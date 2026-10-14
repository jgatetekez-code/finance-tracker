import { formatAmount } from "./currency.js";

export function initBudget(state, save, onUpdate) {
    const form = document.getElementById("settings-form");
    const budgetInput = document.getElementById("budget-cap");
    const currencySelect = document.getElementById("base-currency");
    const usdRateInput = document.getElementById("usd-rate");
    const eurRateInput = document.getElementById("eur-rate");
    const settingsStatus = document.getElementById("settings-status");
    const budgetStatus = document.getElementById("budget-status");
    const budgetWarning = document.getElementById("budget-warning");

    function renderBudget() {
        const now = new Date();

        const monthlyTransactions = state.transactions.filter((item) => {
            const date = new Date(`${item.date}T00:00:00`);

            return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth()
            
            );

        });

        const total = monthlyTransactions.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const cap = state.settings.budgetCap;

        if (budgetStatus) {
            budgetStatus.textContent =
            `This month's spending: ${formatAmount(total, state.settings)}. ` +
            `Budget cap: ${formatAmount(cap, state.settings)}.`;

        }

        if (budgetWarning) {
            if (cap > 0 && total > cap) {
                budgetWarning.textContent =
                  "Warning: You have exceeded your monthly budget.";
            } else if (cap > 0 && total >= cap * 0.8) {
                budgetWarning.textContent =
                "You have used at least 80% of your monthly budget.";

            } else {
                budgetWarning.textContent = "";

            }

        }



    }

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();


            const cap = Number(budgetInput.value);
            const usdRate =Number(usdRateInput.value);
            const eurRate =Number(eurRateInput.value);

            if (
                !Number.isFinite(cap) ||
                cap < 0 ||
                !Number.isFinite(usdRate) ||
                usdRate <= 0 ||
                !Number.isFinite(eurRate) ||
                eurRate <= 0
            ) {
                settingsStatus.textContent =
                "Enter a budget of zero or more and valid positive exchange rates.";
                return;
            }

            state.settings.budgetCap = cap;
            state.settings.currency = currencySelect.value;
            state.settings.usdRate = usdRate;
            state.settings.eurRate = eurRate;

            if (!save()) {
                settingsStatus.textContent =
                "Could not save settings. Check your browser storage.";
                return;
            }

            settingsStatus.textContent = "Settings saved successfully.";
            renderBudget();
            onUpdate();

        });

    }

    if (budgetInput) budgetInput.value = state.settings.budgetCap;
    if (currencySelect) currencySelect.value = state.settings.currency;
    if (usdRateInput) usdRateInput.value = state.settings.usdRate;
    if (eurRateInput) eurRateInput.value = state.settings.eurRate;

    renderBudget();

    return { renderBudget };


}