const APP_SHELL_NAV = [
    { key: 'dashboard', href: 'main_dashboard.html', icon: 'dashboard', label: 'Dashboard' },
    { key: 'clients', href: 'client_management.html', icon: 'people_outline', label: 'Clients' },
    { key: 'projects', href: 'project_list.html', icon: 'folder_open', label: 'Projects' },
    { key: 'team', href: 'global_team_list_view.html', icon: 'groups', label: 'Team' },
    { key: 'invoices', href: 'global_invoices_list_overview.html', icon: 'receipt_long', label: 'Invoices' },
    { key: 'reports', href: 'business_analytics.html', icon: 'analytics', label: 'Reports' },
    { key: 'activity', href: 'activity_log.html', icon: 'history', label: 'Activity Log' },
];

const APP_SHELL_BOTTOM = [
    { key: 'settings', href: 'settings-modules.html', icon: 'settings', label: 'Settings' },
    { key: 'logout', href: 'login.html', icon: 'logout', label: 'Logout' },
];

function getPathDepth(pathname) {
    const normalized = (pathname || '').replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    if (!parts.length) {
        return 0;
    }

    const lastPart = parts[parts.length - 1];
    const endsWithFile = /\.[a-z0-9]+$/i.test(lastPart);
    return endsWithFile ? parts.length - 1 : parts.length;
}

function getShellBasePath() {
    const explicitBase = document.body?.dataset?.shellBase;
    if (typeof explicitBase === 'string' && explicitBase.length > 0) {
        return explicitBase;
    }

    const depth = getPathDepth(window.location.pathname);
    return depth > 0 ? '../'.repeat(depth) : '';
}

function resolveShellHref(href, basePath) {
    if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href) || href.startsWith('/')) {
        return href;
    }

    return `${basePath}${href}`;
}

function inferActiveKey(pathname) {
    const file = pathname.split('/').pop() || '';
    const map = {
        'main_dashboard.html': 'dashboard',
        'project_list.html': 'projects',
        'project_details.html': 'projects',
        'client_management.html': 'clients',
        'global_team_list_view.html': 'team',
        'team_memer_managment_profile.html': 'team',
        'team_member_managment_profile_v1.html': 'team',
        'team_member_managment_profile_v2.html': 'team',
        'global_invoices_list_overview.html': 'invoices',
        'invoice_detailed_view.html': 'invoices',
        'business_analytics.html': 'reports',
        'activity_log.html': 'activity',
        'settings-modules.html': 'settings',
    };
    return map[file] || 'dashboard';
}

function navClass(active) {
    if (active) {
        return 'flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-semibold transition-colors';
    }
    return 'flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium transition-colors';
}

function bottomClass(active, key) {
    if (active) {
        return 'flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-semibold transition-colors';
    }
    if (key === 'logout') {
        return 'flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg font-medium transition-colors';
    }
    return 'flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium transition-colors';
}

function renderSidebar(activeKey, basePath) {
    const navHtml = APP_SHELL_NAV.map((item) => {
        const isActive = item.key === activeKey;
        const resolvedHref = resolveShellHref(item.href, basePath);
        return `\n            <a class="${navClass(isActive)}" href="${resolvedHref}">\n                <span class="material-symbols-outlined">${item.icon}</span>\n                ${item.label}\n            </a>`;
    }).join('');

    const bottomHtml = APP_SHELL_BOTTOM.map((item) => {
        const isActive = item.key === activeKey;
        const resolvedHref = resolveShellHref(item.href, basePath);
        return `\n            <a class="${bottomClass(isActive, item.key)}" href="${resolvedHref}">\n                <span class="material-symbols-outlined">${item.icon}</span>\n                ${item.label}\n            </a>`;
    }).join('');

    return `
    <aside
        class="w-64 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex h-full z-30 transition-all duration-300">
        <div class="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
            <div class="flex items-center gap-2 text-primary font-bold text-xl">
                <span class="material-symbols-outlined text-3xl">grid_view</span>
                <span class="text-slate-900 dark:text-white">BizDash</span>
            </div>
        </div>
        <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">${navHtml}
        </nav>
        <div class="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-1">${bottomHtml}
        </div>
    </aside>`;
}

function renderHeader(config, basePath) {
    const searchHtml = config.showSearch ? `
        <div class="hidden sm:flex items-center flex-1 max-w-md ml-4">
            <div class="relative w-full">
                <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                    class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                    placeholder="${config.searchPlaceholder}" type="text" />
            </div>
        </div>` : '';

    return `
    <header
        class="h-16 bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
        <button id="mobile-menu-btn" class="md:hidden text-slate-500 hover:text-primary" type="button">
            <span class="material-symbols-outlined">menu</span>
        </button>
        ${searchHtml}
        <div class="ml-auto flex items-center gap-3 sm:gap-6">
            <a href="${resolveShellHref('activity_log.html', basePath)}"
                class="relative p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Open activity log" aria-label="Open activity log">
                <span class="material-symbols-outlined">notifications</span>
                <span
                    class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1a2632]"></span>
            </a>
            <div class="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-700">
                <div class="hidden sm:block text-right">
                    <p class="text-sm font-bold text-slate-800 dark:text-white">${config.userName}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${config.userRole}</p>
                </div>
                <img alt="User Profile" class="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                    src="${config.avatar}" />
            </div>
        </div>
    </header>`;
}

function bindMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.querySelector('aside');

    if (!btn || !overlay || !sidebar) {
        return;
    }

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
    const sidebarSlot = document.getElementById('app-sidebar-slot');
    const headerSlot = document.getElementById('app-header-slot');

    if (!sidebarSlot || !headerSlot) {
        return;
    }

    const body = document.body;
    const activeKey = body.dataset.shellActive || inferActiveKey(window.location.pathname);
    const basePath = getShellBasePath();
    const pagesWithTopSearch = new Set(['dashboard', 'reports', 'activity']);
    const config = {
        showSearch: pagesWithTopSearch.has(activeKey),
        searchPlaceholder: body.dataset.shellSearch || 'Search projects, clients...',
        userName: body.dataset.shellUser || 'Alex Morgan',
        userRole: body.dataset.shellRole || 'Owner',
        avatar: body.dataset.shellAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlfeQOIB19XAH6vh3cLwzlUsLZD1o_7nPugJl844OrHDROE-tDJDfigjalJ9syJqVfQy3C1Cd70RTURr8ZNMFzKsxJ36FiNoZILn8SjY0xozg6p9fpglP85yfV7guvo36i1GKNQ3POOsAw5fN1myySTziJWxGEFxyVtxgp4Q9A-IfbX4z8FkVCpBEpZvGoP3tmaGsZKzpLPnCNTcWiBK19wCDBv9mdPYkt-skJ9HkbypzSgb52dEyJr_ILOkLt_d5Gl1dLZ0M3E2sS',
    };

    sidebarSlot.innerHTML = renderSidebar(activeKey, basePath);
    headerSlot.innerHTML = renderHeader(config, basePath);
    bindMobileMenu();
});
