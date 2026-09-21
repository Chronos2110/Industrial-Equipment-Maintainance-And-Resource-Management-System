// ==========================================================================
// IEMRS - Workforce JavaScript (js/workforce.js)
// CRUD, Availability Filtering, and localStorage Persistence (SDG 8)
// ==========================================================================

let workforceList = [];
let workforceModalInstance = null;

document.addEventListener("DOMContentLoaded", function () {
    // 1. Initialize modal instance
    let modalEl = document.getElementById("workforceModal");
    workforceModalInstance = new bootstrap.Modal(modalEl);

    // 2. Load data
    loadWorkforceData();

    // 3. Bind search and filter events
    document.getElementById("searchInput").addEventListener("input", filterAndRenderTable);
    document.getElementById("availabilityFilter").addEventListener("change", filterAndRenderTable);

    // 4. Add button click
    document.getElementById("addNewTechBtn").addEventListener("click", resetForm);

    // 5. Form submit
    document.getElementById("workforceForm").addEventListener("submit", handleFormSubmit);
});

// Load records from localStorage
function loadWorkforceData() {
    let saved = localStorage.getItem("iemrs_workforce");
    if (saved) {
        workforceList = JSON.parse(saved);
    } else {
        workforceList = [];
    }
    filterAndRenderTable();
    updateKpiCards();
}

// Update summary metric cards
function updateKpiCards() {
    let total = workforceList.length;
    let available = 0;
    let busy = 0;
    let unavailable = 0;

    for (let i = 0; i < workforceList.length; i++) {
        let av = workforceList[i].availability;
        if (av === "Available") available++;
        else if (av === "Busy") busy++;
        else if (av === "Unavailable") unavailable++;
    }

    document.getElementById("kpiTotalTechs").textContent = total;
    document.getElementById("kpiAvailableTechs").textContent = available;
    document.getElementById("kpiBusyTechs").textContent = busy;
    document.getElementById("kpiUnavailableTechs").textContent = unavailable;
}

// Filter and render table rows
function filterAndRenderTable() {
    let query = document.getElementById("searchInput").value.toLowerCase().trim();
    let availVal = document.getElementById("availabilityFilter").value;
    let tbody = document.getElementById("workforceTableBody");
    let emptyState = document.getElementById("workforceEmptyState");

    tbody.innerHTML = "";

    let filtered = [];

    for (let i = 0; i < workforceList.length; i++) {
        let tech = workforceList[i];
        let matchesQuery =
            tech.id.toLowerCase().includes(query) ||
            tech.name.toLowerCase().includes(query) ||
            tech.skill.toLowerCase().includes(query) ||
            tech.certification.toLowerCase().includes(query);

        let matchesAvail = (availVal === "All") || (tech.availability === availVal);

        if (matchesQuery && matchesAvail) {
            filtered.push(tech);
        }
    }

    document.getElementById("recordsCount").textContent = filtered.length + " Technicians";

    if (filtered.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    for (let j = 0; j < filtered.length; j++) {
        let t = filtered[j];
        let tr = document.createElement("tr");

        let availBadgeClass = "badge-available";
        if (t.availability === "Busy") availBadgeClass = "badge-busy";
        else if (t.availability === "Unavailable") availBadgeClass = "badge-unavailable";

        tr.innerHTML =
            "<td><strong>" + t.id + "</strong></td>" +
            "<td>" + t.name + "</td>" +
            "<td>" + t.skill + "</td>" +
            "<td><small class='text-muted'>" + t.certification + "</small></td>" +
            "<td><span class='badge-status " + availBadgeClass + "'>" + t.availability + "</span></td>" +
            "<td>" + t.workload + "</td>" +
            "<td class='text-center'>" +
            "  <div class='btn-action-group justify-content-center'>" +
            "    <button type='button' class='btn-action-edit' onclick='editTechnician(\"" + t.id + "\")'>Edit</button>" +
            "    <button type='button' class='btn-action-delete' onclick='deleteTechnician(\"" + t.id + "\")'>Delete</button>" +
            "  </div>" +
            "</td>";

        tbody.appendChild(tr);
    }
}

// Reset form
function resetForm() {
    document.getElementById("workforceForm").reset();
    document.getElementById("editIndex").value = "-1";
    document.getElementById("techId").removeAttribute("readonly");
    document.getElementById("techModalLabel").textContent = "Register Technician";
}

// Form Submit Handler
function handleFormSubmit(event) {
    event.preventDefault();

    let editIndexVal = parseInt(document.getElementById("editIndex").value);
    let id = document.getElementById("techId").value.trim();
    let name = document.getElementById("techName").value.trim();
    let skill = document.getElementById("techSkill").value.trim();
    let certification = document.getElementById("techCert").value.trim();
    let availability = document.getElementById("techAvailability").value;
    let workload = document.getElementById("techWorkload").value.trim();

    if (!id || !name || !skill || !certification || !availability || !workload) {
        showAlert("Please fill in all fields.", "danger");
        return;
    }

    if (editIndexVal === -1) {
        // Add new
        for (let i = 0; i < workforceList.length; i++) {
            if (workforceList[i].id.toUpperCase() === id.toUpperCase()) {
                showAlert("Technician ID already exists. Please choose a unique ID.", "danger");
                return;
            }
        }

        let newTech = {
            id: id,
            name: name,
            skill: skill,
            certification: certification,
            availability: availability,
            workload: workload
        };

        workforceList.unshift(newTech);
        showAlert("Technician " + name + " registered.", "success");
    } else {
        // Edit existing
        if (editIndexVal >= 0 && editIndexVal < workforceList.length) {
            workforceList[editIndexVal].name = name;
            workforceList[editIndexVal].skill = skill;
            workforceList[editIndexVal].certification = certification;
            workforceList[editIndexVal].availability = availability;
            workforceList[editIndexVal].workload = workload;
            showAlert("Technician " + name + " profile updated.", "success");
        }
    }

    localStorage.setItem("iemrs_workforce", JSON.stringify(workforceList));

    workforceModalInstance.hide();
    filterAndRenderTable();
    updateKpiCards();
}

// Open Edit Modal
function editTechnician(id) {
    let index = -1;
    for (let i = 0; i < workforceList.length; i++) {
        if (workforceList[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) return;

    let t = workforceList[index];

    document.getElementById("editIndex").value = index;
    document.getElementById("techId").value = t.id;
    document.getElementById("techId").setAttribute("readonly", true);
    document.getElementById("techName").value = t.name;
    document.getElementById("techSkill").value = t.skill;
    document.getElementById("techCert").value = t.certification;
    document.getElementById("techAvailability").value = t.availability;
    document.getElementById("techWorkload").value = t.workload;

    document.getElementById("techModalLabel").textContent = "Edit Technician (" + t.id + ")";
    workforceModalInstance.show();
}

// Delete Technician
function deleteTechnician(id) {
    let confirmed = confirm("Are you sure you want to remove technician [" + id + "] from roster?");
    if (!confirmed) return;

    let newArr = [];
    for (let i = 0; i < workforceList.length; i++) {
        if (workforceList[i].id !== id) {
            newArr.push(workforceList[i]);
        }
    }

    workforceList = newArr;
    localStorage.setItem("iemrs_workforce", JSON.stringify(workforceList));

    showAlert("Technician " + id + " removed.", "danger");
    filterAndRenderTable();
    updateKpiCards();
}
