const fs = require('fs');
const path = require('path');

const files = [
    "app/(storefront)/shop/[slug]/pdp.module.css",
    "components/pdp/ProductInfo.module.css",
    "components/pdp/ProductGallery.module.css",
    "components/pdp/VariantSelector.module.css",
    "components/pdp/QuantitySelector.module.css",
    "components/pdp/AddToCartBar.module.css",
    "components/pdp/ProductTabs.module.css",
    "components/pdp/RelatedProducts.module.css",
    "components/cart/CartItem.module.css",
    "components/cart/CartSummary.module.css",
    "components/cart/EmptyCart.module.css",
    "components/checkout/CheckoutForm.module.css",
    "components/checkout/CheckoutSummary.module.css",
    "components/account/AccountShell.module.css",
    "components/account/AccountNav.module.css",
    "components/account/DashboardClient.module.css",
    "components/account/OrderCard.module.css",
    "components/account/ProfileForm.module.css",
];

const baseDir = "c:\\Users\\rajni\\OneDrive\\Desktop\\All Projects\\RFC STORE";

function replaceTokens(content) {
    let newContent = content;
    const replacements = {
        "var(--color-primary)": "var(--rfc-text)",
        "var(--color-secondary)": "var(--rfc-accent)",
        "var(--color-secondary-dark)": "var(--rfc-accent-dark)",
        "var(--color-on-primary)": "var(--rfc-text-inv)",
        "var(--color-on-secondary)": "var(--rfc-text-inv)",
        "var(--color-background)": "var(--rfc-bg)",
        "var(--color-surface-container-lowest)": "var(--rfc-surface)",
        "var(--color-surface-container-low)": "var(--rfc-bg)",
        "var(--color-surface-container)": "var(--rfc-border)",
        "var(--color-outline-variant)": "var(--rfc-border)",
        "var(--color-outline)": "var(--rfc-text-subtle)",
        "var(--color-error)": "var(--rfc-error)",
        "var(--color-error-container)": "var(--rfc-error-bg)",
        "var(--color-on-error-container)": "var(--rfc-error)",
        "var(--color-on-surface-variant)": "var(--rfc-text-muted)",
        "var(--color-on-surface)": "var(--rfc-text)",
        "var(--radius-default)": "var(--radius-md)",
        "rgba(11, 28, 48, 0.45)": "var(--rfc-text-subtle)",
        "rgba(11, 28, 48, 0.25)": "var(--rfc-border)",
        "rgba(11, 28, 48, 0.35)": "var(--rfc-text-subtle)",
        "rgba(11, 28, 48, 0.2)": "var(--rfc-border)",
        "rgba(11, 28, 48, 0.5)": "var(--rfc-text-muted)",
        "rgba(11, 28, 48, 0.65)": "var(--rfc-text-muted)",
        "rgba(11, 28, 48, 0.55)": "var(--rfc-text-muted)",
        "rgba(11, 28, 48, 0.4)": "var(--rfc-text-subtle)",
        "rgba(11, 28, 48, 0.3)": "var(--rfc-text-subtle)",
        "rgba(11, 28, 48, 0.6)": "var(--rfc-text-muted)",
        "rgba(11, 28, 48, 0.7)": "var(--rfc-text-muted)",
        "rgba(11, 28, 48, 0.12)": "var(--rfc-border)",
        "#0b1c30": "var(--rfc-dark)",
        "#1a2a3a": "var(--rfc-dark-surface)",
        "#ffffff": "var(--rfc-surface)",
        "#fff": "var(--rfc-surface)",
        "#0a0e14": "var(--rfc-dark)",
        "#1a2030": "var(--rfc-dark-surface)"
    };
    
    for (const [key, value] of Object.entries(replacements)) {
        newContent = newContent.split(key).join(value);
    }
    return newContent;
}

files.forEach(filePath => {
    const fullPath = path.join(baseDir, filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    let content = fs.readFileSync(fullPath, "utf-8");
    content = replaceTokens(content);

    if (filePath.includes("ProductInfo.module.css")) {
        content = content.split("color: var(--rfc-accent);").join("color: var(--rfc-text);");
    }

    if (filePath.includes("VariantSelector.module.css")) {
        content = content.split("background-color: var(--rfc-text);").join("background-color: var(--rfc-accent-light);");
        content = content.split("color: var(--rfc-text-inv);").join("color: var(--rfc-accent);");
        content = content.split("border-color: var(--rfc-text);").join("border-color: var(--rfc-accent);");
    }

    if (filePath.includes("AddToCartBar.module.css")) {
        content = content.split(".wishlistBtn {\n  display: flex;").join(".wishlistBtn {\n  background-color: var(--rfc-dark);\n  color: var(--rfc-surface);\n  display: flex;");
        content = content.split("color: var(--rfc-text-muted);\n  cursor: pointer;").join("color: var(--rfc-text-inv-muted);\n  cursor: pointer;");
    }

    if (filePath.includes("CartItem.module.css")) {
        content = content.split("background-color: var(--rfc-error-bg);").join("background-color: transparent;");
    }

    if (filePath.includes("CheckoutForm.module.css")) {
        content = content.split("background-color: #fffbeb;").join("background-color: var(--rfc-warning-bg);");
        content = content.split("border: 1px solid #f59e0b;").join("border: 1px solid var(--rfc-warning);");
        content = content.split("color: #92400e;").join("color: var(--rfc-warning);");
        content = content.split("background-color: var(--rfc-text);").join("background-color: var(--rfc-accent);");
        content = content.split("background-color: var(--rfc-dark-surface);").join("background-color: var(--rfc-accent-dark);");
        content = content.split("box-shadow: 0 0 0 3px rgba(10, 14, 20, 0.08);").join("box-shadow: 0 0 0 3px rgba(230,57,70,0.1);");
        content = content.split("box-shadow: 0 0 0 3px rgba(10,14,20,0.08);").join("box-shadow: 0 0 0 3px rgba(230,57,70,0.1);");
    }

    if (filePath.includes("AccountNav.module.css")) {
        content = content.split("background: var(--rfc-accent);").join("background: transparent;\n  color: var(--rfc-accent);\n  border-left: 3px solid var(--rfc-accent);");
        content = content.split("color: var(--rfc-text-inv);").join("color: var(--rfc-accent);");
        content = content.split("background: var(--rfc-accent-dark);").join("background: var(--rfc-bg);");
    }
    
    if (filePath.includes("ProfileForm.module.css")) {
        content = content.split("box-shadow: 0 0 0 3px rgba(10,14,20,0.08);").join("box-shadow: 0 0 0 3px rgba(230,57,70,0.1); border-color: var(--rfc-accent);");
    }

    fs.writeFileSync(fullPath, content, "utf-8");
    console.log(`Updated ${filePath}`);
});

console.log("Done");
