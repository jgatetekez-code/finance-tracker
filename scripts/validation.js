export function validateTransaction(transaction) {
    const errors = {};

    if (!transaction.description.trim()) {
        errors.description = "Enter an expense description.";
    } else if (transaction.description.length > 150) {
        errors.description = "Description must be 150 characters or fewer.";
    }

    if (!Number.isFinite(transaction.amount) ||
        transaction.amount <= 0){
            errors.amount = "Enter an amount greater than zero.";

        }

        if (!transaction.category.trim()) {
            errors.category = "Enter an expense category.";
        } else if (transaction.category.length > 80) {
            errors.category = "category must be 80 characters or fewer.";
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction.date)) {
            errors.date = "Choose a valid date.";

        } else{
                       const date = new Date(`${transaction.date}T00:00:00Z`);

            if (Number.isNaN(date.getTime()) ||
                 date.toISOString().slice(0,10) !== transaction.date) {
            
                errors.date = "Choose a valid date.";
                }
        }

        return errors;

    
}

export function createSearchRegex(pattern, ignoreCase = true) {
    if (!pattern) {
        return null;
    }

    if (pattern.length > 100) {
        throw new Error("Search must be 100 characters or fewer.");

    }

    try {
        return new RegExp(pattern, ignoreCase ? "i" : "");

    } catch {
        throw new Error("Invalid regular expression. Check your search.");

    }
}