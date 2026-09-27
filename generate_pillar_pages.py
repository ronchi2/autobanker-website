import os

base_dir = r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website"

template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <!-- LocalBusiness SAB Schema -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "name": "AutoBanker",
      "image": "https://autobanker.ca/assets/autobanker-update.png",
      "@id": "https://autobanker.ca/",
      "url": "https://autobanker.ca/",
      "telephone": "+1-800-555-0199",
      "email": "contact@autobanker.ca",
      "areaServed": [
        "Toronto",
        "Greater Toronto Area",
        "Ontario"
      ],
      "description": "Premium subprime auto financing and bad credit car loans serving the Greater Toronto Area.",
      "logo": "https://autobanker.ca/assets/autobanker-update.png",
      "priceRange": "$$"
    }}
    </script>
    <link rel="stylesheet" href="autobanker-styles.css?v=3">
</head>
<body>
    <!-- Navigation -->
    <nav>
        <a href="index.html" class="brand">
            <img src="assets/autobanker-update.png" alt="AutoBanker Logo" class="brand-logo">
        </a>
        <input type="checkbox" id="menu-toggle" class="menu-toggle">
        <label for="menu-toggle" class="hamburger">
            <span></span><span></span><span></span>
        </label>
        <div class="nav-links">
            <a href="index.html#free-guide" class="nav-cta">Free Guide</a>
            <a href="autobanker-about.html">About Us</a>
            <a href="autobanker-services.html">Premium Services</a>
            <a href="autobanker-faq.html">FAQ</a>
        </div>
        <a href="index.html#apply" class="nav-cta desktop-cta">Apply Now</a>
    </nav>

    <!-- Hero Section -->
    <header class="hero" style="min-height: 70vh; padding-top: 10rem; background-image: linear-gradient(to right, rgba(0, 0, 0, 0.95) 20%, rgba(0, 0, 0, 0.7) 100%), url('assets/hero-neon-car.png');">
        <div class="hero-content">
            <div class="hero-subtitle">Serving Toronto & The GTA</div>
            <h1>{h1}</h1>
            <h2 style="font-size: 1.5rem; color: var(--gold-accent); margin-bottom: 1rem; font-weight: normal;">{h2}</h2>
            <p>{hero_p}</p>
            <a href="index.html#apply" class="btn-primary">Secure Your Approval</a>
        </div>
    </header>

    <!-- 3-Step Visual Roadmap -->
    <section class="roadmap-banner">
        <div class="roadmap-container">
            <div class="roadmap-step">
                <div class="roadmap-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="roadmap-text"><span class="roadmap-num">1</span><strong>Apply in 2 minutes</strong></div>
            </div>
            <div class="roadmap-divider"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></div>
            <div class="roadmap-step">
                <div class="roadmap-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="roadmap-text"><span class="roadmap-num">2</span><strong>Get approved terms</strong></div>
            </div>
            <div class="roadmap-divider"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></div>
            <div class="roadmap-step">
                <div class="roadmap-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </div>
                <div class="roadmap-text"><span class="roadmap-num">3</span><strong>Pick your vehicle</strong></div>
            </div>
        </div>
    </section>

    <!-- Content Section -->
    <section style="padding: 6rem 5%; background: var(--bg-primary);">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: var(--text-muted); font-size: 1.125rem;">
            <h2 style="font-size: 2.5rem; color: #fff; margin-bottom: 2rem;">{content_h2}</h2>
            <p style="margin-bottom: 2rem;">{content_p1}</p>
            <h3 style="font-size: 1.75rem; color: var(--gold-accent); margin-bottom: 1.5rem;">{content_h3}</h3>
            <p style="margin-bottom: 3rem;">{content_p2}</p>
            
            <div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-subtle);">
                <h3 style="color: #fff; margin-bottom: 1rem;">Ready to get started?</h3>
                <p style="margin-bottom: 2rem;">Our Ontario financing program takes less than 2 minutes and will not affect your credit score.</p>
                <a href="index.html#apply" class="btn-primary">Start My Application</a>
            </div>
        </div>
    </section>

    <!-- Global Footer -->
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-col">
                <img src="assets/autobanker-update.png" alt="AutoBanker Logo" class="footer-logo">
                <p>Premium subprime auto financing and guaranteed car loan approvals. Proudly serving the Greater Toronto Area (GTA) & Ontario.</p>
            </div>
            <div class="footer-col">
                <h4>Contact Us</h4>
                <ul>
                    <li>📞 +1-800-555-0199</li>
                    <li>✉️ contact@autobanker.ca</li>
                    <li>📍 Toronto, Ontario, Canada (Service Area Business)</li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Legal</h4>
                <ul>
                    <li><a href="autobanker-privacy.html">Privacy Policy</a></li>
                    <li><a href="autobanker-terms.html">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 AutoBanker.ca. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""

