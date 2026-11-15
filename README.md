# Smart Parking Management System (SPMS)
### **Java Programming CO1 Assignment Project**

> A complete, modern, professional, and fully responsive campus smart parking management website built with **HTML5, CSS3, and JavaScript (ES6+)**.

---

## 🎓 Academic Alignment & Course Outcome (CO1)
This project satisfies the requirements for the **Java Programming CO1 Assignment**:
- **Problem Formulation:** Mitigating campus congestion, eliminating unauthorized parking, replacing slow paper ticketing, and automating multi-floor space allocation.
- **Object-Oriented Modeling (CO1):** System design models core Java OOP principles:
  - **Encapsulation:** `Vehicle`, `ParkingSlot`, and `Ticket` entities with internal state and data validation.
  - **Inheritance Hierarchy:** `Vehicle` base class extended by `Car`, `TwoWheeler`, `EVehicle`, `EBike`, and `DeliveryVan`.
  - **Polymorphism:** Dynamic tariff calculation strategy implementing tiered hourly rules, daily caps, student discounts, and faculty concessions.
  - **Aggregation / Composition:** A `ParkingComplex` containing 5 `ParkingFloor` instances holding 96 individual `ParkingSlot` bays.

---

## 🎨 Color Palette & Visual Design
- **Navy Blue (Primary & Authority):** `#06101e`, `#0b192c`, `#1e3e62`
- **Light Blue & Cyan (Accents & Technology):** `#0077b6`, `#0096c7`, `#00b4d8`, `#e0f2fe`
- **Clean White & Slate Neutrals:** `#ffffff`, `#f8fafc`, `#e2e8f0`
- **Status Indicators:** Emerald Green (Available), Crimson Red (Occupied), Amber (Pending/Reserved)
- **Design Highlights:**
  - Modern collapsible sidebar navigation with active route highlighting and live badges.
  - Live campus clock updating every second.
  - Interactive 5-floor parking bay matrix with status cards and checkout triggers.
  - Print-optimized thermal receipt parking passes with dynamic SVG barcodes.
  - Smooth micro-interactions, responsive flex/grid layouts, and accessible typography.

---

## 🚀 Key Modules & Functional Features

### 1. 🏠 Home Page
- Project introduction with hero section and animated glow effects.
- Live campus statistics ticker (Occupancy rate, Free slots, Total vehicles, Passes issued).
- 5-floor architectural preview cards.
- Core smart capabilities grid.

### 2. 📊 Live Dashboard
- **Capacity KPIs:** Total slots (96), Available slots, Occupied slots, Registered vehicles, Audited revenue.
- **5-Floor Occupancy Monitor:** Visual progress bars depicting utilization across all 5 levels.
- **Recent Activity Stream:** Real-time gate check-in and check-out logs with timestamps.
- **Quick Action Bar:** One-click shortcuts for registration, slot allocation, fee calculator, and CSV export.

### 3. 🚗 Vehicle Management
- Full CRUD vehicle directory with instant client-side search and dual dropdown filters (Role & Category).
- **Duplicate Registration Prevention:** Automatic validation prevents registering duplicate vehicle registration numbers with clear styled alerts.
- Displays parking status (e.g. `Parked in F1-01` or `Not Parked`).
- Direct action to park vehicle or release assigned slot.

### 4. 🅿️ Parking Slot Management (5 Floors Interactive Grid)
- **5 Specialized Campus Floors:**
  - **Floor 1 (Ground Hub - 16 Slots):** Dedicated to Electric Vehicles (with Level-2 chargers) and Campus Delivery Vans.
  - **Floor 2 (Level 2 - 18 Slots):** Reserved for University Faculty & Staff.
  - **Floor 3 (Level 3 - 20 Slots):** Student Four-Wheeler Deck.
  - **Floor 4 (Level 4 - 24 Slots):** Dedicated Two-Wheeler & E-Bike Stands.
  - **Floor 5 (Level 5 - 18 Slots):** Campus Visitors & General Overflow.
