// Content script that runs on Amazon pages
console.log('Amazon Product Title Extractor: Content script loaded');

// Function to check if we're on a product page
function isProductPage() {
    const url = window.location.href;
    return url.includes('/dp/') || url.includes('/gp/product/') || url.includes('/product/');
}

// Function to extract product title
function getProductTitle() {
    // Multiple selectors to try for Amazon product titles
    const selectors = [
        '#productTitle',
        'h1.a-size-large',
        'h1.a-size-base-plus',
        '.a-size-large.a-color-base',
        '[data-automation-id="product-title"]',
        'h1[data-automation-id="product-title"]'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const title = element.textContent.trim();
            if (title && title.length > 0) {
                return title;
            }
        }
    }

    // Fallback: try to find any h1 that might be the product title
    const h1Elements = document.querySelectorAll('h1');
    for (const h1 of h1Elements) {
        const text = h1.textContent.trim();
        if (text && text.length > 0 && !text.includes('Amazon.com')) {
            return text;
        }
    }

    return null;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractTitle') {
        if (isProductPage()) {
            const title = getProductTitle();
            sendResponse({ success: true, title: title });
        } else {
            sendResponse({ success: false, error: 'Not on a product page' });
        }
    }
});

// Auto-detect when we're on a product page and log the title
function isProductPage() {
    const url = window.location.href;
    return url.includes('amazon.') && (url.includes('/dp/') || url.includes('/gp/product/') || url.includes('/product/'));
}