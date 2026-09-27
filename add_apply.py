import os
import re

index_path = r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\index.html"
apply_path = r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\apply-now.html"

with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

with open(apply_path, "r", encoding="utf-8") as f:
    apply_content = f.read()

# Extract the apply section from apply_now.html
match = re.search(r'(<!-- Hero Section -->.*?)(?=<!-- Global Footer -->)', apply_content, re.DOTALL)
if match:
    apply_section = match.group(1).replace('<!-- Hero Section -->', '<!-- Application Form Section -->')
    
    # insert before <!-- Global Footer --> in index.html
    new_index = index_content.replace('<!-- Global Footer -->', apply_section + '\n    <!-- Global Footer -->')
    
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_index)
    print("Successfully added application section back to index.html")
else:
    print("Could not find apply section in apply-now.html")
