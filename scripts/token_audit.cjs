#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const TOKEN_REGEX = /\{\{\s*(SK_[A-Z0-9_]+)\s*\}\}/g;

const args = process.argv.slice(2);
const options = {
	templates: 'templates',
	allowlist: 'docs/CONFIG_REFERENCE.md',
};

for (let i = 0; i < args.length; i += 1) {
	const arg = args[i];
	if (arg === '--templates') {
		options.templates = args[i + 1];
		i += 1;
		continue;
	}
	if (arg === '--allowlist') {
		options.allowlist = args[i + 1];
		i += 1;
	}
}

const templatesRoot = path.resolve(options.templates);
const allowlistPath = path.resolve(options.allowlist);

if (!fs.existsSync(templatesRoot)) {
	console.error(`Templates directory not found: ${templatesRoot}`);
	process.exit(2);
}

if (!fs.existsSync(allowlistPath)) {
	console.error(`Allowlist file not found: ${allowlistPath}`);
	process.exit(2);
}

const extractTokensFromTemplates = (dir) => {
	const tokens = new Set();
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			for (const token of extractTokensFromTemplates(fullPath)) {
				tokens.add(token);
			}
			continue;
		}
		let content;
		try {
			content = fs.readFileSync(fullPath, 'utf8');
		} catch (error) {
			continue;
		}
		for (const match of content.matchAll(TOKEN_REGEX)) {
			tokens.add(match[1]);
		}
	}
	return tokens;
};

const extractAllowlistFromConfigReference = (filePath) => {
	const content = fs.readFileSync(filePath, 'utf8');
	const lines = content.split(/\r?\n/);
	const allowlist = new Set();
	let inBlock = false;
	let seenMarker = false;

	for (const line of lines) {
		if (line.trim().startsWith('```')) {
			inBlock = !inBlock;
			continue;
		}
		if (!inBlock) {
			continue;
		}
		const trimmed = line.trim();
		if (!trimmed) {
			continue;
		}
		if (trimmed.startsWith('#') && trimmed.includes('SK_TOKEN_ALLOWLIST')) {
			seenMarker = true;
			continue;
		}
		if (!seenMarker) {
			continue;
		}
		if (trimmed.startsWith('#')) {
			continue;
		}
		allowlist.add(trimmed);
	}

	return allowlist;
};

const tokens = extractTokensFromTemplates(templatesRoot);
const allowlist = extractAllowlistFromConfigReference(allowlistPath);

const missing = [...tokens].filter((token) => !allowlist.has(token)).sort();
if (missing.length > 0) {
	console.error('Tokens used in templates but missing from allowlist:');
	for (const token of missing) {
		console.error(`- ${token}`);
	}
	process.exit(1);
}

console.log('Token audit passed.');
