import json
import hashlib
import boto3
from botocore.vendored import requests

def lambda_handler(event, context):
    # TODO implement
    print(event)
    if 'queryStringParameters' in event:
        access_token = event['queryStringParameters']['user_id']
        print('access_token received')
    else:
        access_token = "accessToken"
    headers = {
			'Authorization': 'Bearer ' + access_token,
			'Content-Type': 'application/x-www-form-urlencoded'
		  }
    payload={}
    url = 'https://planmeal.auth.us-east-1.amazoncognito.com/oauth2/userInfo'
    r = requests.get(url, data=json.dumps(payload), headers=headers)
    print(r.json())
    if 'email' in r.json():
        email = r.json()['email']
    else:
        return {
            'statusCode': 200,
            'headers':{
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials':True
            },
                'body': json.dumps({
                    'invalid_access_token':'1'
            })
        }
    print(email)
    em = email.split('@')[0]
    em1 = email.split('@')[1].split('.')
    m = hashlib.md5()
    m.update(em.encode('utf8'))
    m.update(em1[0].encode('utf8')+em1[1].encode('utf8'))
    print(m.hexdigest())
    user_id = m.hexdigest()
    item = check_user_profile(user_id)
    add_active_user(user_id)
    send_email(email)
    if not item:
        put_user_profile(user_id, '0', email)
        print('user_profile found')
        return {
            'statusCode': 200,
        'headers':{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':True
        },
            'body': json.dumps({
                'user_id':user_id,
                'page_num':'0'
            })
        }
    else:
        return {
            'statusCode': 200,
        'headers':{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':True
        },
            'body': json.dumps(item)
        }

def check_user_profile(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_profile')
    response = table.get_item(
        Key={
            'user_id': user_id
        }
    )
    if 'Item' in response:
        item = response['Item']
        print("Get profile succeeded:")
        print(item)
        return item
    # print(json.dumps(response, indent=4))
    return None

    
def put_user_profile(user_id, completion_level, email):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_profile')
    response = table.put_item(
        Item={
        'user_id' : user_id,
        'completion_level': completion_level,
        'email': email
        }
    )
    print("PutItem succeeded:")
    print(json.dumps(response, indent=4))
    

def add_active_user(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_active')
    response = table.scan()
    print(response)
    if response['Count'] != 0:
        delete_active_user(response['Items'])
    response = table.put_item(
        Item={
            'user_id':user_id
            
        })
    print(response)
    
def delete_active_user(items):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_active')
    print(items)
    for item in items:
        response = table.delete_item(
          Key={
                    'user_id': item['user_id']
                }
            )
        print(response)
        
def send_email(email):
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
                'Data': 'MyMacroChef'
            },
            'Body': {
                'Text': {
                    'Data': 'Welcome to MyMacroChef\n Please fill out your profile to achieve maximum rewards.!!!'
                }
            }
        }
    )
    print(response)