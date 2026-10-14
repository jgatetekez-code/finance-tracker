import { loadData, saveData } from "./storage.js";
import { formatAmount } from "./currency.js";
import { initTransactions } from "./transactions.js";
import { initBudget } from "./budget.js";
import { initImportExport } from "./import-export.js";

const state =loadData()

function save() {
    return saveData(state);
}

let transactionsUI = null;
let budgetUI = null;

function refreshUI() {
    if (transactionsUI) {
        transactionsUI.render();
    }

    if (budgetUI) {
        budgetUI.renderBudget();
    }
}

transactionsUI = initTransactions(
    state,
    save,
    formatAmount,
    refreshUI

);

budgetUI = initBudget(state, save, refreshUI);

initImportExport(state, save, refreshUI);

refreshUI();
