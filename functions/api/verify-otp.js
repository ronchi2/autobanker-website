export async function onRequestPost({ request, env }) {
    try {
        const { phone, otp, leadData } = await request.json();
        
        if (!phone || !otp) {
            return new Response(JSON.stringify({ error: "Phone and OTP required" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const storedOtp = env.OTP_STORE ? await env.OTP_STORE.get(phone) : null;
        if (!storedOtp || storedOtp !== otp) {
            return new Response(JSON.stringify({ error: "Invalid or expired verification code." }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // OTP is valid. Clear it from KV so it cannot be reused
        if (env.OTP_STORE) {
            await env.OTP_STORE.delete(phone);
        }

        const vehicle = leadData?.vehicleType || leadData?.cb_vehicleType || leadData?.desiredVehicle || leadData?.currentVehicle || "";
        const income = leadData?.monthlyIncome || leadData?.cb_monthlyIncome || "";
        const service = leadData?.serviceType || "Auto Loan Pre-Approval";

        // 1. Send Complete Underwriting Lead to GoHighLevel (V2 API Upsert + Notes)
        if (env.GHL_API_KEY && leadData) {
            const ghlHeaders = {
                'Authorization': `Bearer ${env.GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            const tags = [
                "AutoBanker Website",
                "Status: SMS Verified ✅",
                `Service: ${service}`,
                vehicle ? `Vehicle: ${vehicle}` : null,
                leadData.budget ? `Budget: ${leadData.budget}` : null,
                leadData.employment ? `Employment: ${leadData.employment}` : null,
                income ? `Income: $${income}/mo` : null,
                leadData.housingStatus ? `Housing: ${leadData.housingStatus}` : null,
                leadData.residency ? `Residency: ${leadData.residency}` : null,
                leadData.creditScore ? `Credit: ${leadData.creditScore}` : null
            ].filter(Boolean);
            
            const ghlPayload = {
                locationId: env.GHL_LOCATION_ID,
                firstName: leadData.firstName || "",
                lastName: leadData.lastName || "",
                name: `${leadData.firstName || ""} ${leadData.lastName || ""}`.trim(),
                email: leadData.email || "",
                phone: phone,
                address1: leadData.address || leadData.streetAddress || "",
                city: leadData.city || "",
                state: leadData.province || "",
                postalCode: leadData.postalCode || "",
                country: "CA",
                dateOfBirth: leadData.dob || undefined,
                tags: tags,
                source: leadData.serviceType ? `Premium Form (${leadData.serviceType})` : "Website Intake Form"
            };

            let ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
                method: 'POST',
                headers: ghlHeaders,
                body: JSON.stringify(ghlPayload)
            });

            if (!ghlRes.ok) {
                ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
                    method: 'POST',
                    headers: ghlHeaders,
                    body: JSON.stringify(ghlPayload)
                });
            }

            const responseText = await ghlRes.text();
            console.log("GHL Response Status:", ghlRes.status);

            try {
                const parsed = JSON.parse(responseText);
                const contactId = parsed?.contact?.id;
                if (contactId) {
                    const noteLines = [
                        `✅ VERIFIED AUTOBANKER UNDERWRITING DOSSIER`,
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                        `• Verification: SMS 2FA Verified (${phone})`,
                        `• Service Pillar: ${service}`,
                        `• Full Name: ${leadData.firstName || ''} ${leadData.lastName || ''}`,
                        `• Email: ${leadData.email || ''}`,
                        `• Date of Birth: ${leadData.dob || 'Not provided'}`,
                        `• Address: ${leadData.address || ''}, ${leadData.city || ''}, ${leadData.province || ''} ${leadData.postalCode || ''}`,
                        `• Time at Address: ${leadData.addressLength || 'Not provided'}`,
                        `• Housing Status: ${leadData.housingStatus || 'Not provided'} (${leadData.monthlyHousingCost ? '$' + leadData.monthlyHousingCost + '/mo' : 'N/A'})`,
                        `• Residency Status: ${leadData.residency || 'Not provided'}`,
                        `• Vehicle Type: ${vehicle || 'Not provided'}`,
                        `• Monthly Budget: ${leadData.budget || 'Not provided'}`,
                        `• Employment Status: ${leadData.employment || 'Not provided'}`,
                        `• Employer & Job Title: ${leadData.employerName || 'N/A'} (${leadData.jobTitle || 'N/A'})`,
                        `• Job Tenure: ${leadData.empLength || 'Not provided'}`,
                        `• Gross Monthly Income: ${income ? '$' + income : 'Not provided'}`,
                        `• Additional Income: ${leadData.additionalIncome || 'None'}`,
                        `• Credit Report Consent: ${leadData.creditConsent ? 'Explicitly Authorized' : 'Authorized via Submission'}`
                    ];

                    if (leadData.creditScore) noteLines.push(`• Est. Credit Score Tier: ${leadData.creditScore}`);
                    if (leadData.currentVehicle) noteLines.push(`• Refinance Vehicle: ${leadData.currentVehicle} (${leadData.mileage || 0} km)`);
                    if (leadData.currentPayment) noteLines.push(`• Current Payment: $${leadData.currentPayment}/mo | Balance: $${leadData.loanBalance || 0}`);
                    if (leadData.desiredVehicle) noteLines.push(`• Sourcing Target: ${leadData.desiredVehicle} (${leadData.yearRange || 'Any yr'}) | Features: ${leadData.features || 'Any'} | Trade-In: ${leadData.tradeIn || 'No'}`);
                    if (leadData.cashBack) noteLines.push(`• Cash Back Requested: $${leadData.cashBack} | Debt to Consolidate: $${leadData.totalDebt || 0}`);

                    await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
                        method: 'POST',
                        headers: ghlHeaders,
                        body: JSON.stringify({ body: noteLines.join('\n') })
                    });
                }
            } catch (noteErr) {
                console.error("GHL Note Error:", noteErr);
            }
        }

        // 2. Send Complete Underwriting Email Notification via Resend API
        if (env.RESEND_API_KEY && leadData) {
            const resendUrl = 'https://api.resend.com/emails';
            
            let premiumRows = '';
            if (leadData.creditScore) {
                premiumRows += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Est. Credit Score:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.creditScore}</td></tr>`;
            }
            if (leadData.currentVehicle) {
                premiumRows += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Refi Vehicle & Mileage:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.currentVehicle} (${leadData.mileage || 'N/A'} km)</td></tr>`;
                premiumRows += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Current Payment & Balance:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">$${leadData.currentPayment || '0'}/mo (Balance: $${leadData.loanBalance || '0'})</td></tr>`;
            }
            if (leadData.desiredVehicle) {
                premiumRows += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Desired Vehicle (Sourcing):</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.desiredVehicle} (${leadData.yearRange || 'Any'}) — ${leadData.features || ''} | Trade-in: ${leadData.tradeIn || 'No'}</td></tr>`;
            }
            if (leadData.cashBack) {
                premiumRows += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Cash Back & Debt Consolidation:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">Cash Back: $${leadData.cashBack} | Total Debt: $${leadData.totalDebt || '0'}</td></tr>`;
            }

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background: #0B0F19; padding: 20px 24px; border-bottom: 3px solid #D4AF37;">
                        <h2 style="color: #D4AF37; margin: 0;">✅ New AutoBanker Lead Verified (SMS 2FA Passed)</h2>
                        <p style="color: #9ca3af; font-size: 13px; margin: 6px 0 0 0;">Service Pillar: <strong style="color: #fff;">${service}</strong></p>
                    </div>
                    <div style="padding: 20px 24px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.firstName || ''} ${leadData.lastName || ''}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Verified Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${phone}</strong> ✅</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.email || ''}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date of Birth:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.dob || 'Not provided'}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Vehicle Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${vehicle}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Monthly Budget:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.budget || 'N/A'}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Residency:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.residency || 'N/A'}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Housing Status & Cost:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.housingStatus || 'N/A'} (${leadData.monthlyHousingCost ? '$' + leadData.monthlyHousingCost + '/mo' : 'N/A'})</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time at Address:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.addressLength || 'N/A'}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Employment Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.employment || 'N/A'}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Employer & Role:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.employerName || 'N/A'} (${leadData.jobTitle || 'N/A'})</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Employment Length:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.empLength || 'N/A'}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Monthly Gross Income:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">$${income}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Additional Income:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.additionalIncome || 'None'}</td></tr>
                            ${premiumRows}
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.address || ''}, ${leadData.city || ''}, ${leadData.province || ''} ${leadData.postalCode || ''}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Credit Bureau Consent:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.creditConsent ? 'Yes (Explicitly Checked)' : 'Yes'}</td></tr>
                        </table>
                    </div>
                </div>
            `;

            const resendPayload = {
                from: 'AutoBanker Leads <leads@updates.autobanker.ca>',
                to: ['ravi@autobanker.ca', 'ravi.maharaj888@gmail.com'],
                subject: `✅ Verified Lead (${service}): ${leadData.firstName || ''} ${leadData.lastName || ''}`,
                html: emailHtml
            };

            const resendRes = await fetch(resendUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resendPayload)
            });

            if (!resendRes.ok) {
                console.error("Resend Error:", await resendRes.text());
            }
        }

        return new Response(JSON.stringify({ success: true, message: "Verified and lead captured" }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
