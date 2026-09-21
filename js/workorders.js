// ==========================================================================
// IEMRS - Work Orders JavaScript (js/workorders.js)
// CRUD, Priority & Status Filtering, and localStorage Persistence
// ==========================================================================

let ordersList = [];
let orderModalInstance = null;

document.addEventListener("DOMContentLoaded", function () {
    // 1. Initialize modal instance
    let modalEl = document.getElementById("workOrderModal");
    orderModalInstance = new bootstrap.Modal(modalEl);

    // 2. Load data
    loadWorkOrdersData();

    // 3. Bind search and filter events
    document.getElementById("searchInput").addEventListener("input", filterAndRenderTable);
    document.getElementById("priorityFilter").addEventListener("change", filterAndRenderTable);
    document.getElementById("statusFilter").addEventListener("change", filterAndRenderTable);

    // 4. Add button click
    document.getElementById("addNewOrderBtn").addEventListener("click", resetForm);

    // 5. Form submit
    document.getElementById("workOrderForm").addEventListener("submit", handleFormSubmit);
});

// Load records from localStorage
function loadWorkOrdersData() {
    let saved = localStorage.getItem("iemrs_workorders");
    if (saved) {
        ordersList = JSON.parse(saved);
    } else {
        ordersList = [];
    }
    filterAndRenderTable();
    updateKpiCards();
}

// Update summary metric cards
function updateKpiCards() {
    let total = ordersList.length;
    let high = 0;
    let inProgress = 0;
    let completed = 0;

    for (let i = 0; i < ordersList.length; i++) {
        if (ordersList[i].priority === "High") high++;
        if (ordersList[i].status === "In Progress") inProgress++;
        if (ordersList[i].status === "Completed") completed++;
    }

    document.getElementById("kpiTotalOrders").textContent = total;
    document.getElementById("kpiHighPriority").textContent = high;
    document.getElementById("kpiInProgressOrders").textContent = inProgress;
    document.getElementById("kpiCompletedOrders").textContent = completed;
}

