S3 = require("@aws-sdk/client-s3");

const bucketName = 'n11634448-test'

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
}

main();
