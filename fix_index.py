import os

file_path = r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

broken_text = """                    colors: {
            <img src="assets/autobanker-update.png" alt="AutoBanker Logo" class="brand-logo">
        </a>"""

fixed_text = """                    colors: {
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
            color: #D4AF37;
        }
        input[type=range] { accent-color: #D4AF37; }
    </style>
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W65H4SVF"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <!-- Navigation -->
    <nav>
        <a href="index.html" class="brand">
            <img src="assets/autobanker-update.png" alt="AutoBanker Logo" class="brand-logo">
        </a>"""

if broken_text in content:
    content = content.replace(broken_text, fixed_text)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed successfully!")
else:
    print("Broken text not found.")
