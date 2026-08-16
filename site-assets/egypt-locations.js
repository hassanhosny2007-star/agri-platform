/* ============================================
   site-assets/egypt-locations.js
   بيانات محافظات ومراكز مصر + دوال بناء قوائم العنوان
   ============================================ */

const EGYPT_LOCATIONS = {
  "القاهرة": ["مدينة نصر","مصر الجديدة","حلوان","المعادي","شبرا","عين شمس","الزيتون","السيدة زينب","الدرب الأحمر","الموسكي","الأزبكية","وسط البلد","القاهرة الجديدة","بدر","الشروق","التجمع الخامس","المرج","المطرية","عزبة النخل","حدائق القبة","روض الفرج","بولاق","الساحل","الوايلي","الزاوية الحمراء","منشية ناصر","البساتين","دار السلام","طره","المقطم"],
  "الجيزة": ["الجيزة","الدقي","العجوزة","إمبابة","بولاق الدكرور","أوسيم","كرداسة","أبو النمرس","الحوامدية","البدرشين","الصف","أطفيح","العياط","منشأة القناطر","الواحات البحرية","6 أكتوبر","الشيخ زايد"],
  "الإسكندرية": ["المنتزه","شرق","وسط","غرب","الجمرك","العامرية","برج العرب","العجمي"],
  "الدقهلية": ["المنصورة","طلخا","ميت غمر","دكرنس","أجا","منية النصر","السنبلاوين","الكردي","بلقاس","شربين","المنزلة","تمي الأمديد","الجمالية","ميت سلسيل","محلة دمنة","نبروه","بني عبيد","المطرية","منشأة أبو عمر"],
  "الغربية": ["طنطا","المحلة الكبرى","كفر الزيات","زفتى","السنطة","قطور","بسيون","سمنود"],
  "القليوبية": ["بنها","شبرا الخيمة","القناطر الخيرية","قليوب","الخانكة","كفر شكر","طوخ","شبين القناطر","العبور"],
  "الشرقية": ["الزقازيق","بلبيس","مشتول السوق","فاقوس","أبو حماد","أبو كبير","الحسينية","الصالحية الجديدة","ههيا","القرين","القنايات","كفر صقر","منيا القمح","أولاد صقر","ديرب نجم","العاشر من رمضان","صان الحجر القبلية"],
  "المنوفية": ["شبين الكوم","منوف","سرس الليان","أشمون","الباجور","قويسنا","بركة السبع","تلا","الشهداء"],
  "البحيرة": ["دمنهور","كفر الدوار","رشيد","إدكو","أبو المطامير","أبو حمص","الدلنجات","المحمودية","الرحمانية","إيتاي البارود","حوش عيسى","شبراخيت","كوم حمادة","بدر","وادي النطرون","النوبارية الجديدة"],
  "كفر الشيخ": ["كفر الشيخ","دسوق","فوه","مطوبس","بلطيم","الحامول","بيلا","الرياض","سيدي سالم","قلين","سيدي غازي","البرلس"],
  "دمياط": ["دمياط","رأس البر","فارسكور","الزرقا","كفر سعد","الروضة","عزبة البرج","السرو","كفر البطيخ","ميت أبو غالب","دمياط الجديدة"],
  "بورسعيد": ["بورفؤاد","الشرق","المناخ","الضواحي","الزهور","العرب"],
  "الإسماعيلية": ["الإسماعيلية","فايد","القنطرة شرق","القنطرة غرب","التل الكبير","القصاصين الجديدة","أبو صوير"],
  "السويس": ["السويس","عتاقة","الأربعين","الجناين","فيصل"],
  "شمال سيناء": ["العريش","الشيخ زويد","رفح","بئر العبد","الحسنة","نخل"],
  "جنوب سيناء": ["الطور","شرم الشيخ","دهب","نويبع","طابا","سانت كاترين","أبو رديس","رأس سدر"],
  "بني سويف": ["بني سويف","الواسطى","ناصر","إهناسيا","ببا","الفشن","سمسطا"],
  "الفيوم": ["الفيوم","طامية","سنورس","إطسا","أبشواي","يوسف الصديق (لهون)","الفيوم الجديدة"],
  "المنيا": ["المنيا","العدوة","مغاغة","بني مزار","مطاي","سمالوط","أبو قرقاص","ملوي","دير مواس","المدينة الفكرية"],
  "أسيوط": ["أسيوط","ديروط","منفلوط","القوصية","أبنوب","الفتح","ساحل سليم","البداري","صدفا","أبو تيج","الغنايم"],
  "سوهاج": ["سوهاج","طهطا","طما","المراغة","جرجا","البلينا","ساقلتة","دار السلام","أخميم","المنشأة","جهينة"],
  "قنا": ["قنا","نجع حمادي","دشنا","قوص","نقادة","أبوتشت","فرشوط","الوقف","قفط"],
  "الأقصر": ["الأقصر","الزينية","البياضية","القرنة","إسنا","الطود","أرمنت"],
  "أسوان": ["أسوان","إدفو","كوم أمبو","دراو","نصر النوبة","كلابشة","البصيلية"],
  "البحر الأحمر": ["الغردقة","رأس غارب","سفاجا","القصير","مرسى علم","الشلاتين","حلايب"],
  "الوادي الجديد": ["الخارجة","الداخلة","الفرافرة","باريس","بلاط"],
  "مطروح": ["مرسى مطروح","الحمام","العلمين","الضبعة","سيدي براني","السلوم","سيوة"],
  "أخرى": []
};

