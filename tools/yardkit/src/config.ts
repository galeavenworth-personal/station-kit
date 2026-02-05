import { homedir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';

/**
 * Configuration schema for Yardkit supervisor
 */
const ConfigSchema = z.object({
	maxParallel: z.number().int().positive().default(1),
	timeoutSeconds: z
		.object({
			prep: z.number().int().positive().default(900), // 15 minutes
			execute: z.number().int().positive().default(1800), // 30 minutes
			gates: z.number().int().positive().default(600), // 10 minutes
		})
		.default({}),
	artifactsDir: z.string().default('artifacts/supervisor'),
	workspacePoolDir: z.string().default(join(homedir(), '.yardkit/workspaces')),
	locksDir: z.string().default('artifacts/supervisor/locks'),
	thinkingDir: z.string().default('.kilocode/thinking'),
	repoRoot: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
	const raw = {
		maxParallel: process.env.SUPERVISOR_MAX_PARALLEL
			? Number.parseInt(process.env.SUPERVISOR_MAX_PARALLEL, 10)
			: undefined,
		timeoutSeconds: {
			prep: process.env.SUPERVISOR_TIMEOUT_PREP
				? Number.parseInt(process.env.SUPERVISOR_TIMEOUT_PREP, 10)
				: undefined,
			execute: process.env.SUPERVISOR_TIMEOUT_EXECUTE
				? Number.parseInt(process.env.SUPERVISOR_TIMEOUT_EXECUTE, 10)
				: undefined,
			gates: process.env.SUPERVISOR_TIMEOUT_GATES
				? Number.parseInt(process.env.SUPERVISOR_TIMEOUT_GATES, 10)
				: undefined,
		},
		artifactsDir: process.env.SUPERVISOR_ARTIFACTS_DIR,
		workspacePoolDir: process.env.SUPERVISOR_WORKSPACE_POOL_DIR,
		locksDir: process.env.SUPERVISOR_LOCKS_DIR,
		thinkingDir: process.env.SUPERVISOR_THINKING_DIR,
		repoRoot: process.env.SUPERVISOR_REPO_ROOT || process.cwd(),
	};

	return ConfigSchema.parse(raw);
}
