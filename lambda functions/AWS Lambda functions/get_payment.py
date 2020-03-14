import json
import hashlib
import boto3

def lambda_handler(event, context):
    # TODO implement
    print(event)
    user_id = event['queryStringParameters']['user_id']
    user_profile = check_user(user_id)
    if user_profile:
        calendar = get_meal_calendar(user_id)
        payment = {
            'page_num':user_profile['completion_level']
        }
        if calendar:
            payment['start_date_calendar']=calendar['first_date']
        print(user_profile)
        payment.update(get_user_payment(user_id))
        return {
        'statusCode': 200,
        'headers':{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':True
        },
        'body': json.dumps(payment)
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
        print("GetItem succeeded:")
        # print(json.dumps(item, indent=4))
        item['card_entry_1'] = '****'
        item['card_entry_2'] = '****'
        item['card_entry_3'] = '****'
        item['card_entry_4'] = item['card_number'][-4:]
        del item['card_number']
        item['cvv'] = ''
        print(item)
        return item
    # print(json.dumps(response, indent=4))
    return {}
    
def get_meal_calendar(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('calendar')
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