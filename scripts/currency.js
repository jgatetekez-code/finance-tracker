export function convertFromRWF(amount, settings) {
    if (settings.currency === "USD") {
        return amount / settings.usdRate;
}

if (settings.currency === "EUR") {
    return amount / settings.eurRate;
}

return amount;

}

export function formatAmount(amount,settings) {
    const converted = convertFromRWF(amount, settings);

    const symbols = {
        RWF:"RWF",
        USD:"USD",
        EUR:"EUR"


    };

    return `${symbols[settings.currency] || "RWF"} ${

        new Intl.NumberFormat("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2

        }).format(converted)} `;

    

    
    
}
