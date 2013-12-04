	
function displayItin(itinToDisplay) {
	pqresult.get(itinToDisplay, {
		success: function(itinObject) {
			$("#introHome").hide();
			$("#introAbout").hide();
			var finalHTML = '<div class="row"><div class="col-md-6"><h2>My '+itinObject.get("name")+' Itinerary</h2></div><div class="col-md-6"><div class="btn-toolbar"><button id="deleteItinButton" class="btn btn-primary btn-lg">Delete This Itinerary</button><button id="addNewButton" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#addNew">Add New Venue</button></div></div></div>';
			var venues = itinObject.get("venues");
			var markerObject = new Array();
			if (venues != undefined) {
				venues.sort(function(a,b){return Date.parse('05/08/1992 ' + a.timeStart) - Date.parse('05/08/1992 ' + b.timeStart)});
				for (var i=0; i<venues.length; i++) {
					fetchImage(venues[i].id); 
					finalHTML = finalHTML+'<div class="panel panel-primary"><div class="panel-heading"><div class="row"><div class="col-md-6"><h3 class="panel-title">'+venues[i].name+'</h3></div><div class="col-md-6 text-right"><span class="event-edit glyphicon glyphicon-pencil"></span></div></div></div><div class="panel-body"><span class="event-time pull-left">'+venues[i].timeStart+' - '+venues[i].timeEnd+'</span><span class="event-loc pull-right">'+venues[i].location.address+'</span><br><p>'+venues[i].description+'</p></div></div>';
					var currentMarkerObject = { type: 'Feature', geometry: { type: 'Point', coordinates: [venues[i].location.lng, venues[i].location.lat]}, properties: { title: venues[i].name } };
					markerObject.push(currentMarkerObject);
				}
				$(".itin").html(finalHTML);
				var markerLayer = L.mapbox.markerLayer(markerObject).addTo(map);
				window.map.setView([markerObject[0].geometry.coordinates[1],markerObject[0].geometry.coordinates[0]], 11)
			} else {
				$(".itin").html(finalHTML);
			}
			$("#addNewButton").animate({opacity:1},500);
			$("#deleteItinButton").animate({opacity:1},500);
			$("#venuesMap").animate({height:"300px"},500);
			$(".itin .glyphicon").click(function() { venueEdit($(this).attr("class")); });
		}
	});
}

$(function () {
	window.map = L.mapbox.map('venuesMap', 'nilkanthjp.gejogbbl');
});


function fetchImage(id) {
	fetchURL = 'https://api.foursquare.com/v2/venues/'+id+'/photos?client_id=YMIT5XO55EHGTOLS2Q3JOWUBBDCNJCFH2ZUFWQRPTDBI4HEE&client_secret=JXJEA205QBY2B34AKVD3EPTA0FLPPDPBUE4XXCSFIRLWWGPQ&v=20131125&limit=1'
	$.ajax({
		url: fetchURL,
		context: document.body
	}).done( function(thePhoto) {
		console.dir(thePhoto);
		//prefix + size(36x36) + suffix
	});
}