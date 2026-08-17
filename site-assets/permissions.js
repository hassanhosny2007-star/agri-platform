/* ============================================
   site-assets/permissions.js
   حارس الصلاحيات المشترك - أي صفحة تستخدمه بتتحقق أوتوماتيك
   الاستخدام: 
     const ok = await AgroNexPermissions.check(db, session.user.id, 'can_use_mix_checker');
     if(!ok){ AgroNexPermissions.showDenied(); return; }
   ============================================ */

const AgroNexPermissions = {
  async check(db, userId, permKey){
    const { data: profile } = await db.from('profiles').select('permissions, is_active, role').eq('id', userId).single();
    if(!profile) return false;
    if(profile.role === 'admin') return true; // الأدمن دايمًا معاه كل الصلاحيات
    if(profile.is_active === false) return false; // الحساب المعطّل يترفض من كل الميزات
    const perms = profile.permissions || {};
    // لو الصلاحية مش موجودة أصلًا في بيانات المستخدم (حساب قديم)، الافتراضي إنها مفتوحة
    return perms[permKey] !== false;
  },

  showDenied(message){
    document.body.innerHTML = `
      <div style="max-width:480px; margin:90px auto; text-align:center; font-family:'IBM Plex Sans Arabic', sans-serif; padding:24px; direction:rtl;">
        <div style="font-size:44px;">🚫</div>
        <h2 style="margin-top:14px; font-family:'Tajawal', sans-serif; color:#24391F;">مفيش صلاحية لاستخدام الميزة دي</h2>
        <p style="margin-top:8px; color:#5b543f; font-size:14px; line-height:1.7;">${message || 'حسابك مش مفعّل له الوصول للميزة دي حاليًا. تواصل مع الأدمن لو عندك استفسار.'}</p>
        <a href="dashboard.html" style="display:inline-block; margin-top:22px; padding:12px 26px; background:#3B5B37; color:#fff; text-decoration:none; border-radius:9px; font-family:'Tajawal', sans-serif; font-weight:700;">رجوع للرئيسية</a>
      </div>`;
  }
};
