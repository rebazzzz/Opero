function inferClientTabFromPath(pathname) {
    const file = (pathname || '').split('/').pop() || '';
    if (file.includes('invoices')) return 'invoices';
    if (file.includes('projects')) return 'projects';
    if (file.includes('notes')) return 'notes';
    return 'overview';
}

function clientTabClass(active) {
    if (active) {
        return 'border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm';
    }
    return 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm';
}

document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('client-details-topbar');
    if (!mount) return;

    const activeTab = document.body.dataset.clientTab || inferClientTabFromPath(window.location.pathname);
    const tabs = [
        { key: 'overview', label: 'Overview', href: 'client_details_overview.html' },
        { key: 'invoices', label: 'Invoices', href: 'client_details_invoices_tab.html' },
        { key: 'projects', label: 'Projects', href: 'client_details_projects_tab.html' },
        { key: 'notes', label: 'Notes & Files', href: 'client_details_notes_tab.html' },
    ];

    const tabsHtml = tabs.map((tab) => {
        const active = tab.key === activeTab;
        const current = active ? ' aria-current="page"' : '';
        return `<a${current} class="${clientTabClass(active)}" href="${tab.href}">${tab.label}</a>`;
    }).join('');

    mount.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center">
                    <img alt="Company Logo" class="w-full h-full object-contain rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGH0YP5DrexDhhUFRMH7490xi0IaOMorumL2QgOuti-ClgjsgmQri_zWuWOgjKCrOdUwCuWIiCJFs8tTULf-s1OuT2NOVTQzw4k8sKUCaqo_7FfnLN2HFZqP8zg7ClAYlTcfX_7_btKX4Tt1fBbdtXD7xxiwvmp-8dlbwiu8u9s8cj3ybkRUKEDb6_5dYEt9R_DLZm0S55P1sQDSvn5IYAwG7xCiFKJzr1SuII5yCJu4lf7uQfY3Py342Aeb7l7PHrcQWiPmZMI2zs"/>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Acme Corporation</h1>
                    <div class="flex items-center gap-2 text-sm text-slate-500">
                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">location_on</span> San Francisco, CA</span>
                        <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span class="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-xs border border-green-100">Active Client</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-3">
                <button class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 transition-colors shadow-sm">
                    Edit Details
                </button>
                <button class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm shadow-blue-200 dark:shadow-none transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">add</span> New Project
                </button>
            </div>
        </div>
        <div class="border-b border-slate-200 dark:border-slate-800 mb-8">
            <nav aria-label="Tabs" class="-mb-px flex space-x-8 overflow-x-auto">
                ${tabsHtml}
            </nav>
        </div>
    `;
});
