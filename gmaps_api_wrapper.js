/**
 * Created by Manas on 23-03-2015.
 */

function GoogleMapsApiWrapper(centerLocation, zoomLevel, mapContainer) {
    var config = {
        map: null,
        directionsRenderer: null,
        directionsService: null,
        markers: [],
        markerIcons: {
            purple: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/purple-dot.png",
            yellow: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png",
            blue: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png",
            green: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png",
            red: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png",
            orange: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/orange-dot.png"
        },
        travelModes: {
            walking: google.maps.TravelMode.WALKING,
            driving: google.maps.TravelMode.DRIVING,
            bicycling: google.maps.TravelMode.BICYCLING
        }
    };

    // self invoking initialization method
    var init = function () {
        // setup map
        var options = {
            zoom: zoomLevel,
            center: new google.maps.LatLng(centerLocation["lat"], centerLocation["lng"]),
            mapTypeControl: false
        };
        config.map = new google.maps.Map(mapContainer, options);

        // setup directions renderer which will draw routes on map
        config.directionsRenderer = new google.maps.DirectionsRenderer();
        config.directionsRenderer.setOptions({suppressMarkers: true, preserveViewport: true});
        config.directionsRenderer.setMap(config.map);

        // setup directions service which will retrieve the required route
        config.directionsService = new google.maps.DirectionsService();
    }();

    this.addMarker = function (location, infoWindowContent, shouldOpenInfoWindowInitially, markerIcon, markerId, doubleClickCallback) {
        var infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(location["lat"], location["lng"]),
            map: config.map,
            icon: new google.maps.MarkerImage(config.markerIcons[markerIcon] || config.markerIcons.red)
        });
        marker.setMap(config.map);

        // add id property to each marker so that it can easily be recognized later
        marker.id = markerId;

        // add remove method to marker
        marker.remove = function () {
            marker.setMap(null);
        };

        //show info window when marker is clicked
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(config.map, marker);
        });

        if (shouldOpenInfoWindowInitially) {
            // initially show info window
            infoWindow.open(config.map, marker);
        }

        // handle double click using the callback provided
        if (doubleClickCallback != undefined) {
            google.maps.event.addListener(marker, 'dblclick', doubleClickCallback);
        }

        // keep marker reference for later use
        config.markers.push(marker);

    };

    this.addRoute = function (origin, destination, travelMode) {
        var request = {
            origin: new google.maps.LatLng(origin["lat"], origin["lng"]),
            destination: new google.maps.LatLng(destination["lat"], destination["lng"]),
            travelMode: config.travelModes[travelMode] || config.travelModes.walking
        };

        config.directionsService.route(request, function (res, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                config.directionsRenderer.setDirections(res);
            } else {
                console.log("Error occurred while adding route: " + status);
            }
        });
    };

    this.clearRoutes = function () {
        config.directionsRenderer.setDirections({routes: []});
    };

    this.clearMarkers = function () {
        for (var i=0; i<config.markers.length; i++) {
            config.markers[i].setMap(null);
        }
    };

    this.getMarkers = function () {
        return config.markers;
    }
}