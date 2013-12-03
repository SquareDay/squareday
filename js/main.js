Parse.initialize("YSYKURfsGILaLBqVUnd1ViJqEL0FG05ng8qTI6OQ", "nGmU13RtnJqGIhrr5RQeHA6Th9wf23rc7tJwgw1J");
var Itineraries = Parse.Object.extend("Itineraries");

var pqresult = new Parse.Query(Itineraries);
	pqresult.find({
    	success:function(results) {
    		window.allItineraries = results;
    		generateItinUL(results);
    		window.currentItin = window.allItineraries[0].id;
    	}
	});

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

function addVenue(venue,itinToAddTo) {
	pqresult.get(itinToAddTo, {
		success: function(itinObject) {
			var currentVenues = itinObject.get("venues");
	    	itinObject.save(null, {
				success: function(itinObject) {
					if (currentVenues == undefined) {
						itinObject.set("venues", [venue]);
						itinObject.save();
					} else {
						currentVenues.push(venue);
						itinObject.set("venues", currentVenues);
						itinObject.save();	
					}
				}
			});
		}
  	});
}

function generateItinUL(results) {
	finalHTML = "";
	for (var i=0; i<results.length; i++) {
		finalHTML = finalHTML + "<li id='"+results[i].id+"'><a>"+results[i]._serverData.name+"</a></li>"
	}
	$("#mySquaredays ul").html(finalHTML);
	$("#mySquaredays ul li").click(function() {
		window.currentItin = $(this).attr("id");
		displayItin(window.currentItin);
	})
}

function displayVenues(theList) {
	$("#venueList").html("<img width='20' src='./css/img/ajax_loader.gif' />");
	var finalHTML = "";
	for (var i=0; i<theList.response.venues.length; i++) {
		if (theList.response.venues[i].location.address != undefined && theList.response.venues[i].location.city != undefined && theList.response.venues[i].location.state != undefined) {
			var address = theList.response.venues[i].location.address+". "+theList.response.venues[i].location.city+", "+theList.response.venues[i].location.state;
		} else {
			var address = "";
		}
		var name = theList.response.venues[i].name;
		finalHTML = finalHTML+'<a href="#"><li class="list-group-item"><span class="title">'+name+' </span><span class="location"> '+address+'</span></li></a>';
	}
	$("#venueList").html(finalHTML);
}
