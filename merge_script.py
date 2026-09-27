import re

with open(r'C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\index.html', 'r', encoding='utf-8') as f:
    original = f.read()

with open(r'C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\indexupdated.html', 'r', encoding='utf-8') as f:
    updated = f.read()

# 1. Title and Meta description
updated_title = re.search(r'<title>.*?</title>', updated, re.DOTALL).group(0)
updated_meta = re.search(r'<meta name="description".*?>', updated).group(0)

original = re.sub(r'<title>.*?</title>', updated_title, original, flags=re.DOTALL)
original = re.sub(r'<meta name="description".*?>', updated_meta, original)

# 2. Add Tailwind and Fonts to head
head_insert = '''
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    },
                    colors: {
                        gold: '#D4AF37',
                        dark: '#0B0F19',
                        darker: '#06080D',
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif !important; }
        nav, nav a, .brand-text { font-family: 'Cinzel', serif !important; }
        .gradient-text {
            background: linear-gradient(to right, #ffffff, #D4AF37);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        input[type=range] { accent-color: #D4AF37; }
    </style>
'''
original = original.replace('</head>', head_insert + '</head>')

# 3. Update Hero
hero_replacement = '''    <header class="hero">
        <div class="hero-content">
            <div class="hero-subtitle">Serving Toronto & The GTA</div>
            <h1>Get Approved With <br/><span class="gradient-text">Bad Credit Car Loans</span></h1>
            <h2 style="font-size: 1.5rem; color: var(--gold-accent); margin-bottom: 1rem; font-weight: normal;">Bankruptcy? Consumer Proposal? Zero Down? No problem.</h2>
            <p>Experience guaranteed auto financing in the GTA with our revolutionary matching system.</p>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;">
                <a href="#apply" class="btn-primary">Secure Your Approval</a>
                <a href="#free-guide" class="btn-primary" style="background: transparent; border: 2px solid var(--gold-accent); color: var(--gold-accent);">Download Free Credit Building Guide</a>
            </div>
        </div>
    </header>'''
original = re.sub(r'<header class="hero">.*?</header>', hero_replacement, original, flags=re.DOTALL)

# 4. Remove 3-step visual roadmap
original = re.sub(r'<!-- 3-Step Visual Roadmap -->\s*<section class="roadmap-banner">.*?</section>', '', original, flags=re.DOTALL)

# 5. Extract updated Calculator & Form
updated_calc_form_match = re.search(r'<!-- Calculator & Form Dual Section -->\s*<section class="py-24 bg-black/40 border-y border-white/5" id="calculator">.*?</section>', updated, flags=re.DOTALL)
updated_calc_form = updated_calc_form_match.group(0)

# Replace emojis with images in the extracted form
updated_calc_form = updated_calc_form.replace(
    '<div class="text-2xl mb-2">🚗</div>',
    '<img src="assets/car_icon.png" alt="Standard car auto financing" class="w-16 h-16 object-contain mb-2 mx-auto">'
)
updated_calc_form = updated_calc_form.replace(
    '<div class="text-2xl mb-2">🚙</div>',
    '<img src="assets/suv_icon.png" alt="SUV family auto loan" class="w-16 h-16 object-contain mb-2 mx-auto">'
)
updated_calc_form = updated_calc_form.replace(
    '<div class="text-2xl mb-2">🛻</div>',
    '<img src="assets/truck_icon.png" alt="Pickup truck financing options" class="w-16 h-16 object-contain mb-2 mx-auto">'
)
updated_calc_form = updated_calc_form.replace(
    '<div class="text-2xl mb-2">🚐</div>',
    '<img src="assets/van_icon.png" alt="Minivan and cargo van loans" class="w-16 h-16 object-contain mb-2 mx-auto">'
)

# Replace the original Calculator and Form sections
start_idx = original.find('<!-- Loan Calculator Section -->')
end_idx = original.find('</section> <!-- Close dual-section -->')
if start_idx != -1 and end_idx != -1:
    end_idx += len('</section> <!-- Close dual-section -->')
    original = original[:start_idx] + updated_calc_form + '\n\n' + original[end_idx:]

with open(r'C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\index.html', 'w', encoding='utf-8') as f:
    f.write(original)

print('Success')
