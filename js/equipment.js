// ==========================================================================
// IEMRS - Equipment Management JavaScript (js/equipment.js)
// Simple CRUD, Search, Status Filter & localStorage Persistence
// ==========================================================================

let equipmentList = [];
let equipmentModalInstance = null;

document.addEventListener("DOMContentLoaded", function () {
    // 1. Initialize modal instance
    let modalElement = document.getElementById("equipmentModal");
    equipmentModalInstance = new bootstrap.Modal(modalElement);

    // 2. Load data from localStorage
    loadEquipmentData();

    // 3. Bind search and filter events
    document.getElementById("searchInput").addEventListener("input", filterAndRenderTable);
    document.getElementById("statusFilter").addEventListener("change", filterAndRenderTable);

    // 4. Bind Add Equipment button to clear form
    document.getElementById("addNewEquipmentBtn").addEventListener("click", function () {
        resetForm();
    });

    // 5. Bind form submit for Add / Edit
    document.getElementById("equipmentForm").addEventListener("submit", handleFormSubmit);
});

// Load data from localStorage
function loadEquipmentData() {
    let saved = localStorage.getItem("iemrs_equipment");
    if (saved) {
        equipmentList = JSON.parse(saved);
    } else {
        equipmentList = [];
    }
    filterAndRenderTable();
    updateKpiCards();
}

// Update summary metric cards
function updateKpiCards() {
    let total = equipmentList.length;
    let operational = 0;
    let maintenance = 0;
    let faulty = 0;

    for (let i = 0; i < equipmentList.length; i++) {
        let st = equipmentList[i].status;
        if (st === "Operational") operational++;
        else if (st === "Maintenance") maintenance++;
        else if (st === "Faulty") faulty++;
    }

    document.getElementById("kpiTotal").textContent = total;
    document.getElementById("kpiOperational").textContent = operational;
    document.getElementById("kpiMaintenance").textContent = maintenance;
    document.getElementById("kpiFaulty").textContent = faulty;
}

// Filter and render table rows
function filterAndRenderTable() {
    let query = document.getElementById("searchInput").value.toLowerCase().trim();
    let filterStatus = document.getElementById("statusFilter").value;
    let tbody = document.getElementById("equipmentTableBody");
    let emptyState = document.getElementById("equipmentEmptyState");

    tbody.innerHTML = "";

    let filtered = [];

    for (let i = 0; i < equipmentList.length; i++) {
        let item = equipmentList[i];
        let matchesQuery =
            item.id.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query);

        let matchesStatus = (filterStatus === "All") || (item.status === filterStatus);

        if (matchesQuery && matchesStatus) {
            filtered.push(item);
        }
    }

    // Update records count label
    document.getElementById("recordsCount").textContent = filtered.length + " Records";

    // Handle Empty State
    if (filtered.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    // Render Rows
    for (let j = 0; j < filtered.length; j++) {
        let eq = filtered[j];
        let tr = document.createElement("tr");

        let badgeClass = "badge-operational";
        if (eq.status === "Maintenance") {
            badgeClass = "badge-maintenance";
        } else if (eq.status === "Faulty") {
            badgeClass = "badge-faulty";
        }

        tr.innerHTML =
            "<td><strong>" + eq.id + "</strong></td>" +
            "<td>" + eq.name + "</td>" +
            "<td>" + eq.type + "</td>" +
            "<td>" + eq.location + "</td>" +
            "<td><span class='badge-status " + badgeClass + "'>" + eq.status + "</span></td>" +
            "<td>" + eq.lastMaintenance + "</td>" +
            "<td>" + eq.nextMaintenance + "</td>" +
            "<td class='text-center'>" +
            "  <div class='btn-action-group justify-content-center'>" +
            "    <button type='button' class='btn-action-edit' onclick='editEquipment(\"" + eq.id + "\")'>Edit</button>" +
            "    <button type='button' class='btn-action-delete' onclick='deleteEquipment(\"" + eq.id + "\")'>Delete</button>" +
            "  </div>" +
            "</td>";

        tbody.appendChild(tr);
    }
}