const AgroNexLocations = (() => {

  function buildPicker({ govSelectId, centerSelectId, otherGovInputId, otherCenterInputId }){
    const govSelect = document.getElementById(govSelectId);
    const centerSelect = document.getElementById(centerSelectId);
    const otherGovInput = otherGovInputId ? document.getElementById(otherGovInputId) : null;
    const otherCenterInput = otherCenterInputId ? document.getElementById(otherCenterInputId) : null;

    govSelect.innerHTML = '<option value="">اختار المحافظة...</option>' +
      Object.keys(EGYPT_LOCATIONS).map(g => `<option value="${g}">${g}</option>`).join('');

    function populateCenters(gov){
      const centers = EGYPT_LOCATIONS[gov] || [];
      centerSelect.innerHTML = '<option value="">اختار المركز/الحي...</option>' +
        centers.map(c => `<option value="${c}">${c}</option>`).join('') +
        '<option value="أخرى">أخرى</option>';
      centerSelect.disabled = false;
    }

    govSelect.addEventListener('change', () => {
      const gov = govSelect.value;
      if(!gov){
        centerSelect.innerHTML = '<option value="">اختار المحافظة الأول</option>';
        centerSelect.disabled = true;
        if(otherGovInput) otherGovInput.style.display = 'none';
        return;
      }
      populateCenters(gov);
      if(otherGovInput) otherGovInput.style.display = gov === 'أخرى' ? 'block' : 'none';
    });

    centerSelect.addEventListener('change', () => {
      if(otherCenterInput) otherCenterInput.style.display = centerSelect.value === 'أخرى' ? 'block' : 'none';
    });

    centerSelect.innerHTML = '<option value="">اختار المحافظة الأول</option>';
    centerSelect.disabled = true;
  }

  // بيرجع القيمة النهائية (المحافظة الفعلية، المركز الفعلي) مع مراعاة اختيار "أخرى"
  function getPickerValues({ govSelectId, centerSelectId, otherGovInputId, otherCenterInputId }){
    const govSelect = document.getElementById(govSelectId);
    const centerSelect = document.getElementById(centerSelectId);
    const otherGovInput = otherGovInputId ? document.getElementById(otherGovInputId) : null;
    const otherCenterInput = otherCenterInputId ? document.getElementById(otherCenterInputId) : null;

    let governorate = govSelect.value;
    if(governorate === 'أخرى' && otherGovInput) governorate = otherGovInput.value.trim() || 'أخرى';

    let center = centerSelect.value;
    if(center === 'أخرى' && otherCenterInput) center = otherCenterInput.value.trim() || 'أخرى';

    return { governorate, center };
  }

  return { buildPicker, getPickerValues, EGYPT_LOCATIONS };
})();
