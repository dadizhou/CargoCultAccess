function showNotification(text) {
    //TODO: show proper notification. e.g. popup (https://www.w3schools.com/howto/howto_js_popup.asp)
    alert(text);
}

function getServerUrl() {
    var serverURL = 'https://cargocult.azurewebsites.net';
    if (document.URL.startsWith('http://localhost')) {
        serverURL = 'http://localhost:54342';
    }
    return serverURL;
}

function getLocationIDFromURL() {
    return urlParams.get('locationid');
}

function openEditPage(locationID) {
    var linkText = 'editlocation.html';
    if (locationID != null) {
        linkText += '?locationid=' + locationID.replace('edit-', '');
    }
    window.location.href = linkText;
}

function openManageLocationsPage() {
    window.location.href = 'managelocations.html';
}

function callServer(url, type, data, dataType, contentType, success, error) {
    var ajax = {};
    if (url != null) { ajax.url = url; }
    if (type != null) { ajax.type = type; }
    if (data != null) { ajax.data = data; }
    if (dataType != null) { ajax.dataType = dataType; }
    if (contentType != null) { ajax.contentType = contentType; }
    if (success != null) { ajax.success = success; }
    if (error != null) { ajax.error = error; }

    $.ajax(ajax);
}

function setPageNumber(num) {
    // use session storage for now
    setSessionStorage('pageNum', num);
}

function getPageNumber() {
    // use session storage for now
    return getSessionStorage('pageNum');
}

function clearPageNumber() {
    // use session storage for now
    removeSessionStorage('pageNum');
}

function setSessionStorage(key, val) {
    sessionStorage.setItem(key, val);
}

function getSessionStorage(key) {
    return sessionStorage.getItem(key);
}

function removeSessionStorage(key) {
    sessionStorage.removeItem(key);
}

function clearSessionStorage(key) {
    sessionStorage.clear();
}