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
    // تحويل صامت للرئيسية بدل ما نوريه رسالة "الصلاحية مقفولة عنك"
    window.location.href = 'dashboard.html';
  }
};
