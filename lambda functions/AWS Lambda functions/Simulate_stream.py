import json
import boto3
from datetime import datetime
import calendar
import time
import random
import googlemaps

my_stream_name = 'location-stream'
kinesis_client = boto3.client('kinesis', region_name='us-east-1')

def lambda_handler(event, context):
    origin = "755 4th Avenue, Brooklyn, NY 11232"
    dest = "590 Hamilton Ave, Brooklyn, NY 11232"   #getDestinationAddress()
    simulate_driving(origin, dest)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Simulation Done from '+origin+' to '+dest+'!')
    }

def put_to_stream(origin, dest):
    payload = {
                'origin': origin,
                'destination': dest,
                'timestamp': str(calendar.timegm(datetime.utcnow().timetuple()))
              }
    payload = {'origin': '40.6609952,-73.9973613', 'destination': '40.6667946,-73.99682229999999', 'timestamp': str(calendar.timegm(datetime.utcnow().timetuple()))}
    print(payload)

    put_response = kinesis_client.put_record(
                        StreamName=my_stream_name,
                        Data=json.dumps(payload),
                        PartitionKey='deliveryguy01')
    print(put_response)
                        
def simulate_driving(origin, dest):
    autoDriveSteps = []
    gmaps = googlemaps.Client(key='Key')
    
    #Destination Geocode
    dest_geocode = gmaps.geocode(dest)[0]["geometry"]["location"]
    dest_geocode = str(dest_geocode["lat"])+","+str(dest_geocode["lng"])
    
    # Request directions via public transit
    now = datetime.now()
    directions_result = gmaps.directions(origin, dest, mode="driving", departure_time=now)
    steps = directions_result[0]["legs"][0]["steps"]
    for step in steps:
        autoDriveSteps.append(step["end_location"])
        step_geocode = str(step["end_location"]["lat"])+","+str(step["end_location"]["lng"])
        put_to_stream(step_geocode, dest_geocode)
        break
        # wait for step duration
        time.sleep(step["duration"]["value"])
        print(step_geocode)
    put_to_stream(dest_geocode, dest_geocode)
    #print("autoDriveSteps ", autoDriveSteps)
    return autoDriveSteps