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

// Mobile menu toggle
document
  .getElementById("mobile-menu-btn")
  ?.addEventListener("click", function () {
    const sidebar = document.querySelector("aside");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar.classList.toggle("hidden");
    overlay.classList.toggle("hidden");
  });

// Close sidebar when overlay is clicked
document
  .getElementById("sidebar-overlay")
  ?.addEventListener("click", function () {
    const sidebar = document.querySelector("aside");
    sidebar.classList.add("hidden");
    this.classList.add("hidden");
  });

// ============================================
// Project List Search & Filter Functionality
// ============================================

// State
var currentStatusFilter = "all";
var currentDateFilter = "all";
var currentSearchQuery = "";

// Get all table rows
function getTableRows() {
  var tableContainer = document.getElementById("projects-table-container");
  if (!tableContainer) return [];
  var tbody = tableContainer.querySelector("tbody");
  if (!tbody) return [];
  return Array.prototype.slice.call(tbody.querySelectorAll("tr"));
}

// Parse date string to Date object
function parseDate(dateString) {
  if (
    !dateString ||
    dateString.trim() === "" ||
    dateString.toLowerCase() === "tbd"
  ) {
    return null;
  }

  // Try to parse the date
  var parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Try common formats
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

  // Format: "Oct 24, 2023"
  var match = dateString.match(/([a-zA-Z]+)\s+(\d+),?\s+(\d{4})/);
  if (match) {
    var month = months[match[1].toLowerCase().substring(0, 3)];
    if (month !== undefined) {
      return new Date(parseInt(match[3]), month, parseInt(match[2]));
    }
  }

  return null;
}

// Check if a row matches the current filters
function rowMatchesFilters(row) {
  // Get text content from project name and client columns
  var projectNameCell = row.querySelector("td:nth-child(1)");
  var clientCell = row.querySelector("td:nth-child(2)");

  var projectName = projectNameCell
    ? projectNameCell.textContent.toLowerCase()
    : "";
  var clientName = clientCell ? clientCell.textContent.toLowerCase() : "";

  // Search filter
  if (currentSearchQuery) {
    var searchMatch =
      projectName.indexOf(currentSearchQuery) !== -1 ||
      clientName.indexOf(currentSearchQuery) !== -1;
    if (!searchMatch) return false;
  }

  // Status filter
  if (currentStatusFilter !== "all") {
    var statusCell = row.querySelector("td:nth-child(3)");
    var statusText = statusCell
      ? statusCell.textContent.toLowerCase().trim()
      : "";

    // Map filter values to possible status text matches
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

  // Date filter
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

// Apply all filters to the table
function applyFilters() {
  var rows = getTableRows();
  var visibleCount = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var matches = rowMatchesFilters(row);
    if (matches) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  }

  // Show/hide no results message
  var noResultsMessage = document.getElementById("no-results-message");
  var tableContainer = document.getElementById("projects-table-container");

  if (noResultsMessage) {
    if (visibleCount === 0) {
      noResultsMessage.classList.remove("hidden");
      if (tableContainer) tableContainer.classList.add("hidden");
    } else {
      noResultsMessage.classList.add("hidden");
      if (tableContainer) tableContainer.classList.remove("hidden");
    }
  }
}

// Toggle dropdown
function toggleDropdown(dropdown) {
  var statusDropdown = document.getElementById("status-dropdown");
  var dateDropdown = document.getElementById("date-dropdown");

  if (dropdown === statusDropdown) {
    if (dateDropdown) dateDropdown.classList.add("hidden");
  } else if (dropdown === dateDropdown) {
    if (statusDropdown) statusDropdown.classList.add("hidden");
  }
  if (dropdown) dropdown.classList.toggle("hidden");
}

// Close all dropdowns
function closeAllDropdowns() {
  var statusDropdown = document.getElementById("status-dropdown");
  var dateDropdown = document.getElementById("date-dropdown");
  if (statusDropdown) statusDropdown.classList.add("hidden");
  if (dateDropdown) dateDropdown.classList.add("hidden");
}

// Initialize the filter functionality
function initProjectFilters() {
  var searchInput = document.getElementById("project-search-input");
  var statusFilterBtn = document.getElementById("status-filter-btn");
  var dateFilterBtn = document.getElementById("date-filter-btn");
  var statusFilterText = document.getElementById("status-filter-text");
  var dateFilterText = document.getElementById("date-filter-text");

  // Search input
  if (searchInput) {
    searchInput.oninput = function (e) {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    };
    searchInput.onkeyup = function (e) {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    };
  }

  // Status filter button
  if (statusFilterBtn) {
    statusFilterBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(document.getElementById("status-dropdown"));
    };
  }

  // Status options
  var statusOptions = document.querySelectorAll(".status-option");
  for (var i = 0; i < statusOptions.length; i++) {
    statusOptions[i].onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      var status = this.getAttribute("data-status");
      currentStatusFilter = status;

      if (statusFilterText) {
        statusFilterText.textContent = this.textContent;
      }

      closeAllDropdowns();
      applyFilters();
    };
  }

  // Date filter button
  if (dateFilterBtn) {
    dateFilterBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(document.getElementById("date-dropdown"));
    };
  }

  // Date options
  var dateOptions = document.querySelectorAll(".date-option");
  for (var i = 0; i < dateOptions.length; i++) {
    dateOptions[i].onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      var dateRange = this.getAttribute("data-date");
      currentDateFilter = dateRange;

      if (dateFilterText) {
        dateFilterText.textContent = this.textContent;
      }

      closeAllDropdowns();
      applyFilters();
    };
  }

  // Close dropdowns when clicking outside
  document.onclick = function (e) {
    var statusFilterBtn = document.getElementById("status-filter-btn");
    var statusDropdown = document.getElementById("status-dropdown");
    var dateFilterBtn = document.getElementById("date-filter-btn");
    var dateDropdown = document.getElementById("date-dropdown");

    var isStatusBtn =
      statusFilterBtn && statusFilterBtn.contains
        ? statusFilterBtn.contains(e.target)
        : false;
    var isStatusDrop =
      statusDropdown && statusDropdown.contains
        ? statusDropdown.contains(e.target)
        : false;
    var isDateBtn =
      dateFilterBtn && dateFilterBtn.contains
        ? dateFilterBtn.contains(e.target)
        : false;
    var isDateDrop =
      dateDropdown && dateDropdown.contains
        ? dateDropdown.contains(e.target)
        : false;

    if (!isStatusBtn && !isStatusDrop && !isDateBtn && !isDateDrop) {
      closeAllDropdowns();
    }
  };
}

// Initialize when DOM is ready
function init() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectFilters);
  } else {
    initProjectFilters();
  }
}

// Start initialization
init();
