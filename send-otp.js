export async function onRequestPost({ request, env }) {
    try {
        const { phone } = await request.json();
        if (!phone) {
            return new Response(JSON.stringify({ error: "Phone number required" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in KV, expire after 5 minutes (300 seconds)
        await env.OTP_STORE.put(phone, otp, { expirationTtl: 300 });

        // Send SMS via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('To', phone);
        formData.append('From', env.TWILIO_PHONE_NUMBER);
        formData.append('Body', `Your AutoBanker verification code is: ${otp}`);

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
            return new Response(JSON.stringify({ error: "Failed to send SMS" }), { 
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
