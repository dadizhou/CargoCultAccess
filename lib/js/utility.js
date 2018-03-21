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

function populateLocationInfo() {
    var locationID = getLocationIDFromURL();
    var resourceURL = '/api/location/getlocationbyid';
    var serverURL = getServerUrl();

    $.ajax({
        type: 'get',
        url: serverURL + resourceURL,
        data: { 'locationid': locationID },
        dataType: 'json',
        success: function (data) {
            $('#txtTitle').val(data.title);
            $('#txtDescription').val(data.description);
            $('#txtLatitude').val(data.latitude);
            $('#txtLongitude').val(data.longitude);
        }
    });
}

function submitLocationEdit() {
    var locationID = getLocationIDFromURL();
    var resourceURL = '/api/location/update';
    var serverURL = getServerUrl();

    var result = { 'locationid': locationID };
    $.each($('#locationForm').serializeArray(), function () {
        result[this.name] = this.value;
    });

    $.ajax({
        url: serverURL + resourceURL,
        type: 'put',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(result),
        success: function (data) {

        }
    });
}