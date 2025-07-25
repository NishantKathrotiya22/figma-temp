function getElement(id) {
  return document.querySelector(id);
}

// Custom Dropdown
var dropdowns = document.querySelectorAll(".custom-dropdown");
if (dropdowns.length) {
  // Only one global click listener for closing dropdowns
  document.addEventListener("click", function (e) {
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });
  });

  dropdowns.forEach(function (dropdown) {
    var disp = dropdown.querySelector(".value-display");
    var selected = dropdown.querySelector(".dropdown-selected");
    var options = dropdown.querySelectorAll(".dropdown-option");
    if (selected) {
      selected.addEventListener("click", function (e) {
        e.stopPropagation();

        // Close all other dropdowns before toggling this one
        dropdowns.forEach(function (dd) {
          if (dd !== dropdown) {
            dd.classList.remove("open");
          }
        });

        // Toggle current dropdown
        dropdown.classList.toggle("open");
      });
    }
    options.forEach(function (option) {
      option.addEventListener("click", function (e) {
        e.stopPropagation();
        if (disp) disp.textContent = option.textContent;
        dropdown.classList.remove("open");
      });
    });
  });
}

//Reset Filter Option

document.getElementById("reset").addEventListener("click", function () {
  const dropdowns = document.querySelectorAll(".custom-dropdown");

  dropdowns.forEach(function (dropdown) {
    const disp = dropdown.querySelector(".value-display");
    if (disp) {
      disp.textContent = "Select an option";
    }

    // Optional: Close dropdown if open
    dropdown.classList.remove("open");
  });
});

// Filter Controller
var gridContainerEl = getElement(".grid-container");
var filterBtn = getElement("#filter-btn");
var filterClose = getElement("#filter-close");
var ecHolderEl = getElement(".ec-holder");

if (filterBtn && gridContainerEl) {
  filterBtn.addEventListener("click", function () {
    gridContainerEl.classList.toggle("hide-filter");
    // ecHolderEl.classList.toggle("p-2");
  });
}

if (filterClose && gridContainerEl) {
  filterClose.addEventListener("click", function () {
    gridContainerEl.classList.add("hide-filter");
    // ecHolderEl.classList.add("p-2");
  });
}

// Date Range Picker (jQuery)
if (typeof $ !== "undefined" && typeof $.fn.daterangepicker !== "undefined") {
  $(function () {
    var $dateInput = $('input[name="datefilter"]');
    if ($dateInput.length) {
      $dateInput.daterangepicker({
        autoUpdateInput: true,
        locale: {
          cancelLabel: "Cancel",
          format: "DD/MM/YYYY",
        },
        startDate: moment(),
        endDate: moment(),
        applyButtonClasses: "date-apply-btn",
        cancelButtonClasses: "date-cancel-btn",
      });
      $dateInput.on("apply.daterangepicker", function (ev, picker) {
        $(this).val(
          picker.startDate.format("DD/MM/YYYY") +
            " - " +
            picker.endDate.format("DD/MM/YYYY")
        );

        if (window.ecCalendar) {
          var start = picker.startDate.clone().startOf("day");
          var end = picker.endDate.clone().startOf("day");
          var days = end.diff(start, "days") + 1; // inclusive
          window.ecCalendar.setOption("date", start.toDate());
          window.ecCalendar.setOption("duration", { days: days });
        }
      });
    }
  });
} else {
  console.warn("jQuery or daterangepicker not loaded.");
}
