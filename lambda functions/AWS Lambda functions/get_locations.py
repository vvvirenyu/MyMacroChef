import json
import boto3
from datetime import datetime, timezone, timedelta
from dateutil import tz
from boto3.dynamodb.conditions import Key, Attr

my_stream_name = 'location-stream'
kinesis_client = boto3.client('kinesis', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    get_destination(0)
    response = kinesis_client.describe_stream(StreamName=my_stream_name)
    my_shard_id = response['StreamDescription']['Shards'][0]['ShardId']
    #print(my_shard_id)

    shard_iterator = kinesis_client.get_shard_iterator(StreamName=my_stream_name,
                                                          ShardId=my_shard_id,
                                                          ShardIteratorType='AT_TIMESTAMP',
                                                          Timestamp=datetime.utcnow()-timedelta(seconds=5))
    my_shard_iterator = shard_iterator['ShardIterator']
    record_response = kinesis_client.get_records(ShardIterator=my_shard_iterator,
                                                  Limit=123)
    print(record_response)
    if len(record_response['Records'])>0: 
        data = json.loads(record_response['Records'][0]['Data'])
        print(data)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
    
def get_destination(id):
    meal_type=""
    to_zone = tz.gettz('America/New_York')
    utc_now = datetime.now(timezone.utc)
    now = datetime.strptime(utc_now.strftime("%Y-%m-%d %I:%M%p"), "%Y-%m-%d %I:%M%p").astimezone(to_zone).replace(tzinfo=None)
    print(now)
    if now >= datetime.strptime(now.strftime("%Y-%m-%d")+' 5:00AM', "%Y-%m-%d %I:%M%p") and now < datetime.strptime(now.strftime("%Y-%m-%d")+' 11:00AM', "%Y-%m-%d %I:%M%p"):
        meal_type="breakfast"
    elif now >= datetime.strptime(now.strftime("%Y-%m-%d")+' 11:00AM', "%Y-%m-%d %I:%M%p") and now < datetime.strptime(now.strftime("%Y-%m-%d")+' 3:00PM', "%Y-%m-%d %I:%M%p"):
        meal_type="lunch"
    elif now >= datetime.strptime(now.strftime("%Y-%m-%d")+' 3:00PM', "%Y-%m-%d %I:%M%p") and now < datetime.strptime(now.strftime("%Y-%m-%d")+' 6:30PM', "%Y-%m-%d %I:%M%p"):
        meal_type="snack"
    elif now >= datetime.strptime(now.strftime("%Y-%m-%d")+' 6:30PM', "%Y-%m-%d %I:%M%p") and now < datetime.strptime(now.strftime("%Y-%m-%d")+' 11:00PM', "%Y-%m-%d %I:%M%p"):
        meal_type="dinner"
    print('meal_type',meal_type)
    if meal_type!="":
        '''table = dynamodb.Table('address')
        response = table.query(
            KeyConditionExpression=Key('id').eq(id)
        )
        print(response)
        if response['Count']>0:
            return response['Items'][0]'''
    return None