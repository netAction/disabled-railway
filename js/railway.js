/*
	disabled railway
	2014 by Thomas netAction Schmidt
	https://github.com/netAction/disabled-railway
	MIT License
*/

// Global vars
var map;
var stationsForEveryone = L.layerGroup();
var stationsNoWheelchair = L.layerGroup();
var ajaxRequest;

function drawStations() {
	var bounds = map.getBounds();

	var query =
		'[out:json]\n'+
		'[timeout:5];\n'+
		'node\n'+
		'  ["railway"="station"]\n'+
		'  ('+
			bounds._southWest.lat+','+
			bounds._southWest.lng+','+
			bounds._northEast.lat+','+
			bounds._northEast.lng+
		');\n'+
		'out 1000;';

	var query =
		'https://www.overpass-api.de/api/interpreter?'+
		'data='+encodeURIComponent(query)+
		'&jsonp=?';

	if (ajaxRequest) {
		ajaxRequest.abort();
	}
	ajaxRequest = $.getJSON(query, function(data) {
		ajaxRequest = false;
		stationsForEveryone.clearLayers();
		stationsNoWheelchair.clearLayers();

		$.each(data.elements,function() {
			if (this.tags.wheelchair == "yes") {
				var list = stationsForEveryone;
				var color = 'blue';
			} else if (this.tags.wheelchair == "no") {
				var list = stationsNoWheelchair;
				var color = 'blue';
			} else if (this.tags.wheelchair == "limited") {
				var list = stationsNoWheelchair;
				var color = 'blue';
			} else { // unknown
				var list = stationsForEveryone;
				var color = 'gray';
			}
			L.circle([this.lat, this.lon], 1)
				.bindPopup(this.tags.name)
				.setStyle({stroke:0,color:color})
				.addTo(list)
				.setRadius(500); // 500m
		});

		if (!data.elements.length) {
			console.log("Please zoom in.");
		}
	});
} // drawStations


function initMap() {
	map = L
		.map('map',{
			zoomControl:false,
			layers: [stationsForEveryone,stationsNoWheelchair]
		})
			.setView([52.52,13.41], 12);
	map.attributionControl.setPrefix("");
	// Black White map
	L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png', {
			attribution: '',
			maxZoom: 15,
			minZoom:4
	}).addTo(map);

	// Trigger station overlay.
	// A better solution might be https://gist.github.com/pkorac/5287314
	map.on('moveend', function() {
		drawStations();
	});
	drawStations();
} // initMap
initMap();


$('#pedbutton').click(function() {
	if (map.hasLayer(stationsNoWheelchair)==false) {
		map.addLayer(stationsNoWheelchair);
	}
	$('#wheelbutton').removeClass('active');
});
$('#wheelbutton').click(function() {
	if (map.hasLayer(stationsNoWheelchair)) {
		map.removeLayer(stationsNoWheelchair);
	}
	$('#wheelbutton').addClass('active');
});

