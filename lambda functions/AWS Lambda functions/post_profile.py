import json
import boto3
from datetime import datetime
import hashlib
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # TODO implement
    print(event)
    user_id = event['user_id']
    user_details = check_user(user_id)
    if user_details:
        completion_level = '1' if int(user_details['completion_level'])<1 else user_details['completion_level']
        first_name = event['first_name']
        last_name = event['last_name']
        age = event['age']
        sex = event['sex']
        weight = event['weight']
        height = event['height']
        activity = event['activity']
        phone = event['phone']
        email = user_details['email']
        if activity in ['1','0']:
            activity = '0'
        elif activity in ['2']:
            activity = '1'
        else:
            activity = '2'
        daily_calorie_intake = event['daily_calorie_intake']
        deitary_restrictions = event['deitary_restrictions']
        food_allergies = event['food_allergies'] if event['food_allergies'] != '' else 'NA'
        put_user_profile(user_id,first_name,last_name,age,sex,phone,weight,height,
        activity,daily_calorie_intake,deitary_restrictions,food_allergies,
        completion_level, email)
        send_notification(first_name,last_name,phone)
        send_email(email)
        return {
            'statusCode': 200,
            'body': json.dumps('user profile added')
        }
    return {
        'statusCode': 200,
        'body': json.dumps('user does not exists')
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
        print("GetItem succeeded:")
        return response['Item']
    return False
    
def put_user_profile(user_id,first_name,last_name,age,sex,weight,height,phone, activity,
        daily_calorie_intake,deitary_restrictions,food_allergies,
        completion_level, email):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_profile')
    response = table.put_item(
        Item={
        'user_id' : user_id,
        'first_name':first_name,
        'last_name':last_name,
        'email':email,
        'age' : age,
        'sex' : sex,
        'weight' : weight,
        'height' : height,
        'phone': phone,
        'activity' : activity,
        'daily_calorie_intake' : daily_calorie_intake,
        'deitary_restrictions' : deitary_restrictions,
        'food_allergies' : food_allergies,
        'completion_level': completion_level
        }
    )
    print("PutItem succeeded:")
    print(response)
    
def send_notification(first_name,last_name,phone):
    sns = boto3.client('sns',
    aws_access_key_id='accessKey',
    aws_secret_access_key='secretKey')
    response = sns.publish(PhoneNumber='+1'+phone,
    Message='Welcome '+first_name+' '+last_name+' to MyMacroChef, you will be further notified on this number.')
    print(response)
    
def send_email(first_name,last_name,email):
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
                'Data': 'MyMacroChef Sign Up Completion'
            },
            'Body': {
                'Text': {
                    'Data': 'Welcome '+first_name+' '+last_name+' to MyMacroChef\nYou will be further notified on this email'
                }
            }
        }
    )
    print(response)