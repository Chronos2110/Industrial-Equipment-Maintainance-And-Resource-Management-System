// ==========================================================================
// IEMRS - Dashboard JavaScript (js/dashboard.js)
// Dynamically calculates KPIs and populates tables from localStorage data
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
    loadDashboardMetrics();
    loadUpcomingMaintenance();
    loadInventoryAlerts();
    loadRecentActivities();
});

// 1. Calculate and update Overview KPI cards
function loadDashboardMetrics() {
    let equipment = JSON.parse(localStorage.getItem("iemrs_equipment")) || [];
    let workorders = JSON.parse(localStorage.getItem("iemrs_workorders")) || [];

    let total = equipment.length;
    let operational = 0;
    let maintenance = 0;

    for (let i = 0; i < equipment.length; i++) {
        if (equipment[i].status === "Operational") {
            operational++;
        } else if (equipment[i].status === "Maintenance") {
            maintenance++;
        }
    }

    let openOrdersCount = 0;
    for (let j = 0; j < workorders.length; j++) {
        if (workorders[j].status !== "Completed") {
            openOrdersCount++;
        }
    }

    // Update DOM
    document.getElementById("totalEquipment").textContent = total;
    document.getElementById("operationalEquipment").textContent = operational;
    document.getElementById("maintenanceEquipment").textContent = maintenance;
    document.getElementById("openOrders").textContent = openOrdersCount;
}

// 2. Load Upcoming Maintenance Tasks
function loadUpcomingMaintenance() {
    let maintenanceList = JSON.parse(localStorage.getItem("iemrs_maintenance")) || [];
    let tbody = document.getElementById("upcomingMaintenanceBody");
    let emptyState = document.getElementById("maintenanceEmptyState");

    tbody.innerHTML = "";

    // Filter scheduled or in-progress maintenance
    let upcoming = [];
    for (let i = 0; i < maintenanceList.length; i++) {
        if (maintenanceList[i].status === "Scheduled" || maintenanceList[i].status === "In Progress") {
            upcoming.push(maintenanceList[i]);
        }
    }

    if (upcoming.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    // Display first 4 upcoming items
    let countToShow = Math.min(upcoming.length, 4);
    for (let k = 0; k < countToShow; k++) {
        let item = upcoming[k];
        let tr = document.createElement("tr");

        let statusBadgeClass = item.status === "Scheduled" ? "badge-scheduled" : "badge-in-progress";

        tr.innerHTML =
            "<td><strong>" + item.equipment + "</strong></td>" +
            "<td>" + item.scheduledDate + "</td>" +
            "<td><span class='badge-status badge-preventive'>" + item.type + "</span></td>" +
            "<td><span class='badge-status " + statusBadgeClass + "'>" + item.status + "</span></td>";

        tbody.appendChild(tr);
    }
}

// 3. Load Low Stock Inventory Alerts
function loadInventoryAlerts() {
    let inventory = JSON.parse(localStorage.getItem("iemrs_inventory")) || [];
    let container = document.getElementById("inventoryAlertsList");
    let emptyState = document.getElementById("inventoryEmptyState");

    container.innerHTML = "";

    let lowStockItems = [];
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].quantity <= inventory[i].minStock) {
            lowStockItems.push(inventory[i]);
        }
    }

    if (lowStockItems.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    for (let j = 0; j < lowStockItems.length; j++) {
        let item = lowStockItems[j];
        let alertCard = document.createElement("div");
        alertCard.className = "p-3 mb-2 rounded border border-danger-subtle bg-danger-subtle d-flex justify-content-between align-items-center";

        alertCard.innerHTML =
            "<div>" +
            "<strong class='text-danger d-block'>" + item.name + " (" + item.id + ")</strong>" +
            "<small class='text-muted'>Category: " + item.category + " | Supplier: " + item.supplier + "</small>" +
            "</div>" +
            "<span class='badge-status badge-low-stock'>Only " + item.quantity + " left (Min: " + item.minStock + ")</span>";

        container.appendChild(alertCard);
    }
}

// 4. Load Recent Audit Activity
function loadRecentActivities() {
    let activities = JSON.parse(localStorage.getItem("iemrs_activities")) || [];
    let tbody = document.getElementById("recentActivityBody");

    tbody.innerHTML = "";

    for (let i = 0; i < activities.length; i++) {
        let act = activities[i];
        let tr = document.createElement("tr");

        tr.innerHTML =
            "<td><small class='text-muted'>" + act.time + "</small></td>" +
            "<td><strong>" + act.item + "</strong></td>" +
            "<td>" + act.activity + "</td>" +
            "<td><span class='badge bg-light text-dark border'>" + act.user + "</span></td>";

        tbody.appendChild(tr);
    }
}