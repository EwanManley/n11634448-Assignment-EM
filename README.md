Assignment 2 - Cloud Services Exercises - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:** Ewan Manley
- **Student number:** n11634448
- **Partner name (if applicable):** N/A
- **Application name:** video-transcoder
- **Two line description:** I implemented an app that was intended to transcode videos into MP3 or MP4, using DynamoDB to store user metadata, S3 to store video files that were transcoded and used cognito for authentication while also remaining stateless.
- **EC2 instance name or ID:** i-0c12e7562d5236aeb

------------------------------------------------

### Core - First data persistence service

- **AWS service name:** S3
- **What data is being stored?:** Video Files (MP3, Mp4)
- **Why is this service suited to this data?:** S3 is well suited to storing large files such as videos, as it has great scalability, whereas most other AWS services have restrictions on file size.
- **Why are the other services used not suitable for this data?:** Most lack the scalability of S3 and cannot accept larger files.
- **Bucket/instance/table name:** n11634448-vt-output
- **Video timestamp:** 0:30
- **Relevant files:**
    - app.js
    - upload.html

### Core - Second data persistence service

- **AWS service name:** DynamoDB
- **What data is being stored?:** user metadata (username, role, email)
- **Why is this service suited to this data?:** DynamoDB is well suited for storing user data, as it's fast, structured and scales well. Necessary when you expect a significant number of users.
- **Why are the other services used not suitable for this data?:** While DynamoDB isn't overly superior for user data, it does have it's advantages. Cognito for example cannot be rolled/backed up, whereas DynamoDB can. DynamoDB is also superior for storing user data outside of authentication data.
- **Bucket/instance/table name:** a2_n11634448_db
- **Video timestamp:** 0:49, 1:05
- **Relevant files:**
    - dynamo.js
    - app.js

### Third data service

- **AWS service name:** N/A
- **What data is being stored?:** [eg video metadata]
- **Why is this service suited to this data?:** [eg. ]
- **Why is are the other services used not suitable for this data?:** [eg. Advanced video search requires complex querries which are not available on S3 and inefficient on DynamoDB]
- **Bucket/instance/table name:**
- **Video timestamp:**
- **Relevant files:**
    -

### S3 Pre-signed URLs

- **S3 Bucket names:** n11634448-vt-output
- **Video timestamp:** N/A
- **Relevant files:**
    - N/A

### In-memory cache

- **ElastiCache instance name:** N/A
- **What data is being cached?:** [eg. Thumbnails from YouTube videos obatined from external API]
- **Why is this data likely to be accessed frequently?:** [ eg. Thumbnails from popular YouTube videos are likely to be shown to multiple users ]
- **Video timestamp:**
- **Relevant files:**
    - N/A

### Core - Statelessness

- **What data is stored within your application that is not stored in cloud data services?:** Application is not stateless due to breaks in functionality
- **Why is this data not considered persistent state?:** [eg. intermediate files can be recreated from source if they are lost]
- **How does your application ensure data consistency if the app suddenly stops?:** [eg. journal used to record data transactions before they are done.  A separate task scans the journal and corrects problems on startup and once every 5 minutes afterwards. ]
- **Relevant files:**
    - N/A

### Graceful handling of persistent connections

- **Type of persistent connection and use:** N/A
- **Method for handling lost connections:** [eg. client responds to lost connection by reconnecting and indicating loss of connection to user until connection is re-established ]
- **Relevant files:**
    - N/A


### Core - Authentication with Cognito

- **User pool name:** n11634448-video-transcoder
- **How are authentication tokens handled by the client?:** On login, the frontend is supposed to store the JWT in the browser, which is then included when users attempt to access any protected API's like admin tools or just regular user functionality, depending on role.
- **Video timestamp:** 1:48
- **Relevant files:**
    - midAuth.js
    - admin-register.html
    - admin.html
    - register.html
    - upload.html
    - cognito.js
    - confirm.html
    - index.html
    - app.js

### Cognito multi-factor authentication

- **What factors are used for authentication:** N/A
- **Video timestamp:**
- **Relevant files:**
    - N/A

### Cognito federated identities

- **Identity providers used:** N/A
- **Video timestamp:**
- **Relevant files:**
    - N/A

### Cognito groups

- **How are groups used to set permissions?:** N/A
- **Video timestamp:**
- **Relevant files:**
    - N/A

### Core - DNS with Route53

- **Subdomain**: n11634448.cab432.com
- **Video timestamp:** 1:34

### Parameter store

- **Parameter names:** N/A
- **Video timestamp:**
- **Relevant files:**
    - N/A

### Secrets manager

- **Secrets names:** N/A
- **Video timestamp:**
- **Relevant files:**
    - N/A

### Infrastructure as code

- **Technology used:** AWS CLI, Docker and Dockerfile
- **Services deployed:** S3 Buckets, DynamoDB, Cognito User Pool, EC2 Instance, Route 53
- **Video timestamp:** 0:36, 0:59, 1:46, 0:00, 1:30
- **Relevant files:**
    - Dockerfile
    - package.json
    - index.js
    - app.js
    - cognito.js
    - dynamo.js
    - midAuth.js
    - 

### Other (with prior approval only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -
