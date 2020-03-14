1. Introduction
It’s way past dinner time and you’re getting hungrier by the minute and cooking seems like just one more chore you’d rather avoid. You wake up the next day feeling gloomy from all the junk food you ate last night and start contemplating life decisions. With all the deadlines, responsibilities and personal commitments life throws at us, healthy eating isn’t always the number one priority. Accessible and affordable healthy food programmes can be a great solution to this problem and we are trying to address it.
2. Methodology
The user can get into the system using Sign In/Sign Up page after email authentication Using AWS Cognito. When the user is first signing up, he will land on his Profile page which is a Form that requires them to enter their personal information like Name, Weight, Height, Age and the type of food the user prefers to eat. We recommend what calories he should be consuming by displaying the computed BMI vs optimal BMI dynamically.
Once the user has setup their profile, system will redirect them to preferences page. The pre-populated meals are the recommended high-rated meals from thousands of users that have similar user parameters like Weight, Height, Calorie Intake, Age, Activities to the new users. The recommendations were generated by predicting cluster of the new user in K-Means Clustering Algorithm deployed on sagemaker endpoint. If the user doesn’t like the suggested recommendation in the first list, he could always get new recommendations by requesting again. Lambda function takes care of the dietary restrictions and food allergies of the new user, so he could get customized choices for meals that will best suit him.
Processing all the above information, the system will now prompt the user to enter the delivery time for each/multiple meals throughout the week. For ease of use, we have provided Day-Week-Month-View inside a calendar with interactive drag-n-drop feature. User can put multiple delivery locations for particular type of meals ( For eg: Lunch at Work and Dinner at Home). Once this one-time-setup is done, user can track his delivery live. The location of the Delivery Guy is shared with the system through Kinesis Data Stream which provides real-time location of his delivery on the embedded google maps component on the web-page itself. SNS and SES were enabled to notify users for payments and delivery information. Cloudwatch events trigger the delivery guy to begin his trip at the requested time to the saved address of the user automatically.
If you want to change the meal for a day, or the delivery time/address or just cancel the meal, you can ask Alexa to do it for you.
 2.1 Architecture
 
 ## Architecture Diagram

![diagram](architecture-diagram.jpg)

 2.2 ​Components
● SageMaker (Recommend Meals)
Amazon SageMaker is a fully-managed service that enables data scientists and developers to quickly and easily build, train, and deploy machine learning models at any scale. With ​1000​ users and 300,000 ratings, Sagemaker ​K-Means​ Clustering model is being trained to form 35 different clusters. Each cluster corresponds to user that have similar type of details like weight, height, calorie intake, age, sex and activities. The trained model was then ​deployed​ to sagemaker endpoint. When a new user fill out and saves the form, sagemaker endpoint is being triggered. Prediction is being made for the new user according to his personal details and is being assigned to a ​cluster.​ We use the cluster information to pick out top-rated meals from the previous users in the cluster that share the same preferences as the new user.
● Kinesis Data Stream (Delivery Tracking)
You can use Amazon Kinesis Data Streams to collect and process large streams of data records in real time. We used kinesis to stream the ​coordinates​ of the delivery guy in order to allow the user to track his delivery. The data is then fetched by lambda and S3 to display current location.
● Alexa Skill (User Interaction)
The Alexa Skills Kit lets you teach Alexa ​new skills.​ Customers can access these new abilities by asking Alexa questions or making requests. You can build skills that provide users with many different types of abilities. The ​intents include: Change Delivery time, Change Delivery location, Change Meal for any day and Cancel Meal. The alexa was interfaces directly to update in DynamoDB when particular intent is fulfilled.
● Cognito (User Authentication)
We used Cognito to securely manage and synchronize app data for users across all their mobile devices. New users can ​register​ to this services using Sign Up page on the web-page with email verification. The system was made secure using access-tokens​ from cognito interface and implementing it in API headers.
● S3 (Front end and Data Storage)
We used S3 to store and retrieve any amount of data, at any time, from anywhere on the web. These resources include html, css, js, csv, json and Sagemaker models. The project is statically hosted on S3 with two endpoints - one for ​webpage​ and one for sagemaker​ model.
● DynamoDB (User Details)
We created databases in DynamoDB which stored ​user’s​ details(profile, login info,
address and time of delivery, payment info, meal preferences, etc.).
● API Gateway (RESTFul APIs)
An API gateway is programming that sits in front of an application programming interface (A​ PI​) and acts as a single point of entry for a defined group of

microservices. We created a number of resources(calendar, profile, preferences, etc.) which had G​ ET​ and P​ OST​ methods to request or send data with ‘Access-Token’ headers.
● Lambda (serve Requests)
AWS Lambda is a serverless compute service that runs your code in response to events and automatically manages the underlying compute resources for you. We created a number of lambda functions which were triggered on GET or POST methods.
● SES and SNS (Notification)
SNS and SES can be used to fan out notifications to end users using mobile push, SMS, and email. We used SES and SNS to notify user about his order, successful sign up, etc. via email and sms respectively
● Cloudwatch (Trigger User Meals to Drivers)
CloudWatch collects monitoring and operational data in the form of logs, metrics, and events, providing you with a unified view of AWS resources, applications, and services that run on AWS and on-premise servers. We used CloudWatch to monitor the logs of lambda functions. Cloudwatch would also trigger event to ​start the trip before 30 minutes from the delivery time to the saved address automatically.


