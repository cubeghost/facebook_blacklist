// http://stackoverflow.com/a/17584657
//chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
chrome.webNavigation.onCompleted.addListener(function(details) {
    
    console.log('onCompleted');
    
    // https://developer.chrome.com/extensions/messaging
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {pageload: 'load'});
    });
    
    
});
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    
    console.log('historyStateUpdated');
    
    // https://developer.chrome.com/extensions/messaging
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {pageload: 'history'});
    });
    
    
});