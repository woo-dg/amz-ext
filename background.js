// Background service worker
console.log('Amazon Product Title Extractor: Background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Amazon Product Title Extractor: Extension installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getProductTitle') {
        // This can be used for future functionality
        sendResponse({ success: true });
    }
}); 