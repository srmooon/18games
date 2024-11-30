class Logger {
    private static instance: Logger;
    private logs: string[] = [];
    private maxLogs = 1000; // Limite de logs mantidos em memória

    private constructor() {
        // Singleton
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private formatMessage(level: string, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const dataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
        return `[${timestamp}] ${level}: ${message}${dataStr}\n----------------------------------------\n`;
    }

    private addLog(message: string) {
        this.logs.push(message);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove o log mais antigo se exceder o limite
        }

        // Salva os logs no localStorage
        try {
            localStorage.setItem('app_logs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('Error saving logs to localStorage:', error);
        }
    }

    getAllLogs(): string[] {
        return this.logs;
    }

    downloadLogs() {
        const allLogs = this.logs.join('\n');
        const blob = new Blob([allLogs], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    info(message: string, data?: any) {
        const logMessage = this.formatMessage('INFO', message, data);
        console.log(logMessage);
        this.addLog(logMessage);
    }

    error(message: string, error?: any) {
        const logMessage = this.formatMessage('ERROR', message, error);
        console.error(logMessage);
        this.addLog(logMessage);
    }

    warn(message: string, data?: any) {
        const logMessage = this.formatMessage('WARN', message, data);
        console.warn(logMessage);
        this.addLog(logMessage);
    }

    debug(message: string, data?: any) {
        const logMessage = this.formatMessage('DEBUG', message, data);
        console.debug(logMessage);
        this.addLog(logMessage);
    }

    clearLogs() {
        this.logs = [];
        try {
            localStorage.removeItem('app_logs');
        } catch (error) {
            console.error('Error clearing logs from localStorage:', error);
        }
    }
}

// Exporta uma única instância do logger
export const logger = Logger.getInstance();
