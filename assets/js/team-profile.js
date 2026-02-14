function initTeamProfileTabs() {
  var tabButtons = document.querySelectorAll("[data-team-tab-target]");
  var tabPanels = document.querySelectorAll("[data-team-tab-panel]");
  if (!tabButtons.length || !tabPanels.length) return;

  function activateTab(tabName) {
    for (var i = 0; i < tabButtons.length; i++) {
      var isActive = tabButtons[i].getAttribute("data-team-tab-target") === tabName;
      tabButtons[i].classList.toggle("team-tab-active", isActive);
      tabButtons[i].classList.toggle("text-slate-500", !isActive);
      tabButtons[i].classList.toggle("dark:text-slate-400", !isActive);
    }

    for (var j = 0; j < tabPanels.length; j++) {
      var shouldShow = tabPanels[j].getAttribute("data-team-tab-panel") === tabName;
      tabPanels[j].classList.toggle("hidden", !shouldShow);
    }
  }

  for (var k = 0; k < tabButtons.length; k++) {
    tabButtons[k].addEventListener("click", function () {
      activateTab(this.getAttribute("data-team-tab-target"));
    });
  }

  activateTab(document.body.dataset.teamDefaultTab || "roles");
}

function initTeamAssignmentModal() {
  if (document.getElementById("team-assign-project-modal")) return;

  var markup = [
    '<div id="team-assign-project-modal" class="pd-modal hidden" aria-hidden="true">',
    '  <div class="pd-modal__backdrop" data-team-modal-close></div>',
    '  <div class="pd-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="team-assign-project-title">',
    '    <form class="pd-modal__card" id="team-assign-project-form">',
    '      <button type="button" class="pd-modal__close" data-team-modal-close aria-label="Close"><span class="material-icons-outlined">close</span></button>',
    '      <div class="pd-modal__header">',
    '        <h2 id="team-assign-project-title" class="pd-modal__title">Assign Project or Task</h2>',
    '        <p class="pd-modal__subtitle">Assign this team member to an existing project and optionally create a new task.</p>',
    '      </div>',
    '      <div class="pd-modal__body">',
    '        <div class="pd-fields">',
    '          <div class="pd-field pd-field--full">',
    '            <label for="team_assign_project">Existing Project <span class="pd-required">*</span></label>',
    '            <select id="team_assign_project" required><option value="">Select a project...</option><option>Blue Point Expansion</option><option>Main Road Renovation</option><option>Lincoln Center Survey</option></select>',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="team_assign_role">Role in Project</label>',
    '            <select id="team_assign_role"><option>Contributor</option><option>Project Lead</option><option>Reviewer</option></select>',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="team_assign_date">Assignment Date</label>',
    '            <input id="team_assign_date" type="date" />',
    '          </div>',
    '          <div class="pd-field pd-field--full">',
    '            <label for="team_new_task_title">Create New Task (Optional)</label>',
    '            <input id="team_new_task_title" type="text" placeholder="e.g. Prepare kickoff brief" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="team_new_task_due">Task Due Date</label>',
    '            <input id="team_new_task_due" type="date" />',
    '          </div>',
    '          <div class="pd-field">',
    '            <label for="team_new_task_priority">Task Priority</label>',
    '            <select id="team_new_task_priority"><option>Normal</option><option>High</option><option>Urgent</option></select>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div class="pd-modal__footer">',
    '        <button type="button" class="pd-btn pd-btn--ghost" data-team-modal-close>Cancel</button>',
    '        <button type="submit" class="pd-btn pd-btn--primary"><span class="material-icons-outlined">assignment_turned_in</span>Assign</button>',
    '      </div>',
    '    </form>',
    '  </div>',
    '</div>',
  ].join("");

  document.body.insertAdjacentHTML("beforeend", markup);
}

function wireTeamAssignmentModal() {
  initTeamAssignmentModal();

  var modal = document.getElementById("team-assign-project-modal");
  var form = document.getElementById("team-assign-project-form");
  if (!modal || !form) return;

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-modal-open");
  }

  function openModal() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-modal-open");
    var firstField = modal.querySelector("select, input");
    if (firstField) firstField.focus();
  }

  var openers = document.querySelectorAll('[data-team-modal-open="assign-project"]');
  for (var i = 0; i < openers.length; i++) {
    openers[i].addEventListener("click", openModal);
  }

  var closers = modal.querySelectorAll("[data-team-modal-close]");
  for (var j = 0; j < closers.length; j++) {
    closers[j].addEventListener("click", closeModal);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    closeModal();
    form.reset();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    initTeamProfileTabs();
    wireTeamAssignmentModal();
  });
} else {
  initTeamProfileTabs();
  wireTeamAssignmentModal();
}
