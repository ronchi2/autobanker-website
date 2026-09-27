import os
import re

index_path = r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\index.html"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to extract the three parts
# 1: Everything before Lead Magnet
# 2: Lead Magnet Section
# 3: Application Form Section
# 4: Global Footer and everything after

pattern = r'(.*?)(\s*<!-- Lead Magnet Section -->.*?)(\s*<!-- Application Form Section -->.*?)(<!-- Global Footer -->.*)'

match = re.search(pattern, content, re.DOTALL)

if match:
    before_lead = match.group(1)
    lead_magnet = match.group(2)
    app_form = match.group(3)
    footer = match.group(4)

    # Swap them
    new_content = before_lead + app_form + lead_magnet + '\n    ' + footer

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully swapped sections in index.html")
else:
    print("Could not match the sections correctly.")
