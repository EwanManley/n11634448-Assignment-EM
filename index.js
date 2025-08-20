require("dotenv").config();
const S3 = require("@aws-sdk/client-s3");
const S3Presigner = require("@aws-sdk/s3-request-presigner");

const bucketName = 'n11634448-test'
const qutUsername = 'n11634448@qut.edu.au'
const purpose = 'prac'
const objectKey = 'myAwesomeObjectKey'
const objectValue = 'This could be just about anything.'

async function main() {
    // Creating a client for sending commands to S3
    s3Client = new S3.S3Client({ region: 'ap-southeast-2' });

    // Command for creating a bucket
    command = new S3.CreateBucketCommand({
        Bucket: bucketName
    });

    // Send the command to create the bucket
    try {
        const response = await s3Client.send(command);
        console.log(response.Location)
    } catch (err) {
        console.log(err);
    }

    // Creating command for tagging the bucket
    command = new S3.PutBucketTaggingCommand({
        Bucket: bucketName,
        Tagging: {
            TagSet: [
                {
                    Key: 'qut-username',
                    Value: qutUsername,
                },
                {
                    Key: 'purpose',
                    Value: purpose
                }
            ]
        }
    });
    // Send the command to tag the bucket
    try {
        const response = await s3Client.send(command);
        console.log(response)
    } catch (err) {
        console.log(err);
    }    


    // Create and send a command to write an object
    try {
        const response = await s3Client.send(
            new S3.PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: objectValue
            })
        );
        console.log(response);
    } catch (err) {
        console.log(err);
    }

    // Create and send a command to read an object
    try {
        const response = await s3Client.send(
            new S3.GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            })
        );
        // We need to transform the response's value to a string or other type.
        str = await response.Body.transformToString();
        console.log(str);
    } catch (err) {
        console.log(err);
    }

    // Create a pre-signed URL for reading an object
    try {
        const command = new S3.GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            });
        const presignedURL = await S3Presigner.getSignedUrl(s3Client, command, {expiresIn: 3600} );
        console.log('Pre-signed URL to get the object:')
        console.log(presignedURL);

        // fetching the object using an HTTP request to the URL.
        const response = await fetch(presignedURL);
        const object = await response.text();
        console.log('Object retrieved with pre-signed URL: ');
        console.log(object);

    } catch (err) {
        console.log(err);
    }
}

main();
