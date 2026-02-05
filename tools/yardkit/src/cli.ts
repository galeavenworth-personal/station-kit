#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { createRunCommand } from './commands/run.js';
import { createShiftCommand } from './commands/shift.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
	try {
		// Load package.json for version
		const packageJsonPath = join(__dirname, '../package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		// Load configuration
		const config = loadConfig();

		// Create CLI program
		const program = new Command();

		program
			.name('yardkit')
			.description(
				'Hybrid Supervisor - Deterministic control plane for multi-line agentic workflows',
			)
			.version(packageJson.version);

		// Register commands
		program.addCommand(createRunCommand(config));
		program.addCommand(createShiftCommand(config));

		// Parse and execute
		await program.parseAsync(process.argv);
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'Fatal error',
		);
		process.exit(1);
	}
}

main();
