window.onload = function() {
	$("#venueName").change(function() {
		var query = $("#venueName").val();
		var location = $("#venueLocation").val();
		fetchVenues(query,location);
	});
}

function fetchVenues(query,location) {
	fetchURL = 'https://api.foursquare.com/v2/venues/search?query='+query+'&near='+location+'&limit=5&client_id=YMIT5XO55EHGTOLS2Q3JOWUBBDCNJCFH2ZUFWQRPTDBI4HEE&client_secret=JXJEA205QBY2B34AKVD3EPTA0FLPPDPBUE4XXCSFIRLWWGPQ&v=20131125'
	$.ajax({
		  url: fetchURL,
		  context: document.body
	}).done( function(theList) {
		displayVenues(theList);
	});
}

function displayVenues(theList) {
	var finalHTML = "";
	for (var i=0; i<theList.response.venues.length; i++) {
		var address = theList.response.venues[i].location.address;
		var name = theList.response.venues[i].name;
		finalHTML = finalHTML+'<li><span class="title">'+name+' </span><span class="location">AT '+address+'</span></li>';
	}
	$("#venueList").html(finalHTML);
}
