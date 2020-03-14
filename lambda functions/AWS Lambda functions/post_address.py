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
    user_profile = check_user(user_id)
    completion_level = event['page_num']
    if int(user_profile['completion_level']) < 4:
        update_user_level(user_id)
    delete_user_address(user_id)
    breakfast_address1 = event["breakfast_address1"]
    breakfast_address2 = '-' if event["breakfast_address2"] == '' else event["breakfast_address2"]
    breakfast_city = event["breakfast_city"]
    breakfast_state = event["breakfast_state"]
    breakfast_country = event["breakfast_country"]
    breakfast_zip = event["breakfast_zip"]
    lunch_address1 = event["lunch_address1"]
    lunch_address2 = '-' if event["lunch_address2"] == '' else event["lunch_address2"]
    lunch_city = event["lunch_city"]
    lunch_state = event["lunch_state"]
    lunch_country = event["lunch_country"]
    lunch_zip = event["lunch_zip"]
    dinner_address1 = event["dinner_address1"]
    dinner_address2 = '-' if event["dinner_address2"] == '' else event["dinner_address2"]
    dinner_city = event["dinner_city"]
    dinner_state = event["dinner_state"]
    dinner_country = event["dinner_country"]
    dinner_zip = event["dinner_zip"]
    snack_address1 = event["snack_address1"]
    snack_address2 = '-' if event["snack_address2"] == '' else event["snack_address2"]
    snack_city = event["snack_city"]
    snack_state = event["snack_state"]
    snack_country = event["snack_country"]
    snack_zip = event["snack_zip"]
    if user_profile:
        insert_meal_address(user_id,breakfast_address1,breakfast_address2,breakfast_city,breakfast_state,breakfast_country,breakfast_zip,
lunch_address1,lunch_address2,lunch_city,lunch_state,lunch_country,lunch_zip,
dinner_address1,dinner_address2,dinner_city,dinner_state,dinner_country,dinner_zip,
snack_address1,snack_address2,snack_city,snack_state,snack_country,snack_zip)
        return {
        'statusCode': 200,
        'body': json.dumps('address for all meals added to the database')
        }
    return {
        'statusCode': 200,
        'body': json.dumps('user does not exist')
    }

def update_user_level(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_profile')
    response = table.update_item(
        Key={
            'user_id': user_id
        },
        UpdateExpression="set completion_level = :r",
        ExpressionAttributeValues={
            ':r': '4'
        },
        ReturnValues="UPDATED_NEW"
    )
    print("UpdateItem succeeded:")
    print(response)

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
    return None
    
def insert_meal_address(user_id,breakfast_address1,breakfast_address2,breakfast_city,breakfast_state,breakfast_country,breakfast_zip,
lunch_address1,lunch_address2,lunch_city,lunch_state,lunch_country,lunch_zip,
dinner_address1,dinner_address2,dinner_city,dinner_state,dinner_country,dinner_zip,
snack_address1,snack_address2,snack_city,snack_state,snack_country,snack_zip
):
    print(breakfast_address1)
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('meal_address')
    response = table.put_item(
        Item={
            'user_id' : user_id,
            'breakfast_address1' : breakfast_address1,
            'breakfast_address2' : breakfast_address2,
            'breakfast_city' : breakfast_city,
            'breakfast_state' : breakfast_state,
            'breakfast_country' : breakfast_country,
            'breakfast_zip' : breakfast_zip,
            'lunch_address1' : lunch_address1,
            'lunch_address2' : lunch_address2,
            'lunch_city' : lunch_city,
            'lunch_state' : lunch_state,
            'lunch_country' : lunch_country,
            'lunch_zip' : lunch_zip,
            'dinner_address1' : dinner_address1,
            'dinner_address2' : dinner_address2,
            'dinner_city' : dinner_city,
            'dinner_state' : dinner_state,
            'dinner_country' : dinner_country,
            'dinner_zip' : dinner_zip,
            'snack_address1' : snack_address1,
            'snack_address2' : snack_address2,
            'snack_city' : snack_city,
            'snack_state' : snack_state,
            'snack_country' : snack_country,
            'snack_zip' : snack_zip
        }
    )
    print("PutItem succeeded:")
    print(json.dumps(response, indent=4))
    
def delete_user_address(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('meal_address')
    response = table.delete_item(
        Key={
            'user_id': user_id
        }
    )
    print("Delete Item succeeded:")
    print(json.dumps(response, indent=4))