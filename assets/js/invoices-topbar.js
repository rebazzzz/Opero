function renderInvoicesListTopbar() {
  return `
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Invoices</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage and track your company billing performance.</p>
      </div>
      <button type="button" data-project-modal-open="create-invoice" class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
        <span class="material-icons">add</span>
        Create New Invoice
      </button>
    </header>
  `;
}

function renderInvoiceDetailTopbar(invoiceNumber, statusText) {
  return `
    <nav class="flex mb-6 text-sm text-slate-500 dark:text-slate-400 no-print">
      <a class="hover:text-primary transition-colors" href="../main_dashboard.html">Home</a>
      <span class="mx-2">/</span>
      <a class="hover:text-primary transition-colors" href="../global_invoices_list_overview.html">Invoices</a>
      <span class="mx-2">/</span>
      <span class="text-slate-900 dark:text-white font-medium">Invoice #${invoiceNumber}</span>
    </nav>
    <div class="mb-6 no-print">
      <a class="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" href="../global_invoices_list_overview.html">
        <span class="material-icons-outlined text-[18px]">arrow_back</span>
        <span>Back to Invoices</span>
      </a>
    </div>
    <header class="bg-white dark:bg-background-dark border border-primary/10 rounded-xl p-4 sm:p-5 mb-8 no-print">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center space-x-3">
          <h1 class="text-xl font-bold tracking-tight">Invoice #${invoiceNumber}</h1>
          <span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">${statusText}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><span class="material-icons text-lg mr-2">download</span>Download PDF</button>
          <button class="flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><span class="material-icons text-lg mr-2">mail_outline</span>Send Reminder</button>
          <button class="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all"><span class="material-icons text-lg mr-2">edit</span>Edit</button>
        </div>
      </div>
    </header>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  var mount = document.getElementById("invoice-topbar-slot");
  if (!mount) return;

  var view = document.body.dataset.invoiceView || "list";
  if (view === "detail") {
    var invoiceNumber = document.body.dataset.invoiceNumber || "INV-2023-0042";
    var invoiceStatus = document.body.dataset.invoiceStatus || "PAID";
    mount.innerHTML = renderInvoiceDetailTopbar(invoiceNumber, invoiceStatus);
    return;
  }

  mount.innerHTML = renderInvoicesListTopbar();
});
