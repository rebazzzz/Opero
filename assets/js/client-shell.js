const CLIENT_SHELL_NAV = [
  { key: 'dashboard', href: 'client_side_portal_dashboard.html', icon: 'dashboard', label: 'Dashboard' },
  { key: 'projects', href: 'client_side/client_side_project_view.html', icon: 'assignment', label: 'Projects' },
  { key: 'invoices', href: 'client_side/client_side_billing_view.html', icon: 'receipt_long', label: 'Invoices' },
  { key: 'documents', href: 'client_side/client_side_documents_overview.html', icon: 'folder', label: 'Documents' },
  { key: 'messages', href: 'client_side/client_side_portal_messaging_view.html', icon: 'forum', label: 'Messages' },
];

const CLIENT_SHELL_BOTTOM = [
  { key: 'settings', href: 'settings-modules.html', icon: 'settings', label: 'Settings' },
  { key: 'logout', href: 'login.html', icon: 'logout', label: 'Logout' },
];

function getClientPathDepth(pathname) {
  const normalized = (pathname || '').replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  if (!parts.length) return 0;
  const lastPart = parts[parts.length - 1];
  const endsWithFile = /\.[a-z0-9]+$/i.test(lastPart);
  return endsWithFile ? parts.length - 1 : parts.length;
}

function getClientShellBasePath() {
  const explicitBase = document.body?.dataset?.clientShellBase;
  if (typeof explicitBase === 'string' && explicitBase.length > 0) return explicitBase;
  const depth = getClientPathDepth(window.location.pathname);
  return depth > 0 ? '../'.repeat(depth) : '';
}

function resolveClientHref(href, basePath) {
  if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href) || href.startsWith('/')) return href;
  return `${basePath}${href}`;
}

function inferClientActiveKey(pathname) {
  const file = pathname.split('/').pop() || '';
  const map = {
    'client_side_portal_dashboard.html': 'dashboard',
    'client_side_project_view.html': 'projects',
    'client_side_billing_view.html': 'invoices',
    'client_side_documents_overview.html': 'documents',
    'client_side_document_review-approval.html': 'documents',
    'client_side_portal_messaging_view.html': 'messages',
  };
  return map[file] || 'dashboard';
}

function clientNavClass(active) {
  if (active) {
    return 'flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-semibold transition-colors';
  }
  return 'flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium transition-colors';
}

function clientBottomClass(active, key) {
  if (active) {
    return 'flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-semibold transition-colors';
  }
  if (key === 'logout') {
    return 'flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg font-medium transition-colors';
  }
  return 'flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium transition-colors';
}

function renderClientSidebar(activeKey, basePath) {
  const navHtml = CLIENT_SHELL_NAV.map((item) => {
    const isActive = item.key === activeKey;
    const resolvedHref = resolveClientHref(item.href, basePath);
    return `\n      <a class="${clientNavClass(isActive)}" href="${resolvedHref}">\n        <span class="material-icons">${item.icon}</span>\n        ${item.label}\n      </a>`;
  }).join('');

  const bottomHtml = CLIENT_SHELL_BOTTOM.map((item) => {
    const isActive = item.key === activeKey;
    const resolvedHref = resolveClientHref(item.href, basePath);
    return `\n      <a class="${clientBottomClass(isActive, item.key)}" href="${resolvedHref}">\n        <span class="material-icons">${item.icon}</span>\n        ${item.label}\n      </a>`;
  }).join('');

  return `
    <aside class="w-64 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col h-full z-30">
      <div class="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
        <div class="flex items-center gap-2 text-primary font-bold text-xl">
          <span class="material-icons text-3xl">grid_view</span>
          <span class="text-slate-900 dark:text-white">BizDash</span>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">${navHtml}
      </nav>
      <div class="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-1">${bottomHtml}
      </div>
    </aside>`;
}

