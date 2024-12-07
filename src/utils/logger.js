const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/app.log');

/**
 * Logs a message to the console and a file.
 * @param {string} message - The message to log.
 * @param {'info' | 'error'} level - Log level (default: info).
 */
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

    console.log(logMessage);
    fs.appendFileSync(logFilePath, `${logMessage}\n`, 'utf8');
}

module.exports = { log };
