// We use a third-party application called "Parse" to store itinerary data in the cloud. These first couple lines establish a connection to our Parse account with our secure credentials. If this were a real app, this would be done on the backend for security reasons.
Parse.initialize("YSYKURfsGILaLBqVUnd1ViJqEL0FG05ng8qTI6OQ", "nGmU13RtnJqGIhrr5RQeHA6Th9wf23rc7tJwgw1J");

// Now, we're going to access our Parse database in the cloud and pull it into a variable called Itineraries.
var Itineraries = Parse.Object.extend("Itineraries");

// Next we're going to query the database to see how many rows there are. Each row represents a single itinerary. This query will be reused several times in the app.
var pqresult = new Parse.Query(Itineraries);
	pqresult.find({
    	success:function(results) {
    		window.allItineraries = results;
    		generateItinUL(results);
    		window.currentItin = undefined;
    	}
	});

// When the DOM is finished loading, we have a bunch of functions that need to run.
window.onload = function() {
	
	// First, this is a call to the Mapbox API to load the map in the background.
	window.map = L.mapbox.map('venuesMap', 'nilkanthjp.gejogbbl');
	
	// This is a jquery command that runs every time another key is typed in the venue search box.
	$("#venueName").keyup(function() {
		$("#venueMeta").hide();
		var query = $("#venueName").val();
		var location = $("#venueLocation").val();
		fetchVenues(query,location); // This function, which is defined later, takes the inputs of the text areas and performs a query using the FourSquare API.
	});
	
	// The next two functions are for the navbar to switch between content.
	$("#home").click(function() {
		changeMenu('home');
	});
	$("#about").click(function() {
		changeMenu('about');
	});
	
	// This is the function run when a new itinerary is to be added to SquareDay, i.e. when its name is typed in the box.
	$("#addNewItinButton").click(function() {
		var itinerary = new Itineraries();
		window.itineraryName = $("#addNewItin #itinName").val();
		itinerary.set("name", window.itineraryName);
		itinerary.save(null);
		pqresult = new Parse.Query(Itineraries);
		pqresult.find({
    		success:function(results) {
    			window.allItineraries = results;
    			generateItinUL(results);
    			$('#addNewItin').modal('hide');
    			var justAddedItin = findItinId(window.itineraryName,results);
    			displayItin(justAddedItin);
    		}
		});
	});
}

// This function searches through all the itineraries in Parse and finds the Parse ID for the one with the inputted name
function findItinId(name,results) {
	for (var i=0; i<results.length; i++) {
		if (name == results[i]._serverData.name) {
			return results[i].id;
			i = results.length;
		}
	}
}

// This is the function called earlier when something in the navbar is clicked to change the content.
function changeMenu(dest) {
	$("#venuesMap").animate({height:"105%"},500);
	$("#introHome, #introAbout").css("display","none");
	$("#intro"+dest.charAt(0).toUpperCase()+dest.slice(1)).css("display","block");
	$("#home").removeClass("active");
	$("#about").removeClass("active");
	$("#mySquaredays").removeClass("active");
	$("#"+dest).addClass("active");
	$(".itin").html("");
	$("#addNewButton, #deleteItinButton").animate({opacity:0},500);
}

// This function generates a URL to use to query the FourSquare API and does so using the client ID. Again, in a real app, this would be done server-side.
function fetchVenues(query,location) {
	fetchURL = 'https://api.foursquare.com/v2/venues/search?query='+query+'&near='+location+'&limit=5&client_id=YMIT5XO55EHGTOLS2Q3JOWUBBDCNJCFH2ZUFWQRPTDBI4HEE&client_secret=JXJEA205QBY2B34AKVD3EPTA0FLPPDPBUE4XXCSFIRLWWGPQ&v=20131125'
	$.ajax({
		  url: fetchURL,
		  context: document.body
	}).done( function(theList) {
		displayVenues(theList);
	});
}

// This function is run to add another venue to the currently displayed itinerary.
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
					displayItin(window.currentItin);
				}
			});
		}
  	});
}

// This function uses the Parse query and translates that array into an unordered list for the navbar. It then edits the navbar ul's HTML accordingly.
function generateItinUL(results) {
	finalHTML = "";
	for (var i=0; i<results.length; i++) {
		finalHTML = finalHTML + "<li id='"+results[i].id+"'>"+results[i]._serverData.name+"</li>"
	}
	$("#mySquaredays #auto").html(finalHTML);
	$("#mySquaredays #auto li").click(function() {
		window.currentItin = $(this).attr("id");
		$("#home").removeClass("active");
		$("#about").removeClass("active");
		$("#mySquaredays").addClass("active");
		displayItin(window.currentItin);
	})
}