// Reset form for new equipment
function resetForm() {
    document.getElementById("equipmentForm").reset();
    document.getElementById("editIndex").value = "-1";
    document.getElementById("eqId").removeAttribute("readonly");
    document.getElementById("equipmentModalLabel").textContent = "Add New Equipment";
}

// Handle Form Submission (Add or Edit)
function handleFormSubmit(event) {
    event.preventDefault();

    let editIndexVal = parseInt(document.getElementById("editIndex").value);
    let id = document.getElementById("eqId").value.trim();
    let name = document.getElementById("eqName").value.trim();
    let type = document.getElementById("eqType").value;
    let location = document.getElementById("eqLocation").value.trim();
    let status = document.getElementById("eqStatus").value;
    let lastMaint = document.getElementById("eqLastMaint").value;
    let nextMaint = document.getElementById("eqNextMaint").value;

    if (!id || !name || !type || !location || !status || !lastMaint || !nextMaint) {
        showAlert("Please fill in all required fields.", "danger");
        return;
    }

    if (editIndexVal === -1) {
        // Adding new record: check ID uniqueness
        for (let i = 0; i < equipmentList.length; i++) {
            if (equipmentList[i].id.toUpperCase() === id.toUpperCase()) {
                showAlert("Equipment ID already exists. Please choose a unique ID.", "danger");
                return;
            }
        }

        let newEquipment = {
            id: id,
            name: name,
            type: type,
            location: location,
            status: status,
            lastMaintenance: lastMaint,
            nextMaintenance: nextMaint
        };

        equipmentList.unshift(newEquipment);
        showAlert("Equipment " + id + " registered successfully.", "success");
    } else {
        // Editing existing record
        if (editIndexVal >= 0 && editIndexVal < equipmentList.length) {
            equipmentList[editIndexVal].name = name;
            equipmentList[editIndexVal].type = type;
            equipmentList[editIndexVal].location = location;
            equipmentList[editIndexVal].status = status;
            equipmentList[editIndexVal].lastMaintenance = lastMaint;
            equipmentList[editIndexVal].nextMaintenance = nextMaint;
            showAlert("Equipment " + id + " updated successfully.", "success");
        }
    }

    // Persist in localStorage
    localStorage.setItem("iemrs_equipment", JSON.stringify(equipmentList));

    // Hide Modal & Refresh
    equipmentModalInstance.hide();
    filterAndRenderTable();
    updateKpiCards();
}

// Open Edit Modal for specified Equipment ID
function editEquipment(id) {
    let index = -1;
    for (let i = 0; i < equipmentList.length; i++) {
        if (equipmentList[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) return;

    let eq = equipmentList[index];

    document.getElementById("editIndex").value = index;
    document.getElementById("eqId").value = eq.id;
    document.getElementById("eqId").setAttribute("readonly", true);
    document.getElementById("eqName").value = eq.name;
    document.getElementById("eqType").value = eq.type;
    document.getElementById("eqLocation").value = eq.location;
    document.getElementById("eqStatus").value = eq.status;
    document.getElementById("eqLastMaint").value = eq.lastMaintenance;
    document.getElementById("eqNextMaint").value = eq.nextMaintenance;

    document.getElementById("equipmentModalLabel").textContent = "Edit Equipment (" + eq.id + ")";
    equipmentModalInstance.show();
}

// Delete specified Equipment after confirmation
function deleteEquipment(id) {
    let confirmed = confirm("Are you sure you want to delete equipment [" + id + "] from registry?");
    if (!confirmed) return;

    let newArr = [];
    for (let i = 0; i < equipmentList.length; i++) {
        if (equipmentList[i].id !== id) {
            newArr.push(equipmentList[i]);
        }
    }

    equipmentList = newArr;
    localStorage.setItem("iemrs_equipment", JSON.stringify(equipmentList));

    showAlert("Equipment " + id + " deleted from registry.", "danger");
    filterAndRenderTable();
    updateKpiCards();
}
