// ==========================================================================
// IEMRS - Maintenance Management JavaScript (js/maintenance.js)
// Simple CRUD, Filtering, Scheduling, and localStorage Persistence
// ==========================================================================

let maintenanceList = [];
let maintenanceModalInstance = null;

document.addEventListener("DOMContentLoaded", function () {
    // 1. Initialize modal instance
    let modalElement = document.getElementById("maintenanceModal");
    maintenanceModalInstance = new bootstrap.Modal(modalElement);

    // 2. Load data from localStorage
    loadMaintenanceData();

    // 3. Bind search and filter events
    document.getElementById("searchInput").addEventListener("input", filterAndRenderTable);
    document.getElementById("typeFilter").addEventListener("change", filterAndRenderTable);
    document.getElementById("statusFilter").addEventListener("change", filterAndRenderTable);

    // 4. Bind Add button
    document.getElementById("addNewMaintBtn").addEventListener("click", resetForm);

    // 5. Bind form submit
    document.getElementById("maintenanceForm").addEventListener("submit", handleFormSubmit);
});

// Load records from localStorage
function loadMaintenanceData() {
    let saved = localStorage.getItem("iemrs_maintenance");
    if (saved) {
        maintenanceList = JSON.parse(saved);
    } else {
        maintenanceList = [];
    }
    filterAndRenderTable();
    updateKpiCards();
}

// Update summary metric cards
function updateKpiCards() {
    let total = maintenanceList.length;
    let scheduled = 0;
    let inProgress = 0;
    let completed = 0;

    for (let i = 0; i < maintenanceList.length; i++) {
        let st = maintenanceList[i].status;
        if (st === "Scheduled") scheduled++;
        else if (st === "In Progress") inProgress++;
        else if (st === "Completed") completed++;
    }

    document.getElementById("kpiTotalMaint").textContent = total;
    document.getElementById("kpiScheduled").textContent = scheduled;
    document.getElementById("kpiInProgress").textContent = inProgress;
    document.getElementById("kpiCompleted").textContent = completed;
}

