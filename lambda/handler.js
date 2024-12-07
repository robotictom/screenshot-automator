const { takeScreenshot } = require('../src/services/screenshotService');
const { uploadToS3 } = require('../src/services/s3Uploader');
const urls = require('../src/config/urls.json');
const path = require('path');
const fs = require('fs');

// Configuration
const SCREENSHOTS_DIR = '/tmp/screenshots';

exports.handler = async () => {
    try {
        if (!fs.existsSync(SCREENSHOTS_DIR)) {
            fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
        }

        for (const { url, websiteName } of urls) {
            const timestamp = Date.now();
            const filePath = path.join(SCREENSHOTS_DIR, `${websiteName}-${timestamp}.png`);

            console.log(`Capturing screenshot for ${url}`);
            await takeScreenshot(url, filePath);

            const s3Key = `screenshots/${websiteName}-${timestamp}.png`;
            console.log(`Uploading ${filePath} to S3`);
            await uploadToS3(filePath, s3Key);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'All screenshots captured and uploaded successfully.' }),
        };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred', error: error.message }),
        };
    }
};
