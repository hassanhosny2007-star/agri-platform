// supabase/functions/check-weather-alerts/index.ts
// بتفحص طقس كل مستخدم فعّل الإشعارات، ولو فيه حالة خطيرة تبعتله Push Notification
// المفروض تتشغّل بجدولة زمنية (كل ساعة مثلًا) عن طريق GitHub Actions أو Supabase Cron

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails("mailto:admin@agronex.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// نفس منطق التنبيهات الموجود في dashboard.html بالظبط (لازم يفضلوا متطابقين)
function getDangerAlert(temp: number, humidity: number) {
  if (temp > 32 || temp < 10) {
    return { type: "spray_danger", title: "⚠️ تحذير: الرش غير مناسب", body: temp > 32 ? "الحرارة مرتفعة جدًا، خطر تبخر سريع للمبيد وحرق الأوراق" : "الحرارة منخفضة جدًا، فعالية المبيد بتقل" };
  }
  if (humidity >= 75 && temp >= 18 && temp <= 30) {
    return { type: "fungal_danger", title: "🍄 تحذير: خطر أمراض فطرية مرتفع", body: "رطوبة عالية مع حرارة معتدلة — فكّر في رش وقائي" };
  }
  if (temp >= 38) {
    return { type: "heat_danger", title: "🌡️ تحذير: إجهاد حراري", body: "حرارة شديدة، النبات معرّض للذبول — تجنب أي رش أو تسميد نهارًا" };
  }
  if (temp <= 5) {
    return { type: "cold_danger", title: "❄️ تحذير: خطر برودة", body: "درجة حرارة منخفضة جدًا، احتمال ضرر بردي للمحاصيل الحساسة" };
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, latitude, longitude, last_alert_type, last_alert_sent_at")
      .eq("notifications_enabled", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) throw error;

    let sentCount = 0;

    for (const profile of profiles ?? []) {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${profile.latitude}&longitude=${profile.longitude}&current=temperature_2m,relative_humidity_2m`
        );
        const weatherData = await weatherRes.json();
        const temp = weatherData.current.temperature_2m;
        const humidity = weatherData.current.relative_humidity_2m;

        const alert = getDangerAlert(temp, humidity);
        if (!alert) continue;

        // منع الإزعاج: لو نفس نوع التنبيه اتبعت قبل كده بأقل من 6 ساعات، متبعتوش تاني
        const lastSent = profile.last_alert_sent_at ? new Date(profile.last_alert_sent_at).getTime() : 0;
        const hoursSinceLastAlert = (Date.now() - lastSent) / (1000 * 60 * 60);
        if (profile.last_alert_type === alert.type && hoursSinceLastAlert < 6) continue;

        // تسجيل الإشعار في الجدول (يظهر في جرس الإشعارات جوا الموقع، بغض النظر عن Push)
        await supabase.from("notifications").insert({
          user_id: profile.id,
          title: alert.title,
          body: alert.body,
          url: "dashboard.html",
        });

        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", profile.id);

        for (const sub of subs ?? []) {
          const subscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          };
          try {
            await webpush.sendNotification(
              subscription,
              JSON.stringify({ title: alert.title, body: alert.body, url: "dashboard.html" })
            );
            sentCount++;
          } catch (pushErr: any) {
            // الاشتراك منتهي أو الجهاز مبقاش موجود، امسحه
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            }
          }
        }

        await supabase
          .from("profiles")
          .update({ last_alert_type: alert.type, last_alert_sent_at: new Date().toISOString() })
          .eq("id", profile.id);
      } catch (userErr) {
        console.error("فشل فحص مستخدم:", profile.id, userErr);
      }
    }

    return new Response(JSON.stringify({ success: true, checked: profiles?.length ?? 0, sent: sentCount }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