// Filter and render table rows
function filterAndRenderTable() {
    let query = document.getElementById("searchInput").value.toLowerCase().trim();
    let typeVal = document.getElementById("typeFilter").value;
    let statusVal = document.getElementById("statusFilter").value;
    let tbody = document.getElementById("maintenanceTableBody");
    let emptyState = document.getElementById("maintenanceEmptyState");

    tbody.innerHTML = "";

    let filtered = [];

    for (let i = 0; i < maintenanceList.length; i++) {
        let item = maintenanceList[i];
        let matchesQuery =
            item.id.toLowerCase().includes(query) ||
            item.equipment.toLowerCase().includes(query) ||
            item.technician.toLowerCase().includes(query);

        let matchesType = (typeVal === "All") || (item.type === typeVal);
        let matchesStatus = (statusVal === "All") || (item.status === statusVal);

        if (matchesQuery && matchesType && matchesStatus) {
            filtered.push(item);
        }
    }

    document.getElementById("recordsCount").textContent = filtered.length + " Records";

    if (filtered.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    for (let j = 0; j < filtered.length; j++) {
        let m = filtered[j];
        let tr = document.createElement("tr");

        let typeBadgeClass = m.type === "Preventive" ? "badge-preventive" : "badge-corrective";

        let statusBadgeClass = "badge-scheduled";
        if (m.status === "In Progress") statusBadgeClass = "badge-in-progress";
        else if (m.status === "Completed") statusBadgeClass = "badge-completed";
        else if (m.status === "Cancelled") statusBadgeClass = "badge-cancelled";

        tr.innerHTML =
            "<td><strong>" + m.id + "</strong></td>" +
            "<td>" + m.equipment + "</td>" +
            "<td><span class='badge-status " + typeBadgeClass + "'>" + m.type + "</span></td>" +
            "<td>" + m.technician + "</td>" +
            "<td>" + m.scheduledDate + "</td>" +
            "<td><span class='badge-status " + statusBadgeClass + "'>" + m.status + "</span></td>" +
            "<td class='text-center'>" +
            "  <div class='btn-action-group justify-content-center'>" +
            "    <button type='button' class='btn-action-edit' onclick='editMaintenance(\"" + m.id + "\")'>Edit</button>" +
            "    <button type='button' class='btn-action-delete' onclick='deleteMaintenance(\"" + m.id + "\")'>Delete</button>" +
            "  </div>" +
            "</td>";

        tbody.appendChild(tr);
    }
}

// Reset form for new schedule
function resetForm() {
    document.getElementById("maintenanceForm").reset();
    document.getElementById("editIndex").value = "-1";
    document.getElementById("maintId").removeAttribute("readonly");
    document.getElementById("maintModalLabel").textContent = "Schedule Maintenance";
}

// Form Submit Handler
function handleFormSubmit(event) {
    event.preventDefault();

    let editIndexVal = parseInt(document.getElementById("editIndex").value);
    let id = document.getElementById("maintId").value.trim();
    let equipment = document.getElementById("maintEquipment").value.trim();
    let type = document.getElementById("maintType").value;
    let technician = document.getElementById("maintTechnician").value.trim();
    let scheduledDate = document.getElementById("maintDate").value;
    let status = document.getElementById("maintStatus").value;

    if (!id || !equipment || !type || !technician || !scheduledDate || !status) {
        showAlert("Please fill in all required fields.", "danger");
        return;
    }

    if (editIndexVal === -1) {
        // Add new
        for (let i = 0; i < maintenanceList.length; i++) {
            if (maintenanceList[i].id.toUpperCase() === id.toUpperCase()) {
                showAlert("Maintenance ID already exists. Please choose a unique ID.", "danger");
                return;
            }
        }

        let newMaint = {
            id: id,
            equipment: equipment,
            type: type,
            technician: technician,
            scheduledDate: scheduledDate,
            status: status
        };

        maintenanceList.unshift(newMaint);
        showAlert("Maintenance task " + id + " scheduled successfully.", "success");
    } else {
        // Edit existing
        if (editIndexVal >= 0 && editIndexVal < maintenanceList.length) {
            maintenanceList[editIndexVal].equipment = equipment;
            maintenanceList[editIndexVal].type = type;
            maintenanceList[editIndexVal].technician = technician;
            maintenanceList[editIndexVal].scheduledDate = scheduledDate;
            maintenanceList[editIndexVal].status = status;
            showAlert("Maintenance task " + id + " updated.", "success");
        }
    }

    localStorage.setItem("iemrs_maintenance", JSON.stringify(maintenanceList));

    maintenanceModalInstance.hide();
    filterAndRenderTable();
    updateKpiCards();
}

// Open Edit Modal
function editMaintenance(id) {
    let index = -1;
    for (let i = 0; i < maintenanceList.length; i++) {
        if (maintenanceList[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) return;

    let m = maintenanceList[index];

    document.getElementById("editIndex").value = index;
    document.getElementById("maintId").value = m.id;
    document.getElementById("maintId").setAttribute("readonly", true);
    document.getElementById("maintEquipment").value = m.equipment;
    document.getElementById("maintType").value = m.type;
    document.getElementById("maintTechnician").value = m.technician;
    document.getElementById("maintDate").value = m.scheduledDate;
    document.getElementById("maintStatus").value = m.status;

    document.getElementById("maintModalLabel").textContent = "Edit Maintenance Task (" + m.id + ")";
    maintenanceModalInstance.show();
}

// Delete Record
function deleteMaintenance(id) {
    let confirmed = confirm("Are you sure you want to delete maintenance schedule [" + id + "]?");
    if (!confirmed) return;

    let newArr = [];
    for (let i = 0; i < maintenanceList.length; i++) {
        if (maintenanceList[i].id !== id) {
            newArr.push(maintenanceList[i]);
        }
    }

    maintenanceList = newArr;
    localStorage.setItem("iemrs_maintenance", JSON.stringify(maintenanceList));

    showAlert("Maintenance record " + id + " removed.", "danger");
    filterAndRenderTable();
    updateKpiCards();
}
