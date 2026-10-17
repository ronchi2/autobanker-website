document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('autobankerIntakeForm');
    if (!form) return;

    const STORAGE_KEY = 'autobanker_quiz_state_v2';
    const STORAGE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (604,800,000 ms — matches GetGoing.ca)

    const steps = document.querySelectorAll('#autobankerIntakeForm .form-step');
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    const progressBar = document.getElementById('progressBar');
    const stepIndicator = document.getElementById('stepIndicator');
    const stepTitle = document.getElementById('stepTitle');
    const displayPhone = document.getElementById('displayPhone');
    const incomeWarningBox = document.getElementById('incomeFloorWarning');
    const preApprovalOverlay = document.getElementById('preApprovalOverlay');

    let currentStep = 1;
    const totalSteps = steps.length;
    let incomeFloorAcknowledged = false;
    let preApprovalShown = false;

    const stepTitles = {
        1: "Vehicle Selection",
        2: "Monthly Budget",
        3: "Residency Status",
        4: "Employment Status",
        5: "Employer Details",
        6: "Monthly Income",
        7: "Additional Income",
        8: "Job Tenure",
        9: "Housing & Living Costs",
        10: "Your Location",
        11: "Final Approval Details",
        12: "SMS Security Verification"
    };

    // 1. Dynamic Regional / Multi-Brand Ad Skinning (?region=bc, ?region=ontario, ?region=alberta, ?program=newcomer)
    function applyDynamicAdTheme() {
        const params = new URLSearchParams(window.location.search);
        const region = (params.get('region') || '').toLowerCase();
        const program = (params.get('program') || '').toLowerCase();
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const provinceSelect = document.getElementById('province');

        const regionMap = {
            'bc': { badge: 'Serving British Columbia • BC Auto Approval Desk', prov: 'BC' },
            'ontario': { badge: 'Serving Ontario • Provincial Auto Approval Program', prov: 'ON' },
            'gta': { badge: 'Serving Toronto & The GTA • Priority Approval Desk', prov: 'ON' },
            'alberta': { badge: 'Serving Alberta • Truck & SUV Approval Program', prov: 'AB' }
        };

        if (region && regionMap[region]) {
            if (heroSubtitle) heroSubtitle.textContent = regionMap[region].badge;
            if (provinceSelect && !provinceSelect.value) {
                provinceSelect.value = regionMap[region].prov;
            }
        } else if (program === 'newcomer') {
            if (heroSubtitle) heroSubtitle.textContent = 'Canadian Newcomer & Work Permit Auto Approval Program';
        } else if (program === 'zerodown') {
            if (heroSubtitle) heroSubtitle.textContent = '$0 Down Payment & Bad Credit Auto Approval Desk';
        }
    }

    // 2. Push VirtualPageview & Step Micro-Conversions to GTM dataLayer
    function trackStepView(stepNum) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'autobanker_step_viewed',
            step_number: stepNum,
            step_name: stepTitles[stepNum] || `Step ${stepNum}`,
            virtual_url: `/apply/step-${stepNum}`
        });
    }

    // 3. Collect all current form data into a clean object
    function collectLeadData() {
        const leadData = {};
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            leadData[key] = value;
        }
        const consentEl = document.getElementById('creditConsent');
        if (consentEl) {
            leadData.creditConsent = consentEl.checked;
        }
        const params = new URLSearchParams(window.location.search);
        if (params.get('utm_source')) leadData.utmSource = params.get('utm_source');
        if (params.get('utm_campaign')) leadData.utmCampaign = params.get('utm_campaign');
        if (params.get('region')) leadData.adRegion = params.get('region');
        return leadData;
    }

    // 4. Save & Restore 7-Day State in localStorage
    function saveStateToStorage() {
        try {
            const payload = {
                currentStep: currentStep < totalSteps ? currentStep : totalSteps - 1,
                values: collectLeadData(),
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.warn('Could not save quiz state:', e);
        }
    }

    function restoreStateFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.timestamp || (Date.now() - parsed.timestamp > STORAGE_TTL)) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }
            const values = parsed.values || {};
            Object.entries(values).forEach(([key, val]) => {
                const els = form.querySelectorAll(`[name="${key}"]`);
                els.forEach(el => {
                    if (el.type === 'radio') {
                        el.checked = (el.value === String(val));
                    } else if (el.type === 'checkbox') {
                        el.checked = Boolean(val);
                    } else {
                        el.value = val;
                    }
                });
            });
            if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep < totalSteps) {
                currentStep = parsed.currentStep;
            }
        } catch (e) {
            console.warn('Could not restore quiz state:', e);
        }
    }

    // 5. Handle Hero Vehicle Card Quick-Launch (?vehicle=SUV or .hero-vehicle-card click)
    function initVehicleQuickLaunch() {
        const params = new URLSearchParams(window.location.search);
        const urlVehicle = params.get('vehicle') || params.get('vehicle_type');
        if (urlVehicle) {
            selectVehicleAndAdvance(urlVehicle, false);
        }

        const heroCards = document.querySelectorAll('[data-quick-vehicle]');
        heroCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const vehicle = card.getAttribute('data-quick-vehicle');
                selectVehicleAndAdvance(vehicle, true);
            });
        });
    }

    function selectVehicleAndAdvance(vehicleName, shouldScroll) {
        const normalized = vehicleName.trim().toLowerCase();
        const radios = form.querySelectorAll('input[name="vehicleType"]');
        let matched = false;
        radios.forEach(r => {
            if (r.value.toLowerCase() === normalized) {
                r.checked = true;
                matched = true;
            }
        });
        if (matched) {
            currentStep = 2;
            saveStateToStorage();
            updateUI();
            if (shouldScroll) {
                const applyEl = document.getElementById('apply');
                if (applyEl) {
                    applyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }

    function updateUI() {
        steps.forEach(step => step.classList.remove('active'));
        
        const currentStepEl = form.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        const progressPercentage = Math.max(8, Math.round(((currentStep - 1) / (totalSteps - 1)) * 100));
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;

        if (stepIndicator) stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;
        if (stepTitle) stepTitle.textContent = stepTitles[currentStep] || "Application";

        if (currentStep === 1) {
            btnBack.style.display = 'none';
        } else {
            btnBack.style.display = 'block';
        }

        if (currentStep === totalSteps) {
            btnNext.style.display = 'none';
            btnBack.style.display = 'none';
            const phoneInput = document.getElementById('phone')?.value || '';
            if (displayPhone) displayPhone.textContent = phoneInput;
        } else if (currentStep === totalSteps - 1) {
            btnNext.textContent = 'Unlock My Pre-Approval →';
            btnNext.style.display = 'block';
        } else {
            btnNext.textContent = 'Continue →';
            if (currentStepEl) {
                const hasTextInputs = currentStepEl.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], input[type="date"], select').length > 0;
                const checkedRadio = currentStepEl.querySelector('input[type="radio"]:checked');
                if (hasTextInputs || checkedRadio) {
                    btnNext.style.display = 'block';
                } else {
                    btnNext.style.display = 'none';
                }
            }
        }

        trackStepView(currentStep);
    }

    function validateStep(stepNum) {
        const stepEl = form.querySelector(`.form-step[data-step="${stepNum}"]`);
        if (!stepEl) return true;
        const inputs = stepEl.querySelectorAll('input[required], select[required]');
        
        for (let input of inputs) {
            if (input.type === 'radio') {
                const radioGroup = stepEl.querySelectorAll(`input[name="${input.name}"]:checked`);
                if (radioGroup.length === 0) return false;
            } else if (input.type === 'checkbox') {
                if (!input.checked) {
                    input.focus();
                    return false;
                }
            } else if (!input.value.trim()) {
                input.focus();
                input.style.borderColor = '#ef4444';
                setTimeout(() => input.style.borderColor = '', 1200);
                return false;
            }
        }

        // GetGoing.ca $1,800/mo Income Floor Soft Check on Step 6
        if (stepNum === 6) {
            const incomeInput = document.getElementById('monthlyIncome');
            const val = parseFloat(incomeInput?.value || '0');
            if (val > 0 && val < 1800 && !incomeFloorAcknowledged && incomeWarningBox) {
                incomeWarningBox.style.display = 'block';
                incomeFloorAcknowledged = true;
                incomeInput.focus();
                return false;
            }
        }

        return true;
    }

    // Trigger the 3.2-second Luxury Pre-Approval Match Dopamine Screen before Location/PII steps
    function triggerPreApprovalDopamineScreen(callback) {
        if (!preApprovalOverlay || preApprovalShown) {
            callback();
            return;
        }
        preApprovalShown = true;
        preApprovalOverlay.style.display = 'flex';
        const statusText = document.getElementById('preApprovalStatusText');
        const subText = document.getElementById('preApprovalSubText');

        setTimeout(() => {
            if (statusText) statusText.textContent = "Calculating Maximum TDSR Approval Limit...";
            if (subText) subText.textContent = "Checking 20+ Canadian Prime & Non-Prime Auto Lenders";
        }, 1100);

        setTimeout(() => {
            if (statusText) statusText.innerHTML = "<span style='color:#00e676;'>✓ PRE-QUALIFICATION MATCH FOUND!</span>";
            if (subText) subText.textContent = "Unlocking your matched vehicle & payment options...";
        }, 2200);

        setTimeout(() => {
            preApprovalOverlay.style.display = 'none';
            callback();
        }, 3300);
    }

    function advanceToNextStep() {
        if (currentStep >= totalSteps) return;

        // If advancing from Step 9 (Housing) to Step 10 (Location/Contact), show Pre-Approval Dopamine Screen
        if (currentStep === 9 && !preApprovalShown && preApprovalOverlay) {
            saveStateToStorage();
            triggerPreApprovalDopamineScreen(() => {
                currentStep++;
                saveStateToStorage();
                updateUI();
            });
            return;
        }

        currentStep++;
        saveStateToStorage();
        updateUI();

        // If we just entered the final 2FA step (Step 12), immediately capture the partial lead + send OTP!
        if (currentStep === totalSteps) {
            const phone = document.getElementById('phone')?.value || '';
            const leadData = collectLeadData();

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'autobanker_lead_captured',
                vehicle_type: leadData.vehicleType,
                budget: leadData.budget
            });

            fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, leadData, isResend: false })
            }).catch(err => console.error("Failed to trigger OTP", err));

            setTimeout(() => {
                const firstOTP = form.querySelector('.otp-input');
                if (firstOTP) firstOTP.focus();
            }, 400);

            // Show fallback "Skip SMS / Verify by Phone Call" button after 10 seconds so no lead is ever lost
            const skipBtn = document.getElementById('btnSkipOTP');
            if (skipBtn) {
                setTimeout(() => {
                    skipBtn.style.display = 'inline-block';
                }, 8000);
            }
        }
    }

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            advanceToNextStep();
        }
    });

    const btnResend = document.getElementById('btnResend');
    if (btnResend) {
        btnResend.addEventListener('click', () => {
            const phone = document.getElementById('phone')?.value || '';
            fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, isResend: true })
            });
            btnResend.textContent = 'Code Sent!';
            setTimeout(() => btnResend.textContent = 'Resend Code', 3000);
        });
    }

    const btnSkipOTP = document.getElementById('btnSkipOTP');
    if (btnSkipOTP) {
        btnSkipOTP.addEventListener('click', () => {
            showCompletionScreen(false);
        });
    }

    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            saveStateToStorage();
            updateUI();
        }
    });

    // Save on any input change and auto-advance radio buttons
    form.addEventListener('input', () => {
        saveStateToStorage();
    });

    const radioInputs = form.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            saveStateToStorage();
            // Only auto-advance if this step does NOT also require text/number inputs
            const stepEl = form.querySelector(`.form-step[data-step="${currentStep}"]`);
            const hasTextInputs = stepEl ? stepEl.querySelectorAll('input[type="text"], input[type="number"], select').length > 0 : false;
            if (!hasTextInputs) {
                setTimeout(() => {
                    if (validateStep(currentStep) && currentStep < totalSteps) {
                        advanceToNextStep();
                    }
                }, 250);
            }
        });
    });

    // OTP Input logic
    const otpInputs = form.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
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

    function showCompletionScreen(verifiedBySms = true) {
        localStorage.removeItem(STORAGE_KEY);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'autobanker_lead_verified',
            verification_method: verifiedBySms ? 'sms_otp' : 'direct_callback'
        });

        const leadData = collectLeadData();
        const firstName = leadData.firstName || 'Valued Client';
        const step2FA = document.getElementById('step2FA');
        if (step2FA) {
            step2FA.innerHTML = `
                <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5" style="background: rgba(0, 230, 118, 0.15); color: #00e676; border: 2px solid rgba(0, 230, 118, 0.4);">
                    <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 style="text-align:center; color:white; font-size:1.85rem; margin-bottom: 0.75rem;">Pre-Approval File Secured, ${firstName}!</h3>
                <p style="text-align:center; color: #d1d5db; font-size:1.05rem; max-width: 520px; margin: 0 auto 1.25rem auto;">
                    Your application has been assigned to a Senior AutoBanker Finance Director. We are reviewing your matched lender programs and will contact you shortly.
                </p>
                <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 16px; max-width: 460px; margin: 0 auto; text-align: left; font-size: 0.9rem; color: #e5e7eb;">
                    <div style="color: #D4AF37; font-weight: 700; margin-bottom: 6px;">What Happens Next:</div>
                    <div>1. Soft-pull lender program matching (Zero impact to your credit score)</div>
                    <div>2. Vehicle &amp; payment structuring tailored to your ${leadData.budget || 'monthly'} budget ($0 down options available)</div>
                    <div>3. Priority matching with our trusted GTA &amp; Ontario dealership network</div>
                </div>
            `;
        }
    }

    async function checkOTPComplete() {
        const otpValue = Array.from(otpInputs).map(i => i.value).join('');
        if (otpValue.length === 6) {
            otpInputs.forEach(i => i.disabled = true);
            const leadData = collectLeadData();
            const phone = document.getElementById('phone')?.value || '';

            try {
                const res = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, otp: otpValue, leadData })
                });

                const result = await res.json();
                
                if (result.success) {
                    showCompletionScreen(true);
                } else {
                    alert(result.error || "Invalid verification code. Please try again.");
                    otpInputs.forEach(i => { i.disabled = false; i.value = ''; });
                    otpInputs[0].focus();
                }
            } catch (err) {
                alert("Network error verifying code. Your application is already saved—click below to complete.");
                otpInputs.forEach(i => { i.disabled = false; i.value = ''; });
                otpInputs[0].focus();
            }
        }
    }

    // Initialize
    restoreStateFromStorage();
    applyDynamicAdTheme();
    initVehicleQuickLaunch();
    updateUI();
});
