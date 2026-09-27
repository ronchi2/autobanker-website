import os

base_dir = r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website"
index_path = os.path.join(base_dir, "index.html")

with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

# Split into parts
header_split = html.find('<!-- Hero Section -->')
footer_split = html.find('<!-- Global Footer -->')

header_part = html[:header_split]
footer_part = html[footer_split:]

def generate_page(folder, filename, title, description, h1, content):
    # Adjust paths for nested folders
    if folder:
        # replace assets/, autobanker-styles.css, etc with ../
        h = header_part.replace('href="autobanker-styles.css', 'href="../autobanker-styles.css')
        h = h.replace('src="assets/', 'src="../assets/')
        h = h.replace('href="index.html', 'href="../index.html')
        h = h.replace('href="autobanker-about.html', 'href="../autobanker-about.html')
        h = h.replace('href="autobanker-services.html', 'href="../autobanker-services.html')
        h = h.replace('href="autobanker-faq.html', 'href="../autobanker-faq.html')
        
        f = footer_part.replace('src="assets/', 'src="../assets/')
        f = f.replace('href="autobanker-privacy.html', 'href="../autobanker-privacy.html')
        f = f.replace('href="autobanker-terms.html', 'href="../autobanker-terms.html')
        f = f.replace('src="autobanker-calculator.js', 'src="../autobanker-calculator.js')
        f = f.replace('src="autobanker-form.js', 'src="../autobanker-form.js')
        
        f = f.replace('href="auto-loans/', 'href="../auto-loans/')
        f = f.replace('href="articles/', 'href="../articles/')
        f = f.replace('href="locations/', 'href="../locations/')
        f = f.replace('href="dealership-vs-broker.html', 'href="../dealership-vs-broker.html')
    else:
        h = header_part
        f = footer_part

    # Replace title and description
    import re
    h = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', h, flags=re.DOTALL)
    h = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">', h)

    body_content = f"""
    <header class="hero" style="min-height: 40vh; padding-top: 150px; padding-bottom: 50px;">
        <div class="hero-content">
            <h1><span class="gradient-text">{h1}</span></h1>
        </div>
    </header>
    <section style="padding: 5rem 5%; background: var(--bg-primary); line-height: 1.8;">
        <div style="max-width: 1000px; margin: 0 auto; color: var(--text-primary); font-size: 1.1rem;">
            {content}
        </div>
    </section>
    """

    out_dir = os.path.join(base_dir, folder)
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
    
    with open(os.path.join(out_dir, filename), "w", encoding="utf-8") as out_f:
        out_f.write(h + body_content + f)

