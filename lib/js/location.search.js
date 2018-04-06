function getPageElements() {
    var result = {};
    result.btnSearchRadius = document.getElementById('btnSearchRadius');
    result.searchRadius = document.getElementById('searchRadius');
    result.googleMap = document.getElementById('googleMap');
    result.mapControls = document.getElementById('mapControls');

    result.mapControls.mapForm = document.getElementById('mapForm');
    result.mapControls.mapForm.locationName = document.getElementById('locationName');
    result.mapControls.mapForm.locationDescription = document.getElementById('locationDescription');
    result.mapControls.mapForm.locationLatitude = document.getElementById('locationLatitude');
    result.mapControls.mapForm.locationLongitude = document.getElementById('locationLongitude');
    result.mapControls.mapForm.btnSaveLocation = document.getElementById('btnSaveLocation');
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