/* ============================================
   assets/layout.js
   يبني الهيدر + السايدبار تلقائيًا، ويفعّل مود الليل/النهار واللغة
   الاستخدام: AgroNexLayout.init({ active: 'admin-dashboard', db })
   ============================================ */

const AgroNexLayout = (() => {

  // قاموس الترجمة لعناصر الهيكل المشترك (سايدبار + هيدر) فقط
  // ملحوظة: محتوى كل صفحة نفسه (العناوين والنصوص جوا #page-content) لسه بالعربي بس حاليًا
  const I18N = {
    ar: {
      nav: {
        dashboard: 'الرئيسية', diagnose: 'تشخيص أمراض النبات', knowledge: 'بنك المعرفة',
        'mix-checker': 'خلط المبيدات والأسمدة', substances: 'دليل المواد الفعالة', 'my-profile': 'بروفايلي',
        'admin-section': 'إدارة المنصة', 'admin-dashboard': 'لوحة تحكم الأدمن', 'admin-profile': 'بروفايل المدير',
        'admin-diagnoses': 'سجل التشخيصات', 'knowledge-manage': 'إدارة بنك المعرفة', 'mix-manage': 'إدارة جدول الخلط',
      },
      siteLink: '🌐 عرض الموقع', toggleTitle: 'إظهار/إخفاء القائمة الجانبية',
      themeTitle: 'تبديل الوضع الليلي/النهاري', logoutTitle: 'تسجيل الخروج', langBtn: 'EN',
    },
    en: {
      nav: {
        dashboard: 'Home', diagnose: 'Plant Disease Diagnosis', knowledge: 'Knowledge Base',
        'mix-checker': 'Pesticide & Fertilizer Mixing', substances: 'Active Substances Guide', 'my-profile': 'My Profile',
        'admin-section': 'Platform Management', 'admin-dashboard': 'Admin Dashboard', 'admin-profile': 'Admin Profile',
        'admin-diagnoses': 'Diagnoses Log', 'knowledge-manage': 'Manage Knowledge Base', 'mix-manage': 'Manage Mixing Table',
      },
      siteLink: '🌐 View Site', toggleTitle: 'Show/Hide sidebar',
      themeTitle: 'Toggle dark/light mode', logoutTitle: 'Logout', langBtn: 'AR',
    }
  };

  const NAV_ITEMS = [
    { key: 'dashboard', href: 'dashboard.html', icon: '🏠', roles: 'all' },
    { key: 'diagnose', href: 'diagnose.html', icon: '🌿', roles: 'all' },
    { key: 'knowledge', href: 'knowledge-base.html', icon: '📚', roles: 'all' },
    { key: 'mix-checker', href: 'mix-checker.html', icon: '🧪', roles: 'all' },
    { key: 'substances', href: 'substances-directory.html', icon: '🔍', roles: 'all' },
    { key: 'my-profile', href: 'engineer-profile.html', icon: '👤', roles: 'all' },

    { key: 'admin-section', roles: ['admin'], isSection: true },
    { key: 'admin-dashboard', href: 'admin.html', icon: '🛠️', roles: ['admin'] },
    { key: 'admin-profile', href: 'admin-profile.html', icon: '⭐', roles: ['admin'] },
    { key: 'admin-diagnoses', href: 'admin-diagnoses.html', icon: '📋', roles: ['admin'] },
    { key: 'knowledge-manage', href: 'knowledge-manage.html', icon: '🗂️', roles: ['admin'] },
    { key: 'mix-manage', href: 'mix-checker-manage.html', icon: '⚗️', roles: ['admin'] },
  ];

  function getInitialLang(){ return localStorage.getItem('agronex-lang') || 'ar'; }
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agronex-theme', theme);
  }
  function getInitialTheme(){ return localStorage.getItem('agronex-theme') || 'light'; }

  // بترتب كروت stat-tiles في صفوف بحد أقصى 4 كروت في الصف
  function arrangeTiles(container){
    if(!container) return;
    const n = container.children.length;
    if(n === 0) return;
    const desired = Math.min(4, n);
    const minTileWidth = 190;
    const maxByWidth = Math.max(1, Math.floor(container.clientWidth / minTileWidth));
    const cols = Math.min(desired, maxByWidth);
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  }

  function buildSidebar(activeKey, isAdmin, lang){
    const t = I18N[lang];
    const items = NAV_ITEMS.filter(i => i.roles === 'all' || (isAdmin && i.roles.includes('admin')));
    const linksHtml = items.map(i => {
      if(i.isSection){
        return `<div class="side-section-title">${t.nav[i.key]}</div>`;
      }
      return `<a class="side-link ${i.key === activeKey ? 'active' : ''}" href="${i.href}">
        <span class="icon">${i.icon}</span><span>${t.nav[i.key]}</span>
      </a>`;
    }).join('');
    return `<div class="side-brand"><img src="site-assets/logo.png" alt="AgroNex" class="side-logo"> AgroNex</div>${linksHtml}`;
  }

  function buildTopbar(profile, email, isAdmin, lang){
    const t = I18N[lang];
    const name = (profile && profile.full_name) || email || '...';
    const avatar = (profile && profile.avatar_url) || '';
    const profileHref = isAdmin ? 'admin-profile.html' : 'engineer-profile.html';
    return `
      <a class="user-block" href="${profileHref}" style="text-decoration:none; cursor:pointer;">
        <img src="${avatar}" onerror="this.style.visibility='hidden'">
        <div>
          <div class="u-name">${name}</div>
          <div class="u-email">${email || ''}</div>
        </div>
      </a>
      <div class="top-actions">
        <a class="site-link" href="index.html" target="_blank">${t.siteLink}</a>
        <button class="icon-btn" id="lang-toggle-btn" title="Switch language / تبديل اللغة">${t.langBtn}</button>
        <button class="icon-btn" id="theme-toggle-btn" title="${t.themeTitle}">🌙</button>
        <button class="icon-btn" id="layout-logout-btn" title="${t.logoutTitle}">🚪</button>
      </div>
    `;
  }

  async function init({ active, db }){
    applyTheme(getInitialTheme());

    const { data: { session } } = await db.auth.getSession();
    if(!session){ window.location.href = 'login.html'; return null; }

    const { data: profile } = await db.from('profiles').select('*').eq('id', session.user.id).single();
    const isAdmin = profile && profile.role === 'admin';
    let currentLang = getInitialLang();

    const existingContent = document.body.innerHTML;
    document.body.innerHTML = `
      <button class="icon-btn" id="sidebar-toggle-btn" title="إظهار/إخفاء القائمة الجانبية">☰</button>
      <div id="app-shell">
        <aside id="app-sidebar">${buildSidebar(active, isAdmin, currentLang)}</aside>
        <div id="app-main">
          <header id="app-topbar">${buildTopbar(profile, session.user.email, isAdmin, currentLang)}</header>
          <main id="page-content">${existingContent}</main>
        </div>
      </div>
    `;

    const sidebarEl = document.getElementById('app-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    function attachTopbarEvents(){
      const themeBtn = document.getElementById('theme-toggle-btn');
      themeBtn.textContent = getInitialTheme() === 'dark' ? '☀️' : '🌙';
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
      });

      document.getElementById('layout-logout-btn').addEventListener('click', async () => {
        await db.auth.signOut();
        window.location.href = 'login.html';
      });

      document.getElementById('lang-toggle-btn').addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        localStorage.setItem('agronex-lang', currentLang);
        document.getElementById('app-sidebar').innerHTML = buildSidebar(active, isAdmin, currentLang);
        document.getElementById('app-topbar').innerHTML = buildTopbar(profile, session.user.email, isAdmin, currentLang);
        attachTopbarEvents();
      });
    }
    attachTopbarEvents();

    if(window.innerWidth > 860 && localStorage.getItem('agronex-sidebar-collapsed') === 'true'){
      sidebarEl.classList.add('collapsed');
    }

    toggleBtn.addEventListener('click', () => {
      if(window.innerWidth <= 860){
        sidebarEl.classList.toggle('open');
      } else {
        sidebarEl.classList.toggle('collapsed');
        localStorage.setItem('agronex-sidebar-collapsed', sidebarEl.classList.contains('collapsed') ? 'true' : 'false');
      }
    });

    return { session, profile, isAdmin };
  }

  return { init, arrangeTiles };
})();
