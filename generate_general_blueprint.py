import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AutoBanker Credit Building Guide</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600;700&display=swap');
        
        :root {
            --gold: #D4AF37;
            --primary: #0B0F19;      /* Darkest navy/black */
            --secondary: #1A2235;    /* Lighter navy */
            --text-dark: #222222;    /* Main body text */
            --text-muted: #555555;   /* Secondary text */
            --bg-light: #FAFAFA;     /* Light off-white */
        }

        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #e5e5e5;
            -webkit-print-color-adjust: exact;
        }

        .page {
            width: 8.5in;
            height: 11in;
            box-sizing: border-box;
            position: relative;
            page-break-after: always;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background-color: #ffffff;
        }

        /* ---------------- COVER PAGE ---------------- */
        .cover-page {
            background-color: var(--primary);
            color: white;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        .cover-border {
            position: absolute;
            top: 0.75in;
            bottom: 0.75in;
            left: 0.75in;
            right: 0.75in;
            border: 1px solid rgba(212, 175, 55, 0.5);
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 2rem;
            box-sizing: border-box;
        }

        .cover-top {
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-size: 0.85rem;
            color: var(--gold);
            font-weight: 600;
        }

        .cover-bottom {
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            color: rgba(255,255,255,0.6);
            letter-spacing: 1px;
        }

        .cover-content {
            z-index: 10;
            padding: 2in 1.5in;
        }

        .brand {
            font-family: 'Cinzel', serif;
            font-size: 3.5rem;
            color: #FFFFFF;
            margin-bottom: 0.5rem;
            letter-spacing: 3px;
        }

        .cover-divider {
            width: 60px;
            height: 2px;
            background-color: var(--gold);
            margin: 1.5rem auto;
        }

        .cover-title {
            font-family: 'Cinzel', serif;
            font-size: 4.5rem;
            line-height: 1.1;
            margin-bottom: 1rem;
            color: var(--gold);
        }

        .cover-subtitle {
            font-family: 'Inter', sans-serif;
            font-weight: 300;
            font-size: 1.3rem;
            line-height: 1.6;
            color: #d1d5db;
        }

        /* ---------------- CONTENT PAGES ---------------- */
        .content-page {
            padding: 1in;
            color: var(--text-dark);
        }

        .page-header {
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 0.75rem;
            margin-bottom: 2.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .page-header .brand-small {
            font-family: 'Cinzel', serif;
            color: var(--primary);
            font-size: 1.2rem;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .page-header .section-title {
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--gold);
            font-size: 0.75rem;
            font-weight: 600;
        }

        h2 {
            font-family: 'Cinzel', serif;
            font-size: 2.4rem;
            color: var(--primary);
            margin-top: 0;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }
        
        h3 {
            font-family: 'Inter', sans-serif;
            font-size: 1.2rem;
            color: var(--primary);
            margin-top: 2.5rem;
            margin-bottom: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        p {
            font-size: 1.05rem;
            line-height: 1.7;
            margin-top: 0;
            margin-bottom: 1.25rem;
            color: var(--text-muted);
        }

        .lead-paragraph {
            font-size: 1.25rem;
            line-height: 1.6;
            color: var(--primary);
            margin-bottom: 2.5rem;
            font-weight: 300;
        }

        /* Pull Quote / Secret Box */
        .pull-quote {
            background-color: var(--bg-light);
            border-left: 4px solid var(--gold);
            padding: 1.5rem 2rem;
            margin: 2.5rem 0;
        }

        .pull-quote-title {
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--gold);
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
        }

        .pull-quote p {
            font-size: 1.15rem;
            color: var(--primary);
            font-style: italic;
            margin: 0;
            line-height: 1.6;
        }

        /* Stats Grid */
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 2.5rem 0;
        }
        
        .stat-card {
            border-top: 3px solid var(--primary);
            background: var(--bg-light);
            padding: 1.5rem;
        }

        .stat-card h4 {
            font-family: 'Cinzel', serif;
            font-size: 1.75rem;
            color: var(--gold);
            margin: 0 0 0.5rem 0;
        }

        .stat-card p {
            font-size: 0.95rem;
            margin: 0;
            line-height: 1.5;
        }

        /* CTA Box */
        .cta-box {
            margin-top: 3.5rem;
            background-color: var(--primary);
            padding: 2.5rem;
            text-align: center;
            color: white;
            border-radius: 8px;
        }

        .cta-box h3 {
            color: var(--gold);
            font-family: 'Cinzel', serif;
            font-size: 2rem;
            margin-top: 0;
            margin-bottom: 1rem;
            text-transform: none;
            letter-spacing: 0;
        }

        .cta-box p {
            color: #d1d5db;
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
        }

        .cta-link {
            display: inline-block;
            background-color: var(--gold);
            color: var(--primary);
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.95rem;
        }

        .page-footer {
            position: absolute;
            bottom: 0.75in;
            left: 1in;
            right: 1in;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: #9CA3AF;
            font-family: 'Inter', sans-serif;
            letter-spacing: 1px;
            border-top: 1px solid #E5E7EB;
            padding-top: 0.5rem;
        }

        /* Ordered List Styling */
        ol.custom-list {
            list-style: none;
            counter-reset: my-counter;
            padding: 0;
            margin: 0;
        }
        
        ol.custom-list li {
            counter-increment: my-counter;
            margin-bottom: 2rem;
            padding-left: 3rem;
            position: relative;
        }
        
        ol.custom-list li::before {
            content: counter(my-counter);
            position: absolute;
            left: 0;
            top: 0;
            font-family: 'Cinzel', serif;
            font-size: 1.75rem;
            font-weight: bold;
            color: var(--gold);
            line-height: 1;
        }

        ol.custom-list h4 {
            margin: 0 0 0.5rem 0;
            font-family: 'Inter', sans-serif;
            font-size: 1.15rem;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="page cover-page">
        <div class="cover-border">
            <div class="cover-top">Exclusive Strategy Guide</div>
            <div class="cover-bottom">WWW.AUTOBANKER.CA</div>
        </div>
        <div class="cover-content">
            <div class="brand">AutoBanker</div>
            <div class="cover-divider"></div>
            <div class="cover-title">The Credit<br>Recovery<br>Playbook</div>
            <div class="cover-subtitle">The exact blueprint to rebuilding your credit score fast while driving the car you deserve.</div>
        </div>
    </div>

    <!-- PAGE 1: HOW CREDIT REALLY WORKS -->
    <div class="page content-page">
        <div class="page-header">
            <div class="brand-small">AUTOBANKER</div>
            <div class="section-title">01 / Decoding the Algorithm</div>
        </div>

        <h2>How Equifax & TransUnion Actually Score You</h2>
        
        <p class="lead-paragraph">Before you can rebuild your credit, you need to understand the math behind it. Most Canadians waste years trying to fix their credit because they focus their energy on the wrong things.</p>
        
        <p>Lenders rely heavily on automated systems to determine your creditworthiness. By understanding the exact breakdown of how your score is calculated, you can stop making blind guesses and start taking strategic actions that force your score to rise.</p>
        
        <div class="grid-2">
            <div class="stat-card">
                <h4>35%</h4>
                <p><strong>Payment History:</strong> The heaviest factor. A single 30-day late payment can drop your score by up to 100 points. Consistency is mathematically everything.</p>
            </div>
            <div class="stat-card">
                <h4>30%</h4>
                <p><strong>Credit Utilization:</strong> Maxed-out cards tank your score immediately. This measures how much of your available credit limits you are currently using.</p>
            </div>
            <div class="stat-card">
                <h4>15%</h4>
                <p><strong>Credit Age:</strong> The average age of all your accounts. Never close your oldest credit card, even if you do not use it anymore.</p>
            </div>
            <div class="stat-card">
                <h4>10%</h4>
                <p><strong>Credit Mix:</strong> Having only credit cards is seen as risky. Lenders want to see a mix of revolving credit and installment credit (like a car loan).</p>
            </div>
        </div>

        <h3>The Installment Loan Secret</h3>
        <p>If you have bad credit, getting approved for another high-interest credit card will barely move your score. Credit cards represent "revolving credit," which lenders naturally view as a high-risk indicator if mismanaged.</p>
        
        <p>An auto loan, however, is an <strong>installment loan</strong>. Because it is backed by a tangible asset (the car) and follows a fixed, predictable payment schedule, the credit bureaus weigh it heavily. Establishing 6 to 12 months of on-time payments on an auto loan is unequivocally the fastest method to catapult your credit score back into the "Good" range.</p>

        <div class="pull-quote">
            <div class="pull-quote-title">The Refinance Loophole</div>
            <p>After 12 months of perfect payments on a subprime car loan, your score typically improves enough to qualify for <strong>VIP Refinancing</strong>—allowing you to trade out of the high-rate loan and cut your interest rate in half.</p>
        </div>

        <div class="page-footer">
            <span>THE CREDIT RECOVERY PLAYBOOK</span>
            <span>PAGE 1</span>
        </div>
    </div>

    <!-- PAGE 2: ACTION STEPS -->
    <div class="page content-page">
        <div class="page-header">
            <div class="brand-small">AUTOBANKER</div>
            <div class="section-title">02 / Actionable Strategies</div>
        </div>

        <h2>Three Strategies to Boost Your Score Today</h2>
        
        <p class="lead-paragraph">You do not have to wait years to see your score improve. By executing these three targeted strategies, you can trigger a positive reporting cycle in as little as 30 days.</p>
        
        <ol class="custom-list">
            <li>
                <h4>The 30% Utilization Rule</h4>
                <p>If you have a credit card with a $1,000 limit, never let the balance go above $300 (30%). If your cards are currently maxed out, your score is being artificially suppressed by the algorithm. Paying them down to below 30% will trigger an immediate, massive jump in your score the moment your monthly statement cuts.</p>
            </li>
            
            <li>
                <h4>Soft Pulls vs. Hard Pulls</h4>
                <p>Every time a bank formally checks your credit to approve a loan, it records a "Hard Pull," which drops your score by 5 to 10 points. If you visit a traditional dealership, their finance office might blindly shotgun your application to 10 different banks at once, instantly causing 10 hard pulls and ruining your credit file. Always use an auto broker (like AutoBanker) who performs a single soft pull to evaluate your file without damage.</p>
            </li>

            <li>
                <h4>Dispute Bureau Errors</h4>
                <p>Over 20% of Canadians have glaring errors on their Equifax or TransUnion reports. You might have late payments listed that you actually paid on time, or old collections that should have fallen off after 6 years. Order your free report directly from Equifax.ca and dispute any errors—they are legally required to remove them within 30 days if they cannot verify the debt.</p>
            </li>
        </ol>

        <div class="cta-box">
            <h3>Ready to Rebuild?</h3>
            <p>The fastest way to fix your credit is by driving a car you love with an affordable payment that repairs your score every month.</p>
            <a href="https://autobanker.ca/apply-now.html" class="cta-link">Secure Your Approval</a>
            <p style="margin-top: 1.5rem; font-size: 0.9rem; margin-bottom: 0;">Or call us directly at <strong>+1-647-931-5876</strong></p>
        </div>

        <div class="page-footer">
            <span>THE CREDIT RECOVERY PLAYBOOK</span>
            <span>PAGE 2</span>
        </div>
    </div>

</body>
</html>
"""

with open(r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\blueprint_general.html", "w", encoding="utf-8") as f:
    f.write(html_content)
    
print("General blueprint HTML rewritten with Senior Art Director guidelines.")
