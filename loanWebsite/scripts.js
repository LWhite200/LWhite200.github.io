function calculateDebt() {


    document.getElementById('formSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    const bYear1 = parseInt(document.getElementById('borrowingYear1').value);
    const loanAmt1 = parseFloat(document.getElementById('loanAmt1').value);
    const loanAmt2 = parseFloat(document.getElementById('loanAmt2').value);
    const loanAmt3 = parseFloat(document.getElementById('loanAmt3').value);
    const loanAmt4 = parseFloat(document.getElementById('loanAmt4').value);
    
    const interestRate = 0.05;
    const repaymentYears = 10;

    let totalDebt = loanAmt1 * Math.pow(1 + interestRate, 3) +
        loanAmt2 * Math.pow(1 + interestRate, 2) +
        loanAmt3 * Math.pow(1 + interestRate, 1) +
        loanAmt4; 

    const amortization = (totalDebt * interestRate) / (1 - Math.pow(1 + interestRate, -repaymentYears));
    document.getElementById('totalDebt').textContent = `Total Debt: $${totalDebt.toFixed(2)}`;
    document.getElementById('amortization').textContent = `Annual Amortization Payments: $${amortization.toFixed(2)}`;

    // Initialize variables for the amortization table
    let remainingDebt = totalDebt;

    // I am a genius, you can litterally just loop through each one changing the variable name's ending 'int'
    for (let year = 1; year <= repaymentYears; year++) {
        const interest = remainingDebt * interestRate;
        const principal = amortization - interest;
        remainingDebt -= principal; // subtract the total debt after each payment

        // Set the values in the table using my genius strategy
        document.getElementById(`pay${year}`).textContent = `$${amortization.toFixed(2)}`;
        document.getElementById(`intr${year}`).textContent = `$${interest.toFixed(2)}`;
        document.getElementById(`prin${year}`).textContent = `$${principal.toFixed(2)}`;
        document.getElementById(`reD${year}`).textContent = `$${Math.max(0, remainingDebt).toFixed(2)}`;
    }
}

// Simply add the distance from the first year if the first year is a valid number.
function updateYears() {
    let bYear1 = parseInt(document.getElementById('borrowingYear1').value);
    if (!isNaN(bYear1) && bYear1 >= 0) {
        document.getElementById('borrowingYear2').value = bYear1 + 1;
        document.getElementById('borrowingYear3').value = bYear1 + 2;
        document.getElementById('borrowingYear4').value = bYear1 + 3;
    } else {
        document.getElementById('borrowingYear2').value = '';
        document.getElementById('borrowingYear3').value = '';
        document.getElementById('borrowingYear4').value = '';
    }
}

function checkThenDebt() {
    const bYear1 = parseInt(document.getElementById('borrowingYear1').value);
    const loanAmt1 = parseFloat(document.getElementById('loanAmt1').value);
    const loanAmt2 = parseFloat(document.getElementById('loanAmt2').value);
    const loanAmt3 = parseFloat(document.getElementById('loanAmt3').value);
    const loanAmt4 = parseFloat(document.getElementById('loanAmt4').value);
    
    // Check if at least one of the inputs is valid
    if (!isNaN(bYear1) && bYear1 >= 0 || 
        !isNaN(loanAmt1) && loanAmt1 > 0 || 
        !isNaN(loanAmt2) && loanAmt2 > 0 || 
        !isNaN(loanAmt3) && loanAmt3 > 0 || 
        !isNaN(loanAmt4) && loanAmt4 > 0) {
        calculateDebt();
    } else {
        // Optionally handle the case where all inputs are invalid
        alert("Please enter at least one valid input.");
    }
}


checkThenDebt
calculateDebt();
updateYears();