# Content for articles
articles = [
    {
        "filename": "consumer-proposal.html",
        "title": "Getting a Car Loan After a Consumer Proposal | AutoBanker",
        "description": "Learn how long it takes to get a car loan after a consumer proposal in Canada. AutoBanker helps you get approved.",
        "h1": "Getting a Car Loan After a Consumer Proposal",
        "content": """
            <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">Can I Get a Car Loan After a Consumer Proposal?</h2>
            <p>Yes! It is very possible to get a car loan after filing a consumer proposal. Many people think their financial life is over, but that is simply not true. Lenders know that bad things happen to good people. We work with lenders who understand your situation.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">How Long Do I Have to Wait?</h3>
            <p>You do not have to wait years. In fact, getting an auto loan can be one of the best ways to rebuild your credit after a consumer proposal. Some lenders will even approve you while you are still making payments on your proposal.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">How Does It Work?</h3>
            <p>We look at your income, not just your past credit score. If you have a steady job and make enough money, we can match you with a lender who will say "yes". When you make your car loan payments on time every month, your credit score will slowly go up.</p>
            <p style="margin-top: 2rem;"><a href="../index.html#apply" class="btn-primary" style="display: inline-block;">Apply For Free Today</a></p>
        """
    },
    {
        "filename": "minimum-credit-score.html",
        "title": "What is the Minimum Credit Score for a Car Loan? | AutoBanker",
        "description": "Find out the minimum credit score needed to get a car loan in Canada. Get approved with AutoBanker even with bad credit.",
        "h1": "Minimum Credit Score For a Car Loan",
        "content": """
            <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">What Credit Score Do I Need?</h2>
            <p>A common question we hear is: "What is the minimum credit score I need to buy a car?" The simple answer is that there is no magic number. While standard banks might want a score over 650, specialized lenders look at the full picture.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">Can I Get Approved with a 500 Score?</h3>
            <p>Yes. Even if your score is 500 or lower, you can still get approved for an auto loan. Specialized subprime lenders care more about your current ability to pay than your past mistakes. They will look at your monthly income, your job history, and where you live.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">Steps to Get Approved</h3>
            <ul>
                <li>Have proof of steady income.</li>
                <li>Be ready to show a recent pay stub.</li>
                <li>Apply through a broker like AutoBanker so your credit is not checked multiple times.</li>
            </ul>
            <p style="margin-top: 2rem;"><a href="../index.html#apply" class="btn-primary" style="display: inline-block;">Check Your Options</a></p>
        """
    },
    {
        "filename": "rebuilding-credit.html",
        "title": "Rebuilding Credit with an Auto Loan | AutoBanker",
        "description": "Learn how an auto loan can help rebuild your credit score fast. AutoBanker connects you to the right bad credit car loans.",
        "h1": "Rebuilding Credit Fast With a Car Loan",
        "content": """
            <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">Why an Auto Loan is Great for Your Credit</h2>
            <p>If your credit score is low, one of the fastest ways to fix it is by taking out an installment loan. A car loan is one of the best types of installment loans because it shows lenders that you can be trusted to make regular monthly payments on a large purchase.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">How It Helps Your Score</h3>
            <p>Every time you make an on-time payment for your car, the lender reports it to the credit bureaus (Equifax and TransUnion). Month after month, these positive reports add up. Before you know it, your score will start to climb. This can help you get better interest rates in the future.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">The Secret: Never Miss a Payment</h3>
            <p>The key to success is picking a car with payments that fit your budget easily. AutoBanker will never push you into a loan you cannot afford. Our goal is to set you up for success.</p>
            <p style="margin-top: 2rem;"><a href="../index.html#apply" class="btn-primary" style="display: inline-block;">Start Rebuilding Today</a></p>
        """
    }
]

# Content for locations
locations = [
    {
        "filename": "mississauga.html",
        "city": "Mississauga",
    },
    {
        "filename": "brampton.html",
        "city": "Brampton",
    },
    {
        "filename": "scarborough.html",
        "city": "Scarborough",
    }
]

for loc in locations:
    content = f"""
        <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">Bad Credit Car Loans in {loc["city"]}</h2>
        <p>Are you looking for a car loan in {loc["city"]}, but worried about your credit? You are in the right place. AutoBanker is the top choice for bad credit auto financing in {loc["city"]} and the surrounding areas.</p>
        <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">Why Choose Us in {loc["city"]}?</h3>
        <p>We have strong relationships with dealerships and specialized lenders all over the GTA. This means we can match you with the best options close to home. Whether you have zero down payment, are a new immigrant, or have a past bankruptcy, we can help you drive away happy.</p>
        <p style="margin-top: 2rem;"><a href="../index.html#apply" class="btn-primary" style="display: inline-block;">Apply in {loc["city"]} Now</a></p>
    """
    generate_page("locations", loc["filename"], f"Bad Credit Car Loans in {loc['city']} | AutoBanker", f"Get approved for a car loan in {loc['city']} today. We specialize in bad credit, zero down, and bankruptcy auto financing.", f"Auto Loans in {loc['city']}", content)

for art in articles:
    generate_page("articles", art["filename"], art["title"], art["description"], art["h1"], art["content"])

