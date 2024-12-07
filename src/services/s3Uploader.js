const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const { s3BucketName } = require('../config/config.json');

const s3Client = new S3Client({});

/**
 * Uploads a file to an S3 bucket using AWS SDK v3.
 * @param {string} filePath - Path to the local file.
 * @param {string} key - S3 object key (path inside the bucket).
 */
async function uploadToS3(filePath, key) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: s3BucketName,
            Key: key,
            Body: fileContent,
        };

        await s3Client.send(new PutObjectCommand(params));
        console.log(`File uploaded to S3: s3://${s3BucketName}/${key}`);
    } catch (error) {
        console.error(`Failed to upload ${filePath} to S3:`, error.message);
        throw error;
    }
}

module.exports = { uploadToS3 };
