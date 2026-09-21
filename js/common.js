// ==========================================================================
// IEMRS - Common Shared Frontend JavaScript (js/common.js)
// Handles: Role display, Active sidebar navigation, Logout, Alerts, and Data Seeding
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
    initCommon();
    initDefaultData();
});

// Display active navigation, role, and bind logout
function initCommon() {
    // 1. Display Current Role
    let role = sessionStorage.getItem("iemrs_role");
    if (!role) {
        role = "Administrator";
    }

    let roleElements = document.querySelectorAll(".topbar-role, #currentRole");
    roleElements.forEach(function (el) {
        el.textContent = role;
    });

    // 2. Active Sidebar Navigation
    let currentPath = window.location.pathname.toLowerCase();
    let navLinks = document.querySelectorAll(".sidebar a:not(.logout)");

    navLinks.forEach(function (link) {
        let href = link.getAttribute("href");
        if (href && currentPath.includes(href.toLowerCase().replace("../", ""))) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // 3. Logout handling
    let logoutLinks = document.querySelectorAll(".sidebar .logout, #logoutBtn");
    logoutLinks.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            sessionStorage.removeItem("iemrs_role");
            window.location.href = "../index.html";
        });
    });
}

// Show a temporary feedback alert banner
function showAlert(message, type = "success") {
    let container = document.getElementById("alertContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "alertContainer";
        document.body.appendChild(container);
    }

    let alertDiv = document.createElement("div");
    alertDiv.className = "custom-alert custom-alert-" + type;
    alertDiv.innerHTML = "<span>" + message + "</span><button type='button' class='btn-close btn-close-sm' aria-label='Close'></button>";

    let closeBtn = alertDiv.querySelector(".btn-close");
    closeBtn.addEventListener("click", function () {
        alertDiv.remove();
    });

    container.appendChild(alertDiv);

    setTimeout(function () {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3500);
}

// Seed realistic initial data in localStorage if not already present
function initDefaultData() {
    // 1. Equipment Seed
    if (!localStorage.getItem("iemrs_equipment")) {
        let initialEquipment = [
            { id: "EQ001", name: "CNC Machine 01", type: "CNC Machine", location: "Production Floor", status: "Operational", lastMaintenance: "2026-09-10", nextMaintenance: "2026-09-24" },
            { id: "EQ002", name: "Hydraulic Press 02", type: "Hydraulic Press", location: "Workshop A", status: "Maintenance", lastMaintenance: "2026-09-05", nextMaintenance: "2026-09-26" },
            { id: "EQ003", name: "Compressor 04", type: "Compressor", location: "Utility Area", status: "Faulty", lastMaintenance: "2026-09-01", nextMaintenance: "2026-09-28" },
            { id: "EQ004", name: "Lathe Machine 03", type: "Lathe", location: "Production Floor", status: "Operational", lastMaintenance: "2026-09-12", nextMaintenance: "2026-09-30" },
            { id: "EQ005", name: "Industrial Pump 01", type: "Pump", location: "Cooling Plant", status: "Operational", lastMaintenance: "2026-08-28", nextMaintenance: "2026-10-05" },
            { id: "EQ006", name: "Conveyor Belt 02", type: "Conveyor", location: "Assembly Line 1", status: "Operational", lastMaintenance: "2026-09-15", nextMaintenance: "2026-10-02" },
            { id: "EQ007", name: "Generator Unit 01", type: "Generator", location: "Powerhouse", status: "Operational", lastMaintenance: "2026-08-20", nextMaintenance: "2026-10-12" }
        ];
        localStorage.setItem("iemrs_equipment", JSON.stringify(initialEquipment));
    }

    // 2. Maintenance Seed
    if (!localStorage.getItem("iemrs_maintenance")) {
        let initialMaintenance = [
            { id: "MN101", equipment: "CNC Machine 01", type: "Preventive", technician: "Rajesh Kumar", scheduledDate: "2026-09-24", status: "Scheduled" },
            { id: "MN102", equipment: "Hydraulic Press 02", type: "Corrective", technician: "Sarah Jenkins", scheduledDate: "2026-09-22", status: "In Progress" },
            { id: "MN103", equipment: "Compressor 04", type: "Corrective", technician: "Vikram Patel", scheduledDate: "2026-09-20", status: "In Progress" },
            { id: "MN104", equipment: "Lathe Machine 03", type: "Preventive", technician: "David Chen", scheduledDate: "2026-09-30", status: "Scheduled" },
            { id: "MN105", equipment: "Industrial Pump 01", type: "Preventive", technician: "Alex Morgan", scheduledDate: "2026-09-14", status: "Completed" },
            { id: "MN106", equipment: "Conveyor Belt 02", type: "Preventive", technician: "Rajesh Kumar", scheduledDate: "2026-09-15", status: "Completed" }
        ];
        localStorage.setItem("iemrs_maintenance", JSON.stringify(initialMaintenance));
    }

    // 3. Work Orders Seed
    if (!localStorage.getItem("iemrs_workorders")) {
        let initialOrders = [
            { id: "WO-301", equipment: "Compressor 04", problem: "Pressure drop below 120 bar and unusual vibration", technician: "Vikram Patel", priority: "High", date: "2026-09-20", status: "In Progress" },
            { id: "WO-302", equipment: "Hydraulic Press 02", problem: "Cylinder seal leakage and fluid temperature high", technician: "Sarah Jenkins", priority: "High", date: "2026-09-21", status: "In Progress" },
            { id: "WO-303", equipment: "Lathe Machine 03", problem: "Tool holder alignment calibration required", technician: "David Chen", priority: "Medium", date: "2026-09-19", status: "Assigned" },
            { id: "WO-304", equipment: "Industrial Pump 01", problem: "Suction valve inspection and routine flush", technician: "Alex Morgan", priority: "Low", date: "2026-09-18", status: "Completed" },
            { id: "WO-305", equipment: "CNC Machine 01", problem: "Spindle bearing lubrication and chip tray cleaning", technician: "Rajesh Kumar", priority: "Medium", date: "2026-09-21", status: "Open" },
            { id: "WO-306", equipment: "Conveyor Belt 02", problem: "Belt tension adjustment on drive pulley", technician: "Rajesh Kumar", priority: "Low", date: "2026-09-15", status: "Completed" }
        ];
        localStorage.setItem("iemrs_workorders", JSON.stringify(initialOrders));
    }

    // 4. Workforce Seed (SDG 8: Decent Work and Safe Labor)
    if (!localStorage.getItem("iemrs_workforce")) {
        let initialWorkforce = [
            { id: "TECH-01", name: "Rajesh Kumar", skill: "CNC Mechanics & Milling", certification: "ISO-9001 Safety / Master Tech", availability: "Available", workload: "1 Active Order" },
            { id: "TECH-02", name: "Sarah Jenkins", skill: "Hydraulic & Fluid Power", certification: "CMRP (Certified Maintenance)", availability: "Busy", workload: "2 Active Orders" },
            { id: "TECH-03", name: "Vikram Patel", skill: "Pneumatics & Compressors", certification: "Level 2 Vibration Analyst", availability: "Busy", workload: "2 Active Orders" },
            { id: "TECH-04", name: "David Chen", skill: "Electrical Systems & PLC", certification: "Certified Automation Professional", availability: "Available", workload: "1 Active Order" },
            { id: "TECH-05", name: "Alex Morgan", skill: "Pumps & Industrial Piping", certification: "Industrial Safety Standards", availability: "Available", workload: "0 Active Orders" },
            { id: "TECH-06", name: "Priya Sharma", skill: "Predictive Analytics & Sensors", certification: "IIoT Maintenance Specialist", availability: "Unavailable", workload: "On Training Leave" }
        ];
        localStorage.setItem("iemrs_workforce", JSON.stringify(initialWorkforce));
    }

    // 5. Inventory Seed (SDG 12: Responsible Consumption)
    if (!localStorage.getItem("iemrs_inventory")) {
        let initialInventory = [
            { id: "PRT-101", name: "Hydraulic Filter HF-90", category: "Filters", quantity: 3, minStock: 5, supplier: "Bosch Rexroth" },
            { id: "PRT-102", name: "Machine Oil ISO VG 46", category: "Lubricants", quantity: 5, minStock: 10, supplier: "Shell Industrial" },
            { id: "PRT-103", name: "Deep Groove Ball Bearings 6205", category: "Bearings", quantity: 4, minStock: 8, supplier: "SKF Bearings" },
            { id: "PRT-104", name: "Drive Belt V-B52", category: "Mechanical", quantity: 18, minStock: 6, supplier: "Gates Corporation" },
            { id: "PRT-105", name: "Pressure Relief Valve 200B", category: "Mechanical", quantity: 12, minStock: 4, supplier: "Parker Hannifin" },
            { id: "PRT-106", name: "Contactor Relay 24V DC", category: "Electrical", quantity: 25, minStock: 5, supplier: "Siemens Industrial" }
        ];
        localStorage.setItem("iemrs_inventory", JSON.stringify(initialInventory));
    }

    // 6. Recent Activity Log Seed
    if (!localStorage.getItem("iemrs_activities")) {
        let initialActivities = [
            { time: "10 mins ago", item: "Hydraulic Press 02", activity: "Corrective Maintenance logged", user: "Sarah Jenkins", badge: "badge-maintenance" },
            { time: "45 mins ago", item: "Hydraulic Filter HF-90", activity: "Stock level fell below minimum threshold (3 left)", user: "System Monitor", badge: "badge-faulty" },
            { time: "2 hours ago", item: "WO-301 Compressor", activity: "High priority work order created", user: "Administrator", badge: "badge-high" },
            { time: "4 hours ago", item: "Industrial Pump 01", activity: "Preventive maintenance completed successfully", user: "Alex Morgan", badge: "badge-operational" },
            { time: "1 day ago", item: "Conveyor Belt 02", activity: "Work order WO-306 closed", user: "Rajesh Kumar", badge: "badge-completed" }
        ];
        localStorage.setItem("iemrs_activities", JSON.stringify(initialActivities));
    }
}
