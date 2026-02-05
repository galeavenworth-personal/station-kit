#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_PATTERNS = [
	'OWNER/REPO',
	'INSERT CONTACT METHOD',
	'INSERT CONTACT',
	'YOUR_ORG',
	'YOUR_EMAIL',
];

const DEFAULT_EXCLUDES = new Set([
	'.git',
	'.kilocode',
	'node_modules',
	'dist',
	'build',
	'docs',
	'pre-flight',
	'plans',
	'scripts',
	'private',
	'venv',
	'.venv',
	'__pycache__',
]);

const TEXT_EXTENSIONS = new Set([
	'.md',
	'.txt',
	'.yml',
	'.yaml',
	'.toml',
	'.json',
	'.py',
	'.js',
	'.ts',
	'.tsx',
	'.jsx',
	'.sh',
	'.bash',
	'.zsh',
	'.cfg',
	'.ini',
	'.rst',
	'.html',
	'.css',
	'.scss',
]);

const args = process.argv.slice(2);
const options = {
	root: '.',
	includeDocs: false,
	scanCodeBlocks: false,
	patterns: [],
};

for (let i = 0; i < args.length; i += 1) {
	const arg = args[i];
	if (arg === '--root') {
		options.root = args[i + 1];
		i += 1;
		continue;
	}
	if (arg === '--include-docs') {
		options.includeDocs = true;
		continue;
	}
	if (arg === '--scan-code-blocks') {
		options.scanCodeBlocks = true;
		continue;
	}
	if (arg === '--pattern') {
		options.patterns.push(args[i + 1]);
		i += 1;
	}
}

const root = path.resolve(options.root);
const patterns =
	options.patterns.length > 0 ? options.patterns : DEFAULT_PATTERNS;
const regexes = patterns.map((pattern) => new RegExp(pattern));

const excludes = new Set(DEFAULT_EXCLUDES);
if (options.includeDocs) {
	excludes.delete('docs');
}

const isTextLike = (filePath) => {
	const ext = path.extname(filePath).toLowerCase();
	if (TEXT_EXTENSIONS.has(ext)) {
		return true;
	}
	return ext === '';
};

const stripInlineCode = (line) => line.replace(/`[^`]*`/g, '');

const scanFile = (filePath, scanCodeBlocks) => {
	let content;
	try {
		content = fs.readFileSync(filePath, 'utf8');
	} catch (error) {
		return [];
	}

	const results = [];
	let inCodeBlock = false;
	const lines = content.split(/\r?\n/);
	lines.forEach((line, index) => {
		if (line.trim().startsWith('```')) {
			inCodeBlock = !inCodeBlock;
			return;
		}
		if (inCodeBlock && !scanCodeBlocks) {
			return;
		}
		const lineForScan = stripInlineCode(line);
		for (const rx of regexes) {
			if (rx.test(lineForScan)) {
				results.push([index + 1, line.trim()]);
				break;
			}
		}
	});

	return results;
};

const iterFiles = (dir) => {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (entry.isDirectory()) {
			if (excludes.has(entry.name)) {
				continue;
			}
			files.push(...iterFiles(path.join(dir, entry.name)));
			continue;
		}
		files.push(path.join(dir, entry.name));
	}
	return files;
};

let failures = 0;
for (const filePath of iterFiles(root)) {
	if (!isTextLike(filePath)) {
		continue;
	}
	const hits = scanFile(filePath, options.scanCodeBlocks);
	if (hits.length === 0) {
		continue;
	}
	const rel = path.relative(root, filePath);
	for (const [lineNumber, line] of hits) {
		console.log(`${rel}:${lineNumber}: ${line}`);
		failures += 1;
	}
}

if (failures > 0) {
	console.error(`Found ${failures} placeholder occurrence(s).`);
	process.exit(1);
}

console.log('No placeholders found.');
