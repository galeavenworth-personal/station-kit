import pino from 'pino';

/**
 * Create a structured logger instance
 */
export function createLogger(
	options: { pretty?: boolean; level?: string } = {},
) {
	const pretty = options.pretty ?? process.env.NODE_ENV !== 'production';
	const level = options.level ?? process.env.LOG_LEVEL ?? 'info';

	return pino({
		level,
		transport: pretty
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
					},
				}
			: undefined,
	});
}

export const logger = createLogger();
