function renderTeamListTopbar() {
  return `
    <section class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Team Members</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your team, roles, permissions, and assignments.</p>
      </div>
      <button type="button" data-project-modal-open="add-team-member"
        class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 transition-all">
        <span class="material-icons text-lg mr-2">person_add</span>
        Invite Team Member
      </button>
    </section>
  `;
}

function renderTeamProfileTopbar(name) {
  return `
    <nav class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
      <a class="hover:text-primary transition-colors" href="../main_dashboard.html">Home</a>
      <span>/</span>
      <a class="hover:text-primary transition-colors" href="../global_team_list_view.html">Team</a>
      <span>/</span>
      <span class="text-slate-900 dark:text-white font-medium">${name}</span>
    </nav>
    <div class="pt-1">
      <a href="../global_team_list_view.html" class="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-all">
        <span class="material-icons text-base">arrow_back</span>
        Back to Team List
      </a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  var slot = document.getElementById("team-topbar-slot");
  if (!slot) return;

  var view = document.body.dataset.teamView || "list";
  if (view === "profile") {
    slot.innerHTML = renderTeamProfileTopbar(document.body.dataset.teamMemberName || "Team Member");
    return;
  }

  slot.innerHTML = renderTeamListTopbar();
});
