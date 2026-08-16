/* ============================================
   assets/layout.js
   يبني الهيدر + السايدبار تلقائيًا، ويفعّل مود الليل/النهار
   الاستخدام: AgroNexLayout.init({ active: 'admin-dashboard', db, session, profile })
   ============================================ */

const AgroNexLayout = (() => {

  // كل روابط السايدبار الممكنة، مقسّمة بحسب من يشوفها
  const NAV_ITEMS = [
    { key: 'dashboard', href: 'dashboard.html', icon: '🏠', label: 'الرئيسية', roles: 'all' },
    { key: 'diagnose', href: 'diagnose.html', icon: '🌿', label: 'تشخيص أمراض النبات', roles: 'all' },
    { key: 'knowledge', href: 'knowledge-base.html', icon: '📚', label: 'بنك المعرفة', roles: 'all' },
    { key: 'mix-checker', href: 'mix-checker.html', icon: '🧪', label: 'خلط المبيدات والأسمدة', roles: 'all' },
    { key: 'substances', href: 'substances-directory.html', icon: '🔍', label: 'دليل المواد الفعالة', roles: 'all' },
    { key: 'my-profile', href: 'engineer-profile.html', icon: '👤', label: 'بروفايلي', roles: 'all' },

    { key: 'admin-section', label: 'إدارة المنصة', roles: ['admin'], isSection: true },
    { key: 'admin-dashboard', href: 'admin.html', icon: '🛠️', label: 'لوحة تحكم الأدمن', roles: ['admin'] },
    { key: 'admin-profile', href: 'admin-profile.html', icon: '⭐', label: 'بروفايل المدير', roles: ['admin'] },
    { key: 'admin-diagnoses', href: 'admin-diagnoses.html', icon: '📋', label: 'سجل التشخيصات', roles: ['admin'] },
    { key: 'knowledge-manage', href: 'knowledge-manage.html', icon: '🗂️', label: 'إدارة بنك المعرفة', roles: ['admin'] },
    { key: 'mix-manage', href: 'mix-checker-manage.html', icon: '⚗️', label: 'إدارة جدول الخلط', roles: ['admin'] },
  ];

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agronex-theme', theme);
  }

  function getInitialTheme(){
    return localStorage.getItem('agronex-theme') || 'light';
  }

  function buildSidebar(activeKey, isAdmin){
    const items = NAV_ITEMS.filter(i => i.roles === 'all' || (isAdmin && i.roles.includes('admin')));
    const linksHtml = items.map(i => {
      if(i.isSection){
        return `<div class="side-section-title">${i.label}</div>`;
      }
      return `<a class="side-link ${i.key === activeKey ? 'active' : ''}" href="${i.href}">
        <span class="icon">${i.icon}</span><span>${i.label}</span>
      </a>`;
    }).join('');

    return `
      <div class="side-brand">🌱 AgroNex</div>
      ${linksHtml}
    `;
  }

  function buildTopbar(profile, email, isAdmin){
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
        <button class="icon-btn" id="sidebar-toggle-btn" title="إظهار/إخفاء القائمة الجانبية">☰</button>
        <a class="site-link" href="index.html" target="_blank">🌐 عرض الموقع</a>
        <button class="icon-btn" id="theme-toggle-btn" title="تبديل الوضع الليلي/النهاري">🌙</button>
        <button class="icon-btn" id="layout-logout-btn" title="تسجيل الخروج">🚪</button>
      </div>
    `;
  }

  async function init({ active, db }){
    applyTheme(getInitialTheme());

    const { data: { session } } = await db.auth.getSession();
    if(!session){ window.location.href = 'login.html'; return null; }

    const { data: profile } = await db.from('profiles').select('*').eq('id', session.user.id).single();
    const isAdmin = profile && profile.role === 'admin';

    // بناء الهيكل حوالين المحتوى الموجود بالفعل في الصفحة
    const existingContent = document.body.innerHTML;
    document.body.innerHTML = `
      <div id="app-shell">
        <aside id="app-sidebar">${buildSidebar(active, isAdmin)}</aside>
        <div id="app-main">
          <header id="app-topbar">${buildTopbar(profile, session.user.email, isAdmin)}</header>
          <main id="page-content">${existingContent}</main>
        </div>
      </div>
    `;

    // مود الليل/النهار
    const themeBtn = document.getElementById('theme-toggle-btn');
    themeBtn.textContent = getInitialTheme() === 'dark' ? '☀️' : '🌙';
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });

    // تسجيل الخروج
    document.getElementById('layout-logout-btn').addEventListener('click', async () => {
      await db.auth.signOut();
      window.location.href = 'login.html';
    });

    // استرجاع حالة الطي المحفوظة (سطح المكتب بس)
    const sidebarEl = document.getElementById('app-sidebar');
    if(window.innerWidth > 860 && localStorage.getItem('agronex-sidebar-collapsed') === 'true'){
      sidebarEl.classList.add('collapsed');
    }

    // زرار إظهار/إخفاء السايدبار (شغال على الموبايل وسطح المكتب)
    document.getElementById('sidebar-toggle-btn').addEventListener('click', () => {
      if(window.innerWidth <= 860){
        sidebarEl.classList.toggle('open');
      } else {
        sidebarEl.classList.toggle('collapsed');
        localStorage.setItem('agronex-sidebar-collapsed', sidebarEl.classList.contains('collapsed') ? 'true' : 'false');
      }
    });

    return { session, profile, isAdmin };
  }

  return { init };
})();
