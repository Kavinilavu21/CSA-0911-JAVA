/**
 * SMART PARKING MANAGEMENT SYSTEM
 * Course: Java Programming CO1 Assignment
 * Technology: HTML5, CSS3, JavaScript (ES6+)
 * Storage: LocalStorage API
 * Full Interactive Dashboard Script
 */

// =============================================================================
// 1. DATA MODELS & INITIAL STATE SEEDING
// =============================================================================

const STORAGE_KEYS = {
  VEHICLES: 'spms_vehicles_data',
  SLOTS: 'spms_slots_data',
  TICKETS: 'spms_tickets_data',
  ACTIVITIES: 'spms_activities_data'
};

// Rates per vehicle category
const TARIFF_RULES = {
  'two-wheeler': { name: 'Two-Wheeler', hourly: 10, maxDaily: 60, icon: 'fa-motorcycle' },
  'car': { name: 'Car', hourly: 30, maxDaily: 200, icon: 'fa-car' },
  'electric-vehicle': { name: 'Electric Vehicle', hourly: 25, maxDaily: 160, icon: 'fa-bolt' },
  'ebike': { name: 'E-Bike', hourly: 10, maxDaily: 50, icon: 'fa-bicycle' },
  'delivery-van': { name: 'Delivery Van', hourly: 40, maxDaily: 250, icon: 'fa-truck' }
};

// Floor configurations: 5 Floors total (96 slots)
const FLOOR_CONFIGS = [
  { floor: 1, name: 'Floor 1 (Ground)', subtitle: 'EV Charging & Delivery Hub', totalSlots: 16, allowedCategories: ['electric-vehicle', 'delivery-van', 'car'] },
  { floor: 2, name: 'Floor 2 (Level 2)', subtitle: 'Faculty & Staff Reserved', totalSlots: 18, allowedCategories: ['car', 'two-wheeler', 'electric-vehicle'] },
  { floor: 3, name: 'Floor 3 (Level 3)', subtitle: 'Student Car Deck', totalSlots: 20, allowedCategories: ['car', 'electric-vehicle'] },
  { floor: 4, name: 'Floor 4 (Level 4)', subtitle: 'Two-Wheeler & E-Bike Zone', totalSlots: 24, allowedCategories: ['two-wheeler', 'ebike'] },
  { floor: 5, name: 'Floor 5 (Level 5)', subtitle: 'Visitor & General Overflow', totalSlots: 18, allowedCategories: ['car', 'two-wheeler', 'delivery-van', 'electric-vehicle', 'ebike'] }
];

// App State
let state = {
  vehicles: [],
  slots: [],
  tickets: [],
  activities: [],
  currentFloor: 1,
  activeFilterStatus: 'all',
  activeCategoryFilter: 'all',
  currentEditingVehicleId: null
};

// Initialize Application Data
function initDataStore() {
  const storedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  const storedSlots = localStorage.getItem(STORAGE_KEYS.SLOTS);
  const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
  const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);

  if (!storedVehicles || !storedSlots || !storedTickets) {
    seedDefaultData();
  } else {
    state.vehicles = JSON.parse(storedVehicles);
    state.slots = JSON.parse(storedSlots);
    state.tickets = JSON.parse(storedTickets);
    state.activities = storedActivities ? JSON.parse(storedActivities) : [];
  }
}

