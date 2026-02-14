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
    "      </div>",
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_project_name">Project Name <span class="pd-required">*</span></label>',
    '            <input id="pd_project_name" name="pd_project_name" required type="text" />',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_project_status">Status</label>',
    '            <select id="pd_project_status" name="pd_project_status"><option>In Progress</option><option>Planning</option><option>Review</option><option>Completed</option><option>On Hold</option></select>',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_project_priority">Priority</label>',
    '            <select id="pd_project_priority" name="pd_project_priority"><option>Normal</option><option>High</option><option>Urgent</option></select>',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_project_start">Start Date</label>',
    '            <input id="pd_project_start" name="pd_project_start" type="date" />',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_project_due">Due Date</label>',
    '            <input id="pd_project_due" name="pd_project_due" type="date" />',
    "          </div>",
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_project_budget">Budget (USD)</label>',
    '            <input id="pd_project_budget" name="pd_project_budget" min="0" step="0.01" placeholder="5000.00" type="number" />',
    "          </div>",
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_project_notes">Description</label>',
    '            <textarea id="pd_project_notes" name="pd_project_notes" placeholder="Update scope, deliverables, and context..."></textarea>',
    "          </div>",
    "        </div>",
    "      </div>",
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">save</span>Save Changes</button>',
    "      </div>",
    "    </form>",
    "  </div>",
    "</div>",
    '<div id="pd-create-invoice-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-project-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pd-create-invoice-title">',
    '    <form class="pd-modal__card" id="pd-create-invoice-form">',
    '      <button type="button" class="pd-modal__close" data-project-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="pd-create-invoice-title" class="pd-modal__title">Create Invoice</h2>',
    '        <p class="pd-modal__subtitle">Generate and send an invoice for this project.</p>',
    "      </div>",
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field">',
    '            <label for="pd_invoice_id">Invoice ID <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_id" name="pd_invoice_id" required placeholder="INV-2026-001" type="text" />',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_invoice_date">Issue Date <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_date" name="pd_invoice_date" required type="date" />',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_invoice_due">Due Date <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_due" name="pd_invoice_due" required type="date" />',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_invoice_amount">Amount (USD) <span class="pd-required">*</span></label>',
    '            <input id="pd_invoice_amount" name="pd_invoice_amount" min="0" required step="0.01" placeholder="1250.00" type="number" />',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_invoice_status">Status</label>',
    '            <select id="pd_invoice_status" name="pd_invoice_status"><option>Pending</option><option>Draft</option><option>Paid</option><option>Overdue</option></select>',
    "          </div>",
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_invoice_notes">Notes</label>',
    '            <textarea id="pd_invoice_notes" name="pd_invoice_notes" placeholder="Optional line items or billing notes..."></textarea>',
    "          </div>",
    "        </div>",
    "      </div>",
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">receipt_long</span>Create Invoice</button>',
    "      </div>",
    "    </form>",
    "  </div>",
    "</div>",
    '<div id="pd-add-team-member-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-project-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pd-add-team-title">',
    '    <form class="pd-modal__card" id="pd-add-team-form">',
    '      <button type="button" class="pd-modal__close" data-project-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="pd-add-team-title" class="pd-modal__title">Add New Team Member</h2>',
    '        <p class="pd-modal__subtitle">Invite someone and assign them to active projects.</p>',
    "      </div>",
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field">',
    '            <label for="pd_member_name">Full Name <span class="pd-required">*</span></label>',
    '            <input id="pd_member_name" name="pd_member_name" required placeholder="e.g. Jane Doe" type="text" />',
    "          </div>",
    '          <div class="pd-field">',
    '            <label for="pd_member_email">Email Address <span class="pd-required">*</span></label>',
    '            <input id="pd_member_email" name="pd_member_email" required placeholder="jane@company.com" type="email" />',
    "          </div>",
    '          <div class="pd-field pd-field--full">',
    '            <label for="pd_member_role">Role & Permissions</label>',
    '            <select id="pd_member_role" name="pd_member_role"><option>Field Staff</option><option>Project Lead</option><option>Administrator</option></select>',
    "          </div>",
    '          <div class="pd-field pd-field--full">',
    "            <label>Assign to Active Projects (Optional)</label>",
    '            <div class="pd-modal__list">',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> Website Redesign for Acme Corp</label>',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> SEO Audit Q4</label>',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> API Integration</label>',
    '              <label class="pd-modal__list-item"><input type="checkbox" /> Brand Identity Pack</label>',
    "            </div>",
    "          </div>",
    "        </div>",
    "      </div>",
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">send</span>Send Invitation</button>',
    "      </div>",
    "    </form>",
    "  </div>",
    "</div>",
    '<div id="pd-manage-tasks-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-project-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pd-manage-tasks-title">',
    '    <div class="pd-modal__card">',
    '      <button type="button" class="pd-modal__close" data-project-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="pd-manage-tasks-title" class="pd-modal__title">Manage Tasks</h2>',
    '        <p class="pd-modal__subtitle">Create, edit, or delete project tasks from one place.</p>',
    '      </div>',
    '      <div class="pd-modal__body">',
    '        <div class="pd-task-layout">',
    '          <div>',
    '            <div class="pd-task-head"><h3>All Tasks</h3><button type="button" id="pd-task-new-btn" class="pd-btn pd-btn--outline">+ New Task</button></div>',
    '            <div id="pd-task-list" class="pd-task-list"></div>',
    '          </div>',
    '          <form id="pd-task-editor-form" class="pd-task-editor">',
    '            <h3 id="pd-task-editor-title">Create Task</h3>',
    '            <input type="hidden" id="pd_task_id" />',
    '            <div class="pd-field">',
    '              <label for="pd_task_title">Task Title <span class="pd-required">*</span></label>',
    '              <input id="pd_task_title" required type="text" placeholder="e.g. Finalize homepage mockups" />',
    '            </div>',
    '            <div class="pd-fields">',
    '              <div class="pd-field">',
    '                <label for="pd_task_due">Due</label>',
    '                <input id="pd_task_due" type="text" placeholder="Due Tomorrow" />',
    '              </div>',
    '              <div class="pd-field">',
    '                <label for="pd_task_status">Status</label>',
    '                <select id="pd_task_status"><option>Open</option><option>In Progress</option><option>Blocked</option><option>Done</option></select>',
    '              </div>',
    '            </div>',
    '            <div class="pd-field">',
    '              <label for="pd_task_assignee">Assignee</label>',
    '              <input id="pd_task_assignee" type="text" placeholder="e.g. Sarah Miller" />',
    '            </div>',
    '            <div class="pd-field">',
    '              <label for="pd_task_notes">Notes</label>',
    '              <textarea id="pd_task_notes" placeholder="Optional details..."></textarea>',
    '            </div>',
    '            <div class="pd-task-actions">',
    '              <button type="button" id="pd-task-cancel-btn" class="pd-btn pd-btn--ghost">Reset</button>',
    '              <button type="submit" class="pd-btn pd-btn--primary">Save Task</button>',
    '            </div>',
    '          </form>',
    '        </div>',
    '      </div>',
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Close</button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>',
    '<div id="pd-edit-client-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-project-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pd-edit-client-title">',
    '    <form class="pd-modal__card" id="pd-edit-client-form">',
    '      <button type="button" class="pd-modal__close" data-project-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="pd-edit-client-title" class="pd-modal__title">Edit Client Details</h2>',
    '        <p class="pd-modal__subtitle">Update contact, company, and address info.</p>',
    '      </div>',
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field">',
    '            <label for="pd_client_company">Company Name <span class="pd-required">*</span></label>',
    '            <input id="pd_client_company" required type="text" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_client_industry">Industry</label>',
    '            <input id="pd_client_industry" type="text" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_client_contact">Contact Name <span class="pd-required">*</span></label>',
    '            <input id="pd_client_contact" required type="text" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_client_email">Email <span class="pd-required">*</span></label>',
    '            <input id="pd_client_email" required type="email" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_client_phone">Phone</label>',
    '            <input id="pd_client_phone" type="text" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="pd_client_address">Address</label>',
    '            <input id="pd_client_address" type="text" />',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-project-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">save</span>Save Client</button>',
    '      </div>',
    '    </form>',
    '  </div>',
    '</div>',
  ].join("");

  document.body.insertAdjacentHTML("beforeend", markup);
}

