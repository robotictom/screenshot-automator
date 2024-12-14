require('dotenv').config();

const { takeScreenshot, finalWidth, finalHeight } = require('./services/screenshotService');
const { uploadToS3 } = require('./services/s3Uploader');
const { log } = require('./utils/logger');
const path = require('path');
const fs = require('fs');
const urls = require('./config/urls.json');
const { s3BucketName } = require('./config/config.json');

// Check if --upload flag was passed at runtime
const shouldUpload = process.argv.includes('--upload');

const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');

// Helper function to get a human-readable timestamp: YYYYMMDD-HHMM
function getFormattedTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}`;
}

// Helper function to sanitize website name
function sanitizeWebsiteName(name) {
    return name.toLowerCase().replace(/\s+/g, '_');
}

(async function main() {
    try {
        if (!fs.existsSync(SCREENSHOTS_DIR)) {
            fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
        }

        for (const { url, websiteName } of urls) {
            const sanitizedName = sanitizeWebsiteName(websiteName);
            const formattedTimestamp = getFormattedTimestamp();
            const fileName = `${sanitizedName}-${finalWidth}x${finalHeight}-${formattedTimestamp}.jpg`;
            const filePath = path.join(SCREENSHOTS_DIR, fileName);

            log(`Capturing screenshot for ${url}`);
            await takeScreenshot(url, filePath);

            // Upload to S3 only if --upload flag is used
            if (shouldUpload && s3BucketName) {
                const s3Key = `screenshots/${fileName}`;
                log(`Uploading ${filePath} to S3`);
                await uploadToS3(filePath, s3Key);
            }
        }

        log('All screenshots captured successfully.');
        if (shouldUpload) {
            log('Screenshots uploaded to S3.');
        } else {
            log('Screenshots saved locally.');
        }
    } catch (error) {
        log(`An error occurred: ${error.message}`, 'error');
    }
})();
