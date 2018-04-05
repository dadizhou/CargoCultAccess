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