# Content for auto-loans
services = [
    {
        "filename": "zero-down.html",
        "title": "Zero Down Car Loans in Toronto | AutoBanker",
        "description": "Get a car loan with $0 down payment. AutoBanker helps you get approved for zero down auto financing in the GTA.",
        "h1": "Zero Down Car Loans",
        "content": """
            <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">Keep Your Cash. Drive Away Today.</h2>
            <p>Buying a car shouldn't mean emptying your bank account. A zero down car loan means you don't have to pay a huge sum of money upfront. You can finance the whole price of the vehicle, including taxes.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">How Do Zero Down Loans Work?</h3>
            <p>Lenders look at your monthly income to make sure you can afford the monthly payments. If your income is strong enough, they will cover the entire cost of the car. We specialize in finding these $0 down options for our clients.</p>
            <p>With a $0 down loan, you keep your savings for emergencies or everyday life. Let AutoBanker help you find a reliable car with absolutely no money out of pocket.</p>
            <p style="margin-top: 2rem;"><a href="../index.html#apply" class="btn-primary" style="display: inline-block;">Get Pre-Approved for $0 Down</a></p>
        """
    },
    {
        "filename": "new-immigrant.html",
        "title": "New Immigrant Car Loans Canada | AutoBanker",
        "description": "New to Canada? No credit history? AutoBanker offers special auto financing programs for newcomers, students, and permanent residents.",
        "h1": "New Immigrant Auto Financing",
        "content": """
            <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">Welcome to Canada! Let's Get You Driving.</h2>
            <p>Being new to Canada is exciting, but it can be hard to get around without a car. The problem is that you have no Canadian credit history yet, so regular banks might say no. Do not worry—AutoBanker is here to help.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">Special Newcomer Programs</h3>
            <p>We work with lenders who have special programs just for new permanent residents, workers on permits, and international students. These lenders don't need to see a long credit history. Instead, they look at your job and income.</p>
            <p>Getting a car loan is also the best way to start building your Canadian credit score from scratch. We make the process fast, friendly, and easy to understand.</p>
            <p style="margin-top: 2rem;"><a href="../index.html#apply" class="btn-primary" style="display: inline-block;">Apply as a Newcomer</a></p>
        """
    },
    {
        "filename": "bankruptcy.html",
        "title": "Bankruptcy Car Loans in Toronto | AutoBanker",
        "description": "Get a car loan after bankruptcy in Toronto. AutoBanker specializes in post-bankruptcy and consumer proposal auto financing.",
        "h1": "Car Loans After Bankruptcy",
        "content": """
            <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">A Fresh Start Is Possible</h2>
            <p>Going through bankruptcy is tough, but it does not mean you cannot own a car. A bankruptcy is simply a fresh start. We partner with lenders who are happy to give you a second chance.</p>
            <h3 style="color: var(--gold-accent); margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">The Best Way to Rebuild</h3>
            <p>After a bankruptcy, your credit score drops. Taking out a bad credit car loan and making your payments on time every single month is the fastest way to bring your score back up. We will help you find a car that fits your budget perfectly, so you never have to stress about making payments.</p>
            <p style="margin-top: 2rem;"><a href="../index.html#apply" class="btn-primary" style="display: inline-block;">Get Your Fresh Start</a></p>
        """
    }
]

for s in services:
    generate_page("auto-loans", s["filename"], s["title"], s["description"], s["h1"], s["content"])

# Comparison page in root
comp_content = """
    <h2 style="color: var(--gold-accent); margin-bottom: 1.5rem; font-size: 2rem;">Which Option is Better for You?</h2>
    <p>When you need a car, you might think you should just walk into a car dealership. But if your credit is not perfect, working with an Auto Finance Broker like AutoBanker is a much better idea.</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
        <div style="background: var(--bg-secondary); padding: 2rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
            <h3 style="color: #ff4444; margin-bottom: 1rem;">Going Direct to a Dealership</h3>
            <ul style="list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem;">
                <li>They might check your credit many times, which drops your score.</li>
                <li>They only have their own cars to sell you.</li>
                <li>They might focus on selling you a car, rather than fixing your credit.</li>
            </ul>
        </div>
        <div style="background: var(--bg-secondary); padding: 2rem; border-radius: 12px; border: 1px solid var(--gold-accent);">
            <h3 style="color: var(--gold-accent); margin-bottom: 1rem;">Using AutoBanker (Broker)</h3>
            <ul style="list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem;">
                <li>We only check your credit once.</li>
                <li>We find the perfect lender for your exact situation first.</li>
                <li>Once approved, you get to choose from cars at many different trusted dealerships.</li>
            </ul>
        </div>
    </div>
    <p style="margin-top: 2rem;"><a href="index.html#apply" class="btn-primary" style="display: inline-block;">Try AutoBanker Today</a></p>
"""

generate_page("", "dealership-vs-broker.html", "Dealership vs Auto Finance Broker | AutoBanker", "Learn the difference between getting a car loan from a dealership versus an auto finance broker.", "Dealership vs. Auto Finance Broker", comp_content)

print("HTML pages generated.")
