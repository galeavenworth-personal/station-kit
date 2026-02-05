import { Command } from 'commander';
import { execa } from 'execa';
import pLimit from 'p-limit';
import type { Config } from '../config.js';
import { logger } from '../logger.js';

interface ShiftOptions {
	maxParallel?: number;
	queue?: string;
	limit?: number;
}

/**
 * Shift command: Pull tasks from Beads and run up to N in parallel
 */
export function createShiftCommand(config: Config): Command {
	const cmd = new Command('shift')
		.description('Pull tasks from Beads queue and run up to N in parallel')
		.option(
			'-n, --max-parallel <n>',
			'Maximum parallel lines',
			Number.parseInt,
			config.maxParallel,
		)
		.option('-q, --queue <name>', 'Beads queue filter', 'ready')
		.option(
			'-l, --limit <n>',
			'Maximum total tasks to process',
			Number.parseInt,
		)
		.action(async (options: ShiftOptions) => {
			await runShift(config, options);
		});

	return cmd;
}

async function runShift(config: Config, options: ShiftOptions): Promise<void> {
	const maxParallel = options.maxParallel ?? config.maxParallel;
	const queue = options.queue ?? 'ready';
	const limit = options.limit;

	logger.info({ maxParallel, queue, limit }, 'Starting shift');

	try {
		// Pull tasks from Beads
		const tasks = await getBeadsTasks(config, queue, limit);

		if (tasks.length === 0) {
			logger.info('No tasks found in queue');
			return;
		}

		logger.info(
			{ taskCount: tasks.length },
			`Processing ${tasks.length} tasks`,
		);

		// Run tasks with concurrency limit
		const limiter = pLimit(maxParallel);

		const promises = tasks.map((taskId) =>
			limiter(async () => {
				try {
					await runTask(config, taskId);
					logger.info({ taskId }, 'Task completed');
				} catch (error) {
					logger.error(
						{
							taskId,
							error: error instanceof Error ? error.message : String(error),
						},
						'Task failed',
					);
				}
			}),
		);

		await Promise.all(promises);

		logger.info('Shift complete');
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'Shift failed',
		);
		process.exit(1);
	}
}

async function getBeadsTasks(
	_config: Config,
	queue: string,
	limit?: number,
): Promise<string[]> {
	logger.debug({ queue, limit }, 'Fetching tasks from Beads');

	// TODO: Implement actual Beads query
	// This is a placeholder - needs integration with bd CLI
	logger.warn('Beads task fetching not yet implemented - returning empty list');

	// Future implementation:
	// const result = await execa('bd', ['list', '--status', queue, '--json'], {
	//   cwd: config.repoRoot,
	// });
	// const tasks = JSON.parse(result.stdout);
	// return limit ? tasks.slice(0, limit) : tasks;

	return [];
}

async function runTask(config: Config, taskId: string): Promise<void> {
	// Delegate to run command
	await execa('node', ['dist/cli.js', 'run', '--task', taskId], {
		cwd: config.repoRoot,
		stdio: 'inherit',
	});
}
