tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#197fe6",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
        "neutral-surface": "#ffffff",
        "dark-surface": "#1e2936",
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

function initShellToggles() {
  // Mobile menu toggle
  document
    .getElementById("mobile-menu-btn")
    ?.addEventListener("click", function () {
      var sidebar = document.querySelector("aside");
      var overlay = document.getElementById("sidebar-overlay");
      sidebar?.classList.toggle("hidden");
      overlay?.classList.toggle("hidden");
    });

  // Close sidebar when overlay is clicked
  document
    .getElementById("sidebar-overlay")
    ?.addEventListener("click", function () {
      var sidebar = document.querySelector("aside");
      sidebar?.classList.add("hidden");
      this.classList.add("hidden");
    });
}

// ============================================
// Project List Search & Filter Functionality
// ============================================

var currentStatusFilter = "all";
var currentDateFilter = "all";
var currentSearchQuery = "";

function getTableRows() {
  var tableContainer = document.getElementById("projects-table-container");
  if (!tableContainer) return [];
  var tbody = tableContainer.querySelector("tbody");
  if (!tbody) return [];
  return Array.prototype.slice.call(tbody.querySelectorAll("tr"));
}

function parseDate(dateString) {
  if (
    !dateString ||
    dateString.trim() === "" ||
    dateString.toLowerCase() === "tbd"
  ) {
    return null;
  }

  var parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  var months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  var match = dateString.match(/([a-zA-Z]+)\s+(\d+),?\s+(\d{4})/);
  if (match) {
    var month = months[match[1].toLowerCase().substring(0, 3)];
    if (month !== undefined) {
      return new Date(parseInt(match[3], 10), month, parseInt(match[2], 10));
    }
  }

  return null;
}

function rowMatchesFilters(row) {
  var projectNameCell = row.querySelector("td:nth-child(1)");
  var clientCell = row.querySelector("td:nth-child(2)");

  var projectName = projectNameCell
    ? projectNameCell.textContent.toLowerCase()
    : "";
  var clientName = clientCell ? clientCell.textContent.toLowerCase() : "";

  if (currentSearchQuery) {
    var searchMatch =
      projectName.indexOf(currentSearchQuery) !== -1 ||
      clientName.indexOf(currentSearchQuery) !== -1;
    if (!searchMatch) return false;
  }

  if (currentStatusFilter !== "all") {
    var statusCell = row.querySelector("td:nth-child(3)");
    var statusText = statusCell
      ? statusCell.textContent.toLowerCase().trim()
      : "";

    var statusMap = {
      active: ["active"],
      "pending review": ["pending review", "pending"],
      draft: ["draft"],
      "in review": ["in review", "review"],
      completed: ["completed", "complete", "done"],
    };

    var possibleStatuses = statusMap[currentStatusFilter] || [
      currentStatusFilter,
    ];
    var statusMatch = false;

    for (var i = 0; i < possibleStatuses.length; i++) {
      if (statusText.indexOf(possibleStatuses[i]) !== -1) {
        statusMatch = true;
        break;
      }
    }

    if (!statusMatch) return false;
  }

  if (currentDateFilter !== "all") {
    var deadlineCell = row.querySelector("td:nth-child(6)");
    var deadlineText = deadlineCell ? deadlineCell.textContent.trim() : "";
    var rowDate = parseDate(deadlineText);

    if (!rowDate) {
      return false;
    }

    var now = new Date();
    var currentYear = now.getFullYear();
    var currentMonth = now.getMonth();

    var dateMatch = false;

    switch (currentDateFilter) {
      case "this-month":
        dateMatch =
          rowDate.getFullYear() === currentYear &&
          rowDate.getMonth() === currentMonth;
        break;
      case "last-month":
        var lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        var lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        dateMatch =
          rowDate.getFullYear() === lastMonthYear &&
          rowDate.getMonth() === lastMonth;
        break;
      case "this-year":
        dateMatch = rowDate.getFullYear() === currentYear;
        break;
      default:
        dateMatch = true;
    }

    if (!dateMatch) return false;
  }

  return true;
}

function applyFilters() {
  var rows = getTableRows();
  var visibleCount = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var matches = rowMatchesFilters(row);
    row.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  }

  var noResultsMessage = document.getElementById("no-results-message");
  var tableContainer = document.getElementById("projects-table-container");

  if (!noResultsMessage) return;

  if (visibleCount === 0) {
    noResultsMessage.classList.remove("hidden");
    tableContainer?.classList.add("hidden");
  } else {
    noResultsMessage.classList.add("hidden");
    tableContainer?.classList.remove("hidden");
  }
}

function toggleDropdown(dropdown) {
  var statusDropdown = document.getElementById("status-dropdown");
  var dateDropdown = document.getElementById("date-dropdown");

  if (dropdown === statusDropdown) {
    dateDropdown?.classList.add("hidden");
  } else if (dropdown === dateDropdown) {
    statusDropdown?.classList.add("hidden");
  }

  dropdown?.classList.toggle("hidden");
}

