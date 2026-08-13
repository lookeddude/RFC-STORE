import os
import re

files = [
    r"app\(storefront)\shop\[slug]\pdp.module.css",
    r"components\pdp\ProductInfo.module.css",
    r"components\pdp\ProductGallery.module.css",
    r"components\pdp\VariantSelector.module.css",
    r"components\pdp\QuantitySelector.module.css",
    r"components\pdp\AddToCartBar.module.css",
    r"components\pdp\ProductTabs.module.css",
    r"components\pdp\RelatedProducts.module.css",
    r"components\cart\CartItem.module.css",
    r"components\cart\CartSummary.module.css",
    r"components\cart\EmptyCart.module.css",
    r"components\checkout\CheckoutForm.module.css",
    r"components\checkout\CheckoutSummary.module.css",
    r"components\account\AccountShell.module.css",
    r"components\account\AccountNav.module.css",
    r"components\account\DashboardClient.module.css",
    r"components\account\OrderCard.module.css",
    r"components\account\ProfileForm.module.css",
]

base_dir = r"c:\Users\rajni\OneDrive\Desktop\All Projects\RFC STORE"

def replace_tokens(content):
    # Global replaces
    content = content.replace("var(--color-primary)", "var(--rfc-text)")
    content = content.replace("var(--color-secondary)", "var(--rfc-accent)")
    content = content.replace("var(--color-secondary-dark)", "var(--rfc-accent-dark)")
    content = content.replace("var(--color-on-primary)", "var(--rfc-text-inv)")
    content = content.replace("var(--color-on-secondary)", "var(--rfc-text-inv)")
    content = content.replace("var(--color-background)", "var(--rfc-bg)")
    content = content.replace("var(--color-surface-container-lowest)", "var(--rfc-surface)")
    content = content.replace("var(--color-surface-container-low)", "var(--rfc-bg)")
    content = content.replace("var(--color-surface-container)", "var(--rfc-border)")
    content = content.replace("var(--color-outline-variant)", "var(--rfc-border)")
    content = content.replace("var(--color-outline)", "var(--rfc-text-subtle)")
    content = content.replace("var(--color-error)", "var(--rfc-error)")
    content = content.replace("var(--color-error-container)", "var(--rfc-error-bg)")
    content = content.replace("var(--color-on-error-container)", "var(--rfc-error)")
    content = content.replace("var(--color-on-surface-variant)", "var(--rfc-text-muted)")
    content = content.replace("var(--color-on-surface)", "var(--rfc-text)")
    content = content.replace("var(--radius-default)", "var(--radius-md)")
    content = content.replace("rgba(11, 28, 48, 0.45)", "var(--rfc-text-subtle)")
    content = content.replace("rgba(11, 28, 48, 0.25)", "var(--rfc-border)")
    content = content.replace("rgba(11, 28, 48, 0.35)", "var(--rfc-text-subtle)")
    content = content.replace("rgba(11, 28, 48, 0.2)", "var(--rfc-border)")
    content = content.replace("rgba(11, 28, 48, 0.5)", "var(--rfc-text-muted)")
    content = content.replace("rgba(11, 28, 48, 0.65)", "var(--rfc-text-muted)")
    content = content.replace("rgba(11, 28, 48, 0.55)", "var(--rfc-text-muted)")
    content = content.replace("rgba(11, 28, 48, 0.4)", "var(--rfc-text-subtle)")
    content = content.replace("rgba(11, 28, 48, 0.3)", "var(--rfc-text-subtle)")
    content = content.replace("rgba(11, 28, 48, 0.6)", "var(--rfc-text-muted)")
    content = content.replace("rgba(11, 28, 48, 0.7)", "var(--rfc-text-muted)")
    content = content.replace("rgba(11, 28, 48, 0.12)", "var(--rfc-border)")
    content = content.replace("#0b1c30", "var(--rfc-dark)")
    content = content.replace("#1a2a3a", "var(--rfc-dark-surface)")
    content = content.replace("#ffffff", "var(--rfc-surface)")
    content = content.replace("#fff", "var(--rfc-surface)")
    content = content.replace("#0a0e14", "var(--rfc-dark)")
    content = content.replace("#1a2030", "var(--rfc-dark-surface)")
    return content

for file_path in files:
    full_path = os.path.join(base_dir, file_path)
    if not os.path.exists(full_path):
        print(f"File not found: {full_path}")
        continue
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content
    content = replace_tokens(content)

    # Specific file overrides
    if "ProductInfo.module.css" in file_path:
        content = content.replace("color: var(--rfc-accent);", "color: var(--rfc-text);") # Price should be text not accent
        # Only discount badges get accent, which they already do if mapped correctly

    if "VariantSelector.module.css" in file_path:
        # Selected variant: border var(--rfc-accent), bg var(--rfc-accent-light)
        content = content.replace("background-color: var(--rfc-text);", "background-color: var(--rfc-accent-light);")
        content = content.replace("color: var(--rfc-text-inv);", "color: var(--rfc-accent);")
        content = content.replace("border-color: var(--rfc-text);", "border-color: var(--rfc-accent);")
        # Fix hover
        content = content.replace("border-color: var(--rfc-text);", "border-color: var(--rfc-accent);")

    if "AddToCartBar.module.css" in file_path:
        # Wishlist button: Secondary button: var(--rfc-dark) bg
        content = content.replace(".wishlistBtn {\n  display: flex;", ".wishlistBtn {\n  background-color: var(--rfc-dark);\n  color: var(--rfc-surface);\n  display: flex;")
        content = content.replace("color: var(--rfc-text-muted);\n  cursor: pointer;", "color: var(--rfc-text-inv-muted);\n  cursor: pointer;")
        content = content.replace("border-color: var(--rfc-accent);\n  color: var(--rfc-accent);", "border-color: var(--rfc-accent);\n  color: var(--rfc-accent);")

    if "ProductTabs.module.css" in file_path:
        # Active tab underline: var(--rfc-accent)
        pass # should be handled by --color-secondary replacement

    if "CartItem.module.css" in file_path:
        # Remove button should use var(--rfc-error) color only (not bg)
        content = content.replace("background-color: var(--rfc-error-bg);", "background-color: transparent;")

    if "CheckoutForm.module.css" in file_path:
        # Payment Notice
        content = content.replace("background-color: #fffbeb;", "background-color: var(--rfc-warning-bg);")
        content = content.replace("border: 1px solid #f59e0b;", "border: 1px solid var(--rfc-warning);")
        content = content.replace("color: #92400e;", "color: var(--rfc-warning);")
        # Place Order Btn bg
        content = content.replace("background-color: var(--rfc-text);", "background-color: var(--rfc-accent);")
        content = content.replace("background-color: var(--rfc-dark-surface);", "background-color: var(--rfc-accent-dark);")
        content = content.replace("box-shadow: 0 0 0 3px rgba(10, 14, 20, 0.08);", "box-shadow: 0 0 0 3px rgba(230,57,70,0.1);")
        content = content.replace("box-shadow: 0 0 0 3px rgba(10,14,20,0.08);", "box-shadow: 0 0 0 3px rgba(230,57,70,0.1);")

    if "AccountNav.module.css" in file_path:
        # Active item: var(--rfc-accent) color and left border
        content = content.replace("background: var(--rfc-accent);", "background: transparent;\n  color: var(--rfc-accent);\n  border-left: 3px solid var(--rfc-accent);")
        content = content.replace("color: var(--rfc-text-inv);", "color: var(--rfc-accent);")
        content = content.replace("background: var(--rfc-accent-dark);", "background: var(--rfc-bg);")

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {file_path}")

print("Done")
