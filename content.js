// Content script that runs on Amazon pages
console.log('Amazon Product Title Extractor: Content script loaded');

// Function to check if we're on a product page
function isProductPage() {
    const url = window.location.href;
    return url.includes('amazon.') && (url.includes('/dp/') || url.includes('/gp/product/') || url.includes('/product/'));
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

// Create and inject the auto-popup
function createAutoPopup() {
    // Remove existing popup if it exists
    const existingPopup = document.getElementById('amazon-title-extractor-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'amazon-title-extractor-popup';
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid #e1e5e9;
    `;

    // Create popup content
    popup.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid #e1e5e9;">
            <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                Amazon Product Title Extractor
            </h3>
            <p style="margin: 0; color: #666; font-size: 12px;">
                Product title detected automatically
            </p>
        </div>
        <div style="padding: 16px;">
            <div id="extracted-title" style="
                background: #f8f9fa;
                padding: 12px;
                border-radius: 6px;
                border-left: 4px solid #667eea;
                margin-bottom: 12px;
            ">
                <h4 style="margin: 0 0 8px 0; color: #333; font-size: 12px; font-weight: 600;">
                    Product Title:
                </h4>
                <p id="title-text" style="
                    margin: 0;
                    color: #555;
                    font-size: 11px;
                    line-height: 1.4;
                    word-wrap: break-word;
                    max-height: 60px;
                    overflow-y: auto;
                ">Extracting...</p>
            </div>
            <button id="close-popup" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
            ">Close</button>
        </div>
    `;

    // Add popup to page
    document.body.appendChild(popup);

    // Extract and display title
    const title = getProductTitle();
    const titleElement = document.getElementById('title-text');
    if (title) {
        titleElement.textContent = title;
        titleElement.style.color = '#27ae60';
    } else {
        titleElement.textContent = 'No product title found';
        titleElement.style.color = '#e74c3c';
    }

    // Add close functionality
    document.getElementById('close-popup').addEventListener('click', () => {
        popup.remove();
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 10000);
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

// Auto-create popup when on product page
if (isProductPage()) {
    console.log('Amazon Product Title Extractor: Product page detected, creating auto-popup');
    // Wait a bit for the page to load
    setTimeout(createAutoPopup, 2000);
}

// Also create popup when URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (isProductPage()) {
            setTimeout(createAutoPopup, 1000);
        }
    }
}).observe(document, { subtree: true, childList: true });