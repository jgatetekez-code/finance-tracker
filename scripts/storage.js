const STORAGE_KEY = "studentFinanceTracker";

export function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                transactions: [],
                settings: {
                    budgetCap: 0,
                    usdRate: 1400,
                    eurRate: 1400,
                }
            };
        }

        const data = JSON.parse(saved);

        return {
            transactions: Array.isArray(data.transactions)
            ? data.transactions
            : [],
        settings: {
            budgetCap: Number(data.settings?.budgetCap) || 0,
            currency: ["RWF", "USD", "EUR"].includes(
                data.settings?.currency
                
            ) ? data.settings?.currency :"RWF",
            usdRate: Number(data.settings?.usdRate) || 1400,
            eurRate: Number(data.settings?.eurRate) || 1550,
        }
        
        
        };

    } catch {
        return {
            transactions: [],
            settings: {
                budgetCap: 0,
                currency: RWF,
                usdRate: 1400,
                eurRate: 1550
            }
        };
    }

}

export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
       
    } catch {
        return false;
    }
}