// Seed Rich Realistic Default Data for Demo
function seedDefaultData() {
  // 1. Initial Vehicles
  const defaultVehicles = [
    { id: 'V-001', regNo: 'TN-09-AX-2024', owner: 'Dr. Ramesh Kumar', contact: '9840123456', category: 'car', role: 'staff', model: 'Honda City White' },
    { id: 'V-002', regNo: 'KA-01-MJ-4589', owner: 'Aarav Sharma', contact: '9741234567', category: 'car', role: 'student', model: 'Hyundai i20 Grey' },
    { id: 'V-003', regNo: 'TN-07-EV-8821', owner: 'Priya Sundaram', contact: '9841876543', category: 'electric-vehicle', role: 'student', model: 'Tata Nexon EV Teal' },
    { id: 'V-004', regNo: 'TN-22-BY-9102', owner: 'Kavita Nair', contact: '9884561230', category: 'two-wheeler', role: 'staff', model: 'Honda Activa 6G Black' },
    { id: 'V-005', regNo: 'DL-04-EB-1122', owner: 'Rahul Verma', contact: '9910987654', category: 'ebike', role: 'student', model: 'Hero Lectro E-Cycle' },
    { id: 'V-006', regNo: 'TN-14-DV-7744', owner: 'Campus Courier Express', contact: '9840998877', category: 'delivery-van', role: 'visitor', model: 'Tata Ace White' },
    { id: 'V-007', regNo: 'KA-03-NV-5012', owner: 'Vikram Patel', contact: '9443123456', category: 'car', role: 'visitor', model: 'Maruti Brezza Red' },
    { id: 'V-008', regNo: 'TN-10-TW-3301', owner: 'Sneha Balan', contact: '9840445566', category: 'two-wheeler', role: 'student', model: 'TVS Jupiter Blue' },
    { id: 'V-009', regNo: 'MH-02-EV-9090', owner: 'Prof. Ananya Sen', contact: '9820112233', category: 'electric-vehicle', role: 'staff', model: 'MG ZS EV Silver' },
    { id: 'V-010', regNo: 'TN-05-DV-4411', owner: 'Stationery Supplies Ltd', contact: '9840332211', category: 'delivery-van', role: 'visitor', model: 'Mahindra Bolero Maxi' }
  ];

  // 2. Initial Slots (96 slots across 5 floors)
  const defaultSlots = [];
  FLOOR_CONFIGS.forEach(cfg => {
    for (let i = 1; i <= cfg.totalSlots; i++) {
      const slotNum = String(i).padStart(2, '0');
      const slotId = `F${cfg.floor}-${slotNum}`;
      
      // Determine default suitable category for this slot
      let category = cfg.allowedCategories[0];
      if (cfg.floor === 1 && i <= 8) category = 'electric-vehicle';
      else if (cfg.floor === 1) category = 'delivery-van';
      else if (cfg.floor === 4 && i > 16) category = 'ebike';
      else if (cfg.floor === 4) category = 'two-wheeler';
      else if (cfg.floor === 2 && i > 12) category = 'two-wheeler';
      else category = 'car';

      defaultSlots.push({
        id: slotId,
        floor: cfg.floor,
        slotNumber: i,
        status: 'available', // available | occupied
        category: category,
        occupiedBy: null, // vehicle object
        ticketId: null,
        entryTime: null
      });
    }
  });

  // 3. Pre-occupy a few slots for realistic demo experience
  const now = new Date();
  
  // Occupy F1-01 with EV V-003
  const slotF1_01 = defaultSlots.find(s => s.id === 'F1-01');
  const entryF1 = new Date(now.getTime() - 2.5 * 3600 * 1000); // 2.5 hrs ago
  slotF1_01.status = 'occupied';
  slotF1_01.occupiedBy = defaultVehicles[2];
  slotF1_01.ticketId = 'TKT-20261115-0101';
  slotF1_01.entryTime = entryF1.toISOString();

  // Occupy F2-02 with Car V-001
  const slotF2_02 = defaultSlots.find(s => s.id === 'F2-02');
  const entryF2 = new Date(now.getTime() - 3.75 * 3600 * 1000); // 3.75 hrs ago
  slotF2_02.status = 'occupied';
  slotF2_02.occupiedBy = defaultVehicles[0];
  slotF2_02.ticketId = 'TKT-20261115-0202';
  slotF2_02.entryTime = entryF2.toISOString();

  // Occupy F3-05 with Car V-002
  const slotF3_05 = defaultSlots.find(s => s.id === 'F3-05');
  const entryF3 = new Date(now.getTime() - 1.2 * 3600 * 1000); // 1.2 hrs ago
  slotF3_05.status = 'occupied';
  slotF3_05.occupiedBy = defaultVehicles[1];
  slotF3_05.ticketId = 'TKT-20261115-0305';
  slotF3_05.entryTime = entryF3.toISOString();

  // Occupy F4-03 with Two-Wheeler V-004
  const slotF4_03 = defaultSlots.find(s => s.id === 'F4-03');
  const entryF4 = new Date(now.getTime() - 4.1 * 3600 * 1000);
  slotF4_03.status = 'occupied';
  slotF4_03.occupiedBy = defaultVehicles[3];
  slotF4_03.ticketId = 'TKT-20261115-0403';
  slotF4_03.entryTime = entryF4.toISOString();

  // Occupy F1-10 with Delivery Van V-006
  const slotF1_10 = defaultSlots.find(s => s.id === 'F1-10');
  const entryF1_10 = new Date(now.getTime() - 0.7 * 3600 * 1000);
  slotF1_10.status = 'occupied';
  slotF1_10.occupiedBy = defaultVehicles[5];
  slotF1_10.ticketId = 'TKT-20261115-0110';
  slotF1_10.entryTime = entryF1_10.toISOString();

  // 4. Initial Tickets (Active + Completed for realistic reports)
  const defaultTickets = [
    {
      ticketId: 'TKT-20261115-0101',
      vehicleReg: defaultVehicles[2].regNo,
      owner: defaultVehicles[2].owner,
      category: defaultVehicles[2].category,
      role: defaultVehicles[2].role,
      floor: 1,
      slotId: 'F1-01',
      entryTime: entryF1.toISOString(),
      exitTime: null,
      status: 'active',
      fee: 0,
      isPaid: false
    },
    {
      ticketId: 'TKT-20261115-0202',
      vehicleReg: defaultVehicles[0].regNo,
      owner: defaultVehicles[0].owner,
      category: defaultVehicles[0].category,
      role: defaultVehicles[0].role,
      floor: 2,
      slotId: 'F2-02',
      entryTime: entryF2.toISOString(),
      exitTime: null,
      status: 'active',
      fee: 0,
      isPaid: false
    },
    {
      ticketId: 'TKT-20261115-0305',
      vehicleReg: defaultVehicles[1].regNo,
      owner: defaultVehicles[1].owner,
      category: defaultVehicles[1].category,
      role: defaultVehicles[1].role,
      floor: 3,
      slotId: 'F3-05',
      entryTime: entryF3.toISOString(),
      exitTime: null,
      status: 'active',
      fee: 0,
      isPaid: false
    },
    {
      ticketId: 'TKT-20261115-0403',
      vehicleReg: defaultVehicles[3].regNo,
      owner: defaultVehicles[3].owner,
      category: defaultVehicles[3].category,
      role: defaultVehicles[3].role,
      floor: 4,
      slotId: 'F4-03',
      entryTime: entryF4.toISOString(),
      exitTime: null,
      status: 'active',
      fee: 0,
      isPaid: false
    },
    {
      ticketId: 'TKT-20261115-0110',
      vehicleReg: defaultVehicles[5].regNo,
      owner: defaultVehicles[5].owner,
      category: defaultVehicles[5].category,
      role: defaultVehicles[5].role,
      floor: 1,
      slotId: 'F1-10',
      entryTime: entryF1_10.toISOString(),
      exitTime: null,
      status: 'active',
      fee: 0,
      isPaid: false
    },
    // Historical Completed Tickets for revenue & analytics
    {
      ticketId: 'TKT-20261115-0081',
      vehicleReg: 'KA-03-NV-5012',
      owner: 'Vikram Patel',
      category: 'car',
      role: 'visitor',
      floor: 5,
      slotId: 'F5-02',
      entryTime: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
      exitTime: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      duration: '3h 0m',
      status: 'completed',
      fee: 94.50, // 3 * 30 = 90 + 5% tax
      isPaid: true
    },
    {
      ticketId: 'TKT-20261115-0074',
      vehicleReg: 'TN-10-TW-3301',
      owner: 'Sneha Balan',
      category: 'two-wheeler',
      role: 'student',
      floor: 4,
      slotId: 'F4-10',
      entryTime: new Date(now.getTime() - 7 * 3600 * 1000).toISOString(),
      exitTime: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      duration: '4h 0m',
      status: 'completed',
      fee: 31.50, // 4 * 10 = 40 - 25% disc = 30 + 5% tax = 31.50
      isPaid: true
    },
    {
      ticketId: 'TKT-20261115-0062',
      vehicleReg: 'MH-02-EV-9090',
      owner: 'Prof. Ananya Sen',
      category: 'electric-vehicle',
      role: 'staff',
      floor: 1,
      slotId: 'F1-04',
      entryTime: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      exitTime: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      duration: '5h 0m',
      status: 'completed',
      fee: 65.60, // 5 * 25 = 125 - 50% = 62.5 + 5% tax = 65.62
      isPaid: true
    }
  ];

  // 5. Activity Stream
  const defaultActivities = [
    { type: 'checkin', text: 'Delivery Van TN-14-DV-7744 checked in at Slot F1-10', time: '42 mins ago' },
    { type: 'checkout', text: 'Prof. Ananya Sen checked out from Slot F1-04 (₹65.60 paid)', time: '1 hour ago' },
    { type: 'checkin', text: 'Student Aarav Sharma parked Car KA-01-MJ-4589 at Slot F3-05', time: '1.2 hours ago' },
    { type: 'checkin', text: 'EV Tata Nexon TN-07-EV-8821 assigned to charging Bay F1-01', time: '2.5 hours ago' },
    { type: 'checkout', text: 'Student Sneha Balan exited Slot F4-10 (₹31.50 paid)', time: '3 hours ago' },
    { type: 'checkin', text: 'Staff Car TN-09-AX-2024 parked at Slot F2-02', time: '3.75 hours ago' }
  ];

  state.vehicles = defaultVehicles;
  state.slots = defaultSlots;
  state.tickets = defaultTickets;
  state.activities = defaultActivities;

  saveAllData();
}

function saveAllData() {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(state.vehicles));
  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(state.slots));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(state.tickets));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(state.activities));
}

// Log an activity entry
function logActivity(type, text) {
  state.activities.unshift({
    type: type,
    text: text,
    time: 'Just now'
  });
  if (state.activities.length > 30) state.activities.pop();
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(state.activities));
  renderActivityLog();
}

// =============================================================================
// 2. TARIFF & FEE CALCULATION ENGINE
// =============================================================================

/**
 * Calculates parking fee based on category, role, duration and extras
 * @param {string} category - Vehicle category key
 * @param {string} role - student | staff | visitor
 * @param {number} durationHours - exact hours float
 * @param {boolean} evCharging - optional fast charging fee
 * @returns {object} calculation breakdown
 */
function calculateParkingFee(category, role, durationHours, evCharging = false) {
  const rule = TARIFF_RULES[category] || TARIFF_RULES['car'];
  
  // Grace period: first 15 mins (0.25 hrs) free for visitors
  if (role === 'visitor' && durationHours <= 0.25) {
    return {
      billableHours: 0,
      baseRate: rule.hourly,
      baseAmount: 0,
      chargingFee: 0,
      grossAmount: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxAmount: 0,
      netPayable: 0,
      isGraceFree: true
    };
  }

  // Billable hours: minimum 1 hour, thereafter rounded up to nearest 0.5 hour
  let billableHours = Math.max(1, Math.ceil(durationHours * 2) / 2);
  let baseAmount = billableHours * rule.hourly;

  // Apply maximum daily cap
  if (baseAmount > rule.maxDaily) {
    baseAmount = rule.maxDaily;
  }

  // EV charging addon
  const chargingFee = (category === 'electric-vehicle' && evCharging) ? 50 : 0;
  const grossAmount = baseAmount + chargingFee;

  // Role discounts
  let discountPercent = 0;
  if (role === 'student') {
    discountPercent = 25; // 25% student discount
  } else if (role === 'staff') {
    discountPercent = 50; // 50% staff concession
  } else {
    discountPercent = 0;
  }

  const discountAmount = (baseAmount * discountPercent) / 100;
  const subtotalAfterDiscount = grossAmount - discountAmount;

  // Campus facility surcharge / GST 5%
  const taxAmount = (subtotalAfterDiscount * 5) / 100;
  const netPayable = Math.round((subtotalAfterDiscount + taxAmount) * 100) / 100;

  return {
    billableHours,
    baseRate: rule.hourly,
    baseAmount: Math.round(baseAmount * 100) / 100,
    chargingFee,
    grossAmount: Math.round(grossAmount * 100) / 100,
    discountPercent,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netPayable: Math.max(0, netPayable),
    isGraceFree: false
  };
}