function renderClientHeader(config, basePath) {
  const avatarFallback = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='28' fill='%2364758b'%3ECB%3C/text%3E%3C/svg%3E";
  const searchHtml = config.showSearch ? `
    <div class="hidden sm:flex items-center flex-1 max-w-md ml-4">
      <div class="relative w-full">
        <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-200 placeholder-slate-400" placeholder="${config.searchPlaceholder}" type="text" />
      </div>
    </div>` : '';

  return `
    <header class="h-16 bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
      <button id="client-mobile-menu-btn" class="md:hidden text-slate-500 hover:text-primary" type="button">
        <span class="material-icons">menu</span>
      </button>
      ${searchHtml}
      <div class="ml-auto flex items-center gap-3 sm:gap-6">
        <button class="relative p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors" type="button">
          <span class="material-icons">notifications</span>
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1a2632]"></span>
        </button>
        <div class="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-700">
          <div class="hidden sm:block text-right">
            <p class="text-sm font-bold text-slate-800 dark:text-white">${config.userName}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${config.userRole}</p>
          </div>
          <img alt="User Profile" class="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20" src="${config.avatar}" onerror="this.onerror=null;this.src='${avatarFallback}'" />
        </div>
      </div>
    </header>`;
}

function applyClientImageFallbacks() {
  const defaultAvatar = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='34' fill='%2364758b'%3ECB%3C/text%3E%3C/svg%3E";
  const imgs = document.querySelectorAll('img');
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].addEventListener('error', function () {
      this.onerror = null;
      this.src = defaultAvatar;
    });
  }
}

