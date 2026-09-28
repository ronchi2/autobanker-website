import re

index_path = r"C:\Users\Ron\Desktop\Projects\Autobanker\autobanker website\index.html"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to match the existing form
pattern = re.compile(r'<form style="position: relative; z-index: 2; max-width: 500px;.*?</form>', re.DOTALL)

# The new GHL embed wrapped in the same layout constraints
ghl_embed = """<div style="position: relative; z-index: 2; max-width: 500px; margin: 0 auto; display: flex; justify-content: center;">
    <iframe
        src="https://api.leadconnectorhq.com/widget/form/xTAjJehkw2PZhCIgRWeD"
        style="width:100%;height:100%;border:none;border-radius:8px;min-height:200px;"
        id="inline-xTAjJehkw2PZhCIgRWeD" 
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Form 2"
        data-height="undefined"
        data-layout-iframe-id="inline-xTAjJehkw2PZhCIgRWeD"
        data-form-id="xTAjJehkw2PZhCIgRWeD"
        data-cookie-consent="true"
        data-cookie-consent-provider="auto"
        title="Form 2"
    ></iframe>
    <script src="https://link.msgsndr.com/js/form_embed.js"></script>
</div>"""

if pattern.search(content):
    new_content = pattern.sub(ghl_embed, content)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully replaced form with GHL embed.")
else:
    print("Could not find the target form to replace.")