// Convert millisecond duration to human readable format (e.g. "2h 45m")
function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  if (totalMinutes < 1) return '< 1 min';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// =============================================================================
// 3. ROUTER & VIEW CONTROLLER
// =============================================================================

function navigateTo(targetHash) {
  const hash = targetHash.replace('#', '') || 'home';
  
  // Hide all views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active-view');
  });

  // Remove active state from nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${hash}`) {
      link.classList.add('active');
    }
  });

  // Activate matching view
  const targetView = document.getElementById(`view-${hash}`);
  if (targetView) {
    targetView.classList.add('active-view');
  } else {
    document.getElementById('view-home').classList.add('active-view');
  }

  // Update header title and breadcrumbs
  updateHeaderBreadcrumbs(hash);

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Refresh page-specific components
  refreshActiveViewData(hash);

  // Scroll smoothly to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateHeaderBreadcrumbs(viewName) {
  const titleMap = {
    home: { title: 'Campus Smart Parking System', crumb: 'Home' },
    dashboard: { title: 'Live Parking Dashboard', crumb: 'Dashboard' },
    vehicles: { title: 'Registered Vehicle Management', crumb: 'Vehicles' },
    slots: { title: 'Multi-Floor Slot Allocation', crumb: 'Parking Slots' },
    calculator: { title: 'Interactive Parking Fee Calculator', crumb: 'Fee Calculator' },
    tickets: { title: 'Parking Tickets & Passes', crumb: 'Tickets' },
    categories: { title: 'Campus Vehicle Categories & Tariffs', crumb: 'Categories' },
    reports: { title: 'Analytics & Management Reports', crumb: 'Reports' },
    about: { title: 'About Java Programming CO1 Project', crumb: 'About Project' }
  };

  const info = titleMap[viewName] || titleMap.home;
  const pageTitleEl = document.getElementById('current-page-title');
  const breadcrumbEl = document.getElementById('current-page-crumb');
  
  if (pageTitleEl) pageTitleEl.textContent = info.title;
  if (breadcrumbEl) breadcrumbEl.textContent = info.crumb;
}

function refreshActiveViewData(viewName) {
  switch (viewName) {
    case 'dashboard':
      renderDashboardMetrics();
      renderFloorOccupancyRows();
      renderActivityLog();
      break;
    case 'vehicles':
      renderVehiclesTable();
      break;
    case 'slots':
      renderSlotsGrid();
      break;
    case 'calculator':
      updateCalculatorOutput();
      break;
    case 'tickets':
      renderTicketsTable();
      break;
    case 'categories':
      renderCategoriesStats();
      break;
    case 'reports':
      renderReportsAnalytics();
      break;
    default:
      renderHomeStats();
      break;
  }
}

// =============================================================================
// 4. HOME PAGE & DASHBOARD METRICS
// =============================================================================

function renderHomeStats() {
  const totalSlots = state.slots.length;
  const occupiedSlots = state.slots.filter(s => s.status === 'occupied').length;
  const availableSlots = totalSlots - occupiedSlots;
  const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100);

  const homeOccupancyEl = document.getElementById('home-stat-occupancy');
  const homeAvailableEl = document.getElementById('home-stat-available');
  const homeVehiclesEl = document.getElementById('home-stat-vehicles');
  const homeTicketsEl = document.getElementById('home-stat-tickets');

  if (homeOccupancyEl) homeOccupancyEl.textContent = `${occupancyRate}%`;
  if (homeAvailableEl) homeAvailableEl.textContent = availableSlots;
  if (homeVehiclesEl) homeVehiclesEl.textContent = state.vehicles.length;
  if (homeTicketsEl) homeTicketsEl.textContent = state.tickets.length;
}

function renderDashboardMetrics() {
  const totalSlots = state.slots.length;
  const occupiedSlots = state.slots.filter(s => s.status === 'occupied').length;
  const availableSlots = totalSlots - occupiedSlots;
  const totalVehicles = state.vehicles.length;

  // Calculate today's revenue from completed and active tickets
  let totalRevenue = 0;
  state.tickets.forEach(t => {
    if (t.isPaid && t.fee) {
      totalRevenue += Number(t.fee);
    }
  });

  // Calculate live occupancy %
  const occPercent = Math.round((occupiedSlots / totalSlots) * 100);
  const availPercent = 100 - occPercent;

  // DOM Elements
  const elTotalSlots = document.getElementById('metric-total-slots');
  const elAvailSlots = document.getElementById('metric-avail-slots');
  const elOccSlots = document.getElementById('metric-occ-slots');
  const elTotalVehicles = document.getElementById('metric-total-vehicles');
  const elRevenue = document.getElementById('metric-revenue');

  const barAvail = document.getElementById('metric-bar-avail');
  const barOcc = document.getElementById('metric-bar-occ');

  if (elTotalSlots) elTotalSlots.textContent = totalSlots;
  if (elAvailSlots) elAvailSlots.textContent = availableSlots;
  if (elOccSlots) elOccSlots.textContent = occupiedSlots;
  if (elTotalVehicles) elTotalVehicles.textContent = totalVehicles;
  if (elRevenue) elRevenue.textContent = `₹${totalRevenue.toFixed(2)}`;

  if (barAvail) barAvail.style.width = `${availPercent}%`;
  if (barOcc) barOcc.style.width = `${occPercent}%`;

  // Update counts in sidebar badges
  const badgeVehicles = document.getElementById('badge-count-vehicles');
  const badgeSlots = document.getElementById('badge-count-slots');
  const badgeTickets = document.getElementById('badge-count-tickets');

  if (badgeVehicles) badgeVehicles.textContent = totalVehicles;
  if (badgeSlots) badgeSlots.textContent = `${occupiedSlots}/${totalSlots}`;
  if (badgeTickets) badgeTickets.textContent = state.tickets.filter(t => t.status === 'active').length;
}

function renderFloorOccupancyRows() {
  const container = document.getElementById('dashboard-floor-bars');
  if (!container) return;

  container.innerHTML = '';

  FLOOR_CONFIGS.forEach(cfg => {
    const floorSlots = state.slots.filter(s => s.floor === cfg.floor);
    const occupiedCount = floorSlots.filter(s => s.status === 'occupied').length;
    const availCount = floorSlots.length - occupiedCount;
    const pct = Math.round((occupiedCount / floorSlots.length) * 100);

    const row = document.createElement('div');
    row.className = 'floor-row';
    row.innerHTML = `
      <div class="floor-row-header">
        <div class="floor-row-name">
          <i class="fa-solid fa-layer-group text-blue-500"></i>
          <span>${cfg.name}</span>
          <span style="font-size:0.75rem; color:var(--slate-500); font-weight:normal;">(${cfg.subtitle})</span>
        </div>
        <div class="floor-row-stats">
          <span style="color:var(--danger);">${occupiedCount} Occupied</span> / 
          <span style="color:var(--success);">${availCount} Free</span> 
          <strong style="margin-left:0.5rem; color:var(--navy-900);">${pct}%</strong>
        </div>
      </div>
      <div class="floor-progress-track">
        <div class="floor-progress-bar" style="width: ${pct}%;"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderActivityLog() {
  const container = document.getElementById('recent-activity-container');
  if (!container) return;

  if (state.activities.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:1.5rem;">
        <i class="fa-solid fa-clock-rotate-left empty-state-icon" style="font-size:2rem;"></i>
        <p>No recent activity recorded yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  state.activities.slice(0, 7).forEach(act => {
    const isCheckin = act.type === 'checkin';
    const item = document.createElement('div');
    item.className = 'floor-row';
    item.style.marginBottom = '0.5rem';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'space-between';

    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <div style="width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:${isCheckin ? 'var(--success-bg)' : 'var(--blue-50)'}; color:${isCheckin ? 'var(--success)' : 'var(--blue-600)'};">
          <i class="fa-solid ${isCheckin ? 'fa-arrow-right-to-bracket' : 'fa-arrow-right-from-bracket'}"></i>
        </div>
        <div>
          <div style="font-size:0.86rem; font-weight:600; color:var(--navy-900);">${escapeHtml(act.text)}</div>
          <div style="font-size:0.72rem; color:var(--slate-400);">${escapeHtml(act.time)}</div>
        </div>
      </div>
      <span class="badge ${isCheckin ? 'badge-available' : 'badge-category'}">${isCheckin ? 'Entry' : 'Exit'}</span>
    `;
    container.appendChild(item);
  });
}

