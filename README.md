# Industrial Equipment Maintenance and Resource Management System (IEMRS)

A comprehensive, deployable web-based industrial control and equipment management frontend built for the college **Web Programming Lab**.

---

## 📌 Project Overview

**IEMRS** is an industrial asset management and plant control dashboard designed to monitor equipment health, schedule preventive and corrective maintenance, dispatch work orders, manage certified technician workloads, track critical spare parts inventory, and provide quantitative operational analytics.

### 🌍 UN Sustainable Development Goals (SDG) Alignment:
- **SDG 8 – Decent Work and Economic Growth**: Fair labor allocation, certified technician tracking, safe work order distribution, and workplace hazard mitigation.
- **SDG 9 – Industry, Innovation and Infrastructure**: Quantitative equipment uptime tracking, Mean Time Between Failures (MTBF) optimization, and preventive maintenance scheduling to prevent costly industrial breakdowns.
- **SDG 12 – Responsible Consumption and Production**: Strict spare parts inventory tracking, lubricant degradation control, scrap component minimization, and automated low-stock warnings.

---

## 🛠️ Technology Stack (Frontend Only)

- **Structure**: HTML5 (Semantic elements, accessible modal dialogues, tables)
- **Styling**: Vanilla CSS3 + Bootstrap 5 (Custom "Modern Industrial Control Dashboard" design system in `css/style.css`)
- **Logic**: Vanilla JavaScript (ES6)
- **Persistence**: Browser `localStorage` (Client-side JSON data store)

> **Note**: As per the Web Programming Lab stage, this application is completely backend-agnostic and runs entirely client-side without Node.js, Express, MySQL, or React.

---

## 📂 Project Structure

```
Mini-Project/
│
├── index.html                  # Industrial System Authentication / Login
├── README.md                   # System documentation & viva reference
│
├── pages/
│   ├── dashboard.html          # Control Center, KPIs, Upcoming Maint, Low Stock
│   ├── equipment.html          # Machinery catalog, status filters, Add/Edit/Delete
│   ├── maintenance.html        # Preventive & corrective scheduling, service logs
│   ├── workorders.html         # Fault diagnostics, priority dispatch & resolution
│   ├── workforce.html          # Technician profiles, certifications & workloads (SDG 8)
│   ├── inventory.html          # Spare parts warehouse, minimum stock alerts (SDG 12)
│   └── analytics.html          # Asset reliability, execution rates & material balances (SDG 9)
│
├── css/
│   └── style.css               # Shared Modern Industrial Control design tokens & styles
│
├── js/
│   ├── common.js               # Shared role display, active nav, alerts, data seeding
│   ├── app.js                  # Login validation and session management
│   ├── dashboard.js            # KPI metrics calculation and dynamic dashboard loaders
│   ├── equipment.js            # Equipment CRUD, filtering, modal state
│   ├── maintenance.js          # Maintenance schedule CRUD and type filters
│   ├── workorders.js           # Work order management and priority filters
│   ├── workforce.js            # Technician roster management and availability
│   ├── inventory.js            # Spare parts CRUD, low-stock trigger evaluation
│   └── analytics.js            # Dynamic reliability metrics, progress bars & resource logs
│
└── assets/                     # Static media and icons (if needed)
```

---

## 🚀 Key Features

1. **Authentication Simulation**:
   - Role-based login (Administrator, Technician, Operator).
   - Dynamic topbar role presentation saved in `sessionStorage`.

2. **Control Center Dashboard**:
   - Dynamic KPI cards (Total Equipment, Operational, Under Maintenance, Open Orders).
   - Real-time Upcoming Maintenance table.
   - Low-Stock alerts triggered dynamically when `quantity <= minimumStock`.
   - Live audit activity feed and SDG overview.

3. **Full Interactive CRUD Operations**:
   - Machinery, Maintenance, Work Orders, Workforce, and Inventory all feature full Create, Read, Update, and Delete capabilities.
   - Confirmation prompts before all delete operations.
   - Sensible form validation and instant toast/alert feedback.

4. **Search & Multi-Criteria Filtering**:
   - Instant search across IDs, names, types, and technicians.
   - Status filters, priority filters, and category filters with dedicated empty states.

5. **Client-Side Persistence (`localStorage`)**:
   - Data persists across browser refreshes using `JSON.stringify()` and `JSON.parse()`.
   - Auto-seeded with realistic industrial machinery and spare parts on first load.

6. **Native Pure-CSS Progress & Analytics**:
   - Calculates equipment health rates and maintenance efficiency without third-party chart dependencies.

---

## 🎓 Web Programming Lab Viva Explanation Guide

If asked by the external examiner during the lab viva:

- **How is data persisted without a database?**
  > *"We use browser `localStorage` with `JSON.stringify()` to serialize our JavaScript objects into storage and `JSON.parse()` to retrieve them when rendering tables. This keeps the application fully functional and persistent offline."*

- **How is DOM manipulation handled?**
  > *"We use standard, efficient DOM methods like `document.getElementById()`, `querySelector()`, `addEventListener()`, dynamic table row generation (`document.createElement('tr')`), and simple template strings to inject values."*

- **How are status badges and low-stock alerts determined?**
  > *"In `js/inventory.js`, each part's current quantity is compared against its minimum stock threshold (`item.quantity <= item.minStock`). If true, the system dynamically assigns the `badge-low-stock` CSS class."*

- **How do the pages stay synchronized?**
  > *"Each page modifies the shared `localStorage` arrays (`iemrs_equipment`, `iemrs_maintenance`, `iemrs_inventory`, etc.). When you navigate to Dashboard or Analytics, those scripts read the latest `localStorage` state and recalculate the statistics on the fly."*

---

## 🔮 Future Backend Roadmap

In subsequent iterations, the following backend architecture will be introduced:
- **Runtime**: Node.js & Express.js REST API
- **Database**: MySQL relational schema for normalized tables (`equipment`, `maintenance_logs`, `technicians`, `inventory`, `work_orders`)
- **Authentication**: Secure JWT (JSON Web Tokens) with hashed passwords (bcrypt)
- **Reporting**: Automated PDF generation for preventive maintenance compliance
