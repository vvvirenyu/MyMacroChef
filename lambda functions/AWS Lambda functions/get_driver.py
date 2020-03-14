import json
import hashlib
import boto3

def lambda_handler(event, context):
    # TODO implement
    print(event)
    items = get_user_profile()
    user_array = []
    for item in items:
        users = {}
        if int(item['completion_level']) < 5:
            continue
        users['first_name'] = item['first_name']
        users['last_name'] = item['last_name']
        users['user_id'] = item['user_id']
        user_array.append(users)
    return {
    'statusCode': 200,
    'headers':{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':True
    },
    'body': json.dumps({
        'users':user_array
        }
    )
    }
    
def get_user_profile():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_profile')
    response = table.scan()
    print(response)
    if 'Items' in response:
        item = response['Items']
        print("GetItem succeeded:")
        # print(json.dumps(item, indent=4))
        return item
    # print(json.dumps(response, indent=4))
    return False

def get_user_preferences():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_preferences')
    response = table.scan()
    print(response)
    if 'Items' in response:
        item = response['Items']
        print("GetItem succeeded:")
        # print(json.dumps(item, indent=4))
        return item
    # print(json.dumps(response, indent=4))
    return False