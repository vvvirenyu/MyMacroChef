import os
import io
import boto3
import json
import csv
import pandas as pd
import hashlib
from boto3.dynamodb.conditions import Key, Attr

# grab environment variables

runtime= boto3.client('runtime.sagemaker',
aws_access_key_id='accessKey',
aws_secret_access_key='secretKey')
s3 = boto3.client('s3')
def lambda_handler(event, context):
    print(event)
    # email = 'hardikaj96@gmail.com'
    # em = email.split('@')[0]
    # em1 = email.split('@')[1].split('.')
    # m = hashlib.md5()
    # m.update(em.encode('utf8'))
    # m.update(em1[0].encode('utf8')+em1[1].encode('utf8'))
    # print(m.hexdigest())
    # user_id = m.hexdigest()
    user_id_flag = event['queryStringParameters']['user_id'].split('_')
    # user_id_flag = 'b01d9deefaf2c8013d58bb16d1d86c2e_1'.split('_')
    user_id = user_id_flag[0]
    recom_flag = user_id_flag[1]
    user_profile = check_user_profile(user_id)
    diet = user_profile['deitary_restrictions']
    if not user_profile:
        return {
            'statusCode': 200,
        'headers':{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':True
        },
            'body': json.dumps('user not found')
        }
    page_num = str(user_profile['completion_level'])
    if recom_flag == '0' and str(user_profile['completion_level']) != '1':
        selection = get_user_preferences(user_id)
        return {
            'statusCode': 200,
            'headers':{
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials':True
            },
            'body': json.dumps({
                'user_id':user_id,
                'page_num':page_num,
                'breakfast' :[],
                'lunch':[],
                'dinner':[],
                'snack':[],
                'selection': selection
            })
        }
    
    age = str(user_profile['age'])
    sex = str(user_profile['sex'])
    weight = str(user_profile['weight'])
    height = str(user_profile['height'])
    calorie_intake = str(user_profile['daily_calorie_intake'])
    activity = str(user_profile['activity'])
    
    payload = sex + ',' + age + ',' + weight + ',' + height + ',' + calorie_intake + ',' +  activity
    print(payload)
    
    # # print("Received event: " + json.dumps(event, indent=2))
    
    # # data = json.loads(json.dumps(event))
    # sex,age,weight,height,calorie_intake, activity = 1.00e+00, 2.70e+01, 1.35e+02, 1.53e+02, 1.90e+03, 2.00e+00
    # payload = "1.00e+00, 2.70e+01, 1.35e+02, 1.53e+02, 1.90e+03,2.00e+00"
    # print(payload)
    
    response = runtime.invoke_endpoint(EndpointName='kmeans-2019-12-17-23-25-25-039',
                                      ContentType='text/csv',
                                      Body=payload)
    print(response)
    result = json.loads(response['Body'].read().decode())
    print(result)
    # result = {'predictions': [{'distance_to_cluster': 31.28098487854004, 'closest_cluster': 4.0}]}
    # clusterfile = s3.get_object(Bucket='mymacrochefhj', Key='Resources/Data/kmeans_output_users_cluster.csv')
    # clusterDF = pd.read_csv(clusterfile['Body'])
    clusterDF = pd.read_csv('/opt/kmeans_output_users_cluster.csv')
    predicted_cluster = result['predictions'][0]['closest_cluster']
    newclusterDF = clusterDF[clusterDF['cluster'] == predicted_cluster]
    # temp = s3.get_object(Bucket='mymacrochefhj', Key='Resources/Data/final_meals.csv')
    # mealsDF = pd.read_csv(temp['Body'])
    mealsDF = pd.read_csv('/opt/final_meals.csv')
    # ratingfile = s3.get_object(Bucket='mymacrochefhj', Key='Resources/Data/ratings.csv')
    # ratingDF = pd.read_csv(ratingfile['Body'])
    ratingDF = pd.read_csv('/opt/ratings.csv')
    print (ratingDF.head(3))
    selected_meals = pd.merge(newclusterDF, ratingDF, left_on='user_id', right_on='user_id', how='inner')
    selected_meals = selected_meals[['user_id','meal_id','ratings']]
    selected_meals = pd.merge(selected_meals, mealsDF, left_on='meal_id', right_on='meal_id', how='inner')
    
    # diett = ['vegan', 'ovovegan', 'lacvegan', 'lacovovegan', 'pesce']
    # if diet in ['vegan', 'ovovegan', 'lacvegan', 'lacovovegan', 'pesce']:
    # selected_meals = selected_meals[selected_meals[diett[1]] == 1]
    breakfast_meals = selected_meals[selected_meals.meal_type == 'breakfast'].sort_values(by='ratings', ascending=False)

    breakfast_meals.drop_duplicates('meal_id', inplace=True, keep='first')

    b = list(breakfast_meals.sample(28)['meal_id'])
    bf_meals = []
    for i in b:
        bf_meals.append(mealsDF[mealsDF['meal_id']==i]['name'].values[0])
    lunch_meals = selected_meals[selected_meals.meal_type == 'lunch'].sort_values(by='ratings', ascending=False)

    lunch_meals.drop_duplicates('meal_id', inplace=True, keep='first')

    l = list(lunch_meals.sample(28)['meal_id'])
    l_meals = []
    for i in l:
        l_meals.append(mealsDF[mealsDF['meal_id']==i]['name'].values[0])

    dinner_meals = selected_meals[selected_meals.meal_type == 'dinner'].sort_values(by='ratings', ascending=False)

    dinner_meals.drop_duplicates('meal_id', inplace=True, keep='first')

    d = list(dinner_meals.sample(28)['meal_id'])
    d_meals = []
    for i in d:
        d_meals.append(mealsDF[mealsDF['meal_id']==i]['name'].values[0]) 

    snack_meals = selected_meals[selected_meals.meal_type == 'snack'].sort_values(by='ratings', ascending=False)

    snack_meals.drop_duplicates('meal_id', inplace=True, keep='first')

    s = list(snack_meals.sample(28)['meal_id']) 
    s_meals = []
    for i in s:
        s_meals.append(mealsDF[mealsDF['meal_id']==i]['name'].values[0])
    
    
    print(breakfast_meals.shape)
    print(lunch_meals.shape)
    print(dinner_meals.shape)
    print(snack_meals.shape)
    
    return {
        'statusCode': 200,
        'headers':{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':True
        },
        'body': json.dumps({
            'user_id':user_id,
            'page_num':page_num,
            'breakfast' :bf_meals,
            'lunch':l_meals,
            'dinner':d_meals,
            'snack':s_meals,
            'selection': []
        })
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
    return None

def get_user_preferences(user_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('user_preferences')
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
    return {}

