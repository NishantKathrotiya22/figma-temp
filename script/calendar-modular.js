/**
 * @fileoverview Modular Calendar Application
 * @description Production-grade calendar application with resource timeline view
 * @author Calendar Team
 * @version 2.0.0
 */

// @ts-nocheck

/**
 * @typedef {Object} EventCalendar
 * @property {Function} create
 */
/**
 * @type {EventCalendar}
 */
var EventCalendar = window.EventCalendar;

/**
 * @namespace CalendarApp
 * @description Main application namespace containing all modules
 */
const CalendarApp = (function () {
  "use strict";

  // ============================================================================
  // CONFIGURATION & CONSTANTS
  // ============================================================================

  const CONFIG = {
    SELECTORS: {
      CALENDAR_CONTAINER: "#ec",
      SIDEBAR_TITLE: ".ec-sidebar-title",
      REGION_FILTER: '.custom-dropdown label[for="region-filter"]',
      WORKTYPE_FILTER: '.custom-dropdown label[for="work-type-filter"]',
      RESET_BUTTON: "#reset",
      TODAY_BUTTON: "#today-btn",
      INITIAL_TAB: "#intial-tab-btn",
      LEAVE_TAB: "#leave-tab-btn",
      SEARCH_INPUT: ".search-input",
      TOOLTIP_ELEMENTS: '[data-bs-toggle="tooltip"]',
      DAY_CONTAINERS:
        ".ec-content > .ec-days:last-child > .ec-day > .ec-events",
      PERSON_DETAILS: ".ec-resource:last-child .person-details",
      EC_DAYS_LAST: ".ec-days:last-child",
      EC_RESOURCE_LAST: ".ec-resource:last-child",
    },
    CALENDAR_OPTIONS: {
      view: "resourceTimelineDay",
      initialView: "resourceTimelineDay",
      slotWidth: "249",
      slotHeight: "80",
      headerToolbar: false,
      editable: false,
      durationEditable: false,
      eventStartEditable: false,
      slotEventOverlap: true,
      slotMinTime: "9:00:00",
      slotMaxTime: "20:00:00",
    },
    TOOLTIP_CONFIG: {
      container: ".ec-body",
      boundary: "clippingParents",
      fallbackPlacements: ["top", "bottom", "left", "right"],
    },
    DEBOUNCE_DELAY: 500,
    HEIGHT_OFFSET: 82,
    WEEK_COLORS: {
      1: "#ff0026ff",
      2: "#225f27ff",
    },
  };

  // ============================================================================
  // UTILITY MODULE
  // ============================================================================

  const Utils = {
    /**
     * Get element by ID with error handling
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null if not found
     */
    getById(id) {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`Element with ID '${id}' not found`);
      }
      return element;
    },

    /**
     * Debounce function for performance optimization
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, delay);
      };
    },

    /**
     * Safe DOM query selector with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {Element|null} Element or null if not found
     */
    querySelector(selector, parent = document) {
      try {
        return parent.querySelector(selector);
      } catch (error) {
        console.error(`Invalid selector: ${selector}`, error);
        return null;
      }
    },

    /**
     * Safe DOM query selector all with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {NodeList|Array} Elements or empty array if error
     */
    querySelectorAll(selector, parent = document) {
      try {
        return parent.querySelectorAll(selector);
      } catch (error) {
        console.error(`Invalid selector: ${selector}`, error);
        return [];
      }
    },

    /**
     * Format duration from milliseconds to hours and minutes
     * @param {number} startMs - Start time in milliseconds
     * @param {number} endMs - End time in milliseconds
     * @returns {string} Formatted duration string
     */
    formatDuration(startMs, endMs) {
      const diffMs = endMs - startMs;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    },

    /**
     * Escape HTML for safe attribute usage
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
      return str
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "");
    },
  };

  // ============================================================================
  // DATA MANAGEMENT MODULE
  // ============================================================================

  const DataManager = {
    /** @type {Array} Global event data */
    eventData: [],

    /** @type {Array} Global resource data */
    resourceData: [],

    /**
     * Set initial data for the calendar
     */
    setInitialData() {
      this.eventData = [
        {
          resourceId: "1",
          start: new Date("2025-07-28T11:45:00+05:30"),
          end: new Date("2025-07-29T13:00:00+05:30"),
          id: "123",
          type: "Full",
          slotEventOverlap: true,
          editable: false,
          durationEditable: false,
          eventStartEditable: false,
          className: ["ec-event-active"],
          extendedProps: {
            employeeID: "100123",
            employeeName: "Diana Alexiou",
            address: "12 King Street, Newtown NSW 2042",
            careerType: "Care Type xyz",
            bookingStatus: "Scheduled",
            region: "Bankstown",
            eventType: "Care Worker",
          },
        },
        // ... Add all your event data here (truncated for brevity)
      ];

      this.resourceData = [
        {
          id: 1,
          extendedProps: {
            name: "Diana Alexiou",
            totalTime: "244h 29m ",
            imgUrl: "Assets/profiles/R1.jpg",
          },
        },
        // ... Add all your resource data here (truncated for brevity)
      ];

      CalendarApp.Renderer.reRenderEvents();
    },

    /**
     * Set leave data for the calendar
     */
    setLeaveData() {
      this.eventData = [
        // ... Your leave event data
      ];

      this.resourceData = [
        // ... Your leave resource data
      ];

      CalendarApp.Renderer.reRenderEvents();
    },

    /**
     * Get current events data
     * @returns {Array} Events array
     */
    getEvents() {
      return this.eventData || [];
    },

    /**
     * Get current resources data
     * @returns {Array} Resources array
     */
    getResources() {
      return this.resourceData || [];
    },

    /**
     * Update events data
     * @param {Array} events - New events data
     */
    updateEvents(events) {
      this.eventData = events;
    },

    /**
     * Update resources data
     * @param {Array} resources - New resources data
     */
    updateResources(resources) {
      this.resourceData = resources;
    },
  };

  // ============================================================================
  // FILTER MODULE
  // ============================================================================

  const FilterManager = {
    /** @type {Object} Current filter state */
    state: {
      region: null,
      worktype: null,
      search: "",
      sortAsc: true,
    },

    /**
     * Reset all filters to default state
     */
    reset() {
      this.state = {
        region: null,
        worktype: null,
        search: "",
        sortAsc: true,
      };
      this.applyFilters();
    },

    /**
     * Set region filter
     * @param {string} region - Region value
     */
    setRegion(region) {
      this.state.region = region;
      this.applyFilters();
    },

    /**
     * Set worktype filter
     * @param {string} worktype - Work type value
     */
    setWorktype(worktype) {
      this.state.worktype = worktype;
      this.applyFilters();
    },

    /**
     * Set search filter
     * @param {string} search - Search query
     */
    setSearch(search) {
      this.state.search = search.toLowerCase().trim();
      this.applyFilters();
    },

    /**
     * Toggle sort order
     */
    toggleSort() {
      this.state.sortAsc = !this.state.sortAsc;
      this.applyFilters();
    },

    /**
     * Get filtered event IDs based on current filters
     * @returns {Array} Array of filtered event IDs
     */
    getFilteredEventIds() {
      const events = DataManager.getEvents();
      return events
        .filter((ev) => {
          let match = true;
          if (this.state.region && this.state.region !== "Select an option") {
            match = match && ev.extendedProps.region === this.state.region;
          }
          if (
            this.state.worktype &&
            this.state.worktype !== "Select an option"
          ) {
            match = match && ev.extendedProps.eventType === this.state.worktype;
          }
          return match;
        })
        .map((ev) => String(ev.resourceId));
    },

    /**
     * Get filtered and searched resources
     * @returns {Array} Filtered resources array
     */
    getFilteredAndSearchedResources() {
      const allResources = DataManager.getResources();
      const filteredEventIds = this.getFilteredEventIds();
      let filteredResources = allResources.filter((res) =>
        filteredEventIds.includes(String(res.id))
      );

      // Apply search filter
      if (this.state.search) {
        filteredResources = filteredResources.filter((res) =>
          res.extendedProps.name.toLowerCase().includes(this.state.search)
        );
      }

      // Apply sorting
      filteredResources.sort((a, b) => {
        const valA = a.extendedProps.name.toLowerCase();
        const valB = b.extendedProps.name.toLowerCase();
        if (valA < valB) return this.state.sortAsc ? -1 : 1;
        if (valA > valB) return this.state.sortAsc ? 1 : -1;
        return 0;
      });

      // If no results with filters, show all resources
      const anyFilter =
        (this.state.region && this.state.region !== "Select an option") ||
        (this.state.worktype && this.state.worktype !== "Select an option") ||
        this.state.search;

      if (anyFilter && filteredResources.length === 0) {
        return allResources;
      }

      return filteredResources;
    },

    /**
     * Apply all current filters
     */
    applyFilters() {
      const filtered = this.getFilteredAndSearchedResources();
      CalendarApp.Renderer.updateResources(filtered);
    },
  };

  // ============================================================================
  // TOOLTIP MODULE
  // ============================================================================

  const TooltipManager = {
    /**
     * Dispose all existing tooltips
     */
    disposeAll() {
      const tooltipElements = Utils.querySelectorAll(
        CONFIG.SELECTORS.TOOLTIP_ELEMENTS
      );
      tooltipElements.forEach((el) => {
        const instance = bootstrap.Tooltip.getInstance(el);
        if (instance) {
          instance.dispose();
        }
      });
    },

    /**
     * Initialize tooltips for all elements
     */
    initializeAll() {
      this.disposeAll();
      const elements = Utils.querySelectorAll(
        CONFIG.SELECTORS.TOOLTIP_ELEMENTS
      );

      elements.forEach((el) => {
        const existing = bootstrap.Tooltip.getInstance(el);
        if (existing) {
          existing.dispose();
        }

        try {
          new bootstrap.Tooltip(el, CONFIG.TOOLTIP_CONFIG);
        } catch (error) {
          console.error("Failed to initialize tooltip:", error);
        }
      });
    },

    /**
     * Render tooltip content for an event
     * @param {Object} arg - Event argument object
     * @returns {string} HTML content for tooltip
     */
    renderTooltipContent(arg) {
      return `
        <div class="custom-tooltip-content">
          <p class="event-desc-id">${arg.event.extendedProps.employeeID}</p>
          <p>12/11/2025 - 18/11/2025</p>
          <div class="event-desc-grid">
            <p>Address (Work Order)</p>
            <p>${arg.event.extendedProps.address}</p>
            <p>Resources</p>
            <p>${arg.event.extendedProps.eventType}</p>
            <p>Booking Status</p>
            <p>${arg.event.extendedProps.bookingStatus}</p>
          </div>
        </div>
      `;
    },
  };

  // ============================================================================
  // HEIGHT SYNC MODULE
  // ============================================================================

  const HeightSyncManager = {
    /**
     * Sync dynamic height for calendar elements
     */
    syncDynamicHeight() {
      const dayContainers = Utils.querySelectorAll(
        CONFIG.SELECTORS.DAY_CONTAINERS
      );
      const target = Utils.querySelector(CONFIG.SELECTORS.PERSON_DETAILS);
      const ecDaysLast = Utils.querySelector(CONFIG.SELECTORS.EC_DAYS_LAST);
      const ecResourceLast = Utils.querySelector(
        CONFIG.SELECTORS.EC_RESOURCE_LAST
      );

      if (!dayContainers.length || !target || !ecDaysLast || !ecResourceLast) {
        console.warn("HeightSync: Required elements not found.");
        return;
      }

      let maxOffsetTop = 0;

      dayContainers.forEach((eventsContainer) => {
        const events = eventsContainer.querySelectorAll(".ec-event");
        events.forEach((ev) => {
          const eventTop = ev.offsetTop;
          if (eventTop > maxOffsetTop) {
            maxOffsetTop = eventTop;
          }
        });
      });

      const finalTop = maxOffsetTop + CONFIG.HEIGHT_OFFSET;

      try {
        target.style.height = `${finalTop}px`;
        ecDaysLast.style.setProperty("--bor-top", `${finalTop}px`);
        ecResourceLast.style.setProperty("--bor-top", `${finalTop}px`);

        console.log("Applied dynamic --bor-top:", finalTop);
      } catch (error) {
        console.error("Failed to apply dynamic height:", error);
      }
    },
  };

  // ============================================================================
  // RENDERER MODULE
  // ============================================================================

  const Renderer = {
    /** @type {Object} Calendar instance */
    calendar: null,

    /**
     * Parse date for header formatting
     * @param {Date} date - Date to format
     * @returns {Object} Formatted date object with HTML
     */
    parseDate(date) {
      const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      });
      const weekday = weekdayFormatter.format(date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      const d = new Date(date);

      // Convert to Excel date number (days since 1900-01-01)
      const excelEpoch = new Date(1900, 0, 1);
      const daysSinceEpoch =
        Math.floor((d - excelEpoch) / (1000 * 60 * 60 * 24)) + 1;

      // WEEKDAY function with mode 2 (Monday = 1, Sunday = 7)
      const weekday2 = ((d.getDay() + 6) % 7) + 1;

      // Excel formula: INT(MOD(date-WEEKDAY(date,2)+1/7,2))+1
      let parity = Math.floor((daysSinceEpoch - weekday2 + 1 / 7) % 2) + 1;

      let label = `${weekday} - ${day}-${month}-${year} (Week-${parity})`;
      const color = CONFIG.WEEK_COLORS[parity] || "#00000";

      return {
        html: `<div style="color: ${color}; padding: 4px 8px; border-radius: 4px;">${label}</div>`,
      };
    },

    /**
     * Render event details
     * @param {Object} arg - Event argument object
     * @returns {Object} Rendered event HTML
     */
    renderEventDetails(arg) {
      const start = new Date(arg.event.start);
      const end = new Date(arg.event.end);
      const durationStr = Utils.formatDuration(start.getTime(), end.getTime());
      arg.event.extendedProps.duration = durationStr;

      const tooltipHtml = Utils.escapeHtml(
        TooltipManager.renderTooltipContent(arg)
      );

      return {
        html: `
          <div class='event-disp-container' 
               data-bs-toggle="tooltip"
               data-bs-html="true" 
               data-bs-placement="bottom"
               data-popper-placement="left" 
               data-bs-custom-class="custom-tooltip" 
               title="${tooltipHtml}">
            <div class="event-disp">
              <p><span class="event-emp-id">${arg.event.extendedProps.employeeID}</span>${arg.event.extendedProps.employeeName}</p>
              <p>${arg.event.extendedProps.region}</p>
              <p>${arg.event.extendedProps.eventType}</p>
              <p>${arg.event.extendedProps.duration}</p>
            </div>
            <div class="event-disp-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.3437 4.84375L16.5937 3.40625C16.8437 3.125 16.8125 2.65625 16.5313 2.40625C16.1875 2.15625 15.75 2.1875 15.5 2.5L14.1875 4.0625C13.1563 3.46875 11.9687 3.0625 10.7187 2.96875V1.9375H12.7188C13.0938 1.9375 13.4063 1.625 13.4063 1.25C13.4063 0.875 13.0938 0.5625 12.7188 0.5625H7.3125C6.9375 0.5625 6.625 0.875 6.625 1.25C6.625 1.625 6.9375 1.9375 7.3125 1.9375H9.3125V2.9375C5.0625 3.28125 1.71875 6.84375 1.71875 11.1875C1.71875 15.75 5.4375 19.4688 10 19.4688C14.5625 19.4688 18.2812 15.75 18.2812 11.1875C18.2812 8.65625 17.125 6.375 15.3437 4.84375ZM10 18.0625C6.21875 18.0625 3.125 14.9688 3.125 11.1875C3.125 7.40625 6.21875 4.3125 10 4.3125C13.7813 4.3125 16.875 7.40625 16.875 11.1875C16.875 14.9688 13.7813 18.0625 10 18.0625Z" fill="currentColor" />
                <path d="M10.6875 11.0625V7.4375C10.6875 7.0625 10.375 6.75 10 6.75C9.625 6.75 9.3125 7.0625 9.3125 7.4375V11.3437C9.3125 11.5312 9.375 11.7188 9.53125 11.8438L11.8438 14.1562C11.9688 14.2812 12.1563 14.375 12.3438 14.375C12.5313 14.375 12.7188 14.3125 12.8438 14.1562C13.125 13.875 13.125 13.4375 12.8438 13.1562L10.6875 11.0625Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        `,
      };
    },

    /**
     * Render resource information
     * @param {Object} info - Resource info object
     * @returns {Object} Rendered resource HTML
     */
    renderResources(info) {
      const props = info?.resource?.extendedProps;

      if (!props || !props.imgUrl || !props.name || !props.totalTime) {
        return {
          html: `<div class="person-details">No Content</div>`,
        };
      }

      return {
        html: `<div class="person-details">
          <div class="profile-img">
            <img src="${props.imgUrl}" alt="${props.name}">
          </div>
          <div class="person-info">   
            <h5>${props.name}</h5>
          </div>
        </div>`,
      };
    },

    /**
     * Render search interface
     */
    renderSearch() {
      const sidebarTitle = Utils.querySelector(CONFIG.SELECTORS.SIDEBAR_TITLE);
      if (!sidebarTitle) {
        console.warn("Sidebar title not found for search rendering");
        return;
      }

      // Create search container
      const searchContainer = document.createElement("div");
      searchContainer.classList.add("search-container");

      // Create search input
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.name = "search-input";
      searchInput.placeholder = "Search resources";
      searchInput.classList.add("search-input");

      // Create search icon
      const searchIcon = document.createElement("img");
      searchIcon.src = "Assets/icons/search.svg";
      searchIcon.alt = "Search";
      searchIcon.classList.add("search-icon");

      // Create sort button
      const sortBtn = document.createElement("button");
      const sortIcon = document.createElement("img");
      sortIcon.src = "Assets/icons/swap.svg";
      sortIcon.alt = "Sort";
      sortBtn.classList.add("sort-btn");
      sortBtn.appendChild(sortIcon);

      // Append elements
      searchContainer.appendChild(searchIcon);
      searchContainer.appendChild(searchInput);
      sidebarTitle.appendChild(searchContainer);
      sidebarTitle.appendChild(sortBtn);

      // Add event listeners
      const debouncedFilter = Utils.debounce((event) => {
        FilterManager.setSearch(event.target.value);
      }, CONFIG.DEBOUNCE_DELAY);

      searchInput.addEventListener("keyup", debouncedFilter);
      sortBtn.addEventListener("click", () => FilterManager.toggleSort());

      HeightSyncManager.syncDynamicHeight();
    },

    /**
     * Re-render all events
     */
    reRenderEvents() {
      TooltipManager.disposeAll();

      if (this.calendar) {
        this.calendar.setOption("events", DataManager.getEvents());
        this.calendar.setOption("resources", DataManager.getResources());

        setTimeout(() => {
          TooltipManager.initializeAll();
          HeightSyncManager.syncDynamicHeight();
        }, 0);
      }
    },

    /**
     * Update resources in calendar
     * @param {Array} data - New resources data
     */
    updateResources(data) {
      if (this.calendar) {
        TooltipManager.disposeAll();
        this.calendar.setOption("resources", data);

        setTimeout(() => {
          TooltipManager.initializeAll();
          HeightSyncManager.syncDynamicHeight();
        }, 0);
      }
    },

    /**
     * Create calendar instance
     */
    createCalendar() {
      const ecEl = Utils.getById("ec");
      if (!ecEl || typeof EventCalendar === "undefined") {
        console.error("Calendar container or EventCalendar library not found.");
        return;
      }

      const calendarOptions = {
        ...CONFIG.CALENDAR_OPTIONS,
        events: DataManager.getEvents(),
        resources: DataManager.getResources(),
        dayHeaderFormat: this.parseDate.bind(this),
        eventContent: this.renderEventDetails.bind(this),
        resourceLabelContent: this.renderResources.bind(this),
        viewDidMount: this.renderSearch.bind(this),
        eventAllUpdated: () => {
          TooltipManager.initializeAll();
          HeightSyncManager.syncDynamicHeight();
        },
      };

      try {
        this.calendar = EventCalendar.create(ecEl, calendarOptions);
        window.ecCalendar = this.calendar;
      } catch (error) {
        console.error("Failed to create calendar:", error);
      }
    },
  };

  // ============================================================================
  // EVENT HANDLERS MODULE
  // ============================================================================

  const EventHandlers = {
    /**
     * Setup filter dropdowns and reset functionality
     */
    setupFilterDropdownsAndReset() {
      // Region filter
      const regionDropdown = Utils.querySelector(
        CONFIG.SELECTORS.REGION_FILTER
      )?.parentElement;
      if (regionDropdown) {
        const regionOptions =
          regionDropdown.querySelectorAll(".dropdown-option");
        regionOptions.forEach((option) => {
          option.addEventListener("click", function () {
            FilterManager.setRegion(option.textContent.trim());
          });
        });
      }

      // Worktype filter
      const worktypeDropdown = Utils.querySelector(
        CONFIG.SELECTORS.WORKTYPE_FILTER
      )?.parentElement;
      if (worktypeDropdown) {
        const worktypeOptions =
          worktypeDropdown.querySelectorAll(".dropdown-option");
        worktypeOptions.forEach((option) => {
          option.addEventListener("click", function () {
            FilterManager.setWorktype(option.textContent.trim());
          });
        });
      }

      // Reset button
      const resetBtn = Utils.getById("reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          FilterManager.reset();
          const searchInput = Utils.querySelector(
            CONFIG.SELECTORS.SEARCH_INPUT
          );
          if (searchInput) {
            searchInput.value = "";
          }
        });
      }
    },

    /**
     * Setup tab switching functionality
     */
    setupTabSwitching() {
      const initialTabBtn = Utils.getById("intial-tab-btn");
      const leaveTabBtn = Utils.getById("leave-tab-btn");

      if (initialTabBtn) {
        initialTabBtn.addEventListener("click", () => {
          initialTabBtn.children[0]?.classList.add("active-tab-btn");
          leaveTabBtn?.children[0]?.classList.remove("active-tab-btn");
          DataManager.setInitialData();
        });
      }

      if (leaveTabBtn) {
        leaveTabBtn.addEventListener("click", () => {
          leaveTabBtn.children[0]?.classList.add("active-tab-btn");
          initialTabBtn?.children[0]?.classList.remove("active-tab-btn");
          DataManager.setLeaveData();
        });
      }
    },

    /**
     * Setup today button functionality
     */
    setupTodayButton() {
      const todayBtn = Utils.getById("today-btn");
      if (todayBtn) {
        todayBtn.addEventListener("click", () => {
          if (Renderer.calendar) {
            Renderer.calendar.setOption("date", new Date());
          }

          // Sync daterangepicker to today
          if (
            typeof $ !== "undefined" &&
            typeof $.fn.daterangepicker !== "undefined"
          ) {
            const $dateInput = $('input[name="datefilter"]');
            if ($dateInput.length && $dateInput.data("daterangepicker")) {
              const today = moment();
              $dateInput.data("daterangepicker").setStartDate(today);
              $dateInput.data("daterangepicker").setEndDate(today);
              $dateInput.val(
                today.format("DD/MM/YYYY") + " - " + today.format("DD/MM/YYYY")
              );
            }
          }
        });
      }
    },
  };

  // ============================================================================
  // INITIALIZATION MODULE
  // ============================================================================

  const Initializer = {
    /**
     * Initialize the entire calendar application
     */
    init() {
      try {
        console.log("Initializing Calendar Application...");

        // Create calendar first
        Renderer.createCalendar();

        // Set initial data
        DataManager.setInitialData();

        // Setup event handlers
        EventHandlers.setupFilterDropdownsAndReset();
        EventHandlers.setupTabSwitching();
        EventHandlers.setupTodayButton();

        console.log("Calendar Application initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Calendar Application:", error);
      }
    },
  };

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // Core modules
    DataManager,
    FilterManager,
    TooltipManager,
    HeightSyncManager,
    Renderer,
    EventHandlers,
    Initializer,
    Utils,

    // Public methods
    init: Initializer.init.bind(Initializer),
    getCalendar: () => Renderer.calendar,
    getData: () => ({
      events: DataManager.getEvents(),
      resources: DataManager.getResources(),
    }),
    updateData: (events, resources) => {
      if (events) DataManager.updateEvents(events);
      if (resources) DataManager.updateResources(resources);
      Renderer.reRenderEvents();
    },
    applyFilters: FilterManager.applyFilters.bind(FilterManager),
    resetFilters: FilterManager.reset.bind(FilterManager),
    syncHeight: HeightSyncManager.syncDynamicHeight.bind(HeightSyncManager),
    reinitializeTooltips: TooltipManager.initializeAll.bind(TooltipManager),
  };
})();

// ============================================================================
// GLOBAL INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
window.addEventListener("DOMContentLoaded", function () {
  CalendarApp.init();
});

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = CalendarApp;
}
