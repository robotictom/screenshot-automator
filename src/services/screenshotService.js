const puppeteer = require('puppeteer');
const { browserWidth, browserHeight } = require('../config/config.json');

// Set defaults if values are not provided in config.
const DEFAULT_WIDTH = 1366;
const DEFAULT_HEIGHT = 768;

const finalWidth = browserWidth || DEFAULT_WIDTH;
const finalHeight = browserHeight || DEFAULT_HEIGHT;

/**
 * Takes a screenshot of the specified URL.
 * @param {string} url - The URL to capture.
 * @param {string} filePath - Path to save the screenshot.
 */
async function takeScreenshot(url, filePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.setViewport({ width: finalWidth, height: finalHeight });
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Remove the elements if they exist
        await page.evaluate(() => {
            const attentiveOverlay = document.querySelector('#attentive_overlay');
            if (attentiveOverlay) {
                attentiveOverlay.remove();
            }

            const onetrustConsent = document.querySelector('#onetrust-consent-sdk');
            if (onetrustConsent) {
                onetrustConsent.remove();
            }
        });

        // Take screenshot as a JPG
        await page.screenshot({ path: filePath, type: 'jpeg' });
        console.log(`Screenshot saved to ${filePath}`);
    } catch (error) {
        console.error(`Failed to capture screenshot for ${url}:`, error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

module.exports = { takeScreenshot, finalWidth, finalHeight };