function closeAllDropdowns() {
  document.getElementById("status-dropdown")?.classList.add("hidden");
  document.getElementById("date-dropdown")?.classList.add("hidden");
}

function initProjectFilters() {
  var searchInput = document.getElementById("project-search-input");
  var statusFilterBtn = document.getElementById("status-filter-btn");
  var dateFilterBtn = document.getElementById("date-filter-btn");
  var statusFilterText = document.getElementById("status-filter-text");
  var dateFilterText = document.getElementById("date-filter-text");

  if (searchInput) {
    var searchHandler = function (e) {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    };
    searchInput.addEventListener("input", searchHandler);
    searchInput.addEventListener("keyup", searchHandler);
  }

  if (statusFilterBtn) {
    statusFilterBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(document.getElementById("status-dropdown"));
    });
  }

  var statusOptions = document.querySelectorAll(".status-option");
  for (var i = 0; i < statusOptions.length; i++) {
    statusOptions[i].addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      currentStatusFilter = this.getAttribute("data-status");
      if (statusFilterText) statusFilterText.textContent = this.textContent;
      closeAllDropdowns();
      applyFilters();
    });
  }

  if (dateFilterBtn) {
    dateFilterBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(document.getElementById("date-dropdown"));
    });
  }

  var dateOptions = document.querySelectorAll(".date-option");
  for (var j = 0; j < dateOptions.length; j++) {
    dateOptions[j].addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      currentDateFilter = this.getAttribute("data-date");
      if (dateFilterText) dateFilterText.textContent = this.textContent;
      closeAllDropdowns();
      applyFilters();
    });
  }

  document.addEventListener("click", function (e) {
    var statusDrop = document.getElementById("status-dropdown");
    var dateDrop = document.getElementById("date-dropdown");

    var inStatus =
      document.getElementById("status-filter-btn")?.contains(e.target) ||
      statusDrop?.contains(e.target);
    var inDate =
      document.getElementById("date-filter-btn")?.contains(e.target) ||
      dateDrop?.contains(e.target);

    if (!inStatus && !inDate) {
      closeAllDropdowns();
    }
  });
}

// ============================================
// Create Project Modal + Multi-step Form
// ============================================

