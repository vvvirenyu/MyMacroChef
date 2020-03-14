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
    if int(user_profile['completion_level']) < 5:
        update_user_level(user_id)
    if int(event['change_flag']) == 0:
        return {
            'statusCode': 200,
            'body': json.dumps('user did not found')
        }
    payment = get_user_payment(user_id)
    if payment:
        card_number = event["card_number"] if int(event['change_flag']) == 1 else payment['card_number']
    else:
        card_number = event['card_number']
    start_date = event["start_date"]
    end_date = event["end_date"]
    name = event["name"]
    expiry_date_month = event["expiry_date_month"]
    expiry_date_year = event["expiry_date_year"]
    cvv = event["cvv"]
    country = event["country"]
    zipcode = event["zipcode"]
    bill = event["bill"]
    plan = event['plan']
    if user_profile:
        delete_payment(user_id)
        print('deleted')
        insert_payment_info(user_id, start_date, end_date, name,
        card_number, expiry_date_month,expiry_date_year,cvv,
        country, zipcode, bill, plan)
        return {
        'statusCode': 200,
        'body': json.dumps('payment information successfully added')
        }
    return {
        'statusCode': 200,
        'body': json.dumps('user did not found')
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
            ':r': '5'
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
        item = response['Item']
        print("GetItem USer succeeded:")
        return item
    return False
    
def insert_payment_info(user_id, start_date, end_date, name,
        card_number, expiry_date_month,expiry_date_year,cvv,
        country, zipcode, bill, plan):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('payment')
    response = table.put_item(
        Item={
        'user_id' : user_id,
        'start_date' : start_date,
        'end_date' : end_date,
        'name' : name,
        'card_number' : card_number,
        'expiry_date_month' : expiry_date_month,
        'expiry_date_year' : expiry_date_year,
        'cvv' : cvv,
        'country' : country,
        'zipcode' : zipcode,
        'bill' : bill,
        'plan' : plan
        }
    )
    print("PutItem payment succeeded:")
    print(json.dumps(response, indent=4))
    
def get_user_payment(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('payment')
    response = table.get_item(
        Key={
            'user_id': user_id
        }
    )
    if 'Item' in response:
        item = response['Item']
        print("GetItem payment succeeded:")
        return item
    # print(json.dumps(response, indent=4))
    return False

def delete_payment(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('payment')
    response = table.delete_item(
        Key={
            'user_id': user_id
        }
    )
    print("Delete Item succeeded:")
    # print(json.dumps(response, indent=4))