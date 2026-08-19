/* ============================================
   assets/layout.js
   يبني الهيدر + السايدبار تلقائيًا، ويفعّل مود الليل/النهار واللغة والإشعارات
   الاستخدام: AgroNexLayout.init({ active: 'admin-dashboard', db })
   ============================================ */

const AgroNexLayout = (() => {

  const I18N = {
    ar: {
      nav: {
        dashboard: 'الرئيسية', diagnose: 'تشخيص أمراض النبات', knowledge: 'بنك المعرفة',
        'mix-checker': 'خلط المبيدات والأسمدة', substances: 'دليل المواد الفعالة', 'crop-prices': 'أسعار المحاصيل', 'disease-risk': 'تحليل مخاطر الأمراض', 'weather-history': 'سجل الطقس', 'my-profile': 'بروفايلي',
        'admin-section': 'إدارة المنصة', 'admin-dashboard': 'لوحة تحكم الأدمن', 'admin-profile': 'بروفايل المدير',
        'admin-diagnoses': 'سجل التشخيصات', 'knowledge-manage': 'إدارة بنك المعرفة', 'mix-manage': 'إدارة جدول الخلط',
      },
      siteLink: '🌐 عرض الموقع', toggleTitle: 'إظهار/إخفاء القائمة الجانبية',
      themeTitle: 'تبديل الوضع الليلي/النهاري', logoutTitle: 'تسجيل الخروج', langBtn: 'EN',
    },
    en: {
      nav: {
        dashboard: 'Home', diagnose: 'Plant Disease Diagnosis', knowledge: 'Knowledge Base',
        'mix-checker': 'Pesticide & Fertilizer Mixing', substances: 'Active Substances Guide', 'crop-prices': 'Crop Prices', 'disease-risk': 'Disease Risk Analysis', 'weather-history': 'Weather History', 'my-profile': 'My Profile',
        'admin-section': 'Platform Management', 'admin-dashboard': 'Admin Dashboard', 'admin-profile': 'Admin Profile',
        'admin-diagnoses': 'Diagnoses Log', 'knowledge-manage': 'Manage Knowledge Base', 'mix-manage': 'Manage Mixing Table',
      },
      siteLink: '🌐 View Site', toggleTitle: 'Show/Hide sidebar',
      themeTitle: 'Toggle dark/light mode', logoutTitle: 'Logout', langBtn: 'AR',
    }
  };

  const NAV_ITEMS = [
    { key: 'dashboard', href: 'dashboard.html', icon: '🏠', roles: 'all' },
    { key: 'diagnose', href: 'diagnose.html', icon: '🌿', roles: 'all', permKey: 'can_use_ai_diagnosis' },
    { key: 'knowledge', href: 'knowledge-base.html', icon: '📚', roles: 'all', permKey: 'can_view_knowledge_base' },
    { key: 'mix-checker', href: 'mix-checker.html', icon: '🧪', roles: 'all', permKey: 'can_use_mix_checker' },
    { key: 'substances', href: 'substances-directory.html', icon: '🔍', roles: 'all', permKey: 'can_view_substances' },
    { key: 'crop-prices', href: 'crop-prices.html', icon: '📈', roles: 'all', permKey: 'can_view_crop_prices' },
    { key: 'disease-risk', href: 'disease-risk.html', icon: '🔬', roles: 'all', permKey: 'can_use_disease_risk' },
    { key: 'weather-history', href: 'weather-history.html', icon: '📊', roles: 'all', permKey: 'can_view_weather_history' },
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

  function buildSidebar(activeKey, isAdmin, lang, permissions){
    const t = I18N[lang];
    const perms = permissions || {};
    const items = NAV_ITEMS.filter(i => {
      if(!(i.roles === 'all' || (isAdmin && i.roles.includes('admin')))) return false;
      if(!isAdmin && i.permKey && perms[i.permKey] === false) return false; // الأدمن يشوف كل حاجة دايمًا
      return true;
    });
    const linksHtml = items.map(i => {
      if(i.isSection){
        return `<div class="side-section-title">${t.nav[i.key]}</div>`;
      }
      return `<a class="side-link ${i.key === activeKey ? 'active' : ''}" href="${i.href}">
        <span class="icon">${i.icon}</span><span>${t.nav[i.key]}</span>
      </a>`;
    }).join('');
    return `<div class="side-brand"><img src="site-assets/logo.png" alt="AgroNex" class="side-logo" onerror="this.style.display='none'"> <span class="brand-word" style="color:#fff;"><span class="b-agro" style="color:#fff;">Agro</span><span class="b-nex" style="color:#8FC286;">Nex</span></span></div>${linksHtml}`;
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
        <div class="notif-wrap">
          <button class="icon-btn" id="notif-bell-btn" title="الإشعارات">🔔<span class="notif-badge" id="notif-badge" style="display:none;">0</span></button>
          <div class="notif-panel" id="notif-panel"></div>
        </div>
        <button class="icon-btn" id="lang-toggle-btn" title="Switch language / تبديل اللغة">${t.langBtn}</button>
        <button class="icon-btn" id="theme-toggle-btn" title="${t.themeTitle}">🌙</button>
        <button class="icon-btn" id="layout-logout-btn" title="${t.logoutTitle}">🚪</button>
      </div>
    `;
  }

  function timeAgo(dateStr){
    const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if(diffMin < 1) return 'الآن';
    if(diffMin < 60) return `من ${diffMin} دقيقة`;
    const diffH = Math.floor(diffMin / 60);
    if(diffH < 24) return `من ${diffH} ساعة`;
    return `من ${Math.floor(diffH / 24)} يوم`;
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
        <aside id="app-sidebar">${buildSidebar(active, isAdmin, currentLang, profile && profile.permissions)}</aside>
        <div id="app-main">
          <header id="app-topbar">${buildTopbar(profile, session.user.email, isAdmin, currentLang)}</header>
          <main id="page-content">${existingContent}</main>
        </div>
      </div>
    `;

    const sidebarEl = document.getElementById('app-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    async function loadNotifBadge(){
      const badge = document.getElementById('notif-badge');
      if(!badge) return;
      const { count } = await db.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('is_read', false);
      if(count && count > 0){
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    async function openNotifPanel(){
      const panel = document.getElementById('notif-panel');
      const isOpen = panel.classList.contains('open');
      if(isOpen){ panel.classList.remove('open'); return; }

      panel.classList.add('open');
      panel.innerHTML = '<div class="notif-empty">جاري التحميل...</div>';

      const { data: notifs } = await db.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(15);

      if(!notifs || !notifs.length){
        panel.innerHTML = '<div class="notif-empty">مفيش إشعارات لسه</div>';
        return;
      }

      panel.innerHTML = notifs.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}" data-url="${n.url || 'dashboard.html'}">
          <div class="n-title">${n.title}</div>
          <div class="n-body">${n.body || ''}</div>
          <div class="n-time">${timeAgo(n.created_at)}</div>
        </div>
      `).join('');

      panel.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', async () => {
          const id = item.getAttribute('data-id');
          const url = item.getAttribute('data-url');
          await db.from('notifications').update({ is_read: true }).eq('id', id);
          window.location.href = url;
        });
      });

      const unreadIds = notifs.filter(n => !n.is_read).map(n => n.id);
      if(unreadIds.length){
        await db.from('notifications').update({ is_read: true }).in('id', unreadIds);
        loadNotifBadge();
      }
    }

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

      document.getElementById('notif-bell-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openNotifPanel();
      });

      document.getElementById('lang-toggle-btn').addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        localStorage.setItem('agronex-lang', currentLang);
        document.getElementById('app-sidebar').innerHTML = buildSidebar(active, isAdmin, currentLang, profile && profile.permissions);
        document.getElementById('app-topbar').innerHTML = buildTopbar(profile, session.user.email, isAdmin, currentLang);
        attachTopbarEvents();
        loadNotifBadge();
      });

      loadNotifBadge();
    }
    attachTopbarEvents();

    // إغلاق قائمة الإشعارات لو المستخدم دوس بره الصندوق
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notif-panel');
      const wrap = document.querySelector('.notif-wrap');
      if(panel && panel.classList.contains('open') && wrap && !wrap.contains(e.target)){
        panel.classList.remove('open');
      }
    });

    setInterval(loadNotifBadge, 60000);

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
