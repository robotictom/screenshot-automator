const { takeScreenshot, finalWidth, finalHeight } = require('../src/services/screenshotService');
const { uploadToS3 } = require('../src/services/s3Uploader');
const path = require('path');
const fs = require('fs');

// check runtime flags
const args = process.argv.slice(2);
const urlFileArg = args.find(arg => arg.startsWith('--urls='));
const urlFileName = urlFileArg ? urlFileArg.split('=')[1] : 'urls.json';

const urlsFilePath = path.join(__dirname, 'config', urlFileName);
if (!fs.existsSync(urlsFilePath)) {
    throw new Error(`URLs file not found: ${urlsFilePath}`);
}

const urls = require(urlsFilePath);

const { s3BucketName } = require('./config/config.json');

exports.handler = async () => {
    const SCREENSHOTS_DIR = '/tmp/screenshots';

    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    try {
        for (const { url, websiteName } of urls) {
            const sanitizedName = sanitizeWebsiteName(websiteName);
            const timestamp = formatTimestamp();
            const fileName = `${sanitizedName}-${finalWidth}x${finalHeight}-${timestamp}.jpg`;
            const filePath = path.join(SCREENSHOTS_DIR, fileName);

            console.log(`Capturing screenshot for ${url}`);
            await takeScreenshot(url, filePath);

            // Upload to S3
            if (s3BucketName) {
                const s3Key = `screenshots/${fileName}`;
                console.log(`Uploading ${filePath} to S3`);
                await uploadToS3(filePath, s3Key);
            } else {
                console.log('No S3 bucket configured, screenshot saved locally to /tmp.');
            }
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

/**
 * Formats timestamp as YYYYMMDD-HHMM (no seconds)
 */
function formatTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}`;
}

/**
 * Converts the websiteName to lowercase and replaces spaces with underscores.
 * "Example Site" -> "example_site"
 */
function sanitizeWebsiteName(name) {
    return name.toLowerCase().replace(/\s+/g, '_');
}
