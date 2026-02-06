import { createHash } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

export interface WorkflowPreflightOptions {
	repoRoot: string;
	templatesRoot?: string;
	workflowsRoot?: string;
}

interface WorkflowMismatch {
	path: string;
	expectedHash: string;
	observedHash: string;
}

interface WorkflowPreflightReport {
	missing: WorkflowMismatch[];
	stale: WorkflowMismatch[];
	unexpected: string[];
}

const WORKFLOW_COPY_GUIDANCE = [
	'Remediation:',
	'- Copy canonical templates into the repo root:',
	'  cp -R templates/.kilocode ./.kilocode',
	'- Re-run Yardkit after syncing workflows.',
	'- If you intentionally customized workflows, re-apply changes after copying.',
	'See docs/INSTALL.md Step 1 for context.',
].join('\n');

export async function assertWorkflowsInSync(
	options: WorkflowPreflightOptions,
): Promise<void> {
	const templatesRoot =
		options.templatesRoot ??
		join(options.repoRoot, 'templates', '.kilocode', 'workflows');
	const workflowsRoot =
		options.workflowsRoot ?? join(options.repoRoot, '.kilocode', 'workflows');

	await assertDirectoryExists(
		templatesRoot,
		`Templates directory missing: ${formatRepoRelativePath(
			options.repoRoot,
			templatesRoot,
		)}`,
	);
	await assertDirectoryExists(
		workflowsRoot,
		`Installed workflows directory missing: ${formatRepoRelativePath(
			options.repoRoot,
			workflowsRoot,
		)}`,
	);

	const templateFiles = await listFilesRecursive(templatesRoot);
	const installedFiles = new Set(await listFilesRecursive(workflowsRoot));

	const report: WorkflowPreflightReport = {
		missing: [],
		stale: [],
		unexpected: [],
	};

	for (const templateRelPath of templateFiles) {
		const templatePath = join(templatesRoot, templateRelPath);
		const installedPath = join(workflowsRoot, templateRelPath);
		const expectedContent = await readNormalized(templatePath);
		const expectedHash = hashContent(expectedContent);
		installedFiles.delete(templateRelPath);

		try {
			await access(installedPath);
		} catch {
			report.missing.push({
				path: join('.kilocode', 'workflows', templateRelPath),
				expectedHash,
				observedHash: 'missing',
			});
			continue;
		}

		const observedContent = await readNormalized(installedPath);
		const observedHash = hashContent(observedContent);
		if (expectedHash !== observedHash) {
			report.stale.push({
				path: join('.kilocode', 'workflows', templateRelPath),
				expectedHash,
				observedHash,
			});
		}
	}

	if (installedFiles.size > 0) {
		report.unexpected = Array.from(installedFiles).map((file) =>
			join('.kilocode', 'workflows', file),
		);
	}

	if (
		report.missing.length ||
		report.stale.length ||
		report.unexpected.length
	) {
		throw new Error(formatPreflightError(report));
	}
}

async function assertDirectoryExists(
	path: string,
	message: string,
): Promise<void> {
	try {
		await access(path);
	} catch {
		throw new Error(`${message}\n${WORKFLOW_COPY_GUIDANCE}`);
	}
}

function formatPreflightError(report: WorkflowPreflightReport): string {
	const lines: string[] = [
		'Workflow preflight failed: repo-managed workflows are missing or stale.',
		'Expect .kilocode/workflows to match templates/.kilocode/workflows.',
	];

	if (report.missing.length) {
		lines.push('Missing workflows:');
		for (const item of report.missing) {
			lines.push(
				`- ${item.path} (expected ${item.expectedHash}, observed ${item.observedHash})`,
			);
		}
	}

	if (report.stale.length) {
		lines.push('Stale workflows (content mismatch after CRLF normalization):');
		for (const item of report.stale) {
			lines.push(
				`- ${item.path} (expected ${item.expectedHash}, observed ${item.observedHash})`,
			);
		}
	}

	if (report.unexpected.length) {
		lines.push('Unexpected workflows (not in templates):');
		for (const item of report.unexpected) {
			lines.push(`- ${item}`);
		}
	}

	lines.push(WORKFLOW_COPY_GUIDANCE);
	return lines.join('\n');
}

async function listFilesRecursive(root: string): Promise<string[]> {
	const entries = await readdir(root, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const entryPath = join(root, entry.name);
		if (entry.isDirectory()) {
			const nested = await listFilesRecursive(entryPath);
			for (const nestedPath of nested) {
				files.push(nestedPath);
			}
			continue;
		}
		files.push(relative(root, entryPath));
	}
	return files.sort();
}

async function readNormalized(path: string): Promise<string> {
	const content = await readFile(path, 'utf-8');
	return content.replace(/\r\n/g, '\n');
}

function hashContent(content: string): string {
	return createHash('sha256').update(content).digest('hex');
}

function formatRepoRelativePath(repoRoot: string, path: string): string {
	const rel = relative(repoRoot, path);
	return rel.startsWith('.') ? path : rel;
}
