	
function displayItin(itinToDisplay) {
	$("#venuesMap").show(function() {
		$(this).animate({opacity:1},500)
	});
	pqresult.get(itinToDisplay, {
		success: function(itinObject) {
			$("h4#currItinTitle").text(itinObject.get("name"));
			var finalHTML = " ";
			var venues = itinObject.get("venues");
			var markerObject = new Array();
			if (venues != undefined) {
				for (var i=0; i<venues.length; i++) {
					$(".itin").append('<div class="panel panel-primary"><div class="panel-heading"><div class="row"><div class="col-md-6"><h3 class="panel-title">'+venues[i].name+'</h3></div><div class="col-md-6 text-right"><span class="event-btn glyphicon glyphicon-plus-sign"></span><span class="event-btn glyphicon glyphicon-minus-sign"></span><span class="event-btn glyphicon glyphicon-question-sign"></span></div></div></div><div class="panel-body"><span class="event-time pull-left">4:00pm - 6:00pm</span><br><p>'+venues[i].location.address+'</p></div></div>');					
					var currentMarkerObject = { type: 'Feature', geometry: { type: 'Point', coordinates: [venues[i].location.lng, venues[i].location.lat]}, properties: { title: venues[i].name } };
					markerObject.push(currentMarkerObject);
				}
				console.log(markerObject);
				var markerLayer = L.mapbox.markerLayer(markerObject).addTo(map);
			}
			window.map.setView([markerObject[0].geometry.coordinates[1],markerObject[0].geometry.coordinates[0]], 13)
	    }
	});
}

$(function () {
	window.map = L.mapbox.map('venuesMap', 'nilkanthjp.gejogbbl');
});