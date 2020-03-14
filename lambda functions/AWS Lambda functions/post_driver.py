import json
import hashlib
import boto3

def lambda_handler(event, context):
    # TODO implement
    print(event)
    user_id = event['user_id']
    meal_type = event['meal_type']
    user_profile = check_user(user_id)
    if user_profile:
        address = get_user_address(user_id)
        print(address)
        result = {}
        for key in address:
            if meal_type in key:
                result[key] = address[key]
        print(result)
        address = ['address1','city','state','country','zip']
        res = ''
        for a in address:
            for key in result:
                if a in key:
                    res += result[key] + ','
                    break
        send_email(user_profile['email'], meal_type)
        return {
        'statusCode': 200,
        'body': json.dumps(res)
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
    return False
    
def send_email(email, meal_type):
    client = boto3.client('ses',
    aws_access_key_id='accessKey',
    aws_secret_access_key='secretKey')
    response = client.send_email(
        Source='sourceEmailId',
        Destination={
            'ToAddresses': [
                email,
            ]
        },
        Message={
            'Subject': {
                'Data': 'MyMacroChef Delivery'
            },
            'Body': {
                'Text': {
                    'Data': 'Your '+meal_type+' is on the way. \n You can check it here https://mymacrochefhj.s3.amazonaws.com/Resources/HTML/livetracking.html'
                }
            }
        }
    )
    print(response)