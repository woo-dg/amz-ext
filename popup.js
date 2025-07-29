document.addEventListener('DOMContentLoaded', async function() {
    const productTitle = document.getElementById('productTitle');
    const status = document.getElementById('status');

    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if we're on an Amazon page
        if (!tab.url.includes('amazon.')) {
            status.innerHTML = '<p class="error">Please navigate to an Amazon product page first.</p>';
            return;
        }

        // Execute content script to extract product title
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractProductTitle
        });

        if (results && results[0] && results[0].result) {
            productTitle.textContent = results[0].result;
            status.innerHTML = '<p class="success">Product title extracted successfully!</p>';
        } else {
            productTitle.textContent = 'No product title found on this page';
            status.innerHTML = '<p class="error">Could not find product title on this page.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        status.innerHTML = '<p class="error">Error extracting product title. Please try again.</p>';
    }
});

// Function that will be injected into the page to extract product title
function extractProductTitle() {
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