function applyClientIconFallbackIfNeeded() {
  const iconSvgMap = {
    dashboard: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/></svg>',
    assignment: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-3.18C15.4 1.84 14.3 1 13 1h-2c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 0h0Zm5 18H7V7h10v14Zm-8-9h6v2H9v-2Zm0 4h6v2H9v-2Zm0-8h6v2H9V8Z"/></svg>',
    receipt_long: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H7c-1.1 0-2 .9-2 2v16l3-1.5L11 20l3-1.5L17 20l3-1.5L23 20V4c0-1.1-.9-2-2-2Zm-2 13H9v-2h10v2Zm0-4H9V9h10v2Zm0-4H9V5h10v2Z"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4 12 6h8c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h6Z"/></svg>',
    forum: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H7l-5 4V6c0-1.1.9-2 2-2Zm2 5h12v2H6V9Zm0 4h8v2H6v-2Z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m19.14 12.94.04-.94-.04-.94 2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.02 7.02 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.13.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.63l2.03 1.58-.04.94.04.94-2.03 1.58a.5.5 0 0 0-.12.63l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.4 1.05.71 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.23 1.13-.54 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v2H5v14h6v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6V3Zm4.59 4.59L16.17 9l2.58 2.5H9v2h9.76l-2.59 2.5 1.42 1.41L22.5 12l-4.91-4.41Z"/></svg>',
    grid_view: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>',
    notifications: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5L3 18v1h18v-1l-2-2Z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 22l2-2-6.5-6.5Zm-6 0A4.5 4.5 0 1 1 9.5 5a4.5 4.5 0 0 1 0 9Z"/></svg>',
    edit_note: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h11v2H3V3Zm0 4h11v2H3V7Zm0 4h7v2H3v-2Zm11.5 1 5 5-7.5 7H7v-5.5l7.5-7Zm4.5-4.5-1-1a1.5 1.5 0 0 0-2.12 0l-1.17 1.17 3.12 3.12L19 8.62a1.5 1.5 0 0 0 0-2.12Z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2V9h-2V7Zm0 4h2v6h-2v-6Zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"/></svg>',
    file_download: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2Zm7-18-5.5 5.5 1.42 1.42L11 6.84V16h2V6.84l3.08 3.08 1.42-1.42L12 2Z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21 23 12 2 3v7l15 2-15 2v7Z"/></svg>',
    add: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2Z"/></svg>',
    business_center: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4h4v2h5a2 2 0 0 1 2 2v3h-8v2h8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5h8v-2H3V8a2 2 0 0 1 2-2h5V4Z"/></svg>',
    payments: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 17h2v-1h1a2 2 0 0 0 0-4h-4v-2h6V8h-3V7h-2v1h-1a2 2 0 0 0 0 4h4v2H8v2h3v1ZM4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>',
    description: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1v5h5"/><path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/></svg>',
    credit_card: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4H4V6h16v2Zm0 10H4v-6h16v6Z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7l-5 4V6a2 2 0 0 1 2-2Z"/></svg>',
    chat_bubble: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7l-5 4V6a2 2 0 0 1 2-2Z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v1l10 6 10-6V6a2 2 0 0 0-2-2Zm0 5-8 4.8L4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.7 15.7 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.32.56 3.56.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.5a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.24.19 2.44.56 3.56a1 1 0 0 1-.24 1L6.6 10.8Z"/></svg>',
    sunny: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0-5h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.93 4.93l1.41-1.41 2.12 2.12-1.41 1.41-2.12-2.12Zm10.61 10.61 1.41-1.41 2.12 2.12-1.41 1.41-2.12-2.12ZM4.93 19.07l2.12-2.12 1.41 1.41-2.12 2.12-1.41-1.41Zm10.61-10.61 2.12-2.12 1.41 1.41-2.12 2.12-1.41-1.41Z"/></svg>',
    picture_as_pdf: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1v5h5"/><path d="M7 14h2.5a1.5 1.5 0 1 0 0-3H7v6h1.2v-2H9.5a1.5 1.5 0 1 0 0-3H8.2v-1H9.5a.3.3 0 0 1 0 .6H8.8V14H7Zm6 3h1.7c1.2 0 2.3-1 2.3-2.5S15.9 12 14.7 12H13v5Zm1.2-1v-3h.4c.6 0 1.2.5 1.2 1.5s-.6 1.5-1.2 1.5h-.4Zm4-4h3v1h-1.8v1h1.6v1h-1.6v2h-1.2v-5Z"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H3l5-6 3 4 4-5 6 7ZM8.5 9A1.5 1.5 0 1 1 7 10.5 1.5 1.5 0 0 1 8.5 9Z"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2Zm7-18-5.5 5.5 1.42 1.42L11 6.84V16h2V6.84l3.08 3.08 1.42-1.42L12 2Z"/></svg>',
    construction: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m21.7 19.3-5.4-5.4 1.4-1.4 5.4 5.4-1.4 1.4ZM14 10l-4-4 2.2-2.2a2 2 0 1 1 2.8 2.8L14 10Zm-1.4 1.4-8.9 8.9H1v-2.7l8.9-8.9 2.7 2.7Z"/></svg>',
    event: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z"/></svg>',
    check_circle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z"/></svg>',
    photo_library: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 16V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2ZM4 6H2v14a2 2 0 0 0 2 2h14v-2H4V6Z"/></svg>',
    pending_actions: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7a2 2 0 0 0-2 2v14l4-4h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-5 9H8v-2h4v2Zm4-4H8V6h8v2Z"/></svg>',
    electric_bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7l6-11h1l-1 7h4l-6 11Z"/></svg>',
    format_paint: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4V2H6v2h12Zm1 3H5v4h14V7Zm-2 6H7v3l-4 4 1 1 4-4h9v-4Z"/></svg>',
    verified: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 1 8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V5l8-4Zm-1 15 6-6-1.4-1.4-4.6 4.6-2.6-2.6L7 12l4 4Z"/></svg>',
    videocam: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5l6 6v-15l-6 6Z"/></svg>',
    done_all: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m1.7 12.3 1.4-1.4 4.2 4.2-1.4 1.4-4.2-4.2Zm7 0 1.4-1.4 4.2 4.2-1.4 1.4-4.2-4.2Zm6.6 2.8L22.9 7.5l-1.4-1.4-7.6 7.6 1.4 1.4Z"/></svg>',
    attach_file: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6.5v10a4.5 4.5 0 1 1-9 0v-11a3 3 0 1 1 6 0v10a1.5 1.5 0 0 1-3 0v-9h-2v9a3.5 3.5 0 0 0 7 0v-10a5 5 0 1 0-10 0v11a6.5 6.5 0 1 0 13 0v-10h-2Z"/></svg>',
    mood: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-4 8a1.5 1.5 0 1 1 1.5 1.5A1.5 1.5 0 0 1 8 10Zm4 8a6 6 0 0 1-4.9-2.5h9.8A6 6 0 0 1 12 18Zm2.5-6.5A1.5 1.5 0 1 1 16 10a1.5 1.5 0 0 1-1.5 1.5Z"/></svg>',
    format_bold: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 4h6a4 4 0 0 1 0 8H8V4Zm0 10h7a4 4 0 0 1 0 8H8v-8Zm2 2v4h5a2 2 0 0 0 0-4h-5Zm0-10v4h4a2 2 0 0 0 0-4h-4Z"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2-8 4.5V21h16v-2.5C20 16 16.42 14 12 14Z"/></svg>',
    groups: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4ZM8 13c-.29 0-.62.02-.97.05C5.08 13.24 2 14.12 2 16v2h4v-1c0-1.46.82-2.72 2.28-3.65A9.54 9.54 0 0 0 8 13Z"/></svg>',
    insert_drive_file: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1v5h5"/></svg>',
  };

  function applySvgFallback() {
    const iconNodes = document.querySelectorAll('.material-icons, .material-symbols-outlined');
    for (let i = 0; i < iconNodes.length; i++) {
      const node = iconNodes[i];
      const key = (node.textContent || '').trim();
      if (!key) continue;
      if (iconSvgMap[key]) {
        node.innerHTML = iconSvgMap[key];
        node.classList.add('icon-fallback-svg');
      }
    }
  }

  // Always apply for client shell pages to avoid ligature-text rendering issues
  // when external icon fonts fail or load inconsistently.
  applySvgFallback();
}