pages = [
    {
        "filename": "auto-loans-bankruptcy.html",
        "title": "Auto Loans After Bankruptcy Toronto | Guaranteed Car Financing Ontario",
        "description": "Rebuild your credit with guaranteed auto loans after bankruptcy or consumer proposals in Toronto and the GTA. Zero judgment, 100% transparent financing.",
        "h1": "Auto Loans After Bankruptcy or Consumer Proposals",
        "h2": "Get back on the road in the GTA—even if your discharge is recent.",
        "hero_p": "We specialize in helping Ontario drivers secure premium vehicles immediately after a bankruptcy or consumer proposal.",
        "content_h2": "Can I get a car loan after a consumer proposal?",
        "content_p1": "Yes. At AutoBanker, we understand that financial setbacks happen. Whether you are currently in a consumer proposal or have recently been discharged from bankruptcy, our Toronto-based auto financing team has established programs designed specifically to get you approved.",
        "content_h3": "Will this help rebuild my credit score?",
        "content_p2": "Absolutely. An auto loan is one of the fastest and most effective ways to rebuild your credit profile in Canada. We work with lenders who report your positive payments directly to the major credit bureaus, helping you establish a strong financial future while driving a vehicle you love."
    },
    {
        "filename": "car-financing-missed-payments.html",
        "title": "Car Financing With Missed Payments Toronto | Bad Credit Auto Loans",
        "description": "Worried about missed credit card payments? AutoBanker offers guaranteed car financing in Toronto for individuals with low credit scores or late payment history.",
        "h1": "Car Financing With Missed Payments or Low Credit",
        "h2": "Your credit score shouldn't stop you from driving a safe, reliable vehicle.",
        "hero_p": "Missed a few payments? High credit card utilization? We look at your current income, not just your past mistakes.",
        "content_h2": "Can I get a car loan with a 550 credit score?",
        "content_p1": "Yes, you can. Traditional banks in Ontario often rely entirely on automated credit score thresholds. At AutoBanker, we take a human approach. We look at your employment, your income, and your ability to pay today—not a number from a missed credit card payment two years ago.",
        "content_h3": "Are the interest rates going to be predatory?",
        "content_p2": "No. Our vast network of lender partners across the GTA ensures that you get the most competitive rate available for your specific credit tier. As you make your payments on time, your credit score will improve, allowing you to refinance at an even lower rate in the future."
    },
    {
        "filename": "auto-loans-new-immigrants.html",
        "title": "Auto Loans for New Immigrants Toronto | No Credit History Car Financing",
        "description": "New to Canada? Get an auto loan with absolutely no Canadian credit history. We help newcomers in Toronto and Ontario secure reliable transportation.",
        "h1": "Auto Loans for New Immigrants & First-Time Buyers",
        "h2": "No credit history in Canada? No problem.",
        "hero_p": "Welcome to Ontario! We help newcomers secure guaranteed auto financing so you can start working and exploring your new home immediately.",
        "content_h2": "Can I finance a car if I just moved to Canada?",
        "content_p1": "Yes! We have specialized New to Canada programs designed specifically for permanent residents, individuals on work permits, and international students living in the GTA. Even if you have a '0' credit score or no established credit file, we can get you approved.",
        "content_h3": "What documents do I need?",
        "content_p2": "The process is incredibly simple. You generally just need proof of income (like a job offer letter or pay stubs) and a valid Ontario driver's license. We handle all the heavy lifting to ensure your transition into a vehicle is smooth and stress-free."
    },
    {
        "filename": "auto-loans-odsp-disability.html",
        "title": "Auto Loans on ODSP / Disability Toronto | Fixed Income Car Financing",
        "description": "Receiving ODSP, CPP, or Disability? AutoBanker provides guaranteed car loans for individuals on fixed incomes in Toronto and across Ontario.",
        "h1": "Auto Loans on ODSP, CPP, or Fixed Incomes",
        "h2": "Guaranteed approvals for those receiving Disability or Pension income.",
        "hero_p": "Traditional banks often reject non-employment income. At AutoBanker, we recognize ODSP and CPP as 100% valid income for securing your auto loan.",
        "content_h2": "Can I get approved for a car loan while on ODSP?",
        "content_p1": "Absolutely. If you receive ODSP (Ontario Disability Support Program), CPP (Canada Pension Plan), or other guaranteed fixed incomes, we have lenders who specifically cater to your situation. We understand that reliable transportation is essential.",
        "content_h3": "Will my monthly payments be affordable?",
        "content_p2": "Yes. Our finance experts will carefully structure your loan to ensure that your monthly or bi-weekly payments fit perfectly within your fixed income budget, without causing financial strain."
    },
    {
        "filename": "car-financing-repossession.html",
        "title": "Car Financing With Repossession Ontario | Bad Credit Auto Loans GTA",
        "description": "Have a repossession on your record? Get a second chance at AutoBanker. We offer guaranteed bad credit car loans in Toronto, even with past repossessions.",
        "h1": "Car Financing After a Vehicle Repossession",
        "h2": "Everyone deserves a second chance. We'll get you driving again.",
        "hero_p": "A past repossession is a red flag for many dealerships, but not for us. We specialize in severe subprime recovery loans.",
        "content_h2": "Can I get a car loan if I've had a repossession?",
        "content_p1": "Yes. A repossession is a difficult experience, but it doesn't mean you can never finance a vehicle again. We work with specialized subprime lenders in Ontario who focus entirely on helping individuals recover from severe credit hits, including recent repossessions.",
        "content_h3": "How long do I have to wait after a repossession?",
        "content_p2": "You do not need to wait years. In many cases, we can secure financing for you shortly after the repossession has been settled. By financing a more affordable vehicle and making consistent payments, you will rapidly repair your credit profile."
    }
]

for page in pages:
    filepath = os.path.join(base_dir, page["filename"])
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(template.format(**page))
    print(f"Created {page['filename']}")
