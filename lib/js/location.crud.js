function callGetAllLocations(callbackSuccess) {
    var resourceURL = '/api/location/getalllocations';
    var serverURL = getServerUrl();

    callServer(serverURL + resourceURL, 'get', null, 'json', null, callbackSuccess, null);
}

function retrieveAllLocationJSON() {
    var callbackSuccess = function (data) {
        setLocationString(JSON.stringify(data));
    }

    callGetAllLocations(callbackSuccess);
}

function listAllLocations(divLocations, divPagination) {

    var callbackSuccess = function (data) {
        var pageNumber = getPageNumber() != null ? getPageNumber() : 1;

        var itemsPerPage = 5;
        var pages = Math.ceil(data.length / itemsPerPage);
        pageNumber = pageNumber > pages ? pages : pageNumber;
        var currentPageData = data.slice(itemsPerPage * (pageNumber - 1), itemsPerPage * pageNumber);

        divLocations.empty();
        divPagination.empty();

        populateLocationInfo(currentPageData);
        setPageNumber(pageNumber);

        $('#page-selection').bootpag({
            page: pageNumber,
            total: pages
        }).on("page", function (event, pageNumber) {
            currentPageData = data.slice(itemsPerPage * (pageNumber - 1), itemsPerPage * pageNumber);
            divLocations.empty();
            populateLocationInfo(currentPageData);
            setPageNumber(pageNumber);
        });

        function populateLocationInfo(data) {
            $.each(data, function (index, val) {
                var editButtonID = 'edit-' + val.locationID;
                var deleteButtonID = 'delete-' + val.locationID;
                var locDetails =
                    '<div class="card card-outline-primary m-1 p-1">' +
                    '<div class="bg-light p-1">' +
                    '<h4 class="inline-header">' + val.title + '</h4>' +
                    '<a href="#" onclick="deleteLocation(this.id)" class="btn btn-sm btn-danger pull-right btn-float-right" id="' + deleteButtonID + '">Remove</a>' +
                    '<a href="#" onclick="openEditPage(this.id)" class="btn btn-sm btn-warning pull-right btn-float-right" id="' + editButtonID + '">Edit</a>' +
                    '</div>' +
                    '<div class="card-text p-1">' + val.description + '</div>' +
                    '</div>';
                divLocations.append(locDetails);
            });
        }
    };

    callGetAllLocations(callbackSuccess);
}

function populateLocationInfo() {
    var locationID = getLocationIDFromURL();
    var resourceURL = '/api/location/getlocationbyid';
    var serverURL = getServerUrl();
    var callbackSuccess = function (data) {
        $('#txtTitle').val(data.title);
        $('#txtDescription').val(data.description);
        $('#txtLatitude').val(data.latitude);
        $('#txtLongitude').val(data.longitude);
    };

    var data = { 'locationid': locationID };

    callServer(serverURL + resourceURL, 'get', data, 'json', null, callbackSuccess, null);
}

function submitLocationEdit(editMode) {
    var locationID = getLocationIDFromURL();
    var data = editMode ? { 'locationid': locationID } : {};

    $.each($('#locationForm').serializeArray(), function () {
        data[this.name] = this.value;
    });

    var callbackSuccess = function () {
        showNotification(responseText);
        openManageLocationsPage();
    }

    saveLocationEdit(editMode, data, callbackSuccess);
    setPageNumberAfterAdding(editMode);
}

function submitSavePOI(pageElements) {
    var data = {
        'title': pageElements.locationName.value,
        'description': pageElements.locationDescription.value,
        'latitude': pageElements.locationLatitude.value,
        'longitude': pageElements.locationLongitude.value
    };

    var callbackSuccess = function () {
        var responseText = 'Location Saved';
        showNotification(responseText);
    }

    saveLocationEdit(false, data, callbackSuccess);
}

function saveLocationEdit(editMode, data, callbackSuccess) {
    var serverURL = getServerUrl();

    var resourceURL = '/api/location/create';
    var requestType = 'post';
    var responseText = 'Location Added';
    if (editMode) {
        resourceURL = '/api/location/update';
        requestType = 'put';
        var responseText = 'Location Updated';
    }

    callServer(
        serverURL + resourceURL, requestType, JSON.stringify(data),
        'json', 'application/json', callbackSuccess, null
    );
}

function deleteLocation(locationID) {
    if (window.confirm('Delete this location?')) {
        locationID = locationID.replace('delete-', '')
        var resourceURL = '/api/location/delete';
        var serverURL = getServerUrl();
        var responseText = 'Location Deleted';

        var data = { 'locationid': locationID };

        var callbackSuccess = function () {
            showNotification(responseText);
            openManageLocationsPage();
        }

        callServer(serverURL + resourceURL, 'delete', data, 'json', null, callbackSuccess, null);
    }
}

function handlePOI(event, map, pageElements) {
    if (event.placeId) {
        // when clicking on an icon
        var placesService = new google.maps.places.PlacesService(map);
        placesService.getDetails({ placeId: event.placeId }, function (place, status) {
            if (status === 'OK') {
                pageElements.locationName.value = place.name;
                pageElements.locationDescription.value = place.formatted_address;
                pageElements.locationLatitude.value = place.geometry.location.lat();
                pageElements.locationLongitude.value = place.geometry.location.lng();
            }
        });
    } else {
        // when clicking on whitespace
        // do some stuff
    }
}