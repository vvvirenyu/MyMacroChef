var map;
var direction;
var markers = [];
var stepIndex = 0;
var AWS;
var stream_name;
var orig_geocode = {"lat":40.66025310000001,"lng":-73.99813139999998};
var dest_geocode;
var autoDriveSteps = new Array();
var speedFactor = 40;
var apigClient;
var userid;

$( document ).ready(function() {
	if (window.localStorage.getItem('access-token')==null || window.localStorage.getItem('access-token')=='null')
		window.location = "signout.html";
	stream_name = 'location-stream';
	var credentials = new AWS.Credentials();
	credentials.accessKeyId = 'accessKey';
	credentials.secretAccessKey = 'secretKey';
	AWS.config.region = 'us-east-1';
	AWS.config.credentials = credentials;
    console.log( "ready!" );
	populateUsers();
	if($('#map').css('display') == 'block')
	{
		   google.maps.event.trigger(map, 'resize');                
	}
	
	$('#update-button').on('click', function() {
		$('#loading').show();
		var params = {username : userid, user_id : userid};
		var body = {
			"user_id" : $('#user option:selected').attr('user_id'),
			"meal_type" : $('#mealtype').val()
		}
		apigClient.driverPost(params, body)
		.then(function (result) {
		  var dest_add = result.data.body.slice(1, -2);
		  console.log(dest_add);
		  setAnimatedRoute(dest_add);
		}).catch(function (result) {
		  alert('Permission Denied')
		  console.log(result);
		  console.log("Something went wrong!");
		});
	});
	
});

function populateUsers() {
	apigClient = apigClientFactory.newClient({
        accessKey: 'accessKey',
        secretKey: 'secretKey',
      });
    var body = {
        key : "Hello"
    };
	userid = window.localStorage.getItem('userid');
     var params = {user_name : userid, user_id:userid};
      var additionalParams = {headers: {
      'Content-Type':"application/json"
    }};
	apigClient.driverGet(params, body)
        .then(function (result) {
          console.log(result);
		  var users = result.data.users;
			let dropdown = document.getElementById('user');
			let option;
			for (let i = 0; i < users.length; i++) {
			  option = document.createElement('option');
			  option.text = (users[i]['first_name']+" "+users[i]['last_name']);
			  option.setAttribute('data-tokens', (users[i]['first_name']+" "+users[i]['last_name']));
			  option.setAttribute('user_id', users[i]['user_id'])
			  dropdown.add(option);
			}
			$('.selectpicker').selectpicker('refresh');
			$('#loading').hide();
        }).catch(function (result) {
          alert('Permission Denied')
          console.log(result);
          console.log("Something went wrong!");
        });
}

function setAnimatedRoute(dest_add) {
	var geocoder = new google.maps.Geocoder();
	if (geocoder) {
		geocoder.geocode({'address':dest_add}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var temp = results[0].geometry.location;
				dest_geocode = {"lat" : temp.lat(), "lng" : temp.lng()};
				//dest_geocode = {"lat":40.6949022,"lng":-73.98565630000002};
				var dest_resp = dest_geocode.lat+","+dest_geocode.lng;
				
				removeDirections();
				removeMarkers();
				map.setCenter(new google.maps.LatLng(orig_geocode["lat"], orig_geocode["lng"]));
				var marker = new google.maps.Marker({
					map: map,
					position: orig_geocode,
					title: 'Source Location',
					icon: {
							url: "../IMG/origin.png",
							scaledSize: new google.maps.Size(55, 55)
						}
				});
				markers.push(marker);
				var marker = new google.maps.Marker({
					map: map,
					position: orig_geocode,
					title: 'Current location',
					icon: {
							url: "../IMG/car.png",
							scaledSize: new google.maps.Size(55, 55)
						}
				});
				markers.push(marker);
				var marker = new google.maps.Marker({
					map: map,
					position: dest_geocode,
					title: 'Destination Location',
					icon: {
							url: "../IMG/dest.png",
							scaledSize: new google.maps.Size(55, 55)
						}
				});
				markers.push(marker);
				var directionsService = new google.maps.DirectionsService;
				var directionsDisplay = new google.maps.DirectionsRenderer({
					polylineOptions: {
					  strokeColor: "#ed6f2b"
					}
				  });
				var directionsService = new google.maps.DirectionsService;
				var directionsRenderer = new google.maps.DirectionsRenderer({
					map: map
				});
				directionsDisplay.setMap(map);
				directionsDisplay.setOptions({ suppressMarkers: true });
				
				directionsService.route({
					origin: orig_geocode,
					destination: dest_geocode,
					travelMode: google.maps.TravelMode.DRIVING
				},
				function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						directionsDisplay.setDirections(response);
						var remainingSeconds = 0;
						var leg = response.routes[0].legs[0]; // supporting single route, single legs currently
						leg.steps.forEach(function(step) {
							var stepSeconds = step.duration.value;
							var nextStopSeconds = speedFactor - remainingSeconds;
							while (nextStopSeconds <= stepSeconds) {
								var nextStopLatLng = getPointBetween(step.start_location, step.end_location, nextStopSeconds / stepSeconds);
								autoDriveSteps.push(nextStopLatLng);
								nextStopSeconds += speedFactor;
							}
							remainingSeconds = stepSeconds + speedFactor - nextStopSeconds;
						});
						if (remainingSeconds > 0) {
							autoDriveSteps.push(leg.end_location);
						}
						$('#loading').hide();
						var autoDriveTimer = setInterval(function () {
							// stop the timer if the route is finished
							if (autoDriveSteps.length === 0) {
								put_to_stream(dest_resp, dest_resp);
								clearInterval(autoDriveTimer);
								var icon = {
									url: "../IMG/food.png",
									scaledSize: new google.maps.Size(55, 55)
								};
								markers[2].setIcon(icon);
							} else {
								// move marker to the next position (always the first in the array)
								markers[1].setPosition(autoDriveSteps[0]);
								//clearInterval(autoDriveTimer);
								//add location to stream
								try {
									var step_geocode = autoDriveSteps[0].lat()+","+autoDriveSteps[0].lng();
								} catch(error) {
									var step_geocode = autoDriveSteps[0].lat+","+autoDriveSteps[0].lng;
								}
								put_to_stream(step_geocode, dest_resp);
						
								// remove the processed position
								autoDriveSteps.shift();
							}
						},
						1000);
					} else {
						window.alert('Directions request failed due to ' + status);
					}
				});
				
			} 
			else {
				throw('No results found: ' + status);
			}
		});
	}
}

// helper method to calculate a point between A and B at some ratio
function getPointBetween(a, b, ratio) {
    return new google.maps.LatLng(a.lat() + (b.lat() - a.lat()) * ratio, a.lng() + (b.lng() - a.lng()) * ratio);
}

function removeMarkers() {
    for (var i=0; i<markers.length; i++) {
        markers[i].setMap(null);
    }
	markers=[];
}

function removeDirections() {
	if (direction) {
		direction.setMap(null);
		direction="";
	}
}

function put_to_stream(origin, dest) {
    var payload = {
                'origin': origin,
                'destination': dest
              };
	var kinesis = new AWS.Kinesis();
	var params = {
	  Data: JSON.stringify(payload),
	  PartitionKey: 'deliveryguy01', /* required */
	  StreamName: stream_name /* required */
	};
	kinesis.putRecord(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	});
}

function initMap() {
    console.log("initMap")
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.730610, lng: -73.935242 },
        zoom: 12
    });
	google.maps.event.trigger(map, 'resize');
}