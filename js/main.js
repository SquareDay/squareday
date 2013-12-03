Parse.initialize("YSYKURfsGILaLBqVUnd1ViJqEL0FG05ng8qTI6OQ", "nGmU13RtnJqGIhrr5RQeHA6Th9wf23rc7tJwgw1J");
var Itineraries = Parse.Object.extend("Itineraries");

var pqresult = new Parse.Query(Itineraries);
	pqresult.find({
    	success:function(results) {
    		window.allItineraries = results;
    		generateItinUL(results);
    		window.currentItin = undefined;
    	}
	});

window.onload = function() {
	$("#venueName").keyup(function() {
		$("#venueMeta").hide();
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
		finalHTML = finalHTML + "<li id='"+results[i].id+"'>"+results[i]._serverData.name+"</li>"
	}
	$("#mySquaredays #auto").html(finalHTML);
	$("#mySquaredays #auto li").click(function() {
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
		finalHTML = finalHTML+'<a href="#"><li class="list-group-item" id="'+i+'"><span class="title">'+name+' </span><span class="location"> '+address+'</span></li></a>';
	}
	$("#venueList").html(finalHTML);
	$("#venueList li" ).click(function( event ) {
		$("#venueMeta").show();
		window.currentlySelectedVenueID = $(this).attr("id");
		var moreHTML = '<div class="input-append bootstrap-timepicker"><span>Start Time </span><input id="timepickerStart" type="text" class="input-small"><span class="add-on"><i class="icon-time"></i></span></div><div class="input-append bootstrap-timepicker"><span>End Time </span><input id="timepickerEnd" type="text" class="input-small"><span class="add-on"><i class="icon-time"></i></span></div><div class="input-group"><br /><input type="text" class="input-large" placeholder="Description" id="userDescription"></div><button type="button" class="btn btn-primary" id="sendVenue">Save</button>';
		$("#venueMeta").html(moreHTML);
		$('#timepickerStart').timepicker();
		$('#timepickerEnd').timepicker();
		$("#venueMeta button").click(function() {
			var currentVenue = theList.response.venues[window.currentlySelectedVenueID];
			var startTime = convertTimeStringToHours($("#timepickerStart").val());
			var endTime = convertTimeStringToHours($("#timepickerEnd").val());
			currentVenue.timeStart = $("#timepickerStart").val();
			currentVenue.timeEnd = $("#timepickerEnd").val();
			currentVenue.description = $("#userDescription").val();
			addVenue(currentVenue,window.currentItin);
			displayItin(window.currentItin);
		})
	});	
}

function convertTimeStringToHours(timeString) {
	if (timeString.split(" ")[1] == "PM") {
		var hoursToAdd = 12;
	} else {
		var hoursToAdd = 0;
	}
	if (timeString.split(":")[0] == "12") { hoursToAdd = hoursToAdd-12; }
	var hours = parseInt(timeString.split(":")[0])+hoursToAdd+(parseInt(timeString.split(":")[1])/60);
	return hours;
}