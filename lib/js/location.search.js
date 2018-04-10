class CenterLocation {
    constructor() {
        this.latitude = 0;
        this.longitude = 0;
    }

    setLocation(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    getLocation() {
        return { latitude: this.latitude, longitude: this.longitude };
    }

    isLocationSet() {
        return this.latitude == 0 && this.latitude == 0 ? false : true;
    }

    clearLocation() {
        this.latitude = 0;
        this.longitude = 0;
    }
}

function getPageElements() {
    var result = {};

    result.googleMap = document.getElementById('googleMap');
    result.mapControls = document.getElementById('mapControls');

    result.radiusForm = document.getElementById('radiusForm');
    result.searchRadius = document.getElementById('searchRadius');
    result.btnSearchRadius = document.getElementById('btnSearchRadius');

    result.locationForm = document.getElementById('locationForm');
    result.locationName = document.getElementById('locationName');
    result.locationDescription = document.getElementById('locationDescription');
    result.locationLatitude = document.getElementById('locationLatitude');
    result.locationLongitude = document.getElementById('locationLongitude');
    result.btnSaveLocation = document.getElementById('btnSaveLocation');

    result.addressForm = document.getElementById('addressForm');
    result.addressInput = document.getElementById('addressInput');
    result.btnSetCenter = document.getElementById('btnSetCenter');
    result.btnMyLocation = document.getElementById('btnMyLocation');
    result.btnClearCenter = document.getElementById('btnClearCenter');
    return result;
}

function getFailSafeLocation() {
    // TODO: write proper logic to handle this
    // currently set it to Canberra
    var result = {};
    result.latitude = -35.2809368;
    result.longitude = 149.1300092;
    return result;
}

function setCurrentPosition(map, infoWindow, markers, centerLocation) {
    navigator.geolocation.getCurrentPosition(callbackSucces, callbackError, getGeoOption());
    function callbackSucces(position) {
        map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        addMarker(map, infoWindow, markers,
            'Current Location',
            'Current locatoin lat lon',
            position.coords.latitude,
            position.coords.longitude
        );
        centerLocation.setLocation(position.coords.latitude, position.coords.longitude);
    }
    function callbackError(error) {
        alert('Unable to get current location. You can use the Set Center button to set map center.');
        var failSafeLocation = getFailSafeLocation();
        map.setCenter(new google.maps.LatLng(failSafeLocation.latitude, failSafeLocation.longitude));
        addMarker(map, infoWindow, markers,
            'Default location',
            'Default location',
            failSafeLocation.latitude,
            failSafeLocation.longitude
        );
        centerLocation.setLocation(failSafeLocation.latitude, failSafeLocation.longitude);
    }
}

function handleRadiusSearch(map, infoWindow, markers, searchCircle, centerLocation, searchRadius) {
    deleteMarkers(markers);
    if (centerLocation.isLocationSet()) {
        map.setCenter(new google.maps.LatLng(centerLocation.getLocation().latitude, centerLocation.getLocation().longitude));
        searchByRadius(map, infoWindow, markers, searchCircle, searchRadius);
    } else {
        alert('Map center is not available. You can use the Set Center button to set map center.');
    }
}

function disableFormClose() {
    $('.dropdown-menu').on('click', function (event) {
        var events = $._data(document, 'events') || {};
        events = events.click || [];
        for (var i = 0; i < events.length; i++) {
            if (events[i].selector) {
                //Check if the clicked element matches the event selector
                if ($(event.target).is(events[i].selector)) {
                    events[i].handler.call(event.target, event);
                }

                // Check if any of the clicked element parents matches the
                // delegated event selector (Emulating propagation)
                $(event.target).parents(events[i].selector).each(function () {
                    events[i].handler.call(this, event);
                });
            }
        }
        event.stopPropagation(); //Always stop propagation
    });
}

function disableFormSubmit(pageElements) {
    // form 1
    pageElements.radiusForm.onsubmit = function () { return false };
    pageElements.searchRadius.addEventListener('keyup', function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            pageElements.btnSearchRadius.click();
        }
    });

    // form 2
    pageElements.locationForm.onsubmit = function () { return false };

    // form 3
    pageElements.addressForm.onsubmit = function () { return false };
    pageElements.addressInput.addEventListener('keyup', function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            pageElements.btnSetCenter.click();
        }
    });
}

function setCenterManually(autocomplete, map, infoWindow, markers, centerLocation) {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
    } else {
        $('#testMsg').val(place.geometry.location);
        deleteMarkers(markers);
        map.setCenter(place.geometry.location);
        addMarker(map, infoWindow, markers,
            place.name,
            place.formatted_address,
            place.geometry.location.lat(),
            place.geometry.location.lng()
        );
        centerLocation.setLocation(place.geometry.location.lat(), place.geometry.location.lng())
    }
}

function getAutocompleteOptions() {
    var result = {
        componentRestrictions: { country: "au" }
    };
    return result;
}

function getMapProperties() {
    var result = {
        zoom: 14,
        scrollwheel: true,
        draggable: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_LEFT
        }
    };
    return result;
}

function getGeoOption() {
    return {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };
}

function callbackError(msg) {
    // placeholder
    if (msg.message.indexOf('Only secure origins are allowed') == 0) {
        alert('https');
    }
}

function deleteMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function searchByRadius(map, infoWindow, markers, searchCircle, searchRadius) {
    var resourceURL = '/api/location/searchbyradius';
    var serverURL = getServerUrl();

    var mapCenter = map.getCenter();
    var data = {
        'latitude': mapCenter.lat(),
        'longitude': mapCenter.lng(),
        'searchRadius': searchRadius
    };

    var callbackSuccess = function (data) {
        $.each(data, function (index, val) {
            addMarker(map, infoWindow, markers, val.title, val.description, val.latitude, val.longitude);
        });

        searchCircle.setOptions({
            clickable: false,
            strokeColor: '#FF0000',
            strokeOpacity: 0.1,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.1,
            map: map,
            center: mapCenter,
            radius: searchRadius * 1000
        });

        map.setZoom(getZoomValue(searchRadius));
    }

    callServer(serverURL + resourceURL, 'get', data, 'json', null, callbackSuccess, null);
}

function addMarker(map, infoWindow, markers, title, description, latitude, longitude) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map
    });

    google.maps.event.addListener(marker, 'click', (function (marker) {
        return function () {
            var currentLocationInfo =
                '<div>' +
                '<strong>' + title + '</strong>' +
                '<br>' +
                'Notes: ' + description +
                '<br>' +
                'Latitude: ' + latitude +
                '<br>' +
                'Longitude: ' + longitude +
                '</div>'
            infoWindow.setContent(currentLocationInfo);
            infoWindow.open(map, marker);
        }
    })(marker));

    markers.push(marker);
}