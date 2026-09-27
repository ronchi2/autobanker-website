document.addEventListener('DOMContentLoaded', function() {
    // Mode
    const calcMode = document.getElementById('calcMode');
    const groupVehiclePrice = document.getElementById('groupVehiclePrice');
    const groupDesiredPayment = document.getElementById('groupDesiredPayment');

    // Inputs
    const priceSlider = document.getElementById('vehiclePrice');
    const desiredPayment = document.getElementById('desiredPayment');
    const tradeIn = document.getElementById('tradeIn');
    const owedTradeIn = document.getElementById('owedTradeIn');
    const downSlider = document.getElementById('downPayment');
    const termSlider = document.getElementById('loanTerm');
    const interestRateInput = document.getElementById('interestRate');
    const salesTax = document.getElementById('salesTax');
    const paymentFrequency = document.getElementById('paymentFrequency');

    // Values
    const priceVal = document.getElementById('priceVal');
    const desiredVal = document.getElementById('desiredVal');
    const tradeInVal = document.getElementById('tradeInVal');
    const owedTradeInVal = document.getElementById('owedTradeInVal');
    const downVal = document.getElementById('downVal');
    const termVal = document.getElementById('termVal');

    // Results
    const resultTitle = document.getElementById('resultTitle');
    const resultAmount = document.getElementById('resultAmount');
    const appliedRate = document.getElementById('appliedRate');
    const totalLoanVal = document.getElementById('totalLoanVal');

    function formatCurrency(value) {
        return Math.max(0, parseInt(value)).toLocaleString();
    }

    function getFrequencyName(freq) {
        switch(freq) {
            case '12': return 'Monthly';
            case '24': return 'Semi-Monthly';
            case '26': return 'Bi-Weekly';
            case '52': return 'Weekly';
            default: return 'Monthly';
        }
    }

    function calculateLoan() {
        const mode = calcMode.value;
        const freq = parseInt(paymentFrequency.value);
        const freqName = getFrequencyName(paymentFrequency.value);
        const t = parseFloat(tradeIn.value) || 0;
        const o = parseFloat(owedTradeIn.value) || 0;
        const d = parseFloat(downSlider.value) || 0;
        const r_tax = (parseFloat(salesTax.value) || 0) / 100;
        
        const months = parseInt(termSlider.value);
        const annualRate = parseFloat(interestRateInput.value) || 0;
        const r_p = (annualRate / 100) / freq;
        const total_periods = Math.ceil((months / 12) * freq);

        if (mode === 'payment') {
            resultTitle.innerText = `Estimated ${freqName} Payment`;
            const p = parseFloat(priceSlider.value) || 0;
            const tax_amount = Math.max(0, p - t) * r_tax;
            let total_loan = p + tax_amount + o - t - d;
            
            if (total_loan <= 0) {
                total_loan = 0;
                resultAmount.innerText = '$0.00';
            } else {
                let payment = 0;
                if (r_p === 0) {
                    payment = total_loan / total_periods;
                } else {
                    payment = total_loan * (r_p * Math.pow(1 + r_p, total_periods)) / (Math.pow(1 + r_p, total_periods) - 1);
                }
                resultAmount.innerText = '$' + payment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            }
            totalLoanVal.innerText = '$' + total_loan.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

        } else if (mode === 'maxLoan') {
            resultTitle.innerText = `Maximum Vehicle Price`;
            const desired_pmt = parseFloat(desiredPayment.value) || 0;
            
            let max_loan = 0;
            if (r_p === 0) {
                max_loan = desired_pmt * total_periods;
            } else {
                max_loan = desired_pmt * (Math.pow(1 + r_p, total_periods) - 1) / (r_p * Math.pow(1 + r_p, total_periods));
            }
            
            let p_taxable = (max_loan - o + d) / (1 + r_tax) + t;
            let p_nontaxable = max_loan - o + t + d;
            
            let p = 0;
            if (p_nontaxable <= t) {
                p = p_nontaxable;
            } else {
                p = p_taxable;
            }
            
            if (p <= 0) p = 0;
            
            resultAmount.innerText = '$' + p.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            totalLoanVal.innerText = '$' + max_loan.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }

        appliedRate.innerText = annualRate;
    }

    // Update UI on input
    function updateUI() {
        if (calcMode.value === 'payment') {
            groupVehiclePrice.style.display = 'block';
            groupDesiredPayment.style.display = 'none';
        } else {
            groupVehiclePrice.style.display = 'none';
            groupDesiredPayment.style.display = 'block';
        }

        priceVal.innerText = formatCurrency(priceSlider.value);
        desiredVal.innerText = formatCurrency(desiredPayment.value);
        tradeInVal.innerText = formatCurrency(tradeIn.value);
        owedTradeInVal.innerText = formatCurrency(owedTradeIn.value);
        downVal.innerText = formatCurrency(downSlider.value);
        termVal.innerText = termSlider.value;

        calculateLoan();
    }

    // Event Listeners
    const inputs = [calcMode, priceSlider, desiredPayment, tradeIn, owedTradeIn, downSlider, termSlider, interestRateInput, salesTax, paymentFrequency];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updateUI);
            input.addEventListener('change', updateUI);
        }
    });

    // Initial calculation
    updateUI();
});
