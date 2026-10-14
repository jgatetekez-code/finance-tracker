
import { validateTransaction, createSearchRegex } from "./validation.js";

export function initTransactions(state, save, formatAmount, onUpdate) {
    const form = document.getElementById("transaction-form");
    const descriptionInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const categoryInput = document.getElementById("category");
    const dateInput = document.getElementById("date");
    const list = document.getElementById("transaction-list");
    const searchInput = document.getElementById("search-input");
    const caseCheckbox = document.getElementById("case-insensitive");
    const formError = document.getElementById("form-error");
    const saveButton = document.getElementById("save-transaction");
    const cancelButton = document.getElementById("cancel-edit");


    let editingId =null;
    let sortField ="date";
    let sortDirection = "desc";


    function showError(id, message) {
        const element = document.getElementById(id);
        if (element) element.textContent = message || "";
    }


    function render() {
        if (!list) return;

        list.replaceChildren();

        let filtered = [...state.transactions];

    
        try{
            const regex = createSearchRegex(
                searchInput?.value.trim() || "",
                caseCheckbox?.checked !== false

            );

            if (regex) {
                filtered = filtered.filter((item) =>   
                    regex.test(item.description) ||
                regex.test(item.category)

);
             
 
            }

            showError("search-error", "");
        } catch (error) {
            showError("search-error", error.message);
            filtered = [];
        }

        filtered.sort((a,b)  => {
            let first = a[sortField];
            let second = b[sortField];

            if (sortField === "amount") {
                first = Number(first);
                second =Number(second);
            } else {
                first = String(first ?? "").toLowerCase();
                second = String(second ?? "").toLowerCase();
            }

            let result = first < second ? -1 : first > second ? 1 : 0;
            return sortDirection == "asc" ? result : -result;


        });

        if (filtered.length == 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "No expenses found.";
            row.appendChild(cell);
            list.appendChild(row);
            return;
        }
        
      filtered.forEach((item) => {
        const row = document.createElement("tr");

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = item.description;

        const amountCell = document.createElement("td");
        amountCell.textContent = formatAmount(item.amount, state.settings);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = item.category;

        const dateCell = document.createElement("td");
        dateCell.textContent = item.date;

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit ${item.description}`

        );

        editButton.addEventListener("click", () => {
            editingId = item.id;
            descriptionInput.value = item.description;
            if (amountInput) amountInput.value = item.amount;
            categoryInput.value = item.category;
            dateInput.value = item.date;

            saveButton.textContent = "Update expense";
            cancelButton.hidden = false;
            formError.textContent = "";
            descriptionInput.focus();

        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${item.description}`

        );

        deleteButton.addEventListener("click", () => {
            if (!confirm(`Delete "${item.description}"?`)) return;


            const index = state.transactions.findIndex(
            (transaction)  => transaction.id === item.id

            );

                      if (index !== -1) {
                state.transactions.splice(index, 1);

                if (!save()) {
                    formError.textContent =
                        "Could not save changes to browser storage.";
                }
            }
            
            
            if (editingId == item.id) resetForm();

            render();
            onUpdate();
        });

        actionCell.append(editButton, deleteButton);
        row.append(
            descriptionCell,
            amountCell,
            categoryCell,
            dateCell,
            actionCell,

        );
        list.appendChild(row);

      });

    }

    function resetForm() {
        form.reset();
        editingId = null;
        saveButton.textContent = "Save expense";
        cancelButton.hidden = true;
        formError.textContent = "";

        ["description-error", "amount-error", "category-error", "date-error"]
          
             .forEach((id) => showError(id, ""));

    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!amountInput) {
            formError.textContent =
                "Add an Amount input to your HTML before saving expenses.";
            return;
        }
    

    const transaction = {
        description: descriptionInput.value.trim(),
        amount: Number(amountInput.value),
        category: categoryInput.value.trim(),
        date: dateInput.value
    };

    const errors = validateTransaction(transaction);

    showError("description-error", errors.description);
    showError("amount-error", errors.amount);
    showError("category-error", errors.category);
    showError("date-error",errors.date);

    if (Object.keys(errors).length > 0) {
        formError.textContent = "Please correct the errors above.";
        return;

    }

    const now = new Date().toISOString();

    if (editingId !==  null) {
        const existing = state.transactions.find(
            (item) => item.id === editingId

        );

        if (existing) {
            Object.assign(existing, transaction, {
                updatedAt: now
            });


            
        }

    } else {
        state.transactions.push({
            id: crypto.randomUUID(),
            ...transaction,
            createdAt: now,
            updatedAt: now,
            

        });

        
    }

    if (!save()) {
        formError.textContent =
        "Could not save the expense. check browser.";

        return;
    }

    resetForm();
    render();
    onUpdate();

});


    cancelButton?.addEventListener("click", resetForm);
    searchInput?.addEventListener("input",render);
    caseCheckbox?.addEventListener("change", render);


    document.querySelectorAll("#transaction thead th[data-sort]")

      .forEach((heading) => {

        heading.tabIndex = 0;
        heading.setAttribute("role", "button");

        function sort() {
            const field = heading.dataset.sort;
            if (!["description", "amount", "category","date"].includes(field)) {
                return;

            }

            if (sortField == field) {
                sortDirection = sortDirection == "asc" ? "desc" : "asc";

            } else {
                sortField = field;
                sortDirection = "asc";
            }

            render();
        }

        

        heading.addEventListener("click", sort);
        heading.addEventListener("keydown", (event) => {
            if (event.key == "Enter" || event.key == " ") {
                event.preventDefault();
                sort();
            }
        });

      });

      render();

      return { render };


    }

        


