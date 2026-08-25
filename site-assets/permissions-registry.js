/* ============================================
   site-assets/permissions-registry.js
   المصدر الوحيد لكل صلاحيات المنصة
   أي ميزة جديدة تتضاف هنا فقط، وتظهر تلقائي في:
   - admin-user.html (صلاحيات مستخدم واحد)
   - admin-permissions-manage.html (صلاحيات جماعية)
   ============================================ */

const AGRONEX_PERMISSIONS_REGISTRY = [
  { key: 'can_add_farms', label: 'إضافة مزارع جديدة' },
  { key: 'can_manage_crops', label: 'إدارة المحاصيل والسجلات' },
  { key: 'can_use_ai_diagnosis', label: 'استخدام تشخيص الذكاء الاصطناعي' },
  { key: 'can_export_reports', label: 'تصدير التقارير' },
  { key: 'can_view_knowledge_base', label: 'الدخول لبنك المعرفة' },
  { key: 'can_use_mix_checker', label: 'استخدام خلط المبيدات والأسمدة' },
  { key: 'can_view_substances', label: 'الدخول لدليل المواد الفعالة' },
  { key: 'can_view_crop_prices', label: 'مشاهدة أسعار المحاصيل' },
  { key: 'can_use_disease_risk', label: 'استخدام تحليل مخاطر الأمراض' },
  { key: 'can_view_weather_history', label: 'الدخول لسجل الطقس' },
  { key: 'can_view_disease_map', label: 'الدخول لخريطة الأمراض' },
  { key: 'can_view_crops_map', label: 'الدخول لخريطة المحاصيل' },
  { key: 'can_view_radar', label: 'الدخول لـ AgroNex Radar' },
  { key: 'can_view_demand_forecast', label: 'الدخول لتوقع الطلب' },
  { key: 'can_view_earth_pulse', label: 'الدخول لـ AgroNex Earth Pulse' },
  { key: 'can_view_war_room', label: 'الدخول لـ Agricultural War Room' },
  { key: 'can_use_fertilizer_calculator', label: 'استخدام حاسبة التسميد' },
  { key: 'can_buy_fertilizer', label: 'شراء الأسمدة من السوق' },
  { key: 'can_sell_fertilizer', label: 'بيع الأسمدة في السوق' },
  { key: 'can_buy_seeds', label: 'شراء البذور من السوق' },
  { key: 'can_sell_seeds', label: 'بيع البذور في السوق' },
  { key: 'can_buy_pesticides', label: 'شراء المبيدات من السوق' },
  { key: 'can_sell_pesticides', label: 'بيع المبيدات في السوق' },
  { key: 'can_buy_equipment', label: 'شراء المستلزمات الزراعية من السوق' },
  { key: 'can_sell_equipment', label: 'بيع المستلزمات الزراعية في السوق' },
];
