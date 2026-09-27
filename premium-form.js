document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('premiumForm');
    if (!form) return;

    const steps = Array.from(document.querySelectorAll('.form-step'));
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    const progressBar = document.getElementById('progressBar');
    const stepTitle = document.getElementById('stepTitle');

    // Define the flows based on selected service
    const flows = {
        'Credit Rebuilding': ['service', 'a_credit', 'a_vehicle', 'a_budget', 'a_income', 'final_address', 'final_contact', 'final_submit'],
        'VIP Refinancing': ['service', 'b_vehicle', 'b_mileage', 'b_payment', 'b_balance', 'final_address', 'final_contact', 'final_submit'],
        'Vehicle Sourcing': ['service', 'c_desired', 'c_year', 'c_features', 'c_tradein', 'final_address', 'final_contact', 'final_submit'],
        'Cash Back Loans': ['service', 'd_cash', 'd_debt', 'd_vehicle', 'd_income', 'final_address', 'final_contact', 'final_submit']
    };

    let currentFlow = [];
    let currentIndex = 0;

    // Initially we only know the first step is 'service'
    currentFlow = ['service'];
    
    function updateUI() {
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        
        // Show current step
        const currentStepId = currentFlow[currentIndex];
        const currentStepEl = steps.find(s => s.dataset.step === currentStepId);
        
        if (currentStepEl) {
            currentStepEl.classList.add('active');
            
            // Update title
            const title = currentStepEl.dataset.title || 'Select Service';
            stepTitle.textContent = title;
            
            // Buttons logic
            btnBack.style.display = currentIndex > 0 ? 'block' : 'none';
            
            const isRadioStep = currentStepEl.dataset.type === 'radio';
            const isSubmitStep = currentStepEl.dataset.type === 'submit';
            
            if (isSubmitStep) {
                btnNext.style.display = 'none';
            } else if (isRadioStep) {
                // If it's a radio step, hide Next if no option is checked yet
                // But generally we hide Next and let radio click auto-advance, unless we want manual advance
                btnNext.style.display = 'none';
                
                // If an option is already selected, we could show Next, but let's stick to auto-advance or just hiding it until selection
                const checkedRadio = currentStepEl.querySelector('input[type="radio"]:checked');
                if (checkedRadio) {
                    btnNext.style.display = 'block';
                }
            } else {
                btnNext.style.display = 'block';
                btnNext.textContent = 'Continue';
            }
            
            // Progress bar
            const totalSteps = currentFlow.length;
            const progress = ((currentIndex + 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // Auto-advance on radio select
    form.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            // If it's the service selection, update the flow
            if (e.target.name === 'serviceType') {
                const service = e.target.value;
                if (flows[service]) {
                    currentFlow = flows[service];
                }
            }
            
            // Automatically move to next step after a short delay
            setTimeout(() => {
                if (currentIndex < currentFlow.length - 1) {
                    currentIndex++;
                    updateUI();
                }
            }, 300);
        }
    });

    btnNext.addEventListener('click', () => {
        // Simple validation for text inputs on current step
        const currentStepId = currentFlow[currentIndex];
        const currentStepEl = steps.find(s => s.dataset.step === currentStepId);
        
        if (currentStepEl) {
            const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
            let valid = true;
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.classList.add('border-red-500');
                } else {
                    input.classList.remove('border-red-500');
                }
            });
            
            if (!valid) return; // Prevent advancing if required fields are missing
        }

        if (currentIndex < currentFlow.length - 1) {
            currentIndex++;
            updateUI();
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateUI();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Application submitted successfully!');
        // Here you would typically send data to server
    });

    // Handle pressing enter on text inputs
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (btnNext.style.display !== 'none') {
                btnNext.click();
            }
        }
    });

    // Initial setup
    updateUI();
});
