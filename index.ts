// supabase/functions/diagnose-plant/index.ts
// محرك التشخيص الحقيقي - بيستخدم Claude (Anthropic) لتحليل صورة النبات فعليًا

import { createClient } from "npm:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const SYSTEM_PROMPT = `أنت خبير أمراض نبات زراعي محترف. هتشوف صورة نبات وبيانات إضافية عنه (عمر النبات، آخر معاملة، آخر ريّة، نوع الأرض)، ومطلوب منك:

1. تحدد اسم النبات في الصورة
2. تشخّص هل فيه مرض أو آفة ظاهرة، وإيه اسمه بالظبط (بالعربي)
3. توصف الأعراض الظاهرة في الصورة بالتفصيل
4. تقترح حل عملي وواضح (علاج كيميائي أو عضوي أو إجراء زراعي)
5. تحدد مستوى ثقتك في التشخيص: "عالية" لو الأعراض واضحة جدًا، "متوسطة" لو محتمل لكن مش قاطع، "منخفضة" لو الصورة مش واضحة كفاية أو الأعراض غامضة

مهم جدًا: لو الصورة مش واضحة، أو مفيش نبات ظاهر فيها أصلًا، أو مستحيل تحدد حاجة بثقة، قول كده بصراحة في الحقول بدل ما تختلق تشخيص.

رد بصيغة JSON فقط بالضبط بالشكل ده، من غير أي نص زيادة قبله أو بعده:
{
  "plant_name": "اسم النبات",
  "disease_name": "اسم المرض أو (سليم - لا توجد إصابة ظاهرة)",
  "symptoms": "وصف الأعراض بالتفصيل",
  "treatment": "الحل المقترح بالتفصيل",
  "confidence": "عالية أو متوسطة أو منخفضة"
}`;

Deno.serve(async (req) => {
  try {
    // التأكد إن الطلب جاي من مستخدم مسجل دخول فعليًا
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "غير مصرّح" }), { status: 401 });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "غير مصرّح" }), { status: 401 });
    }

    const body = await req.json();
    const { image, media_type, plant_age, last_treatment, last_watering, soil_type } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: "الصورة مطلوبة" }), { status: 400 });
    }

    const userContext = `بيانات إضافية عن النبات:
- عمر النبات: ${plant_age || 'غير محدد'} يوم
- آخر معاملة (سماد/مبيد): ${last_treatment || 'غير محدد'}
- آخر ريّة: ${last_watering || 'غير محدد'}
- نوع الأرض: ${soil_type || 'غير محدد'}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: media_type || "image/jpeg", data: image } },
              { type: "text", text: userContext },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return new Response(JSON.stringify({ error: "تعذر الوصول لمحرك التحليل" }), { status: 502 });
    }

    const data = await response.json();
    const textContent = data.content.find((c: any) => c.type === "text")?.text || "{}";

    // تنظيف الرد لو جه ملفوف بعلامات كود ```json
    const cleaned = textContent.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "حصل خطأ غير متوقع في التحليل" }), { status: 500 });
  }
});
