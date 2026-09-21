// ==========================================================================
// IEMRS - Inventory & Spare Parts JavaScript (js/inventory.js)
// Stock Level Evaluation, Category Filtering, and localStorage Persistence (SDG 12)
// ==========================================================================

let inventoryList = [];
let inventoryModalInstance = null;

document.addEventListener("DOMContentLoaded", function () {
    // 1. Initialize modal instance
    let modalEl = document.getElementById("inventoryModal");
    inventoryModalInstance = new bootstrap.Modal(modalEl);

    // 2. Load data
    loadInventoryData();

    // 3. Bind search and filter events
    document.getElementById("searchInput").addEventListener("input", filterAndRenderTable);
    document.getElementById("categoryFilter").addEventListener("change", filterAndRenderTable);

    // 4. Add button click
    document.getElementById("addNewPartBtn").addEventListener("click", resetForm);

    // 5. Form submit
    document.getElementById("inventoryForm").addEventListener("submit", handleFormSubmit);
});

// Load records from localStorage
function loadInventoryData() {
    let saved = localStorage.getItem("iemrs_inventory");
    if (saved) {
        inventoryList = JSON.parse(saved);
    } else {
        inventoryList = [];
    }
    filterAndRenderTable();
    updateKpiCards();
}

// Update summary metric cards
function updateKpiCards() {
    let total = inventoryList.length;
    let adequate = 0;
    let lowStock = 0;
    let categorySet = {};

    for (let i = 0; i < inventoryList.length; i++) {
        let item = inventoryList[i];
        if (item.quantity <= item.minStock) {
            lowStock++;
        } else {
            adequate++;
        }
        if (item.category) {
            categorySet[item.category] = true;
        }
    }

    document.getElementById("kpiTotalParts").textContent = total;
    document.getElementById("kpiAdequateStock").textContent = adequate;
    document.getElementById("kpiLowStock").textContent = lowStock;
    document.getElementById("kpiCategories").textContent = Object.keys(categorySet).length;
}

