	
function displayItin(itinToDisplay) {
	var map = L.mapbox.map('venuesMap', 'examples.map-9ijuk24y').setView([40, -74.50], 9);
	pqresult.get(itinToDisplay, {
		success: function(itinObject) {
			$("h4#currItinTitle").text(itinObject.get("name"));
			var finalHTML = " ";
			var venues = itinObject.get("venues");
			var markerObject = { features: [] };
			if (venues != undefined) {
				for (var i=0; i<venues.length; i++) {
					$(".itin").append('<div class="panel panel-primary"><div class="panel-heading"><div class="row"><div class="col-md-6"><h3 class="panel-title">'+venues[i].name+'</h3></div><div class="col-md-6 text-right"><span class="event-btn glyphicon glyphicon-plus-sign"></span><span class="event-btn glyphicon glyphicon-minus-sign"></span><span class="event-btn glyphicon glyphicon-question-sign"></span></div></div></div><div class="panel-body"><span class="event-time pull-left">4:00pm - 6:00pm</span><br><p>'+venues[i].location.address+'</p></div></div>');					
					var currentMarkerObject = { type: 'Feature', geometry: { type: 'Point', coordinates: [venues[i].location.lat, venues[i].location.lng]} };
					markerObject.features.push(currentMarkerObject);
				}
				var markerLayer = L.mapbox.markerLayer(markerObject).addTo(map);
			}
	    }
	});
}

$(function () {



});