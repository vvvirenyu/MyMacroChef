import json
import hashlib
import boto3

def lambda_handler(event, context):
    # TODO implement
    print(event)
    user_id = event['queryStringParameters']['user_id']
    user_profile = check_user(user_id)
    if user_profile:
        address = get_user_address(user_id)
        address['page_num'] = user_profile['completion_level']
        return {
        'statusCode': 200,
        'headers':{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':True
        },
        'body': json.dumps(address)
        }
    return {
        'statusCode': 200,
        'body': json.dumps('user not found')
    }

def check_user(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_profile')
    response = table.get_item(
        Key={
            'user_id': user_id
        }
    )
    if 'Item' in response:
        item = response['Item']
        print("GetItem succeeded:")
        # print(json.dumps(item, indent=4))
        return item
    # print(json.dumps(response, indent=4))
    return False
    
def get_user_address(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('meal_address')
    response = table.get_item(
        Key={
            'user_id': user_id
        }
    )
    if 'Item' in response:
        item = response['Item']
        print("GetItem succeeded:")
        # print(json.dumps(item, indent=4))
        return item
    # print(json.dumps(response, indent=4))
    return {}