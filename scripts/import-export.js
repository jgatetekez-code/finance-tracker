import { validateTransaction } from "./validation.js";

export function initImportExport(state, save, onUpdate) {
    const exportButton = document.getElementById("export-json");
    const importInput = document.getElementById("import-json");
    const status = document.getElementById("import-export-status");

    function showStatus(message) {
        if (status) status.textContent = message;
    }

    exportButton?.addEventListener("click", () => {
        const content = JSON.stringify(state, null, 2);
        const blob = new Blob([content], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "student-finance-tracker.json";
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        showStatus("Your expenses have been exported.");
    });

    importInput?.addEventListener("change", async () => {
        const file = importInput.files[0];

        if (!file) return;

        try {
            if (file.size > 2 * 1024 * 1024) {
                throw new Error("The file must be smaller than 2 MB.");
            }

            const imported = JSON.parse(await file.text());

            if (
                !imported ||
                !Array.isArray(imported.transactions) ||
                !imported.settings ||
                typeof imported.settings !== "object"
            ) {
                throw new Error("This file is not a valid tracker backup.");
            }

            if (imported.transactions.length > 10000) {
                throw new Error("The file contains too many expenses.");
            }

            const ids = new Set();

            const transactions = imported.transactions.map((item) => {
                if (
                    !item ||
                    typeof item.id !== "string" ||
                    !item.id ||
                    ids.has(item.id) ||
                    typeof item.description !== "string" ||
                    typeof item.category !== "string" ||
                    typeof item.date !== "string"
                ) {
                    throw new Error("An expense has invalid data.");
                }

                ids.add(item.id);

                const transaction = {
                    description: item.description,
                    amount: item.amount,
                    category: item.category,
                    date: item.date
                };

                const errors = validateTransaction(transaction);

                if (Object.keys(errors).length > 0) {
                    throw new Error(
                        "An expense has invalid details. Import cancelled."
                    );
                }

                const now = new Date().toISOString();

                return {
                    id: item.id,
                    ...transaction,
                    createdAt:
                        typeof item.createdAt === "string"
                            ? item.createdAt
                            : now,
                    updatedAt:
                        typeof item.updatedAt === "string"
                            ? item.updatedAt
                            : now
                };
            });

            const settings = imported.settings;
            const currency = ["RWF", "USD", "EUR"].includes(settings.currency)
                ? settings.currency
                : "RWF";

            const budgetCap = Number(settings.budgetCap);
            const usdRate = Number(settings.usdRate);
            const eurRate = Number(settings.eurRate);

            if (
                !Number.isFinite(budgetCap) ||
                budgetCap < 0 ||
                !Number.isFinite(usdRate) ||
                usdRate <= 0 ||
                !Number.isFinite(eurRate) ||
                eurRate <= 0
            ) {
                throw new Error("The backup contains invalid settings.");
            }

            if (
                !confirm(
                    "Import this backup? It will replace your current expenses and settings."
                )
            ) {
                showStatus("Import cancelled.");
                return;
            }

            const previousTransactions = [...state.transactions];
            const previousSettings = { ...state.settings };

            state.transactions = transactions;
            state.settings = {
                budgetCap,
                currency,
                usdRate,
                eurRate
            };

            if (!save()) {
                state.transactions = previousTransactions;
                state.settings = previousSettings;
                throw new Error("Could not save imported data.");
            }

            showStatus("Backup imported successfully.");
            onUpdate();
        } catch (error) {
            showStatus(error.message || "Could not import this file.");
        } finally {
            importInput.value = "";
        }
    });
}