function getClientDetailsCard() {
  var headings = document.querySelectorAll("h2");
  for (var i = 0; i < headings.length; i++) {
    if ((headings[i].textContent || "").trim() === "Client Details") {
      return headings[i].closest("div.bg-white") || headings[i].closest("div");
    }
  }
  return null;
}

function initProjectDetailModals() {
  ensureProjectDetailModals();

  var modalByAction = {
    "edit-project": document.getElementById("pd-edit-project-modal"),
    "create-invoice": document.getElementById("pd-create-invoice-modal"),
    "add-team-member": document.getElementById("pd-add-team-member-modal"),
    "manage-tasks": document.getElementById("pd-manage-tasks-modal"),
    "edit-client": document.getElementById("pd-edit-client-modal"),
  };

  var editProjectName = document.getElementById("pd_project_name");
  if (editProjectName) {
    var h1 = document.querySelector("h1");
    editProjectName.value = h1 ? h1.textContent.trim() : "";
  }

  var tasks = [];
  var taskList = document.getElementById("pd-task-list");
  var taskForm = document.getElementById("pd-task-editor-form");
  var taskEditorTitle = document.getElementById("pd-task-editor-title");
  var taskIdInput = document.getElementById("pd_task_id");
  var taskTitleInput = document.getElementById("pd_task_title");
  var taskDueInput = document.getElementById("pd_task_due");
  var taskStatusInput = document.getElementById("pd_task_status");
  var taskAssigneeInput = document.getElementById("pd_task_assignee");
  var taskNotesInput = document.getElementById("pd_task_notes");

  function loadInitialTasks() {
    if (tasks.length) return;

    var upcoming = document.querySelectorAll("label");
    var idCounter = 1;
    for (var i = 0; i < upcoming.length; i++) {
      var titleEl = upcoming[i].querySelector("p.font-medium");
      var dueEl = upcoming[i].querySelector("p.text-xs");
      if (!titleEl) continue;

      tasks.push({
        id: idCounter++,
        title: titleEl.textContent.trim(),
        due: dueEl ? dueEl.textContent.trim() : "",
        status: "Open",
        assignee: "",
        notes: "",
      });
    }

    if (!tasks.length) {
      tasks = [
        { id: 1, title: "Finalize Homepage Mockups", due: "Due Tomorrow", status: "In Progress", assignee: "Sarah Miller", notes: "" },
        { id: 2, title: "Weekly Client Sync", due: "Friday, 10:00 AM", status: "Open", assignee: "Alice Freeman", notes: "" },
      ];
    }
  }

  function renderTaskList() {
    if (!taskList) return;

    taskList.innerHTML = "";
    if (!tasks.length) {
      taskList.innerHTML = '<p class="pd-task-empty">No tasks yet.</p>';
      return;
    }

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      var statusKey = (task.status || "open")
        .toLowerCase()
        .replace(/\s+/g, "-");
      var row = document.createElement("div");
      row.className = "pd-task-item";
      row.innerHTML =
        '<div class="pd-task-item__main">' +
        '<h4>' + task.title + '</h4>' +
        '<p>' + (task.due || "No due date") + (task.assignee ? ' • ' + task.assignee : "") + '</p>' +
        '</div>' +
        '<div class="pd-task-item__side">' +
        '<span class="pd-task-badge pd-task-badge--' + statusKey + '">Status: ' + task.status + '</span>' +
        '<div class="pd-task-menu">' +
        '<button type="button" class="pd-task-menu__toggle" data-task-menu-toggle="' + task.id + '" aria-label="Task actions">' +
        '<span class="material-icons-outlined">more_vert</span>' +
        '</button>' +
        '<div class="pd-task-menu__panel hidden" data-task-menu="' + task.id + '">' +
        '<button type="button" class="pd-task-menu__item" data-task-action="edit" data-task-id="' + task.id + '">Edit</button>' +
        '<button type="button" class="pd-task-menu__item pd-task-menu__item--danger" data-task-action="delete" data-task-id="' + task.id + '">Delete</button>' +
        '</div>' +
        '</div>' +
        '</div>';
      taskList.appendChild(row);
    }
  }

  function closeAllTaskMenus() {
    var menus = document.querySelectorAll("[data-task-menu]");
    for (var i = 0; i < menus.length; i++) {
      menus[i].classList.add("hidden");
    }
  }

  function resetTaskEditor() {
    if (!taskForm) return;
    taskForm.reset();
    if (taskIdInput) taskIdInput.value = "";
    if (taskStatusInput) taskStatusInput.value = "Open";
    if (taskEditorTitle) taskEditorTitle.textContent = "Create Task";
  }

  function loadTaskIntoEditor(id) {
    var task = null;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        task = tasks[i];
        break;
      }
    }
    if (!task) return;

    taskIdInput.value = String(task.id);
    taskTitleInput.value = task.title;
    taskDueInput.value = task.due;
    taskStatusInput.value = task.status;
    taskAssigneeInput.value = task.assignee;
    taskNotesInput.value = task.notes;
    taskEditorTitle.textContent = "Edit Task";
    taskTitleInput.focus();
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
    closeAllTaskMenus();
  }

  function hydrateClientFormFromCard() {
    var card = getClientDetailsCard();

    var company = document.getElementById("pd_client_company");
    var industry = document.getElementById("pd_client_industry");
    var contact = document.getElementById("pd_client_contact");
    var email = document.getElementById("pd_client_email");
    var phone = document.getElementById("pd_client_phone");
    var address = document.getElementById("pd_client_address");

    if (!company || !contact || !email) return;

    company.value = card?.querySelector("h3")?.textContent.trim() || "Acme Corp";
    industry.value = card?.querySelector("p.text-sm")?.textContent.trim() || "";

    var textBlocks = card ? card.querySelectorAll("div > p") : [];
    if (textBlocks.length) {
      contact.value = textBlocks[0]?.textContent.trim() || "";
    }

    email.value = card?.querySelector('a[href^="mailto:"]')?.textContent.trim() || "";

    var phoneText = "";
    var addressText = "";
    var infoRows = card ? card.querySelectorAll(".flex.items-start") : [];
    for (var i = 0; i < infoRows.length; i++) {
      var icon = infoRows[i].querySelector(".material-icons")?.textContent.trim();
      var valueEl = infoRows[i].querySelector("a, p");
      if (!valueEl) continue;
      if (icon === "phone") phoneText = valueEl.textContent.trim();
      if (icon === "location_on") addressText = valueEl.textContent.trim();
      if (icon === "person") contact.value = valueEl.textContent.trim();
    }

    phone.value = phoneText;
    address.value = addressText;
  }

  function saveClientFormToCard() {
    var card = getClientDetailsCard();
    if (!card) return;

    var company = document.getElementById("pd_client_company")?.value.trim() || "";
    var industry = document.getElementById("pd_client_industry")?.value.trim() || "";
    var contact = document.getElementById("pd_client_contact")?.value.trim() || "";
    var email = document.getElementById("pd_client_email")?.value.trim() || "";
    var phone = document.getElementById("pd_client_phone")?.value.trim() || "";
    var address = document.getElementById("pd_client_address")?.value.trim() || "";

    var companyEl = card.querySelector("h3");
    if (companyEl) companyEl.textContent = company;

    var industryEl = card.querySelector("p.text-sm");
    if (industryEl) industryEl.textContent = industry;

    var infoRows = card.querySelectorAll(".flex.items-start");
    for (var i = 0; i < infoRows.length; i++) {
      var icon = infoRows[i].querySelector(".material-icons")?.textContent.trim();
      var valueEl = infoRows[i].querySelector("a, p");
      if (!valueEl) continue;

      if (icon === "person") {
        valueEl.textContent = contact;
      } else if (icon === "email") {
        valueEl.textContent = email;
        valueEl.setAttribute("href", "mailto:" + email);
      } else if (icon === "phone") {
        valueEl.textContent = phone;
      } else if (icon === "location_on") {
        valueEl.textContent = address;
      }
    }
  }

  function openModal(action) {
    closeAllModals();
    var modal = modalByAction[action];
    if (!modal) return;

    if (action === "manage-tasks") {
      loadInitialTasks();
      renderTaskList();
      resetTaskEditor();
    }

    if (action === "edit-client") {
      hydrateClientFormFromCard();
    }

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

  document.getElementById("pd-edit-project-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    closeAllModals();
    this.reset();
    if (editProjectName) {
      var h1 = document.querySelector("h1");
      editProjectName.value = h1 ? h1.textContent.trim() : "";
    }
  });

  document.getElementById("pd-create-invoice-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    closeAllModals();
    this.reset();
  });

  document.getElementById("pd-add-team-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    closeAllModals();
    this.reset();
  });

  document.getElementById("pd-edit-client-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    saveClientFormToCard();
    closeAllModals();
  });

  document.getElementById("pd-task-new-btn")?.addEventListener("click", resetTaskEditor);
  document.getElementById("pd-task-cancel-btn")?.addEventListener("click", resetTaskEditor);

  taskList?.addEventListener("click", function (e) {
    var menuToggle = e.target?.closest("[data-task-menu-toggle]");
    if (menuToggle) {
      var menuId = menuToggle.getAttribute("data-task-menu-toggle");
      var panel = document.querySelector('[data-task-menu="' + menuId + '"]');
      if (!panel) return;
      var willOpen = panel.classList.contains("hidden");
      closeAllTaskMenus();
      panel.classList.toggle("hidden", !willOpen);
      return;
    }

    var action = e.target?.getAttribute("data-task-action");
    var id = parseInt(e.target?.getAttribute("data-task-id") || "", 10);
    if (action && !isNaN(id)) {
      closeAllTaskMenus();

      if (action === "edit") {
        loadTaskIntoEditor(id);
        return;
      }

      if (action === "delete") {
        tasks = tasks.filter(function (t) {
          return t.id !== id;
        });
        renderTaskList();
        if (taskIdInput?.value === String(id)) {
          resetTaskEditor();
        }
      }
      return;
    }

    var row = e.target?.closest(".pd-task-item");
    if (!row || e.target?.closest(".pd-task-menu")) return;

    var rowEditButton = row.querySelector('[data-task-action="edit"]');
    if (rowEditButton) {
      var rowId = parseInt(rowEditButton.getAttribute("data-task-id") || "", 10);
      if (!isNaN(rowId)) {
        closeAllTaskMenus();
        loadTaskIntoEditor(rowId);
      }
    }
  });

  taskForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!taskTitleInput?.reportValidity()) return;

    var id = parseInt(taskIdInput.value || "", 10);
    var payload = {
      title: taskTitleInput.value.trim(),
      due: taskDueInput.value.trim(),
      status: taskStatusInput.value,
      assignee: taskAssigneeInput.value.trim(),
      notes: taskNotesInput.value.trim(),
    };

    if (isNaN(id)) {
      var maxId = 0;
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id > maxId) maxId = tasks[i].id;
      }
      tasks.unshift({ id: maxId + 1, title: payload.title, due: payload.due, status: payload.status, assignee: payload.assignee, notes: payload.notes });
    } else {
      for (var j = 0; j < tasks.length; j++) {
        if (tasks[j].id === id) {
          tasks[j].title = payload.title;
          tasks[j].due = payload.due;
          tasks[j].status = payload.status;
          tasks[j].assignee = payload.assignee;
          tasks[j].notes = payload.notes;
          break;
        }
      }
    }

    renderTaskList();
    resetTaskEditor();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllModals();
      closeAllTaskMenus();
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".pd-task-menu")) {
      closeAllTaskMenus();
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

