document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('autobankerIntakeForm');
    if (!form) return;

    const steps = document.querySelectorAll('.form-step');
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    const progressBar = document.getElementById('progressBar');
    const stepIndicator = document.getElementById('stepIndicator');
    const stepTitle = document.getElementById('stepTitle');
    const displayPhone = document.getElementById('displayPhone');
    
    let currentStep = 1;
    const totalSteps = steps.length;

    const stepTitles = {
        1: "Vehicle Type",
        2: "Budget",
        3: "Residency",
        4: "Employment Status",
        5: "Employment Details",
        6: "Monthly Income",
        7: "Additional Income",
        8: "Employment Length",
        9: "Location",
        10: "Contact Details",
        11: "Verification"
    };

    function updateUI() {
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        
        // Show current step
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Update progress bar
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Update indicators
        stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;
        stepTitle.textContent = stepTitles[currentStep] || "Application";

        // Navigation buttons
        if (currentStep === 1) {
            btnBack.style.display = 'none';
        } else {
            btnBack.style.display = 'block';
        }

        if (currentStep === totalSteps) {
            btnNext.style.display = 'none'; // Hide next on 2FA step
            btnBack.style.display = 'none'; // Hide back on 2FA step to prevent going back after SMS sent
            
            // Set phone display
            const phoneInput = document.getElementById('phone').value;
            if (displayPhone) displayPhone.textContent = phoneInput;
        } else if (currentStep === totalSteps - 1) {
            btnNext.textContent = 'Submit Application';
            btnNext.style.display = 'block';
        } else {
            btnNext.textContent = 'Continue';
            
            // Check if current step has text/number inputs
            const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            const hasTextInputs = currentStepEl.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], select').length > 0;
            
            if (hasTextInputs) {
                btnNext.style.display = 'block';
            } else {
                btnNext.style.display = 'none';
            }
        }
    }

    function validateStep(stepNum) {
        const stepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        const inputs = stepEl.querySelectorAll('input[required], select[required]');
        
        for (let input of inputs) {
            if (input.type === 'radio') {
                const radioGroup = stepEl.querySelectorAll(`input[name="${input.name}"]:checked`);
                if (radioGroup.length === 0) return false;
            } else if (!input.value.trim()) {
                input.focus();
                // Flash animation for visual feedback
                input.style.borderColor = 'red';
                setTimeout(() => input.style.borderColor = '', 1000);
                return false;
            }
        }
        return true;
    }

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
                
                // If we just entered the 2FA step, trigger OTP and focus first input
                if (currentStep === totalSteps) {
                    const phone = document.getElementById('phone').value;
                    fetch('/api/send-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone })
                    }).catch(err => console.error("Failed to trigger OTP", err));

                    setTimeout(() => {
                        const firstOTP = document.querySelector('.otp-input');
                        if (firstOTP) firstOTP.focus();
                    }, 500);
                }
            }
        }
    });

    const btnResend = document.getElementById('btnResend');
    if (btnResend) {
        btnResend.addEventListener('click', () => {
            const phone = document.getElementById('phone').value;
            fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            btnResend.textContent = 'Code Sent!';
            setTimeout(() => btnResend.textContent = 'Resend Code', 3000);
        });
    }

    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    // Auto-advance for radio buttons
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            // Small delay for visual feedback before auto advancing
            setTimeout(() => {
                if (validateStep(currentStep) && currentStep < totalSteps) {
                    currentStep++;
                    updateUI();
                }
            }, 300);
        });
    });

    // OTP Input logic
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // allow only numbers
            input.value = input.value.replace(/[^0-9]/g, '');
            if (input.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            checkOTPComplete();
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    async function checkOTPComplete() {
        const otpValue = Array.from(otpInputs).map(i => i.value).join('');
        if (otpValue.length === 6) {
            // Disable inputs while checking
            otpInputs.forEach(i => i.disabled = true);
            
            // Gather lead data
            const leadData = {};
            const formData = new FormData(document.getElementById('autobankerIntakeForm'));
            for (let [key, value] of formData.entries()) {
                leadData[key] = value;
            }
            const phone = document.getElementById('phone').value;

            try {
                const res = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, otp: otpValue, leadData })
                });

                const result = await res.json();
                
                if (result.success) {
                    const step2FA = document.getElementById('step2FA');
                    step2FA.innerHTML = `
                        <div class="verification-icon" style="background: rgba(0, 200, 80, 0.2); color: #00e676;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 style="text-align:center; color:white; font-size:1.8rem; margin-bottom: 1rem;">Application Secured!</h3>
                        <p style="text-align:center; color: var(--text-muted); font-size:1.1rem;">Your identity has been verified and your application is successfully submitted. A finance specialist will reach out shortly.</p>
                    `;
                } else {
                    alert(result.error || "Invalid code. Please try again.");
                    otpInputs.forEach(i => { i.disabled = false; i.value = ''; });
                    otpInputs[0].focus();
                }
            } catch (err) {
                alert("Network error. Please try again.");
                otpInputs.forEach(i => { i.disabled = false; i.value = ''; });
                otpInputs[0].focus();
            }
        }
    }

    // Initialize
    updateUI();
});