function initProjectCreateModal() {
  var modal = document.getElementById("project-create-modal");
  var openBtn = document.getElementById("open-project-create-modal");
  var closeBtns = document.querySelectorAll("[data-project-modal-close]");
  var backBtn = document.getElementById("project-back-btn");
  var nextBtn = document.getElementById("project-next-btn");
  var submitBtn = document.getElementById("project-submit-btn");
  var subtitle = document.getElementById("project-create-subtitle");
  var helpText = document.getElementById("project-create-help");
  var form = document.getElementById("project-create-form");
  var stepPanels = document.querySelectorAll("[data-form-step]");
  var stepItems = document.querySelectorAll("[data-step-index]");
  var progress = document.getElementById("project-stepper-progress");
  var addClientBtn = document.querySelector(".project-add-client-btn");
  var createClientModal = document.getElementById("create-client-modal");
  var createClientForm = document.getElementById("create-client-form");
  var createClientCloseBtns = document.querySelectorAll("[data-client-modal-close]");
  var clientInput = document.getElementById("project_client");
  var clientOptions = document.getElementById("project-client-options");
  var newClientFeedback = document.getElementById("new-client-feedback");
  var newClientName = document.getElementById("new_client_name");
  var newClientEmail = document.getElementById("new_client_email");
  var createClientFields = createClientForm
    ? createClientForm.querySelectorAll("input, textarea, select")
    : [];

  if (!modal || !openBtn || !form) return;

  var currentStep = 1;
  var stepMeta = {
    1: {
      subtitle: "Step 1 of 3: Let's start with the basics.",
      help: 'Need help? Check our <a href="#">Project Creation Guide</a>.',
    },
    2: {
      subtitle: "Step 2 of 3: Who is this project for?",
      help: 'Need help? Check our <a href="#">Client Management Guide</a>.',
    },
    3: {
      subtitle: "Step 3 of 3: Finalize the financial details.",
      help: 'Need help? Check our <a href="#">Project Creation Guide</a>.',
    },
  };

  function progressForStep(step) {
    if (step === 1) return "33%";
    if (step === 2) return "66%";
    return "100%";
  }

  function updateStepUI() {
    for (var i = 0; i < stepPanels.length; i++) {
      var step = parseInt(stepPanels[i].getAttribute("data-form-step"), 10);
      stepPanels[i].classList.toggle("is-visible", step === currentStep);
    }

    for (var j = 0; j < stepItems.length; j++) {
      var itemStep = parseInt(stepItems[j].getAttribute("data-step-index"), 10);
      stepItems[j].classList.remove("is-active", "is-done");
      if (itemStep < currentStep) {
        stepItems[j].classList.add("is-done");
      } else if (itemStep === currentStep) {
        stepItems[j].classList.add("is-active");
      }
    }

    if (subtitle) {
      subtitle.textContent = stepMeta[currentStep].subtitle;
    }

    if (helpText) {
      helpText.innerHTML =
        '<span class="material-icons-outlined">info</span> ' +
        stepMeta[currentStep].help;
    }

    if (progress) {
      progress.style.width = progressForStep(currentStep);
    }

    backBtn?.classList.toggle("is-hidden", currentStep === 1);
    nextBtn?.classList.toggle("is-hidden", currentStep === 3);
    submitBtn?.classList.toggle("is-hidden", currentStep !== 3);
  }

  function openModal() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-modal-open");
    currentStep = 1;
    updateStepUI();

    var firstInput = modal.querySelector('[data-form-step="1"] input, [data-form-step="1"] textarea');
    firstInput?.focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-modal-open");
    closeClientModal();
  }

  function validateCurrentStep() {
    var activeStep = modal.querySelector(
      '[data-form-step="' + currentStep + '"]'
    );
    if (!activeStep) return true;

    var requiredFields = activeStep.querySelectorAll("[required]");
    for (var i = 0; i < requiredFields.length; i++) {
      if (
        requiredFields[i].disabled ||
        requiredFields[i].closest(".hidden") ||
        (requiredFields[i].closest("#create-client-modal") &&
          createClientModal?.classList.contains("hidden"))
      ) {
        continue;
      }
      if (!requiredFields[i].reportValidity()) {
        return false;
      }
    }

    return true;
  }

  function setClientModalFieldsDisabled(disabled) {
    for (var i = 0; i < createClientFields.length; i++) {
      createClientFields[i].disabled = disabled;
    }
  }

  openBtn.addEventListener("click", openModal);

  for (var i = 0; i < closeBtns.length; i++) {
    closeBtns[i].addEventListener("click", closeModal);
  }

  nextBtn?.addEventListener("click", function () {
    if (!validateCurrentStep()) return;
    if (currentStep < 3) {
      currentStep += 1;
      updateStepUI();
    }
  });

  backBtn?.addEventListener("click", function () {
    if (currentStep > 1) {
      currentStep -= 1;
      updateStepUI();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    closeModal();
    form.reset();
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      if (createClientModal && !createClientModal.classList.contains("hidden")) {
        closeClientModal();
      } else {
        closeModal();
      }
    }
  });

  function openClientModal() {
    if (!createClientModal || !createClientForm) return;
    createClientModal.classList.remove("hidden");
    createClientModal.setAttribute("aria-hidden", "false");
    setClientModalFieldsDisabled(false);
    if (newClientFeedback) {
      newClientFeedback.textContent = "";
    }
    setTimeout(function () {
      newClientName?.focus();
    }, 0);
  }

  function closeClientModal() {
    if (!createClientModal || !createClientForm) return;
    createClientModal.classList.add("hidden");
    createClientModal.setAttribute("aria-hidden", "true");
    createClientForm.reset();
    setClientModalFieldsDisabled(true);
    if (newClientFeedback) {
      newClientFeedback.textContent = "";
    }
  }

  function clientExists(name) {
    if (!clientOptions || !name) return false;
    var options = clientOptions.querySelectorAll("option");
    var normalized = name.trim().toLowerCase();
    for (var i = 0; i < options.length; i++) {
      if ((options[i].value || "").trim().toLowerCase() === normalized) {
        return true;
      }
    }
    return false;
  }

  function addClientToList(name) {
    if (!clientOptions || !name) return;
    var option = document.createElement("option");
    option.value = name.trim();
    clientOptions.appendChild(option);
  }

  addClientBtn?.addEventListener("click", openClientModal);

  for (var j = 0; j < createClientCloseBtns.length; j++) {
    createClientCloseBtns[j].addEventListener("click", closeClientModal);
  }

  createClientModal?.addEventListener("click", function (e) {
    if (e.target === createClientModal) {
      closeClientModal();
    }
  });

  createClientForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!newClientName?.reportValidity() || !newClientEmail?.reportValidity()) {
      return;
    }

    var clientName = newClientName.value.trim();
    if (clientExists(clientName)) {
      if (newClientFeedback) {
        newClientFeedback.textContent = "Client already exists. Select it from the list.";
      }
      return;
    }

    addClientToList(clientName);
    if (clientInput) {
      clientInput.value = clientName;
    }
    closeClientModal();
  });

  setClientModalFieldsDisabled(true);
  updateStepUI();
}

function init() {
  initShellToggles();
  initProjectFilters();
  initProjectCreateModal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
