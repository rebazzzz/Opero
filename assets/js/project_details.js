tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#197fe6",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
};

function ensureProjectDetailModals() {
  if (document.getElementById("pd-edit-project-modal")) return;

  var markup = [
    '<div id="pd-edit-project-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-project-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pd-edit-project-title">',
    '    <form class="pd-modal__card" id="pd-edit-project-form">',
    '      <button type="button" class="pd-modal__close" data-project-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="pd-edit-project-title" class="pd-modal__title">Edit Project</h2>',
    '        <p class="pd-modal__subtitle">Update project details, status, and timeline.</p>',
    '      </div>',
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_project_name">Project Name <span class="pd-required">*</span></label>',
    '            <input id="pd_project_name" name="pd_project_name" required type="text" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_project_status">Status</label>',
    '            <select id="pd_project_status" name="pd_project_status"><option>In Progress</option><option>Planning</option><option>Review</option><option>Completed</option><option>On Hold</option></select>',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_project_priority">Priority</label>',
    '            <select id="pd_project_priority" name="pd_project_priority"><option>Normal</option><option>High</option><option>Urgent</option></select>',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_project_start">Start Date</label>',
    '            <input id="pd_project_start" name="pd_project_start" type="date" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_project_due">Due Date</label>',
    '            <input id="pd_project_due" name="pd_project_due" type="date" />',
    '          </div>',
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_project_budget">Budget (USD)</label>',
    '            <input id="pd_project_budget" name="pd_project_budget" min="0" step="0.01" placeholder="5000.00" type="number" />',
    '          </div>',
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_project_notes">Description</label>',
    '            <textarea id="pd_project_notes" name="pd_project_notes" placeholder="Update scope, deliverables, and context..."></textarea>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">save</span>Save Changes</button>',
    '      </div>',
    '    </form>',
    '  </div>',
    '</div>',
    '<div id="pd-create-invoice-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-project-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pd-create-invoice-title">',
    '    <form class="pd-modal__card" id="pd-create-invoice-form">',
    '      <button type="button" class="pd-modal__close" data-project-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="pd-create-invoice-title" class="pd-modal__title">Create Invoice</h2>',
    '        <p class="pd-modal__subtitle">Generate and send an invoice for this project.</p>',
    '      </div>',
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field">',
    '            <label for="pd_invoice_id">Invoice ID <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_id" name="pd_invoice_id" required placeholder="INV-2026-001" type="text" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_invoice_date">Issue Date <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_date" name="pd_invoice_date" required type="date" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_invoice_due">Due Date <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_due" name="pd_invoice_due" required type="date" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_invoice_amount">Amount (USD) <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_amount" name="pd_invoice_amount" min="0" required step="0.01" placeholder="1250.00" type="number" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_invoice_status">Status</label>',
    '            <select id="pd_invoice_status" name="pd_invoice_status"><option>Pending</option><option>Draft</option><option>Paid</option><option>Overdue</option></select>',
    '          </div>',
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_invoice_notes">Notes</label>',
    '            <textarea id="pd_invoice_notes" name="pd_invoice_notes" placeholder="Optional line items or billing notes..."></textarea>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">receipt_long</span>Create Invoice</button>',
    '      </div>',
    '    </form>',
    '  </div>',
    '</div>',
    '<div id="pd-add-team-member-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-project-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pd-add-team-title">',
    '    <form class="pd-modal__card" id="pd-add-team-form">',
    '      <button type="button" class="pd-modal__close" data-project-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="pd-add-team-title" class="pd-modal__title">Add New Team Member</h2>',
    '        <p class="pd-modal__subtitle">Invite someone and assign them to active projects.</p>',
    '      </div>',
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field">',
    '            <label for="pd_member_name">Full Name <span class="pd-required">*</span></label>',
    '            <input id="pd_member_name" name="pd_member_name" required placeholder="e.g. Jane Doe" type="text" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_member_email">Email Address <span class="pd-required">*</span></label>',
    '            <input id="pd_member_email" name="pd_member_email" required placeholder="jane@company.com" type="email" />',
    '          </div>',
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_member_role">Role & Permissions</label>',
    '            <select id="pd_member_role" name="pd_member_role"><option>Field Staff</option><option>Project Lead</option><option>Administrator</option></select>',
    '          </div>',
    '          <div class="pd-field pd-field--full">',
    '            <label>Assign to Active Projects (Optional)</label>',
    '            <div class="pd-modal__list">',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> Website Redesign for Acme Corp</label>',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> SEO Audit Q4</label>',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> API Integration</label>',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> Brand Identity Pack</label>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">send</span>Send Invitation</button>',
    '      </div>',
    '    </form>',
    '  </div>',
    '</div>',
  ].join("");

  document.body.insertAdjacentHTML("beforeend", markup);
}

function initProjectDetailModals() {
  ensureProjectDetailModals();

  var modalByAction = {
    "edit-project": document.getElementById("pd-edit-project-modal"),
    "create-invoice": document.getElementById("pd-create-invoice-modal"),
    "add-team-member": document.getElementById("pd-add-team-member-modal"),
  };

  var editProjectName = document.getElementById("pd_project_name");
  if (editProjectName) {
    var h1 = document.querySelector("h1");
    editProjectName.value = h1 ? h1.textContent.trim() : "";
  }

  function closeAllModals() {
    var keys = Object.keys(modalByAction);
    for (var i = 0; i < keys.length; i++) {
      var modal = modalByAction[keys[i]];
      if (!modal) continue;
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("project-modal-open");
  }

  function openModal(action) {
    closeAllModals();
    var modal = modalByAction[action];
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-modal-open");
    modal.querySelector("input, select, textarea")?.focus();
  }

  var openers = document.querySelectorAll("[data-project-modal-open]");
  for (var i = 0; i < openers.length; i++) {
    openers[i].addEventListener("click", function () {
      openModal(this.getAttribute("data-project-modal-open"));
    });
  }

  var closers = document.querySelectorAll("[data-project-modal-close]");
  for (var j = 0; j < closers.length; j++) {
    closers[j].addEventListener("click", closeAllModals);
  }

  var forms = [
    document.getElementById("pd-edit-project-form"),
    document.getElementById("pd-create-invoice-form"),
    document.getElementById("pd-add-team-form"),
  ];

  for (var k = 0; k < forms.length; k++) {
    forms[k]?.addEventListener("submit", function (e) {
      e.preventDefault();
      closeAllModals();
      this.reset();
      if (this.id === "pd-edit-project-form" && editProjectName) {
        var h1 = document.querySelector("h1");
        editProjectName.value = h1 ? h1.textContent.trim() : "";
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });
}

function init() {
  initProjectDetailModals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
