export async function onRequestPost({ request, env }) {
    try {
        const { phone, otp, leadData } = await request.json();
        
        if (!phone || !otp) {
            return new Response(JSON.stringify({ error: "Phone and OTP required" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const storedOtp = await env.OTP_STORE.get(phone);
        if (!storedOtp || storedOtp !== otp) {
            return new Response(JSON.stringify({ error: "Invalid or expired verification code." }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // OTP is valid. Clear it from KV so it cannot be reused
        await env.OTP_STORE.delete(phone);

        // Send lead to GoHighLevel (V2 API)
        if (env.GHL_API_KEY && leadData) {
            const ghlUrl = 'https://services.leadconnectorhq.com/contacts/';
            const ghlHeaders = {
                'Authorization': `Bearer ${env.GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            const ghlPayload = {
                locationId: env.GHL_LOCATION_ID,
                firstName: leadData.firstName || "",
                lastName: leadData.lastName || "",
                name: `${leadData.firstName || ""} ${leadData.lastName || ""}`.trim(),
                email: leadData.email || "",
                phone: phone,
                address1: leadData.address || "",
                city: leadData.city || "",
                state: leadData.province || "",
                postalCode: leadData.postalCode || "",
                tags: ["AutoBanker Website", leadData.vehicleType, leadData.employment].filter(Boolean),
                source: "Website Intake Form"
            };

            const ghlRes = await fetch(ghlUrl, {
                method: 'POST',
                headers: ghlHeaders,
                body: JSON.stringify(ghlPayload)
            });

            const responseText = await ghlRes.text();
            console.log("GHL Response Status:", ghlRes.status);
            console.log("GHL Response Body:", responseText);

            if (!ghlRes.ok) {
                console.error("GHL Error:", responseText);
            }
        }

        // Send Email Notification via Resend API
        if (env.RESEND_API_KEY && leadData) {
            const resendUrl = 'https://api.resend.com/emails';
            
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #c4a163;">New AutoBanker Lead Verified!</h2>
                    <p style="color: #666;">A new lead has completed the phone verification step.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.firstName || ''} ${leadData.lastName || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.email || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Vehicle Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.vehicleType || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Budget:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.budget || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Residency:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.residency || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Employment Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.employment || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Employer:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.employerName || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Employment Length:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.empLength || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Monthly Income:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.monthlyIncome || ''}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Additional Income:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.additionalIncome || 'None'}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${leadData.address || ''}, ${leadData.city || ''}, ${leadData.province || ''} ${leadData.postalCode || ''}</td></tr>
                    </table>
                </div>
            `;

            const resendPayload = {
                from: 'AutoBanker Leads <leads@updates.autobanker.ca>',
                to: ['ravi@autobanker.ca', 'ravi.maharaj888@gmail.com'],
                subject: `New Verified Lead: ${leadData.firstName || ''} ${leadData.lastName || ''}`,
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