// Filter and render table rows
function filterAndRenderTable() {
    let query = document.getElementById("searchInput").value.toLowerCase().trim();
    let categoryVal = document.getElementById("categoryFilter").value;
    let tbody = document.getElementById("inventoryTableBody");
    let emptyState = document.getElementById("inventoryEmptyState");

    tbody.innerHTML = "";

    let filtered = [];

    for (let i = 0; i < inventoryList.length; i++) {
        let part = inventoryList[i];
        let matchesQuery =
            part.id.toLowerCase().includes(query) ||
            part.name.toLowerCase().includes(query) ||
            part.category.toLowerCase().includes(query) ||
            part.supplier.toLowerCase().includes(query);

        let matchesCat = (categoryVal === "All") || (part.category === categoryVal);

        if (matchesQuery && matchesCat) {
            filtered.push(part);
        }
    }

    document.getElementById("recordsCount").textContent = filtered.length + " Items";

    if (filtered.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    for (let j = 0; j < filtered.length; j++) {
        let p = filtered[j];
        let tr = document.createElement("tr");

        // Rule: Quantity <= minStock means Low Stock
        let isLow = parseInt(p.quantity) <= parseInt(p.minStock);
        let statusText = isLow ? "Low Stock" : "Available";
        let statusBadgeClass = isLow ? "badge-low-stock" : "badge-available";

        tr.innerHTML =
            "<td><strong>" + p.id + "</strong></td>" +
            "<td>" + p.name + "</td>" +
            "<td><span class='badge bg-light text-dark border'>" + p.category + "</span></td>" +
            "<td><strong>" + p.quantity + "</strong> units</td>" +
            "<td>" + p.minStock + " units</td>" +
            "<td>" + p.supplier + "</td>" +
            "<td><span class='badge-status " + statusBadgeClass + "'>" + statusText + "</span></td>" +
            "<td class='text-center'>" +
            "  <div class='btn-action-group justify-content-center'>" +
            "    <button type='button' class='btn-action-edit' onclick='editPart(\"" + p.id + "\")'>Edit</button>" +
            "    <button type='button' class='btn-action-delete' onclick='deletePart(\"" + p.id + "\")'>Delete</button>" +
            "  </div>" +
            "</td>";

        tbody.appendChild(tr);
    }
}

// Reset form
function resetForm() {
    document.getElementById("inventoryForm").reset();
    document.getElementById("editIndex").value = "-1";
    document.getElementById("partId").removeAttribute("readonly");
    document.getElementById("partModalLabel").textContent = "Add Spare Part";
}

// Form Submit Handler
function handleFormSubmit(event) {
    event.preventDefault();

    let editIndexVal = parseInt(document.getElementById("editIndex").value);
    let id = document.getElementById("partId").value.trim();
    let name = document.getElementById("partName").value.trim();
    let category = document.getElementById("partCategory").value;
    let supplier = document.getElementById("partSupplier").value.trim();
    let quantity = parseInt(document.getElementById("partQuantity").value);
    let minStock = parseInt(document.getElementById("partMinStock").value);

    if (!id || !name || !category || !supplier || isNaN(quantity) || isNaN(minStock)) {
        showAlert("Please fill in all fields with valid numbers.", "danger");
        return;
    }

    if (editIndexVal === -1) {
        // Add new
        for (let i = 0; i < inventoryList.length; i++) {
            if (inventoryList[i].id.toUpperCase() === id.toUpperCase()) {
                showAlert("Part ID already exists. Please choose a unique ID.", "danger");
                return;
            }
        }

        let newPart = {
            id: id,
            name: name,
            category: category,
            quantity: quantity,
            minStock: minStock,
            supplier: supplier
        };

        inventoryList.unshift(newPart);
        showAlert("Spare part " + name + " cataloged.", "success");
    } else {
        // Edit existing
        if (editIndexVal >= 0 && editIndexVal < inventoryList.length) {
            inventoryList[editIndexVal].name = name;
            inventoryList[editIndexVal].category = category;
            inventoryList[editIndexVal].quantity = quantity;
            inventoryList[editIndexVal].minStock = minStock;
            inventoryList[editIndexVal].supplier = supplier;
            showAlert("Spare part " + name + " updated.", "success");
        }
    }

    localStorage.setItem("iemrs_inventory", JSON.stringify(inventoryList));

    inventoryModalInstance.hide();
    filterAndRenderTable();
    updateKpiCards();
}

// Open Edit Modal
function editPart(id) {
    let index = -1;
    for (let i = 0; i < inventoryList.length; i++) {
        if (inventoryList[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) return;

    let p = inventoryList[index];

    document.getElementById("editIndex").value = index;
    document.getElementById("partId").value = p.id;
    document.getElementById("partId").setAttribute("readonly", true);
    document.getElementById("partName").value = p.name;
    document.getElementById("partCategory").value = p.category;
    document.getElementById("partSupplier").value = p.supplier;
    document.getElementById("partQuantity").value = p.quantity;
    document.getElementById("partMinStock").value = p.minStock;

    document.getElementById("partModalLabel").textContent = "Edit Spare Part (" + p.id + ")";
    inventoryModalInstance.show();
}

// Delete Part
function deletePart(id) {
    let confirmed = confirm("Are you sure you want to remove part [" + id + "] from inventory?");
    if (!confirmed) return;

    let newArr = [];
    for (let i = 0; i < inventoryList.length; i++) {
        if (inventoryList[i].id !== id) {
            newArr.push(inventoryList[i]);
        }
    }

    inventoryList = newArr;
    localStorage.setItem("iemrs_inventory", JSON.stringify(inventoryList));

    showAlert("Spare part " + id + " removed.", "danger");
    filterAndRenderTable();
    updateKpiCards();
}