// Filter and render table rows
function filterAndRenderTable() {
    let query = document.getElementById("searchInput").value.toLowerCase().trim();
    let priorityVal = document.getElementById("priorityFilter").value;
    let statusVal = document.getElementById("statusFilter").value;
    let tbody = document.getElementById("workordersTableBody");
    let emptyState = document.getElementById("workordersEmptyState");

    tbody.innerHTML = "";

    let filtered = [];

    for (let i = 0; i < ordersList.length; i++) {
        let order = ordersList[i];
        let matchesQuery =
            order.id.toLowerCase().includes(query) ||
            order.equipment.toLowerCase().includes(query) ||
            order.problem.toLowerCase().includes(query) ||
            order.technician.toLowerCase().includes(query);

        let matchesPriority = (priorityVal === "All") || (order.priority === priorityVal);
        let matchesStatus = (statusVal === "All") || (order.status === statusVal);

        if (matchesQuery && matchesPriority && matchesStatus) {
            filtered.push(order);
        }
    }

    document.getElementById("recordsCount").textContent = filtered.length + " Orders";

    if (filtered.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    for (let j = 0; j < filtered.length; j++) {
        let o = filtered[j];
        let tr = document.createElement("tr");

        let priorityBadgeClass = "badge-low";
        if (o.priority === "High") priorityBadgeClass = "badge-high";
        else if (o.priority === "Medium") priorityBadgeClass = "badge-medium";

        let statusBadgeClass = "badge-open";
        if (o.status === "Assigned") statusBadgeClass = "badge-assigned";
        else if (o.status === "In Progress") statusBadgeClass = "badge-in-progress";
        else if (o.status === "Completed") statusBadgeClass = "badge-completed";

        tr.innerHTML =
            "<td><strong>" + o.id + "</strong></td>" +
            "<td>" + o.equipment + "</td>" +
            "<td>" + o.problem + "</td>" +
            "<td>" + o.technician + "</td>" +
            "<td><span class='badge-status " + priorityBadgeClass + "'>" + o.priority + "</span></td>" +
            "<td>" + o.date + "</td>" +
            "<td><span class='badge-status " + statusBadgeClass + "'>" + o.status + "</span></td>" +
            "<td class='text-center'>" +
            "  <div class='btn-action-group justify-content-center'>" +
            "    <button type='button' class='btn-action-edit' onclick='editOrder(\"" + o.id + "\")'>Edit</button>" +
            "    <button type='button' class='btn-action-delete' onclick='deleteOrder(\"" + o.id + "\")'>Delete</button>" +
            "  </div>" +
            "</td>";

        tbody.appendChild(tr);
    }
}

// Reset form for new order
function resetForm() {
    document.getElementById("workOrderForm").reset();
    document.getElementById("editIndex").value = "-1";
    document.getElementById("orderId").removeAttribute("readonly");
    document.getElementById("orderModalLabel").textContent = "Create Work Order";
}

// Form Submit Handler
function handleFormSubmit(event) {
    event.preventDefault();

    let editIndexVal = parseInt(document.getElementById("editIndex").value);
    let id = document.getElementById("orderId").value.trim();
    let equipment = document.getElementById("orderEquipment").value.trim();
    let problem = document.getElementById("orderProblem").value.trim();
    let technician = document.getElementById("orderTechnician").value.trim();
    let priority = document.getElementById("orderPriority").value;
    let date = document.getElementById("orderDate").value;
    let status = document.getElementById("orderStatus").value;

    if (!id || !equipment || !problem || !technician || !priority || !date || !status) {
        showAlert("Please fill in all fields.", "danger");
        return;
    }

    if (editIndexVal === -1) {
        // Add new
        for (let i = 0; i < ordersList.length; i++) {
            if (ordersList[i].id.toUpperCase() === id.toUpperCase()) {
                showAlert("Work Order ID already exists. Please choose a unique ID.", "danger");
                return;
            }
        }

        let newOrder = {
            id: id,
            equipment: equipment,
            problem: problem,
            technician: technician,
            priority: priority,
            date: date,
            status: status
        };

        ordersList.unshift(newOrder);
        showAlert("Work order " + id + " created successfully.", "success");
    } else {
        // Edit existing
        if (editIndexVal >= 0 && editIndexVal < ordersList.length) {
            ordersList[editIndexVal].equipment = equipment;
            ordersList[editIndexVal].problem = problem;
            ordersList[editIndexVal].technician = technician;
            ordersList[editIndexVal].priority = priority;
            ordersList[editIndexVal].date = date;
            ordersList[editIndexVal].status = status;
            showAlert("Work order " + id + " updated.", "success");
        }
    }

    localStorage.setItem("iemrs_workorders", JSON.stringify(ordersList));

    orderModalInstance.hide();
    filterAndRenderTable();
    updateKpiCards();
}

// Open Edit Modal
function editOrder(id) {
    let index = -1;
    for (let i = 0; i < ordersList.length; i++) {
        if (ordersList[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) return;

    let o = ordersList[index];

    document.getElementById("editIndex").value = index;
    document.getElementById("orderId").value = o.id;
    document.getElementById("orderId").setAttribute("readonly", true);
    document.getElementById("orderEquipment").value = o.equipment;
    document.getElementById("orderProblem").value = o.problem;
    document.getElementById("orderTechnician").value = o.technician;
    document.getElementById("orderPriority").value = o.priority;
    document.getElementById("orderDate").value = o.date;
    document.getElementById("orderStatus").value = o.status;

    document.getElementById("orderModalLabel").textContent = "Edit Work Order (" + o.id + ")";
    orderModalInstance.show();
}

// Delete Order
function deleteOrder(id) {
    let confirmed = confirm("Are you sure you want to delete work order [" + id + "]?");
    if (!confirmed) return;

    let newArr = [];
    for (let i = 0; i < ordersList.length; i++) {
        if (ordersList[i].id !== id) {
            newArr.push(ordersList[i]);
        }
    }

    ordersList = newArr;
    localStorage.setItem("iemrs_workorders", JSON.stringify(ordersList));

    showAlert("Work order " + id + " deleted.", "danger");
    filterAndRenderTable();
    updateKpiCards();
}