function bindClientMobileMenu() {
  const btn = document.getElementById('client-mobile-menu-btn');
  const overlay = document.getElementById('client-sidebar-overlay');
  const sidebar = document.querySelector('#client-sidebar-slot aside');
  if (!btn || !overlay || !sidebar) return;

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    overlay.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebarSlot = document.getElementById('client-sidebar-slot');
  const headerSlot = document.getElementById('client-header-slot');
  if (!sidebarSlot || !headerSlot) return;

  const body = document.body;
  const activeKey = body.dataset.clientShellActive || inferClientActiveKey(window.location.pathname);
  const basePath = getClientShellBasePath();
  const config = {
    showSearch: body.dataset.clientShellSearch === 'true',
    searchPlaceholder: body.dataset.clientShellSearchPlaceholder || 'Search projects, invoices, messages...',
    userName: body.dataset.clientShellUser || 'Client Account',
    userRole: body.dataset.clientShellRole || 'Client',
    avatar: body.dataset.clientShellAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJjGT2gGK3zQloadv0n3M6ExvdtDzBpX_9YFzLgGPYvA5eP9lfLNGNz4l0Tx_4yiVekmk0BhiQe-e9wv0BoChwKh5Vm2wqka11SCXsxnU75DSXEOtoMXuBfAmApkWtvh2MbJLDNkJTi-WIE184H1JEEQJRuBza2rpTNSxmtJH77S-p1aRSbrTIiUCnKRpO-_-mZzhl0hKhO3XyeV9ztlwW-aYqZhC0v7uPFenVXux7xhsQagnrLTxlvMvhUF65zWYJCxC0DIVE3NWJ',
  };

  sidebarSlot.innerHTML = renderClientSidebar(activeKey, basePath);
  headerSlot.innerHTML = renderClientHeader(config, basePath);
  bindClientMobileMenu();
  applyClientImageFallbacks();
  applyClientIconFallbackIfNeeded();
});