// This function sets the times for when a venue needs to be edited so that they are always the current time for the venue.
function venueEdit(classes,start,end) {
	var currFunction = classes.split(" ")[2].split("-")[1];
	$('#timepickerStart').timepicker({
		template: 'modal',
		defaultTime: start
	});
	$('#timepickerEnd').timepicker({
		template: 'modal',
		defaultTime: end
	});
}

// This function generates the HTML for the venues that result while the user is searching. It then updates theHTML to the modal on the fly.
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
			$('#addNew').modal('hide');
		})
	});	
}

// This function launches when one of the SquareDay Itineraries is clicked. It generates HTML for that itinerary and plots its venues as markers on the map.
function displayItin(itinToDisplay) {
	pqresult.get(itinToDisplay, {
		success: function(itinObject) {
			window.map.markerLayer.eachLayer(  
   				function(l) { map.markerLayer.removeLayer(l); } // This deletes all markers currently on the map.
			);
			$("#introHome").hide();
			$("#introAbout").hide();
			var finalHTML = '<div class="row"><div class="col-md-6"><h2>My '+itinObject.get("name")+' Itinerary</h2></div><div class="col-md-6"><div class="btn-toolbar"><button id="deleteItinButton" class="btn btn-primary btn-lg">Delete This Itinerary</button><button id="addNewButton" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#addNew">Add New Venue</button></div></div></div>';
			var venues = itinObject.get("venues");
			var markerObject = new Array();
			var startTimes = new Array();
			var endTimes = new Array();
			if (venues != undefined) {
				venues.sort(function(a,b){return Date.parse('05/08/1992 ' + a.timeStart) - Date.parse('05/08/1992 ' + b.timeStart)});
				for (var i=0; i<venues.length; i++) {
					fetchImage(venues[i].id); 
					finalHTML = finalHTML+'<div class="panel panel-primary"><div class="panel-heading"><div class="row"><div class="col-md-6"><h3 class="panel-title">'+venues[i].name+'</h3></div><div class="col-md-6 text-right"><span class="event-edit glyphicon glyphicon-pencil" id="'+i+'" data-toggle="modal" data-target="#editVenue"></span></div></div></div><div class="panel-body"><span class="event-time pull-left">'+venues[i].timeStart+' - '+venues[i].timeEnd+'</span><span class="event-loc pull-right">'+venues[i].location.address+'</span><br><p>'+venues[i].description+'</p></div></div>';
					startTimes.push(venues[i].timeStart);
					endTimes.push(venues[i].timeEnd);
					var currentMarkerObject = { type: 'Feature', geometry: { type: 'Point', coordinates: [venues[i].location.lng, venues[i].location.lat]}, properties: { title: venues[i].name } };
					markerObject.push(currentMarkerObject);
				}
				$(".itin").html(finalHTML);
				var markerLayer = L.mapbox.markerLayer(markerObject).addTo(map); // Adds markers to the map.
				window.map.setView([markerObject[0].geometry.coordinates[1],markerObject[0].geometry.coordinates[0]], 11) // Centers map on the first marker.
			} else {
				$(".itin").html(finalHTML);
			}
			$("#addNewButton").animate({opacity:1},500);
			$("#deleteItinButton").animate({opacity:1},500);
			$("#venuesMap").animate({height:"300px"},500);
			$(".itin .glyphicon").click(function() { venueEdit($(this).attr("class"),startTimes[$(this).attr("id")],endTimes[$(this).attr("id")]); });
			
			// This is the button that deletes the itinerary entirely from the app.
			$("#deleteItinButton").click(function() {
				pqresult.get(window.currentItin, {
				success: function(itinObject) {
					itinObject.destroy(); // This is the Parse call that destroys the current itinerary.
					changeMenu('home');
					pqresult = new Parse.Query(Itineraries);
					pqresult.find({
    					success:function(results) {
    						window.allItineraries = results;
    						generateItinUL(results);
    						$('#addNewItin').modal('hide');
    					}
					});
	   			}
			});
		});
		}
	});
}

// The following are utility functions we wrote for our own use.
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