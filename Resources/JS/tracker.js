
var map;
var direction;
var bin;
var markers = [];
var stream_name;
var kinesis;
var origin = {"lat":40.66025310000001,"lng":-73.99813139999998};
var dest;

$( document ).ready(function() {
	if (window.localStorage.getItem('access-token')==null || window.localStorage.getItem('access-token')=='null')
		window.location = "signout.html";
	//new google.maps.LatLng(parseFloat(40.66025310000001), parseFloat(-73.99813139999998));
	// "755 4th Avenue, Brooklyn, NY 11232";
	dest = {};
	stream_name = 'location-stream';
	var credentials = new AWS.Credentials();
	credentials.accessKeyId = 'accessKeyId';
	credentials.secretAccessKey = 'accesskey';
	AWS.config.region = 'us-east-1';
	AWS.config.credentials = credentials;
	kinesis = new AWS.Kinesis();
    console.log( "ready!" );
	//get_from_stream();
	getRecord();
	//setInterval(getLocations, 5000);
	//getLocations();
	if($('#map').css('display') == 'block')
	{
		   google.maps.event.trigger(map, 'resize');                
	}
	
});

function getRecord() {
  kinesis.describeStream({ StreamName: stream_name}, function ( err, streamData ) {
    if ( err ) {
      console.log( err, err.stack ); // an error occurred
    } else {
      // console.log( streamData ); // successful response
      streamData.StreamDescription.Shards.forEach( shard => {
        kinesis.getShardIterator({
          ShardId: shard.ShardId,
          ShardIteratorType: 'LATEST',
          StreamName: stream_name
        }, function ( err, shardIteratordata ) {
          if ( err ) {
            console.log( err, err.stack ); // an error occurred
          } else {
            var shardIterator = shardIteratordata.ShardIterator;
            var recurse = setInterval(function() {
              kinesis.getRecords({ ShardIterator: shardIterator }, function ( err, recordsData ) {
                if ( err ) {
                  console.log( err, err.stack ); // an error occurred
                } else {
                  // console.log( JSON.stringify( recordsData ) ); // successful response
                  recordsData.Records.forEach(record => {
                    console.log( record.Data.toString(), shard.ShardId );
					var res = JSON.parse(record.Data.toString());
					if (Object.keys(dest).length === 0) {
						$('#noprogress').attr('hidden','');
						$('#inprogress').removeAttr('hidden');
						var cors = res["destination"].split(",");
						dest = {"lat":parseFloat(cors[0]),"lng":parseFloat(cors[1])};
						mapLocations();
					} else {
						var cors = res["origin"].split(",");
						step_temp = {"lat":parseFloat(cors[0]),"lng":parseFloat(cors[1])};
						markers[1].setPosition(step_temp);
					}
					if (res["origin"]==res["destination"]) {
						clearInterval(recurse);
						var icon = {
							url: "../IMG/food.png",
							scaledSize: new google.maps.Size(55, 55)
						};
						markers[2].setIcon(icon);
						$('#inprogress').attr('hidden','');
						$('#delivered').removeAttr('hidden');
						confetti.start(2000);
					}
                  });
                  shardIterator = iterator = recordsData.NextShardIterator;
                }
              });
            }, 1000 * 1 );

          }
        });
      });
    }
  });
}

function mapLocations() {
	removeDirections();
    removeMarkers();
	map.setCenter(new google.maps.LatLng(origin["lat"], origin["lng"]));
	var marker = new google.maps.Marker({
		map: map,
		position: origin,
		title: 'Source Location',
		icon: {
				url: "../IMG/origin.png",
				scaledSize: new google.maps.Size(55, 55)
			}
	});
	markers.push(marker);
	var marker = new google.maps.Marker({
		map: map,
		position: origin,
		title: 'Current location',
		icon: {
				url: "../IMG/car.png",
				scaledSize: new google.maps.Size(55, 55)
			}
	});
	markers.push(marker);
	var marker = new google.maps.Marker({
		map: map,
		position: dest,
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
	directionsDisplay.setMap(map);
	directionsDisplay.setOptions({ suppressMarkers: true });
	directionsService.route({
		origin: origin,//{ lat: sourceLocationLat, lng: sourceLocationLong },
		destination: dest,//results[0].geometry.location,
		travelMode: google.maps.DirectionsTravelMode.DRIVING
	}, function (response, status) {
			if (status === 'OK') {
				directionsDisplay.setDirections(response);
				direction = directionsDisplay;
		} else {
			window.alert('Directions request failed due to ' + status);
		}
	});
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

function initMap() {
    console.log("initMap")
    map = new google.maps.Map(document.getElementById('map'), {
        center: origin,
        zoom: 12
    });
	google.maps.event.trigger(map, 'resize');
}