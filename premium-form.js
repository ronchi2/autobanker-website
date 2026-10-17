document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('premiumForm');
    if (!form) return;

    const steps = Array.from(document.querySelectorAll('.form-step'));
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    const progressBar = document.getElementById('progressBar');
    const stepTitle = document.getElementById('stepTitle');
    const displayPhone = document.getElementById('premiumDisplayPhone');

    // Define the flows based on selected service
    const flows = {
        'Credit Rebuilding': ['service', 'a_credit', 'a_vehicle', 'a_budget', 'a_income', 'final_address', 'final_contact', 'final_submit'],
        'VIP Refinancing': ['service', 'b_vehicle', 'b_mileage', 'b_payment', 'b_balance', 'final_address', 'final_contact', 'final_submit'],
        'Vehicle Sourcing': ['service', 'c_desired', 'c_year', 'c_features', 'c_tradein', 'final_address', 'final_contact', 'final_submit'],
        'Cash Back Loans': ['service', 'd_cash', 'd_debt', 'd_vehicle', 'd_income', 'final_address', 'final_contact', 'final_submit']
    };

    let currentFlow = ['service'];
    let currentIndex = 0;

    // Support URL parameter pre-selection (?service=VIP Refinancing or ?service=Cash Back Loans)
    const params = new URLSearchParams(window.location.search);
    const preselectedService = params.get('service');
    if (preselectedService && flows[preselectedService]) {
        const radio = form.querySelector(`input[name="serviceType"][value="${preselectedService}"]`);
        if (radio) {
            radio.checked = true;
            currentFlow = flows[preselectedService];
            currentIndex = 1;
        }
    }

    function collectPremiumLeadData() {
        const leadData = {};
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            if (value !== '') leadData[key] = value;
        }
        return leadData;
    }

    function updateUI() {
        steps.forEach(step => step.classList.remove('active'));
        
        const currentStepId = currentFlow[currentIndex];
        const currentStepEl = steps.find(s => s.dataset.step === currentStepId);
        
        if (currentStepEl) {
            currentStepEl.classList.add('active');
            
            const title = currentStepEl.dataset.title || 'Select Service';
            stepTitle.textContent = title;
            
            const isSubmitStep = currentStepEl.dataset.type === 'submit';
            const isRadioStep = currentStepEl.dataset.type === 'radio';

            btnBack.style.display = (currentIndex > 0 && !isSubmitStep) ? 'block' : 'none';
            
            if (isSubmitStep) {
                btnNext.style.display = 'none';
                const phoneVal = form.querySelector('input[name="phone"]')?.value || '';
                if (displayPhone) displayPhone.textContent = phoneVal;
            } else if (isRadioStep) {
                const checkedRadio = currentStepEl.querySelector('input[type="radio"]:checked');
                btnNext.style.display = checkedRadio ? 'block' : 'none';
            } else {
                btnNext.style.display = 'block';
                btnNext.textContent = currentStepId === 'final_contact' ? 'Unlock My Options →' : 'Continue →';
            }
            
            const totalSteps = currentFlow.length;
            const progress = ((currentIndex + 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'autobanker_premium_step_viewed',
                step_id: currentStepId,
                step_title: title
            });
        }
    }

    // Auto-advance on radio select
    form.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            if (e.target.name === 'serviceType') {
                const service = e.target.value;
                if (flows[service]) {
                    currentFlow = flows[service];
                }
            }
            
            setTimeout(() => {
                if (currentIndex < currentFlow.length - 1) {
                    currentIndex++;
                    updateUI();
                }
            }, 250);
        }
    });

    btnNext.addEventListener('click', () => {
        const currentStepId = currentFlow[currentIndex];
        const currentStepEl = steps.find(s => s.dataset.step === currentStepId);
        
        if (currentStepEl) {
            const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
            let valid = true;
            inputs.forEach(input => {
                if (input.type === 'checkbox' && !input.checked) {
                    valid = false;
                } else if (!input.value.trim()) {
                    valid = false;
                    input.classList.add('border-red-500');
                } else {
                    input.classList.remove('border-red-500');
                }
            });
            
            if (!valid) return;
        }

        if (currentIndex < currentFlow.length - 1) {
            currentIndex++;
            updateUI();

            // If we just entered final_submit, immediately capture partial lead in GoHighLevel + Resend and trigger Twilio OTP!
            if (currentFlow[currentIndex] === 'final_submit') {
                const leadData = collectPremiumLeadData();
                const phone = leadData.phone || '';
                fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, leadData, isResend: false })
                }).catch(err => console.error('Failed to send OTP on premium form:', err));

                setTimeout(() => {
                    const firstOtp = form.querySelector('.premium-otp-input');
                    if (firstOtp) firstOtp.focus();
                }, 400);
            }
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateUI();
        }
    });

    // OTP Input logic on Premium Form
    const otpInputs = form.querySelectorAll('.premium-otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '');
            if (input.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            checkPremiumOTP();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    function showPremiumSuccess() {
        const submitStepEl = steps.find(s => s.dataset.step === 'final_submit');
        const leadData = collectPremiumLeadData();
        if (submitStepEl) {
            submitStepEl.innerHTML = `
                <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5" style="background: rgba(0, 230, 118, 0.15); color: #00e676; border: 2px solid rgba(0, 230, 118, 0.4);">
                    <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">VIP File Assigned, ${leadData.firstName || 'Client'}!</h3>
                <p class="text-gray-300 text-base max-w-md mx-auto mb-4">
                    Your <strong>${leadData.serviceType || 'Premium'}</strong> dossier has been transmitted to our Senior Finance Desk. A specialist will reach out shortly with your custom options.
                </p>
            `;
        }
    }

    async function checkPremiumOTP() {
        const otpValue = Array.from(otpInputs).map(i => i.value).join('');
        if (otpValue.length === 6) {
            otpInputs.forEach(i => i.disabled = true);
            const leadData = collectPremiumLeadData();
            const phone = leadData.phone || '';

            try {
                const res = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, otp: otpValue, leadData })
                });
                const result = await res.json();
                if (result.success) {
                    showPremiumSuccess();
                } else {
                    alert(result.error || "Invalid verification code. Please try again.");
                    otpInputs.forEach(i => { i.disabled = false; i.value = ''; });
                    otpInputs[0].focus();
                }
            } catch (e) {
                showPremiumSuccess();
            }
        }
    }

    const btnResendPremium = document.getElementById('btnResendPremium');
    if (btnResendPremium) {
        btnResendPremium.addEventListener('click', () => {
            const phone = form.querySelector('input[name="phone"]')?.value || '';
            fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, isResend: true })
            });
            btnResendPremium.textContent = 'Code Sent!';
            setTimeout(() => btnResendPremium.textContent = 'Resend Code', 3000);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showPremiumSuccess();
    });

    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (btnNext.style.display !== 'none') {
                btnNext.click();
            }
        }
    });

    updateUI();
});
