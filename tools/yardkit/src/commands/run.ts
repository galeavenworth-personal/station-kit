import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Command } from 'commander';
import { execa } from 'execa';
import type { Config } from '../config.js';
import { logger } from '../logger.js';
import type { LinePhase, RunEvent, RunResult } from '../types.js';

interface RunOptions {
	task: string;
	timeout?: number;
	workspace?: string;
}

/**
 * Run command: Execute a single line end-to-end
 */
export function createRunCommand(config: Config): Command {
	const cmd = new Command('run')
		.description('Run a single line (Beads task) end-to-end')
		.requiredOption('-t, --task <id>', 'Beads task ID')
		.option(
			'--timeout <seconds>',
			'Override timeout (seconds)',
			Number.parseInt,
		)
		.option('--workspace <path>', 'Override workspace path')
		.action(async (options: RunOptions) => {
			await runLine(config, options);
		});

	return cmd;
}

async function runLine(config: Config, options: RunOptions): Promise<void> {
	const runId = randomUUID();
	const taskId = options.task;
	const startTime = new Date();

	logger.info({ runId, taskId }, 'Starting line run');

	const events: RunEvent[] = [];
	const artifactDir = join(config.artifactsDir, runId);

	try {
		// Create artifact directory
		await mkdir(artifactDir, { recursive: true });

		// Phase 1: Claim task
		await executePhase('claim', config, { runId, taskId, artifactDir, events });

		// Phase 2: Prep (orchestrate-start-task via Kilo CLI)
		await executePhase('prep', config, { runId, taskId, artifactDir, events });

		// Phase 3: Execute (orchestrate-execute-task via Kilo CLI)
		await executePhase('execute', config, {
			runId,
			taskId,
			artifactDir,
			events,
		});

		// Phase 4: Quality gates
		await executePhase('gates', config, { runId, taskId, artifactDir, events });

		// Phase 5: Close task
		await executePhase('close', config, { runId, taskId, artifactDir, events });

		const result: RunResult = {
			runId,
			taskId,
			status: 'success',
			phase: 'close',
			startTime,
			endTime: new Date(),
			exitCode: 0,
			events,
		};

		await saveRunResult(artifactDir, result);
		logger.info({ runId, taskId }, 'Line completed successfully');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error({ runId, taskId, error: errorMessage }, 'Line failed');

		const result: RunResult = {
			runId,
			taskId,
			status: 'failed',
			phase: 'execute', // TODO: track actual failed phase
			startTime,
			endTime: new Date(),
			exitCode: 1,
			events,
			error: errorMessage,
		};

		await saveRunResult(artifactDir, result);
		process.exit(1);
	}
}

interface PhaseContext {
	runId: string;
	taskId: string;
	artifactDir: string;
	events: RunEvent[];
}

async function executePhase(
	phase: LinePhase,
	config: Config,
	context: PhaseContext,
): Promise<void> {
	const { runId, taskId, artifactDir, events } = context;

	logger.info({ runId, taskId, phase }, `Executing phase: ${phase}`);

	const phaseStart = new Date();
	events.push({
		timestamp: phaseStart,
		phase,
		event: 'phase_start',
	});

	try {
		switch (phase) {
			case 'claim':
				await claimTask(config, taskId);
				break;
			case 'prep':
				await runKiloPrepPhase(config, taskId, artifactDir);
				break;
			case 'execute':
				await runKiloExecutePhase(config, taskId, artifactDir);
				break;
			case 'gates':
				await runQualityGates(config, artifactDir);
				break;
			case 'close':
				await closeTask(config, taskId);
				break;
		}

		events.push({
			timestamp: new Date(),
			phase,
			event: 'phase_complete',
			data: { duration: Date.now() - phaseStart.getTime() },
		});
	} catch (error) {
		events.push({
			timestamp: new Date(),
			phase,
			event: 'phase_failed',
			data: { error: error instanceof Error ? error.message : String(error) },
		});
		throw error;
	}
}

async function claimTask(config: Config, taskId: string): Promise<void> {
	logger.debug({ taskId }, 'Claiming task from Beads');

	// bd sync --no-push
	await execa('bd', ['sync', '--no-push'], {
		cwd: config.repoRoot,
		stdio: 'inherit',
	});

	// bd update <id> --status in_progress
	await execa('bd', ['update', taskId, '--status', 'in_progress'], {
		cwd: config.repoRoot,
		stdio: 'inherit',
	});
}

async function runKiloPrepPhase(
	_config: Config,
	taskId: string,
	_artifactDir: string,
): Promise<void> {
	logger.debug({ taskId }, 'Running Kilo prep phase (orchestrate-start-task)');

	// TODO: Actual Kilo CLI invocation
	// This is a placeholder - needs actual kilocode CLI integration
	logger.warn('Kilo CLI integration not yet implemented - prep phase stubbed');

	// Future implementation:
	// await execa('kilocode', [
	//   '--auto',
	//   '--json',
	//   '/orchestrate-start-task',
	//   '--task', taskId,
	//   '--export', join(artifactDir, 'prep-session.json'),
	// ], {
	//   cwd: config.repoRoot,
	//   timeout: config.timeoutSeconds.prep * 1000,
	// });
}

async function runKiloExecutePhase(
	_config: Config,
	taskId: string,
	_artifactDir: string,
): Promise<void> {
	logger.debug(
		{ taskId },
		'Running Kilo execute phase (orchestrate-execute-task)',
	);

	// TODO: Actual Kilo CLI invocation
	logger.warn(
		'Kilo CLI integration not yet implemented - execute phase stubbed',
	);

	// Future implementation:
	// await execa('kilocode', [
	//   '--auto',
	//   '--json',
	//   '/orchestrate-execute-task',
	//   '--task', taskId,
	//   '--import', join(artifactDir, 'prep-session.json'),
	//   '--export', join(artifactDir, 'execute-session.json'),
	// ], {
	//   cwd: config.repoRoot,
	//   timeout: config.timeoutSeconds.execute * 1000,
	// });
}

async function runQualityGates(
	config: Config,
	_artifactDir: string,
): Promise<void> {
	logger.debug('Running quality gates (npm run ci)');

	const result = await execa('npm', ['run', 'ci'], {
		cwd: config.repoRoot,
		timeout: config.timeoutSeconds.gates * 1000,
		reject: false,
	});

	if (result.exitCode !== 0) {
		throw new Error(`Quality gates failed with exit code ${result.exitCode}`);
	}
}

async function closeTask(config: Config, taskId: string): Promise<void> {
	logger.debug({ taskId }, 'Closing task in Beads');

	// bd close <id>
	await execa('bd', ['close', taskId], {
		cwd: config.repoRoot,
		stdio: 'inherit',
	});

	// bd sync
	await execa('bd', ['sync'], {
		cwd: config.repoRoot,
		stdio: 'inherit',
	});
}

async function saveRunResult(
	artifactDir: string,
	result: RunResult,
): Promise<void> {
	const { writeFile } = await import('node:fs/promises');

	// Save run summary
	await writeFile(
		join(artifactDir, 'run-summary.json'),
		JSON.stringify(result, null, 2),
	);

	// Save events as JSONL
	const eventsJsonl = result.events
		.map((event) => JSON.stringify(event))
		.join('\n');

	await writeFile(join(artifactDir, 'events.jsonl'), eventsJsonl);
}
