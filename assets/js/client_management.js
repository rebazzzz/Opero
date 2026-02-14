        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#197fe6",
                        "primary-dark": "#156cbd",
                        "background-light": "#f6f7f8",
                        "background-dark": "#111921",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1a2632",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
                },
            },
        }
    

function initShellToggles() {
    // Mobile menu toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', function () {
        var sidebar = document.querySelector('aside');
        var overlay = document.getElementById('sidebar-overlay');
        sidebar?.classList.toggle('hidden');
        overlay?.classList.toggle('hidden');
    });

    // Close sidebar when overlay is clicked
    document.getElementById('sidebar-overlay')?.addEventListener('click', function () {
        var sidebar = document.querySelector('aside');
        sidebar?.classList.add('hidden');
        this.classList.add('hidden');
    });
}

function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function createStatusBadge(status) {
    if (status === 'Inactive') {
        return '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Inactive</span>';
    }
    return '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/50"><span class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>Active</span>';
}

function appendClientRow(data) {
    var tbody = document.getElementById('clients-tbody');
    if (!tbody) return;

    var row = document.createElement('tr');
    row.className = 'group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors';
    row.innerHTML =
        '<td class="px-6 py-4 whitespace-nowrap align-middle">' +
        '<input class="checkbox h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40 cursor-pointer transition-all" type="checkbox" />' +
        '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap">' +
        '<div class="flex items-center">' +
        '<div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold ring-2 ring-white dark:ring-slate-800 shadow-sm">' + getInitials(data.company) + '</div>' +
        '<div class="ml-4">' +
        '<div class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">' + data.company + '</div>' +
        '<div class="text-xs text-slate-500 dark:text-slate-400">' + data.contact + '</div>' +
        '</div>' +
        '</div>' +
        '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">' +
        '<div class="flex flex-col gap-1">' +
        '<a class="text-sm text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1.5 w-fit" href="mailto:' + data.email + '">' +
        '<span class="material-icons-round text-xs text-slate-400">email</span>' + data.email +
        '</a>' +
        (data.phone ? '<a class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 w-fit" href="tel:' + data.phone.replace(/\s+/g, '') + '"><span class="material-icons-round text-xs text-slate-400">phone</span>' + data.phone + '</a>' : '') +
        '</div>' +
        '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell"><span class="text-sm text-slate-400 italic">No active projects</span></td>' +
        '<td class="px-6 py-4 whitespace-nowrap">' + createStatusBadge(data.status) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">' +
        '<a href="#" class="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">' +
        '<span class="material-symbols-outlined text-base">info</span>Details</a>' +
        '</td>';

    tbody.prepend(row);
}

function initClientCreationModal() {
    var modal = document.getElementById('client-create-modal');
    var openBtn = document.getElementById('open-client-create-modal');
    var form = document.getElementById('client-create-form');
    var closeBtns = document.querySelectorAll('[data-client-create-close]');

    if (!modal || !openBtn || !form) return;

    function openModal() {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('project-modal-open');
        document.getElementById('client_company')?.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('project-modal-open');
        form.reset();
    }

    openBtn.addEventListener('click', openModal);
    for (var i = 0; i < closeBtns.length; i++) {
        closeBtns[i].addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var companyInput = document.getElementById('client_company');
        var contactInput = document.getElementById('client_contact');
        var emailInput = document.getElementById('client_email');
        var phoneInput = document.getElementById('client_phone');
        var statusInput = document.getElementById('client_status');

        if (!companyInput?.reportValidity() || !contactInput?.reportValidity() || !emailInput?.reportValidity()) {
            return;
        }

        appendClientRow({
            company: companyInput.value.trim(),
            contact: contactInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput?.value.trim() || '',
            status: statusInput?.value || 'Active'
        });

        closeModal();
    });
}

function init() {
    initShellToggles();
    initClientCreationModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

