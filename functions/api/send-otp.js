async function syncLeadToGHL(env, phone, leadData, statusTag) {
    if (!env.GHL_API_KEY || !leadData) return null;

    const ghlHeaders = {
        'Authorization': `Bearer ${env.GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const vehicle = leadData.vehicleType || leadData.cb_vehicleType || leadData.desiredVehicle || leadData.currentVehicle || "";
    const income = leadData.monthlyIncome || leadData.cb_monthlyIncome || "";
    const service = leadData.serviceType || "Auto Loan Pre-Approval";

    const tags = [
        "AutoBanker Website",
        statusTag,
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

    try {
        // Try upsert first so partial leads update cleanly when verified
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

        const data = await ghlRes.json().catch(() => null);
        const contactId = data?.contact?.id;

        if (contactId) {
            const noteLines = [
                `📋 AUTOBANKER UNDERWRITING DOSSIER (${statusTag})`,
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                `• Service Pillar: ${service}`,
                `• Name: ${leadData.firstName || ''} ${leadData.lastName || ''}`,
                `• Phone: ${phone}`,
                `• Email: ${leadData.email || ''}`,
                `• Date of Birth: ${leadData.dob || 'Not provided'}`,
                `• Address: ${leadData.address || ''}, ${leadData.city || ''}, ${leadData.province || ''} ${leadData.postalCode || ''}`,
                `• Time at Address: ${leadData.addressLength || 'Not provided'}`,
                `• Housing Status: ${leadData.housingStatus || 'Not provided'} (${leadData.monthlyHousingCost ? '$' + leadData.monthlyHousingCost + '/mo' : 'N/A'})`,
                `• Residency Status: ${leadData.residency || 'Not provided'}`,
                `• Vehicle Type: ${vehicle || 'Not provided'}`,
                `• Target Monthly Budget: ${leadData.budget || 'Not provided'}`,
                `• Employment Status: ${leadData.employment || 'Not provided'}`,
                `• Employer & Role: ${leadData.employerName || 'N/A'} (${leadData.jobTitle || 'N/A'})`,
                `• Job Tenure: ${leadData.empLength || 'Not provided'}`,
                `• Gross Monthly Income: ${income ? '$' + income : 'Not provided'}`,
                `• Additional Income: ${leadData.additionalIncome || 'None'}`,
                `• Credit Consent Given: ${leadData.creditConsent ? 'Yes (Explicit Consent)' : 'Yes (Form Submission)'}`
            ];

            // Include Premium Service fields if applicable
            if (leadData.creditScore) noteLines.push(`• Est. Credit Tier: ${leadData.creditScore}`);
            if (leadData.currentVehicle) noteLines.push(`• Current Vehicle (Refi): ${leadData.currentVehicle} (${leadData.mileage || 0} km)`);
            if (leadData.currentPayment) noteLines.push(`• Current Monthly Payment: $${leadData.currentPayment} | Balance: $${leadData.loanBalance || 0}`);
            if (leadData.desiredVehicle) noteLines.push(`• Sourcing Target: ${leadData.desiredVehicle} (${leadData.yearRange || 'Any yr'}) | Features: ${leadData.features || 'Any'} | Trade-In: ${leadData.tradeIn || 'No'}`);
            if (leadData.cashBack) noteLines.push(`• Cash Back Requested: $${leadData.cashBack} | Debt to Consolidate: $${leadData.totalDebt || 0}`);

            await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
                method: 'POST',
                headers: ghlHeaders,
                body: JSON.stringify({ body: noteLines.join('\n') })
            }).catch(e => console.error("GHL Note Error:", e));
        }

        return contactId;
    } catch (e) {
        console.error("GHL Sync Error:", e);
        return null;
    }
}

async function sendPartialLeadEmail(env, phone, leadData) {
    if (!env.RESEND_API_KEY || !leadData) return;

    const vehicle = leadData.vehicleType || leadData.cb_vehicleType || leadData.desiredVehicle || leadData.currentVehicle || "N/A";
    const income = leadData.monthlyIncome || leadData.cb_monthlyIncome || "N/A";
    const service = leadData.serviceType || "Standard Auto Loan";

    const emailHtml = `
        <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: #0B0F19; padding: 20px 24px; border-bottom: 3px solid #D4AF37;">
                <h2 style="color: #D4AF37; margin: 0;">⚡ New AutoBanker Application Started (OTP Sent)</h2>
                <p style="color: #9ca3af; font-size: 13px; margin: 6px 0 0 0;">Captured automatically before SMS OTP verification so zero leads are lost.</p>
            </div>
            <div style="padding: 20px 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${service}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.firstName || ''} ${leadData.lastName || ''}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone (OTP Pending):</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.email || ''}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date of Birth:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.dob || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Vehicle / Target:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${vehicle}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Monthly Budget:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.budget || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Residency:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.residency || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Housing (Rent/Own):</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.housingStatus || 'N/A'} (${leadData.monthlyHousingCost ? '$' + leadData.monthlyHousingCost + '/mo' : 'N/A'}) | Tenure: ${leadData.addressLength || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Employment:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.employment || 'N/A'} — ${leadData.employerName || 'N/A'} (${leadData.jobTitle || 'N/A'}) [${leadData.empLength || 'N/A'}]</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Monthly Gross Income:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">$${income} (Additional: ${leadData.additionalIncome || 'No'})</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.address || ''}, ${leadData.city || ''}, ${leadData.province || ''} ${leadData.postalCode || ''}</td></tr>
                </table>
            </div>
        </div>
    `;

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'AutoBanker Leads <leads@updates.autobanker.ca>',
            to: ['ravi@autobanker.ca', 'ravi.maharaj888@gmail.com'],
            subject: `⚡ Lead Captured (Awaiting OTP): ${leadData.firstName || ''} ${leadData.lastName || ''} (${phone})`,
            html: emailHtml
        })
    }).catch(e => console.error("Resend Partial Lead Error:", e));
}

export async function onRequestPost({ request, env }) {
    try {
        const { phone, leadData, isResend } = await request.json();
        if (!phone) {
            return new Response(JSON.stringify({ error: "Phone number required" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Stealth Partial-Lead Capture BEFORE SMS OTP is even verified (GetGoing.ca pattern)
        if (leadData && !isResend) {
            await Promise.allSettled([
                syncLeadToGHL(env, phone, leadData, "Status: OTP Pending"),
                sendPartialLeadEmail(env, phone, leadData)
            ]);
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in KV, expire after 10 minutes (600 seconds)
        if (env.OTP_STORE) {
            await env.OTP_STORE.put(phone, otp, { expirationTtl: 600 });
        }

        // 3. Send SMS via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('To', phone);
        formData.append('From', env.TWILIO_PHONE_NUMBER);
        formData.append('Body', `Your AutoBanker pre-approval verification code is: ${otp}`);

        const authHeader = 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

        const twilioRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader
            },
            body: formData
        });

        if (!twilioRes.ok) {
            const err = await twilioRes.text();
            console.error("Twilio error:", err);
            return new Response(JSON.stringify({ 
                error: "Failed to send SMS, but your application details have been saved.",
                partialSaved: true 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, message: "OTP sent" }), { 
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