// =============================================================================
// 5. VEHICLE MANAGEMENT MODULE
// =============================================================================

function renderVehiclesTable() {
  const tbody = document.getElementById('vehicles-table-body');
  const searchInput = document.getElementById('vehicle-search-input');
  const roleFilter = document.getElementById('vehicle-role-filter');
  const categoryFilter = document.getElementById('vehicle-category-filter');
  const emptyState = document.getElementById('vehicles-empty-state');

  if (!tbody) return;

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedRole = roleFilter ? roleFilter.value : 'all';
  const selectedCat = categoryFilter ? categoryFilter.value : 'all';

  // Filter list
  const filtered = state.vehicles.filter(v => {
    const matchesSearch = v.regNo.toLowerCase().includes(searchTerm) ||
                          v.owner.toLowerCase().includes(searchTerm) ||
                          (v.model && v.model.toLowerCase().includes(searchTerm));
    const matchesRole = selectedRole === 'all' || v.role === selectedRole;
    const matchesCat = selectedCat === 'all' || v.category === selectedCat;
    return matchesSearch && matchesRole && matchesCat;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  filtered.forEach(v => {
    // Check if vehicle is currently parked in any slot
    const occupiedSlot = state.slots.find(s => s.status === 'occupied' && s.occupiedBy && s.occupiedBy.regNo === v.regNo);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="reg-number-cell">${escapeHtml(v.regNo)}</span>
      </td>
      <td>
        <strong style="color:var(--navy-900);">${escapeHtml(v.owner)}</strong>
        <div style="font-size:0.75rem; color:var(--slate-500);"><i class="fa-solid fa-phone" style="font-size:0.65rem;"></i> ${escapeHtml(v.contact || 'N/A')}</div>
      </td>
      <td>
        <span class="badge badge-role-${v.role}">${escapeHtml(v.role)}</span>
      </td>
      <td>
        <span class="badge badge-category">
          <i class="fa-solid ${TARIFF_RULES[v.category]?.icon || 'fa-car'}"></i>
          ${escapeHtml(TARIFF_RULES[v.category]?.name || v.category)}
        </span>
        <div style="font-size:0.75rem; color:var(--slate-400); margin-top:2px;">${escapeHtml(v.model || 'Standard')}</div>
      </td>
      <td>
        ${occupiedSlot 
          ? `<span class="badge badge-occupied"><i class="fa-solid fa-parking"></i> Parked in ${occupiedSlot.id}</span>` 
          : `<span class="badge badge-available"><i class="fa-solid fa-circle-check"></i> Not Parked</span>`}
      </td>
      <td>
        <div class="table-actions">
          ${!occupiedSlot ? `
            <button class="btn btn-sm btn-primary" onclick="openAllocateModalForVehicle('${v.regNo}')" title="Park Vehicle">
              <i class="fa-solid fa-square-parking"></i> Park
            </button>
          ` : `
            <button class="btn btn-sm btn-danger" onclick="openReleaseModal('${occupiedSlot.id}')" title="Release Slot">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Exit
            </button>
          `}
          <button class="icon-action-btn edit" onclick="openEditVehicleModal('${v.id}')" title="Edit Vehicle Details">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="icon-action-btn delete" onclick="confirmDeleteVehicle('${v.id}', '${v.regNo}')" title="Delete Vehicle">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Check for duplicate vehicle registration number
function checkDuplicateRegistration(regNo, excludeId = null) {
  const normalized = regNo.replace(/\s+/g, '').toUpperCase();
  return state.vehicles.some(v => {
    if (excludeId && v.id === excludeId) return false;
    return v.regNo.replace(/\s+/g, '').toUpperCase() === normalized;
  });
}

function handleSaveVehicleForm(e) {
  e.preventDefault();

  const regInput = document.getElementById('veh-reg-number');
  const ownerInput = document.getElementById('veh-owner-name');
  const contactInput = document.getElementById('veh-contact');
  const catInput = document.getElementById('veh-category');
  const roleInput = document.getElementById('veh-role');
  const modelInput = document.getElementById('veh-model');
  const errorBox = document.getElementById('veh-form-error');

  const regNo = regInput.value.trim().toUpperCase();
  const owner = ownerInput.value.trim();
  const contact = contactInput.value.trim();
  const category = catInput.value;
  const role = roleInput.value;
  const model = modelInput.value.trim();

  // Basic Validation
  if (!regNo || !owner || !category || !role) {
    showFormError(errorBox, 'Please fill in all required fields.');
    return;
  }

  // Duplicate Check
  const isDuplicate = checkDuplicateRegistration(regNo, state.currentEditingVehicleId);
  if (isDuplicate) {
    showFormError(errorBox, `Duplicate Alert: Vehicle registration "${regNo}" is already registered in the system!`);
    regInput.focus();
    return;
  }

  if (state.currentEditingVehicleId) {
    // Edit existing vehicle
    const vehicle = state.vehicles.find(v => v.id === state.currentEditingVehicleId);
    if (vehicle) {
      const oldReg = vehicle.regNo;
      vehicle.regNo = regNo;
      vehicle.owner = owner;
      vehicle.contact = contact;
      vehicle.category = category;
      vehicle.role = role;
      vehicle.model = model;

      // Update in active slot if parked
      const parkedSlot = state.slots.find(s => s.status === 'occupied' && s.occupiedBy && s.occupiedBy.id === vehicle.id);
      if (parkedSlot) {
        parkedSlot.occupiedBy = vehicle;
      }

      showToast(`Vehicle ${regNo} updated successfully!`, 'success');
      logActivity('checkin', `Updated vehicle profile: ${regNo} (${owner})`);
    }
  } else {
    // Add new vehicle
    const newId = `V-${String(state.vehicles.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-3)}`;
    const newVehicle = {
      id: newId,
      regNo: regNo,
      owner: owner,
      contact: contact,
      category: category,
      role: role,
      model: model || 'Standard'
    };
    state.vehicles.push(newVehicle);
    showToast(`Vehicle ${regNo} registered successfully!`, 'success');
    logActivity('checkin', `Registered new vehicle: ${regNo} (${role.toUpperCase()})`);
  }

  saveAllData();
  closeModal('modal-vehicle-form');
  renderVehiclesTable();
  renderDashboardMetrics();
}

function openAddVehicleModal() {
  state.currentEditingVehicleId = null;
  const modalTitle = document.getElementById('veh-modal-title');
  const errorBox = document.getElementById('veh-form-error');
  const form = document.getElementById('form-vehicle');

  if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-car"></i> Add New Vehicle';
  if (errorBox) errorBox.style.display = 'none';
  if (form) form.reset();

  openModal('modal-vehicle-form');
}

function openEditVehicleModal(vehicleId) {
  const vehicle = state.vehicles.find(v => v.id === vehicleId);
  if (!vehicle) return;

  state.currentEditingVehicleId = vehicleId;
  const modalTitle = document.getElementById('veh-modal-title');
  const errorBox = document.getElementById('veh-form-error');

  if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Vehicle: ${vehicle.regNo}`;
  if (errorBox) errorBox.style.display = 'none';

  document.getElementById('veh-reg-number').value = vehicle.regNo;
  document.getElementById('veh-owner-name').value = vehicle.owner;
  document.getElementById('veh-contact').value = vehicle.contact || '';
  document.getElementById('veh-category').value = vehicle.category;
  document.getElementById('veh-role').value = vehicle.role;
  document.getElementById('veh-model').value = vehicle.model || '';

  openModal('modal-vehicle-form');
}

function confirmDeleteVehicle(vehicleId, regNo) {
  // Check if vehicle is parked
  const isParked = state.slots.some(s => s.status === 'occupied' && s.occupiedBy && s.occupiedBy.regNo === regNo);
  if (isParked) {
    showToast(`Cannot delete ${regNo} while it is parked in a slot. Please release the slot first.`, 'warning');
    return;
  }

  if (confirm(`Are you sure you want to delete vehicle ${regNo}? This action cannot be undone.`)) {
    state.vehicles = state.vehicles.filter(v => v.id !== vehicleId);
    saveAllData();
    showToast(`Vehicle ${regNo} removed from database.`, 'info');
    renderVehiclesTable();
    renderDashboardMetrics();
  }
}

// =============================================================================
// 6. PARKING SLOT MANAGEMENT (5 FLOORS INTERACTIVE)
// =============================================================================

function switchFloor(floorNum) {
  state.currentFloor = Number(floorNum);
  
  // Highlight active tab
  document.querySelectorAll('.floor-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (Number(btn.dataset.floor) === state.currentFloor) {
      btn.classList.add('active');
    }
  });

  renderSlotsGrid();
}

function renderSlotsGrid() {
  const grid = document.getElementById('parking-slots-grid');
  const statusFilter = document.getElementById('slot-status-filter');
  const catFilter = document.getElementById('slot-cat-filter');
  const floorTitle = document.getElementById('current-floor-banner-title');
  const floorSub = document.getElementById('current-floor-banner-sub');

  if (!grid) return;

  const currentCfg = FLOOR_CONFIGS.find(f => f.floor === state.currentFloor) || FLOOR_CONFIGS[0];
  if (floorTitle) floorTitle.textContent = currentCfg.name;
  if (floorSub) floorSub.textContent = currentCfg.subtitle;

  const selectedStatus = statusFilter ? statusFilter.value : 'all';
  const selectedCat = catFilter ? catFilter.value : 'all';

  // Filter slots for current floor
  const floorSlots = state.slots.filter(s => {
    if (s.floor !== state.currentFloor) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    if (selectedCat !== 'all' && s.category !== selectedCat) return false;
    return true;
  });

  grid.innerHTML = '';

  if (floorSlots.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-filter empty-state-icon"></i>
        <h3>No slots matching filter</h3>
        <p>Try resetting the status or vehicle category filters.</p>
      </div>
    `;
    return;
  }

  const now = new Date();

  floorSlots.forEach(slot => {
    const isOccupied = slot.status === 'occupied';
    const card = document.createElement('div');
    card.className = `parking-slot-card ${isOccupied ? 'status-occupied' : 'status-available'}`;
    
    // Category icon
    const catIcon = TARIFF_RULES[slot.category]?.icon || 'fa-car';
    const catName = TARIFF_RULES[slot.category]?.name || slot.category;

    let durationText = '';
    let regNumberBadge = '';

    if (isOccupied && slot.entryTime) {
      const durationMs = now.getTime() - new Date(slot.entryTime).getTime();
      durationText = `<div class="slot-duration-tag"><i class="fa-solid fa-stopwatch"></i> ${formatDuration(durationMs)}</div>`;
      regNumberBadge = `<div class="slot-reg-tag">${escapeHtml(slot.occupiedBy?.regNo || 'GUEST')}</div>`;
    }

    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="slot-id-badge">${slot.id}</span>
          <span class="badge ${isOccupied ? 'badge-occupied' : 'badge-available'}">
            ${isOccupied ? 'Occupied' : 'Available'}
          </span>
        </div>
        <div class="slot-type-indicator">
          <i class="fa-solid ${catIcon}"></i> ${catName}
        </div>
      </div>

      <div>
        <div class="slot-vehicle-icon">
          <i class="fa-solid ${isOccupied ? catIcon : 'fa-circle-dot'}"></i>
        </div>
        ${regNumberBadge}
        ${durationText}
      </div>

      <div class="slot-card-bottom">
        ${isOccupied ? `
          <button class="btn btn-slot-action btn-slot-release" onclick="event.stopPropagation(); openReleaseModal('${slot.id}')">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Checkout
          </button>
        ` : `
          <button class="btn btn-slot-action btn-slot-allocate" onclick="event.stopPropagation(); openAllocateModal('${slot.id}')">
            <i class="fa-solid fa-plus-circle"></i> Allocate
          </button>
        `}
      </div>
    `;

    // Clicking anywhere on card also triggers action
    card.onclick = () => {
      if (isOccupied) {
        openReleaseModal(slot.id);
      } else {
        openAllocateModal(slot.id);
      }
    };

    grid.appendChild(card);
  });
}

// Open Slot Allocation Modal
function openAllocateModal(slotId) {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot) return;

  const slotTitle = document.getElementById('alloc-slot-id');
  const slotFloor = document.getElementById('alloc-floor-name');
  const vehicleSelect = document.getElementById('alloc-vehicle-select');
  const guestRegInput = document.getElementById('alloc-guest-reg');
  const entryTimeInput = document.getElementById('alloc-entry-time');
  const errorBox = document.getElementById('alloc-form-error');

  if (slotTitle) slotTitle.textContent = slot.id;
  if (slotFloor) slotFloor.textContent = `Floor ${slot.floor} (${TARIFF_RULES[slot.category]?.name || 'All Types'})`;
  if (errorBox) errorBox.style.display = 'none';

  // Fill vehicle dropdown with non-parked vehicles
  if (vehicleSelect) {
    vehicleSelect.innerHTML = '<option value="">-- Choose from Registered Vehicles --</option>';
    const nonParkedVehicles = state.vehicles.filter(v => {
      return !state.slots.some(s => s.status === 'occupied' && s.occupiedBy && s.occupiedBy.regNo === v.regNo);
    });

    nonParkedVehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.regNo;
      opt.textContent = `${v.regNo} - ${v.owner} (${TARIFF_RULES[v.category]?.name || v.category}, ${v.role})`;
      vehicleSelect.appendChild(opt);
    });
  }

  if (guestRegInput) guestRegInput.value = '';
  
  // Set current datetime as default
  if (entryTimeInput) {
    const localIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    entryTimeInput.value = localIso;
  }

  // Store target slot ID in dataset
  document.getElementById('modal-allocate-slot').dataset.targetSlot = slotId;
  openModal('modal-allocate-slot');
}

// Shortcut: open allocate modal when clicking "Park" button on a vehicle
function openAllocateModalForVehicle(regNo) {
  const vehicle = state.vehicles.find(v => v.regNo === regNo);
  if (!vehicle) return;

  // Find an available slot that fits this category
  let suitableSlot = state.slots.find(s => s.status === 'available' && s.category === vehicle.category);
  if (!suitableSlot) {
    // Fallback: any available slot on Floor 5 (overflow) or anywhere
    suitableSlot = state.slots.find(s => s.status === 'available');
  }

  if (!suitableSlot) {
    showToast('Campus Parking is completely full! No slots available.', 'danger');
    return;
  }

  // Switch to that floor and open allocate modal
  switchFloor(suitableSlot.floor);
  openAllocateModal(suitableSlot.id);

  // Pre-select the vehicle in dropdown
  setTimeout(() => {
    const vehicleSelect = document.getElementById('alloc-vehicle-select');
    if (vehicleSelect) vehicleSelect.value = regNo;
  }, 100);
}

// Confirm and process Slot Allocation
function handleAllocateSlotSubmit(e) {
  e.preventDefault();

  const modal = document.getElementById('modal-allocate-slot');
  const slotId = modal.dataset.targetSlot;
  const slot = state.slots.find(s => s.id === slotId);

  const vehicleSelect = document.getElementById('alloc-vehicle-select');
  const guestRegInput = document.getElementById('alloc-guest-reg');
  const guestRoleSelect = document.getElementById('alloc-guest-role');
  const guestCatSelect = document.getElementById('alloc-guest-cat');
  const guestOwnerInput = document.getElementById('alloc-guest-owner');
  const entryTimeInput = document.getElementById('alloc-entry-time');
  const errorBox = document.getElementById('alloc-form-error');

  if (!slot) {
    showToast('Target slot not found!', 'danger');
    return;
  }

  let selectedVehicle = null;
  const chosenReg = vehicleSelect.value;
  const guestReg = guestRegInput.value.trim().toUpperCase();

  if (chosenReg) {
    selectedVehicle = state.vehicles.find(v => v.regNo === chosenReg);
  } else if (guestReg) {
    // Check duplicate in registered list
    const existing = state.vehicles.find(v => v.regNo === guestReg);
    if (existing) {
      selectedVehicle = existing;
    } else {
      // Create guest vehicle
      selectedVehicle = {
        id: `V-GST-${Date.now().toString().slice(-4)}`,
        regNo: guestReg,
        owner: guestOwnerInput.value.trim() || 'Visitor / Guest',
        contact: 'N/A',
        category: guestCatSelect.value || slot.category,
        role: guestRoleSelect.value || 'visitor',
        model: 'Visitor Vehicle'
      };
      state.vehicles.push(selectedVehicle);
    }
  } else {
    showFormError(errorBox, 'Please select a registered vehicle OR enter guest vehicle registration.');
    return;
  }

  // Verify vehicle is not already parked elsewhere
  const alreadyParked = state.slots.find(s => s.status === 'occupied' && s.occupiedBy && s.occupiedBy.regNo === selectedVehicle.regNo);
  if (alreadyParked) {
    showFormError(errorBox, `Vehicle ${selectedVehicle.regNo} is already parked in Slot ${alreadyParked.id}!`);
    return;
  }

  // Parse entry time
  const entryTimeVal = entryTimeInput.value ? new Date(entryTimeInput.value).toISOString() : new Date().toISOString();

  // Generate Unique Ticket Number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  const newTicketId = `TKT-${dateStr}-${randomSuffix}`;

  // Update Slot
  slot.status = 'occupied';
  slot.occupiedBy = selectedVehicle;
  slot.ticketId = newTicketId;
  slot.entryTime = entryTimeVal;

  // Create Ticket Record
  const newTicket = {
    ticketId: newTicketId,
    vehicleReg: selectedVehicle.regNo,
    owner: selectedVehicle.owner,
    category: selectedVehicle.category,
    role: selectedVehicle.role,
    floor: slot.floor,
    slotId: slot.id,
    entryTime: entryTimeVal,
    exitTime: null,
    status: 'active',
    fee: 0,
    isPaid: false
  };

  state.tickets.unshift(newTicket);
  logActivity('checkin', `Allocated Slot ${slot.id} to ${selectedVehicle.regNo} (${selectedVehicle.owner})`);
  saveAllData();

  closeModal('modal-allocate-slot');
  showToast(`Slot ${slot.id} allocated successfully to ${selectedVehicle.regNo}!`, 'success');

  // Open the generated ticket for viewing/printing
  openTicketModal(newTicketId);

  renderSlotsGrid();
  renderDashboardMetrics();
}

// Open Release Slot / Checkout Modal
function openReleaseModal(slotId) {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot || slot.status !== 'occupied') return;

  const ticket = state.tickets.find(t => t.ticketId === slot.ticketId) || {
    ticketId: slot.ticketId || 'TKT-LIVE',
    vehicleReg: slot.occupiedBy?.regNo || 'UNKNOWN',
    category: slot.occupiedBy?.category || slot.category,
    role: slot.occupiedBy?.role || 'visitor',
    entryTime: slot.entryTime || new Date().toISOString()
  };

  const modal = document.getElementById('modal-release-slot');
  modal.dataset.slotId = slot.id;
  modal.dataset.ticketId = ticket.ticketId;

  // Calculate live parking duration
  const entry = new Date(ticket.entryTime);
  const exit = new Date();
  const diffMs = exit.getTime() - entry.getTime();
  const diffHours = Math.max(0.1, diffMs / (1000 * 3600));

  // Calculate fee
  const feeCalc = calculateParkingFee(ticket.category, ticket.role, diffHours);

  // Update modal fields
  document.getElementById('rel-slot-id').textContent = slot.id;
  document.getElementById('rel-veh-reg').textContent = ticket.vehicleReg;
  document.getElementById('rel-veh-owner').textContent = ticket.owner || slot.occupiedBy?.owner || 'Campus Guest';
  document.getElementById('rel-category').textContent = TARIFF_RULES[ticket.category]?.name || ticket.category;
  document.getElementById('rel-entry-time').textContent = entry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  document.getElementById('rel-duration').textContent = formatDuration(diffMs);
  document.getElementById('rel-base-rate').textContent = `₹${feeCalc.baseRate}/hr`;
  document.getElementById('rel-discount').textContent = `${feeCalc.discountPercent}% (-₹${feeCalc.discountAmount.toFixed(2)})`;
  document.getElementById('rel-tax').textContent = `+₹${feeCalc.taxAmount.toFixed(2)}`;
  document.getElementById('rel-total-fee').textContent = `₹${feeCalc.netPayable.toFixed(2)}`;

  // Store fee in dataset for checkout handler
  modal.dataset.computedFee = feeCalc.netPayable;
  modal.dataset.durationStr = formatDuration(diffMs);

  openModal('modal-release-slot');
}

// Confirm and process Slot Release / Checkout
function handleReleaseSlotConfirm() {
  const modal = document.getElementById('modal-release-slot');
  const slotId = modal.dataset.slotId;
  const ticketId = modal.dataset.ticketId;
  const computedFee = Number(modal.dataset.computedFee || 0);
  const durationStr = modal.dataset.durationStr || 'N/A';

  const slot = state.slots.find(s => s.id === slotId);
  const ticket = state.tickets.find(t => t.ticketId === ticketId);

  if (!slot) return;

  const vehicleReg = slot.occupiedBy?.regNo || 'Vehicle';

  // Update Ticket
  if (ticket) {
    ticket.exitTime = new Date().toISOString();
    ticket.duration = durationStr;
    ticket.status = 'completed';
    ticket.fee = computedFee;
    ticket.isPaid = true;
  }

  // Release Slot
  slot.status = 'available';
  slot.occupiedBy = null;
  slot.ticketId = null;
  slot.entryTime = null;

  logActivity('checkout', `Slot ${slotId} released by ${vehicleReg}. Payment: ₹${computedFee.toFixed(2)} received.`);
  saveAllData();

  closeModal('modal-release-slot');
  showToast(`Slot ${slotId} released! Payment of ₹${computedFee.toFixed(2)} marked as PAID.`, 'success');

  // Show exit receipt ticket
  if (ticket) {
    openTicketModal(ticket.ticketId);
  }

  renderSlotsGrid();
  renderDashboardMetrics();
}

// =============================================================================
// 7. PARKING FEE CALCULATOR MODULE
// =============================================================================

let calcSelectedCategory = 'car';

function setCalculatorCategory(cat) {
  calcSelectedCategory = cat;
  
  // Highlight selected card
  document.querySelectorAll('.calc-type-card').forEach(card => {
    card.classList.remove('selected');
    if (card.dataset.category === cat) {
      card.classList.add('selected');
    }
  });

  // Enable/disable EV charging option
  const evBox = document.getElementById('calc-ev-charging-box');
  if (evBox) {
    evBox.style.display = (cat === 'electric-vehicle') ? 'block' : 'none';
  }

  updateCalculatorOutput();
}

function setQuickDuration(hours, btnElement = null) {
  const now = new Date();
  const entry = new Date(now.getTime());
  const exit = new Date(now.getTime() + hours * 3600 * 1000);

  const entryInput = document.getElementById('calc-entry-time');
  const exitInput = document.getElementById('calc-exit-time');

  if (entryInput) {
    entryInput.value = new Date(entry.getTime() - entry.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  if (exitInput) {
    exitInput.value = new Date(exit.getTime() - exit.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  // Highlight active preset button
  document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  } else if (typeof window !== 'undefined' && window.event && window.event.target) {
    window.event.target.classList.add('active');
  }

  updateCalculatorOutput();
}

function updateCalculatorOutput() {
  const roleSelect = document.getElementById('calc-user-role');
  const entryInput = document.getElementById('calc-entry-time');
  const exitInput = document.getElementById('calc-exit-time');
  const evCheckbox = document.getElementById('calc-ev-charging-checkbox');

  if (!entryInput || !exitInput) return;

  const role = roleSelect ? roleSelect.value : 'visitor';
  const evCharging = evCheckbox ? evCheckbox.checked : false;

  const entry = new Date(entryInput.value);
  const exit = new Date(exitInput.value);

  let diffHours = 1;
  if (!isNaN(entry) && !isNaN(exit) && exit > entry) {
    diffHours = (exit.getTime() - entry.getTime()) / (1000 * 3600);
  }

  const breakdown = calculateParkingFee(calcSelectedCategory, role, diffHours, evCharging);
  const durationMs = Math.max(0, exit.getTime() - entry.getTime());

  // Update UI Elements
  const elCategory = document.getElementById('calc-res-category');
  const elDuration = document.getElementById('calc-res-duration');
  const elBaseRate = document.getElementById('calc-res-baserate');
  const elGross = document.getElementById('calc-res-gross');
  const elDiscount = document.getElementById('calc-res-discount');
  const elTax = document.getElementById('calc-res-tax');
  const elTotal = document.getElementById('calc-res-total');
  const elRoleTag = document.getElementById('calc-res-role');

  if (elCategory) elCategory.textContent = TARIFF_RULES[calcSelectedCategory]?.name || calcSelectedCategory;
  if (elDuration) elDuration.textContent = formatDuration(durationMs);
  if (elBaseRate) elBaseRate.textContent = `₹${breakdown.baseRate}/hr (${breakdown.billableHours} hrs billable)`;
  if (elGross) elGross.textContent = `₹${breakdown.grossAmount.toFixed(2)}`;
  if (elDiscount) elDiscount.textContent = `-${breakdown.discountPercent}% (-₹${breakdown.discountAmount.toFixed(2)})`;
  if (elTax) elTax.textContent = `+₹${breakdown.taxAmount.toFixed(2)}`;
  if (elTotal) elTotal.textContent = `₹${breakdown.netPayable.toFixed(2)}`;
  if (elRoleTag) elRoleTag.textContent = role.toUpperCase();
}

// Redirect calculation result to Allocate Slot
function handleProceedToTicketFromCalc() {
  navigateTo('slots');
  showToast('Select an available slot to apply your calculated tariff.', 'info');
}

// =============================================================================
// 8. PARKING TICKET GENERATION & PRINTABLE PASS
// =============================================================================

function renderTicketsTable() {
  const tbody = document.getElementById('tickets-table-body');
  const searchInput = document.getElementById('ticket-search-input');
  const statusFilter = document.getElementById('ticket-status-filter');
  const emptyState = document.getElementById('tickets-empty-state');

  if (!tbody) return;

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedStatus = statusFilter ? statusFilter.value : 'all';

  const filtered = state.tickets.filter(t => {
    const matchesSearch = t.ticketId.toLowerCase().includes(searchTerm) ||
                          t.vehicleReg.toLowerCase().includes(searchTerm) ||
                          (t.slotId && t.slotId.toLowerCase().includes(searchTerm));
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  filtered.forEach(t => {
    const tr = document.createElement('tr');
    const isActive = t.status === 'active';
    const entryDate = new Date(t.entryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const exitDate = t.exitTime ? new Date(t.exitTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Still Parked';

    tr.innerHTML = `
      <td>
        <span class="reg-number-cell" style="background:var(--blue-50); border-color:var(--blue-200); color:var(--blue-600);">${escapeHtml(t.ticketId)}</span>
      </td>
      <td>
        <span class="reg-number-cell">${escapeHtml(t.vehicleReg)}</span>
        <div style="font-size:0.75rem; color:var(--slate-500); margin-top:2px;">${escapeHtml(t.owner || 'Campus Guest')}</div>
      </td>
      <td>
        <strong>${escapeHtml(t.slotId || 'Floor ' + t.floor)}</strong>
        <div style="font-size:0.75rem; color:var(--slate-400);">${TARIFF_RULES[t.category]?.name || t.category}</div>
      </td>
      <td>
        <div style="font-size:0.82rem;">${entryDate}</div>
        <div style="font-size:0.72rem; color:var(--slate-400);">Exit: ${exitDate}</div>
      </td>
      <td>
        <strong style="color:var(--navy-900);">${t.isPaid ? '₹' + Number(t.fee).toFixed(2) : 'Active / Pending'}</strong>
      </td>
      <td>
        <span class="badge ${isActive ? 'badge-occupied' : 'badge-available'}">
          ${isActive ? '<i class="fa-solid fa-clock"></i> Active' : '<i class="fa-solid fa-check"></i> Completed'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="openTicketModal('${t.ticketId}')" title="View & Print Ticket">
            <i class="fa-solid fa-print"></i> Ticket
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Open Printable Ticket Pass Modal
function openTicketModal(ticketId) {
  const ticket = state.tickets.find(t => t.ticketId === ticketId);
  if (!ticket) {
    showToast('Ticket record not found!', 'danger');
    return;
  }

  const now = new Date();
  const entryDate = new Date(ticket.entryTime);
  const exitDate = ticket.exitTime ? new Date(ticket.exitTime) : now;
  const durationMs = exitDate.getTime() - entryDate.getTime();
  const durationStr = ticket.duration || formatDuration(durationMs);

  // If active, compute current accrued fee for preview
  let feeToDisplay = ticket.fee;
  if (ticket.status === 'active') {
    const hours = Math.max(0.1, durationMs / (1000 * 3600));
    const previewCalc = calculateParkingFee(ticket.category, ticket.role, hours);
    feeToDisplay = previewCalc.netPayable;
  }

  // Populate ticket view elements
  document.getElementById('tkt-view-id').textContent = ticket.ticketId;
  document.getElementById('tkt-view-reg').textContent = ticket.vehicleReg;
  document.getElementById('tkt-view-category').textContent = TARIFF_RULES[ticket.category]?.name || ticket.category;
  document.getElementById('tkt-view-role').textContent = (ticket.role || 'Visitor').toUpperCase();
  document.getElementById('tkt-view-slot').textContent = ticket.slotId || `Floor ${ticket.floor}`;
  document.getElementById('tkt-view-entry').textContent = entryDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  document.getElementById('tkt-view-exit').textContent = ticket.exitTime ? new Date(ticket.exitTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Active - In Campus';
  document.getElementById('tkt-view-duration').textContent = durationStr;
  document.getElementById('tkt-view-amount').textContent = `₹${Number(feeToDisplay).toFixed(2)}`;
  document.getElementById('tkt-view-status').textContent = ticket.isPaid ? 'PAID & VERIFIED' : 'ACTIVE / UNPAID';
  document.getElementById('tkt-barcode-num').textContent = `* ${ticket.ticketId} *`;

  // Generate dynamic SVG Barcode lines
  generateSvgBarcode(ticket.ticketId, 'tkt-barcode-svg');

  openModal('modal-view-ticket');
}

// Generate Realistic SVG Barcode
function generateSvgBarcode(text, svgElementId) {
  const svg = document.getElementById(svgElementId);
  if (!svg) return;

  svg.innerHTML = '';
  const width = 280;
  const height = 45;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  let x = 10;
  // Simple deterministic pattern based on characters
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const barWidth1 = (code % 3) + 1;
    const spaceWidth = (code % 2) + 1;
    const barWidth2 = ((code * 2) % 4) + 1;

    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect1.setAttribute('x', x);
    rect1.setAttribute('y', 0);
    rect1.setAttribute('width', barWidth1);
    rect1.setAttribute('height', height);
    rect1.setAttribute('fill', '#0b192c');
    svg.appendChild(rect1);
    x += barWidth1 + spaceWidth;

    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect2.setAttribute('x', x);
    rect2.setAttribute('y', 0);
    rect2.setAttribute('width', barWidth2);
    rect2.setAttribute('height', height);
    rect2.setAttribute('fill', '#0b192c');
    svg.appendChild(rect2);
    x += barWidth2 + 2;

    if (x > width - 15) break;
  }
}

// Print Ticket Handler
function printCurrentTicket() {
  window.print();
}

// =============================================================================
// 9. VEHICLE CATEGORIES CATALOG & LIVE COUNTS
// =============================================================================

function renderCategoriesStats() {
  const categories = ['two-wheeler', 'car', 'electric-vehicle', 'ebike', 'delivery-van'];
  
  categories.forEach(cat => {
    // Count registered
    const regCount = state.vehicles.filter(v => v.category === cat).length;
    // Count currently parked
    const parkedCount = state.slots.filter(s => s.status === 'occupied' && s.occupiedBy && s.occupiedBy.category === cat).length;

    const elReg = document.getElementById(`cat-count-reg-${cat}`);
    const elParked = document.getElementById(`cat-count-parked-${cat}`);

    if (elReg) elReg.textContent = `${regCount} Registered`;
    if (elParked) elParked.textContent = `${parkedCount} Parked Now`;
  });
}

function viewSlotsForCategory(cat) {
  navigateTo('slots');
  const catFilter = document.getElementById('slot-cat-filter');
  if (catFilter) {
    catFilter.value = cat;
  }
  renderSlotsGrid();
}

// =============================================================================
// 10. REPORTS & ANALYTICS MODULE
// =============================================================================

function renderReportsAnalytics() {
  const totalSlots = state.slots.length;
  const occupiedSlots = state.slots.filter(s => s.status === 'occupied').length;
  const totalTickets = state.tickets.length;

  let totalRev = 0;
  let studentRev = 0;
  let staffRev = 0;
  let visitorRev = 0;

  state.tickets.forEach(t => {
    if (t.isPaid && t.fee) {
      const fee = Number(t.fee);
      totalRev += fee;
      if (t.role === 'student') studentRev += fee;
      else if (t.role === 'staff') staffRev += fee;
      else visitorRev += fee;
    }
  });

  // Summary Metrics
  const repTotalSlots = document.getElementById('rep-total-slots');
  const repOccupancyRate = document.getElementById('rep-occupancy-rate');
  const repTotalRevenue = document.getElementById('rep-total-revenue');
  const repTotalTickets = document.getElementById('rep-total-tickets');

  if (repTotalSlots) repTotalSlots.textContent = totalSlots;
  if (repOccupancyRate) repOccupancyRate.textContent = `${Math.round((occupiedSlots / totalSlots) * 100)}%`;
  if (repTotalRevenue) repTotalRevenue.textContent = `₹${totalRev.toFixed(2)}`;
  if (repTotalTickets) repTotalTickets.textContent = totalTickets;

  // Render Category Breakdown Bars
  const catDistributionContainer = document.getElementById('rep-cat-distribution');
  if (catDistributionContainer) {
    catDistributionContainer.innerHTML = '';
    const categories = ['car', 'two-wheeler', 'electric-vehicle', 'ebike', 'delivery-van'];
    
    categories.forEach(cat => {
      const count = state.vehicles.filter(v => v.category === cat).length;
      const pct = state.vehicles.length > 0 ? Math.round((count / state.vehicles.length) * 100) : 0;

      const item = document.createElement('div');
      item.className = 'cat-progress-item';
      item.innerHTML = `
        <div class="cat-progress-label">
          <span><i class="fa-solid ${TARIFF_RULES[cat]?.icon || 'fa-car'}"></i> ${TARIFF_RULES[cat]?.name || cat}</span>
          <span><strong>${count}</strong> (${pct}%)</span>
        </div>
        <div class="floor-progress-track">
          <div class="floor-progress-bar" style="width: ${pct}%;"></div>
        </div>
      `;
      catDistributionContainer.appendChild(item);
    });
  }

  // Render Floor Occupancy Summary List
  const floorReportContainer = document.getElementById('rep-floor-breakdown');
  if (floorReportContainer) {
    floorReportContainer.innerHTML = '';
    FLOOR_CONFIGS.forEach(cfg => {
      const fSlots = state.slots.filter(s => s.floor === cfg.floor);
      const occ = fSlots.filter(s => s.status === 'occupied').length;
      const pct = Math.round((occ / fSlots.length) * 100);

      const row = document.createElement('div');
      row.className = 'cat-progress-item';
      row.innerHTML = `
        <div class="cat-progress-label">
          <span>${cfg.name}</span>
          <span>${occ}/${fSlots.length} Slots (${pct}%)</span>
        </div>
        <div class="floor-progress-track">
          <div class="floor-progress-bar" style="width: ${pct}%; background:${pct > 80 ? 'var(--danger)' : 'var(--blue-500)'};"></div>
        </div>
      `;
      floorReportContainer.appendChild(row);
    });
  }
}

// Export Comprehensive Report to CSV
function exportDataToCsv() {
  if (state.tickets.length === 0) {
    showToast('No transaction data to export!', 'warning');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Ticket ID,Vehicle Registration,Owner,Category,Role,Floor,Slot ID,Entry Time,Exit Time,Duration,Status,Fee (INR),Payment Status\r\n';

  state.tickets.forEach(t => {
    const row = [
      t.ticketId,
      t.vehicleReg,
      `"${t.owner || 'N/A'}"`,
      t.category,
      t.role,
      t.floor,
      t.slotId || 'N/A',
      t.entryTime,
      t.exitTime || 'In Campus',
      t.duration || 'N/A',
      t.status,
      t.fee || 0,
      t.isPaid ? 'PAID' : 'UNPAID'
    ].join(',');
    csvContent += row + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SmartParking_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Report CSV successfully generated and downloaded!', 'success');
}

// Reset Demo Data to initial state
function resetAllDemoData() {
  if (confirm('Are you sure you want to reset all data back to original assignment demo defaults? Any newly added vehicles will be cleared.')) {
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.SLOTS);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);

    seedDefaultData();
    showToast('System reset to default demo data!', 'success');
    navigateTo('dashboard');
  }
}

// =============================================================================
// 11. MODAL HELPERS & UTILITIES
// =============================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Close modal when clicking outside modal dialog
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

function showFormError(errorElement, message) {
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

// Floating Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = {
    success: 'fa-circle-check',
    danger: 'fa-triangle-exclamation',
    warning: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-bell'} toast-icon"></i>
    <div class="toast-msg">${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Mobile sidebar toggle
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('mobile-open');
  }
}

// Live Campus Clock in Top Header
function startCampusClock() {
  const clockEl = document.getElementById('campus-live-clock');
  function updateTime() {
    if (!clockEl) return;
    const now = new Date();
    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    clockEl.textContent = now.toLocaleDateString('en-US', options);
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// =============================================================================
// 12. INITIALIZATION ON DOM READY
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Storage & Data
  initDataStore();

  // Start Header Clock
  startCampusClock();

  // Hash Navigation Listener
  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });

  // Setup sidebar collapse toggle
  const collapseBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const mainLayout = document.getElementById('main-layout');

  if (collapseBtn && sidebar && mainLayout) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      mainLayout.classList.toggle('expanded');
    });
  }

  // Setup Mobile Hamburger
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
  }

  // Setup Vehicle Form Submission
  const formVehicle = document.getElementById('form-vehicle');
  if (formVehicle) {
    formVehicle.addEventListener('submit', handleSaveVehicleForm);
  }

  // Vehicle Search & Filters
  const vehSearch = document.getElementById('vehicle-search-input');
  const vehRoleFilter = document.getElementById('vehicle-role-filter');
  const vehCatFilter = document.getElementById('vehicle-category-filter');

  if (vehSearch) vehSearch.addEventListener('input', renderVehiclesTable);
  if (vehRoleFilter) vehRoleFilter.addEventListener('change', renderVehiclesTable);
  if (vehCatFilter) vehCatFilter.addEventListener('change', renderVehiclesTable);

  // Setup Slot Allocation Form
  const formAllocate = document.getElementById('form-allocate-slot');
  if (formAllocate) {
    formAllocate.addEventListener('submit', handleAllocateSlotSubmit);
  }

  // Slot Filters
  const slotStatusFilter = document.getElementById('slot-status-filter');
  const slotCatFilter = document.getElementById('slot-cat-filter');
  if (slotStatusFilter) slotStatusFilter.addEventListener('change', renderSlotsGrid);
  if (slotCatFilter) slotCatFilter.addEventListener('change', renderSlotsGrid);

  // Ticket Search & Filter
  const tktSearch = document.getElementById('ticket-search-input');
  const tktStatusFilter = document.getElementById('ticket-status-filter');
  if (tktSearch) tktSearch.addEventListener('input', renderTicketsTable);
  if (tktStatusFilter) tktStatusFilter.addEventListener('change', renderTicketsTable);

  // Calculator Form Controls
  const calcRole = document.getElementById('calc-user-role');
  const calcEntry = document.getElementById('calc-entry-time');
  const calcExit = document.getElementById('calc-exit-time');
  const calcEvBox = document.getElementById('calc-ev-charging-checkbox');

  if (calcRole) calcRole.addEventListener('change', updateCalculatorOutput);
  if (calcEntry) calcEntry.addEventListener('input', updateCalculatorOutput);
  if (calcExit) calcExit.addEventListener('input', updateCalculatorOutput);
  if (calcEvBox) calcEvBox.addEventListener('change', updateCalculatorOutput);

  // Initial set for calculator default times
  if (calcEntry && calcExit) {
    const now = new Date();
    const future = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours default
    calcEntry.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    calcExit.value = new Date(future.getTime() - future.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  // Global search input in topbar
  const globalSearch = document.getElementById('header-global-search');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = globalSearch.value.trim();
        if (val) {
          navigateTo('vehicles');
          const vSearch = document.getElementById('vehicle-search-input');
          if (vSearch) {
            vSearch.value = val;
            renderVehiclesTable();
          }
        }
      }
    });
  }

  // Navigate to current hash or default 'home'
  const initialHash = window.location.hash || '#home';
  navigateTo(initialHash);
});
