const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, `gateway-${new Date().toISOString().split('T')[0]}.log`);

/**
 * Write log to file
 */
const writeToFile = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data })
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
};

/**
 * Log info message
 */
const info = (message, data = null) => {
    console.log(`[INFO] ${message}`);
    if (process.env.NODE_ENV === 'production') {
        writeToFile('INFO', message, data);
    }
};

/**
 * Log error message
 */
const error = (message, error = null) => {
    console.error(`[ERROR] ${message}`);
    if (error) console.error(error);
    if (process.env.NODE_ENV === 'production') {
        writeToFile('ERROR', message, { error: error?.message || error });
    }
};

/**
 * Log warning message
 */
const warn = (message, data = null) => {
    console.warn(`[WARN] ${message}`);
    if (process.env.NODE_ENV === 'production') {
        writeToFile('WARN', message, data);
    }
};

/**
 * Log debug message (only in development)
 */
const debug = (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
        console.debug(`[DEBUG] ${message}`, data);
    }
};

module.exports = { info, error, warn, debug };