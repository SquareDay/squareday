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
	window.markers = new Array(); // Variable to later store markers of venues in.
	
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
	
	$("#help").click(function() {
		changeMenu('help');
	});
	
	// This is the function run when a new itinerary is to be added to SquareDay, i.e. when its name is typed in the box.
	$("#addNewItinButton").click(function() {
		
		var itinerary = new Itineraries();
		window.itineraryName = $("#addNewItin #itinName").val();
		itinerary.set("name", window.itineraryName);
		itinerary.save({
			success: function() {
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
			}
		});
	});
	
	// This function runs when the edit button is clicked on the "edit venue" modal dialog
	$("#editVenue button").click(function() {
		editVenueMeta(window.theId);
	})
	
	// This function is run when the rename button is clicked on the "rename itin" modal dialog
	$("#renameItinButton").click(function() {
		pqresult.get(window.currentItin, {
			success: function(itinObject) {
				itinObject.set("name", $("#itinRename").val());
				itinObject.save({ success: function() { 
					pqresult = new Parse.Query(Itineraries);
					pqresult.find({
						success:function(results) {
							window.allItineraries = results;
							generateItinUL(results);
							$('#rename').modal('hide');
							displayItin(window.currentItin);
						}
					}); 
				} });
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
	$("#introHome, #introAbout, #introHelp").css("display","none");
	$("#intro"+dest.charAt(0).toUpperCase()+dest.slice(1)).css("display","block");
	$("#home").removeClass("active");
	$("#about").removeClass("active");
	$("#help").removeClass("active");
	$("#mySquaredays").removeClass("active");
	$("#"+dest).addClass("active");
	$(".itin").html("");
	if(dest !== 'home') {
		$("#menu-bar-items").removeClass("hide");
	}
	if(dest == 'home') {
		$("#menu-bar-items").addClass("hide");
	}
}


// This function generates a URL to use to query the FourSquare API and does so using the client ID. Again, in a real app, this would be done server-side.
function fetchVenues(query,location) {
	fetchURL = 'https://api.foursquare.com/v2/venues/search?query='+query+'&near='+location+'&limit=5&client_id=YMIT5XO55EHGTOLS2Q3JOWUBBDCNJCFH2ZUFWQRPTDBI4HEE&client_secret=JXJEA205QBY2B34AKVD3EPTA0FLPPDPBUE4XXCSFIRLWWGPQ&v=20131125'
	$.ajax({
		url: fetchURL,
		context: document.body
	}).done( function(theList) {
		displayVenues(theList);
	}).error( function() {
		$("#venueList").html('No matching venues were found on FourSquare... Try searching again.');
	});
}

// This function is run to add another venue to the currently displayed itinerary.
function addVenue(venue,itinToAddTo) {
	pqresult.get(itinToAddTo, {
		success: function(itinObject) {
			var currentVenues = itinObject.get("venues");
			if (currentVenues == undefined) {
				itinObject.set("venues", [venue]);
				itinObject.save({ success: function() { displayItin(window.currentItin); $('#addNew').modal('hide'); } });
			} else {
				currentVenues.push(venue);
				itinObject.set("venues", currentVenues);
				itinObject.save({ success: function() { displayItin(window.currentItin); $('#addNew').modal('hide'); } });
			}
		}
	});
}

// This function uses the Parse query and translates that array into an unordered list for the navbar. It then edits the navbar ul's HTML accordingly.
function generateItinUL(results) {
	finalHTML = "";
	for (var i=0; i<results.length; i++) {
		finalHTML = finalHTML + "<li id='"+results[i].id+"'>"+results[i]._serverData.name+"</li>"
	}
	$(".auto").html(finalHTML);
	$(".auto li").click(function() {
		window.currentItin = $(this).attr("id");
		$("#home").removeClass("active");
		$("#about").removeClass("active");
		$("#mySquaredays").addClass("active");
		displayItin(window.currentItin);
	})
}

// This function sets the times for when a venue needs to be edited so that they are always the current time for the venue.
function venueEdit(classes,start,end,description,theId) {
	var currFunction = classes.split(" ")[2].split("-")[1];
	$('#editVenue #timepickerStart').timepicker({
		// template: 'modal',
		defaultTime: start
	});
	$('#editVenue #timepickerEnd').timepicker({
		// template: 'modal',
		defaultTime: end
	});
	window.theId = theId;
	$("#editVenue #userDescription").val(description);
	if (currFunction == "remove") {
		window.currentVenues.splice(theId,1);
		pqresult.get(window.currentItin, {
			success: function(itinObject) {
				itinObject.set("venues", window.currentVenues);
				itinObject.save({ success: function() { displayItin(window.currentItin) } });
			}
		});
	}
}

// This function is called when the user attempts to edit a venue's time and description.
function editVenueMeta(theId) {
	var currentVenue = window.currentVenues[theId];
	var startTime = convertTimeStringToHours($("#editVenue #timepickerStart").val());
	var endTime = convertTimeStringToHours($("#editVenue #timepickerEnd").val());
	currentVenue.timeStart = $("#editVenue #timepickerStart").val();
	currentVenue.timeEnd = $("#editVenue #timepickerEnd").val();
	currentVenue.description = $("#editVenue #userDescription").val();
	
	window.currentVenues.splice(theId,1,currentVenue)
	console.log(window.currentVenues);
	pqresult.get(window.currentItin, {
		success: function(itinObject) {
			itinObject.set("venues", window.currentVenues);
			itinObject.save({ success: function() { displayItin(window.currentItin) } });
		}
	});
	
	$('#editVenue').modal('hide');
}

// This function generates the HTML for the venues that result while the user is searching. It then updates theHTML to the modal on the fly.
function displayVenues(theList) {
	$("#venueList").html("<img width='20' src='./css/img/ajax_loader.gif' />");
	var finalHTML = "";
	if(theList.response.venues.length < 1){
		finalHTML = finalHTML+'No matching venues were found on FourSquare... Try searching again.'
	}
	for (var i=0; i<theList.response.venues.length; i++) {
		if (theList.response.venues[i].location.address != undefined && theList.response.venues[i].location.city != undefined && theList.response.venues[i].location.state != undefined) {
			var address = theList.response.venues[i].location.address+". "+theList.response.venues[i].location.city+", "+theList.response.venues[i].location.state;
		} else {
			var address = "http://upload.wikimedia.org/wikipedia/commons/0/03/WhitePixel45w.jpg";
		}
		var name = theList.response.venues[i].name;
		finalHTML = finalHTML+'<a href="#"><li class="list-group-item" id="'+i+'"><span class="title">'+name+' </span><span class="location"> '+address+'</span></li></a>';
	}
	$("#venueList").html(finalHTML);
	$("#venueList li" ).click(function( event ) {
		$("#venueMeta").show();
		window.currentlySelectedVenueID = $(this).attr("id");
		var moreHTML = '<div class="input-group bootstrap-timepicker"><input type="text" class="form-control" id="timepickerStart"><span class="input-group-addon">to</span><input type="text" class="form-control" id="timepickerEnd"></div><div class="input-group"><br /><textarea class="input-large" placeholder="Description" rows="3" id="userDescription"></textarea></div><div class="input-group"><button type="button" class="btn btn-primary pull-right" id="sendVenue">Save</button></div>';
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
			
			// We have to make another FourSquare API call to get the venue's image
			imageFetchURL = 'https://api.foursquare.com/v2/venues/'+currentVenue.id+'/photos?client_id=YMIT5XO55EHGTOLS2Q3JOWUBBDCNJCFH2ZUFWQRPTDBI4HEE&client_secret=JXJEA205QBY2B34AKVD3EPTA0FLPPDPBUE4XXCSFIRLWWGPQ&v=20131125&limit=1'
			$.ajax({
				url: imageFetchURL
			}).done( function(thePhoto) {
				try {
					currentVenue.image = thePhoto.response.photos.items[0].prefix+"200x200"+thePhoto.response.photos.items[0].suffix;
				} catch(err) {
					currentVenue.image = thePhoto.response.photos.items[0].prefix+"200x200"+thePhoto.response.photos.items[0].suffix;
				}
				addVenue(currentVenue,window.currentItin);
			});
			
		})
});	
}

// This function launches when one of the SquareDay Itineraries is clicked. It generates HTML for that itinerary and plots its venues as markers on the map.
function displayItin(itinToDisplay) {
	$("#menu-bar-items").removeClass("hide");
	pqresult.get(itinToDisplay, {
		success: function(itinObject) {
			window.map.markerLayer.setFilter(function(f) {
            	return f.properties['alt'] === itinToDisplay;
			});
			$("#introHome, #introAbout, #introHelp").hide();
			var finalHTML = '<div class="row"><div class="col-md-6"><h2>'+itinObject.get("name")+' SquareDay</h2></div><div class="col-md-6"><div class="btn-toolbar"><button id="addNewButton" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#addNew">Add New Venue</button><button id="renameItinButton" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#rename">Rename</button><button id="deleteItinButton" class="btn btn-primary btn-lg">Delete</button></div></div></div>';
			window.currentVenues = itinObject.get("venues");
			var startTimes = new Array();
			var endTimes = new Array();
			var descriptions = new Array();
			if (window.currentVenues != undefined) {
				window.currentVenues.sort(function(a,b){return Date.parse('05/08/1992 ' + a.timeStart) - Date.parse('05/08/1992 ' + b.timeStart)});
				for (var i=0; i<window.currentVenues.length; i++) {
					finalHTML = finalHTML+'<div class="panel panel-primary col-md-10"><div class="panel-heading"><div class="row"><div class="col-md-6"><h3 class="panel-title">'+window.currentVenues[i].name+'</h3></div><div class="col-md-6 text-right"><span class="event-edit glyphicon glyphicon-pencil" id="'+i+'" data-toggle="modal" data-target="#editVenue"></span><span class="event-edit glyphicon glyphicon-remove" id="'+i+'"></span></div></div></div><div class="panel-body"><span class="event-time pull-left">'+window.currentVenues[i].timeStart+' - '+window.currentVenues[i].timeEnd+'</span><span class="event-loc pull-right">'+window.currentVenues[i].location.address+". "+window.currentVenues[i].location.city+", "+window.currentVenues[i].location.state+'</span><br><p>'+window.currentVenues[i].description+'</p></div></div><div class="col-md-2"><img class="event-img" src="'+window.currentVenues[i].image+'" /></div>';
					startTimes.push(window.currentVenues[i].timeStart);
					endTimes.push(window.currentVenues[i].timeEnd);
					descriptions.push(window.currentVenues[i].description);
					var currentMarkerObject = { type: 'Feature', geometry: { type: 'Point', coordinates: [window.currentVenues[i].location.lng, window.currentVenues[i].location.lat]}, properties: { title: window.currentVenues[i].name, alt: itinToDisplay } };
					window.markers.push(currentMarkerObject);
				}
				$(".itin").html(finalHTML);
				var markerLayer = L.mapbox.markerLayer(window.markers).addTo(map); // Adds markers to the map.
				window.map.setView([window.markers[0].geometry.coordinates[1]-.2,window.markers[0].geometry.coordinates[0]+.2], 10) // Centers map on the first marker.
			} else {
				$(".itin").html(finalHTML);
			}
			$("#venuesMap").animate({height:"300px"},500);
			$(".itin .glyphicon").click(function() { venueEdit($(this).attr("class"),startTimes[$(this).attr("id")],endTimes[$(this).attr("id")],descriptions[$(this).attr("id")],$(this).attr("id")); });
			
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

function removeMarkers() {
	for (var i=0; i<window.markers.length; i++) {
		map.removeLayer(window.markers[i]);
	}
	window.markers = new Array;
}