- Interactive parking bay cards: Click an available slot to allocate, or an occupied slot to checkout.
- Filter bays by Status (*Available / Occupied*) and Category (*Car, Two-Wheeler, EV, E-Bike, Delivery Van*).

### 5. 🧮 Interactive Parking Fee Calculator
- Live tariff simulation tool.
- Select vehicle category, campus affiliation (*Student 25% discount, Staff 50% concession, Visitor standard*), and optional Level-2 EV fast charging (+₹50).
- Datetime pickers with quick preset chips (*15 mins grace, 1 hr, 2 hrs, 4 hrs, full day, overnight*).
- Itemized receipt breakdown showing base rate, gross amount, role deduction, 5% campus facility surcharge, and net payable.
- "Proceed to Allocate Slot" link to immediately park with calculated tariff.

### 6. 🎫 Verifiable Parking Tickets & Printable Passes
- Automatic generation of unique serial numbers: `TKT-YYYYMMDD-XXXX`.
- Detailed pass layout showing vehicle registration, category, assigned floor/slot, entry/exit timestamps, duration, and fee.
- **Dynamic SVG Barcode Generator:** Renders realistic barcode stripes without external image dependencies.
- **Print Pass Layout:** Clean `@media print` style hides UI controls and formats a thermal receipt receipt for printing.

### 7. 🏷️ Vehicle Categories
- Detailed reference catalog covering all 5 vehicle classes:
  1. **Two-Wheelers:** ₹10/hr (Max cap ₹60/day) &bull; Floor 4
  2. **Cars (Four-Wheelers):** ₹30/hr (Max cap ₹200/day) &bull; Floors 2, 3, 5
  3. **Electric Vehicles (EV):** ₹25/hr (Max cap ₹160/day) &bull; Floor 1
  4. **E-Bikes:** ₹10/hr (Max cap ₹50/day) &bull; Floor 4
  5. **Delivery Vans:** ₹40/hr (Max cap ₹250/day) &bull; Floor 1
- Real-time registered and currently parked fleet counts per category.

### 8. 📈 Reports & Management Analytics
- Daily parking traffic density curve across peak campus hours (08:00 to 18:00).
- Vehicle category distribution bars.
- Floor utilization audit table.
- **Export to CSV:** Generates and downloads `SmartParking_Report_<Date>.csv` with all transaction records.
- **Print Report:** Print-formatted analytics summary.

### 9. 📖 About Project (Java CO1 Documentation)
- Academic assignment submission card.
- Problem statement, objectives, scope, and technical stack.
- Java OOP Concept mapping chart highlighting Encapsulation, Inheritance, Polymorphism, and Composition.

---

## 📁 File Structure
```
smart-parking-system/
├── index.html        # Complete single-page application markup with all views & modals
├── style.css         # Modern styling, navy/white/light-blue palette, responsive grid, print styles
├── script.js         # Core reactive data engine, LocalStorage persistence, tariff rules, ticket generator
└── README.md         # Comprehensive project documentation & user guide
```

---

## 💻 How to Run the Website

### Option 1: Using VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and choose:
   `C:\Users\KAVINILAVU S\.gemini\antigravity\scratch\smart-parking-system`
3. Install the **Live Server** extension if not already installed (Extension ID: `ritwickdey.liveserver`).
4. Right-click `index.html` in the Explorer pane.
5. Click **"Open with Live Server"**.
6. The website will launch automatically in your default web browser at `http://127.0.0.1:5500/index.html`.

### Option 2: Direct Browser Launch
- Double-click `index.html` from Windows File Explorer or drag and drop it into Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

## 💾 Demo Data & Persistence
- The system automatically initializes rich, realistic campus demo records upon first launch using `localStorage`.
- Includes registered student/faculty vehicles, active parked bays on various floors, historical completed tickets, and revenue audits.
- You can reset the demo data back to factory defaults at any time by clicking the **"Reset Demo Data"** button in the header or footer.
