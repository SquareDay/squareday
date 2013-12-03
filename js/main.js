Parse.initialize("YSYKURfsGILaLBqVUnd1ViJqEL0FG05ng8qTI6OQ", "nGmU13RtnJqGIhrr5RQeHA6Th9wf23rc7tJwgw1J");
var Itineraries = Parse.Object.extend("Itineraries");

var query = new Parse.Query(Itineraries);
	query.find({
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
	query.get(itinToAddTo, {
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
		finalHTML = finalHTML + "<h4 id='"+results[i].id+"'>"+results[i]._serverData.name+"</h4>"
	}
	$("#itinList").html(finalHTML);
	$("#itinList h4").click(function() {
		window.currentItin = $(this).attr("id");
		displayItin(window.currentItin);
	})
}

function displayItin(itinToDisplay) {
	query.get(itinToDisplay, {
		success: function(itinObject) {
	    	$("h4#currItinTitle").text(itinObject.get("name"));
	    	var finalHTML = " ";
	    	var venues = itinObject.get("venues");
	    	if (venues != undefined) {
		    	for (var i=0; i<venues.length; i++) {
		    	finalHTML = finalHTML+'<a href="#"><li class="list-group-item"><span class="title">'+venues[i].name+' </span>testt<span class="location"> '+venues[i].location.address+'</span></li></a>';
				}
	    	}
	    	$("ul#currItin").html(finalHTML);
		}
  	});
}

function displayVenues(theList) {
	$("#venueList").html("<img width='20' src='./css/img/ajax_loader.gif' />");
	var finalHTML = "";
	for (var i=0; i<theList.response.venues.length; i++) {
		var address = theList.response.venues[i].location.address;
		var name = theList.response.venues[i].name;
		finalHTML = finalHTML+'<a href="#"><li class="list-group-item"><span class="title">'+name+' </span><span class="location"> '+address+'</span></li></a>';
	}
	$("#venueList").html(finalHTML);
}
