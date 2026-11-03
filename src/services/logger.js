class Logger {
    static instance;
    isDev;
    constructor() {
        this.isDev = import.meta.env.DEV;
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        return {
            timestamp,
            level,
            message,
            data,
        };
    }
    info(message, data) {
        if (this.isDev) {
            console.log(`ℹ️ [INFO] ${message}`, data || '');
        }
        // TODO: Send to remote logging service in prod
    }
    warn(message, data) {
        console.warn(`⚠️ [WARN] ${message}`, data || '');
    }
    error(message, error) {
        console.error(`🚨 [ERROR] ${message}`, error || '');
        // TODO: Send to Sentry/LogRocket in prod
    }
    debug(message, data) {
        if (this.isDev) {
            console.debug(`🐞 [DEBUG] ${message}`, data || '');
        }
    }
}
export const logger = Logger.getInstance();
