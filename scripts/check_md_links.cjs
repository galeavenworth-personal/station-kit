#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const LINK_REGEX = /\[[^\]]*\]\(([^)]+)\)/g;
const GITHUB_LINE_REF_REGEX = /:\d+$/;
const HEADING_REGEX = /^(#{1,6})\s+(.*?)\s*$/;
const MD_LINK_TEXT_REGEX = /\[([^\]]+)\]\([^)]+\)/g;

const args = process.argv.slice(2);
const options = {
	root: '.',
	includeTemplates: false,
	github: false,
};

for (let i = 0; i < args.length; i += 1) {
	const arg = args[i];
	if (arg === '--root') {
		options.root = args[i + 1];
		i += 1;
		continue;
	}
	if (arg === '--include-templates') {
		options.includeTemplates = true;
		continue;
	}
	if (arg === '--github') {
		options.github = true;
	}
}

const repoRoot = path.resolve(options.root);
const docsRoot = path.join(repoRoot, 'docs');
const templatesRoot = path.join(repoRoot, 'templates');
const readme = path.join(repoRoot, 'README.md');

const iterMarkdownFiles = (dir) => {
	if (!fs.existsSync(dir)) {
		return [];
	}
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...iterMarkdownFiles(fullPath));
			continue;
		}
		if (entry.isFile() && fullPath.endsWith('.md')) {
			files.push(fullPath);
		}
	}
	return files;
};

const isHttp = (link) =>
	link.startsWith('http://') || link.startsWith('https://');
const isMailto = (link) => link.startsWith('mailto:');

const normalizeLink = (link) => {
	let base = link.split('#')[0];
	if (base.startsWith('file://')) {
		base = base.replace('file://', '');
	}
	return base;
};

const extractFragment = (link) => {
	if (!link.includes('#')) {
		return null;
	}
	const fragment = link.split('#')[1]?.trim();
	return fragment || null;
};

const normalizeHeadingText = (text) => {
	const withoutLinks = text.replace(MD_LINK_TEXT_REGEX, '$1');
	return withoutLinks.replace(/[`*_]/g, '').trim();
};

const slugifyGithub = (text) => {
	let slug = normalizeHeadingText(text).toLowerCase();
	slug = slug.replace(/[^a-z0-9\s-]/g, '');
	slug = slug.replace(/\s+/g, '-');
	slug = slug.replace(/-+/g, '-');
	return slug.replace(/^-|-$/g, '');
};

const buildAnchorIndex = (content) => {
	const anchors = new Set();
	const seen = new Map();
	for (const line of content.split(/\r?\n/)) {
		const match = line.match(HEADING_REGEX);
		if (!match) {
			continue;
		}
		const heading = match[2].trim();
		const slug = slugifyGithub(heading);
		if (!slug) {
			continue;
		}
		const count = seen.get(slug) ?? 0;
		const anchor = count ? `${slug}-${count}` : slug;
		seen.set(slug, count + 1);
		anchors.add(anchor);
	}
	return anchors;
};

const anchorCache = new Map();

const getAnchorIndex = (filePath) => {
	if (anchorCache.has(filePath)) {
		return anchorCache.get(filePath);
	}
	let content;
	try {
		content = fs.readFileSync(filePath, 'utf8');
	} catch (error) {
		anchorCache.set(filePath, new Set());
		return anchorCache.get(filePath);
	}
	const anchors = buildAnchorIndex(content);
	anchorCache.set(filePath, anchors);
	return anchors;
};

const hasGithubLineRef = (link) => {
	const base = link.split('#')[0];
	return GITHUB_LINE_REF_REGEX.test(base);
};

const validateLink = (filePath, link) => {
	if (!link || link.startsWith('#')) {
		const fragment = extractFragment(link);
		if (!fragment) {
			return true;
		}
		const anchors = getAnchorIndex(filePath);
		return anchors.has(fragment);
	}
	if (isHttp(link) || isMailto(link)) {
		return true;
	}
	if (options.github && hasGithubLineRef(link)) {
		return false;
	}
	const fragment = extractFragment(link);
	const normalized = normalizeLink(link);
	if (!normalized) {
		return true;
	}
	let target;
	if (normalized.startsWith('/')) {
		target = path.join(repoRoot, normalized.replace(/^\//, ''));
	} else if (normalized.startsWith('./') || normalized.startsWith('../')) {
		target = path.resolve(path.dirname(filePath), normalized);
	} else if (normalized.includes('/')) {
		target = path.resolve(repoRoot, normalized);
	} else {
		target = path.resolve(path.dirname(filePath), normalized);
	}
	if (!fs.existsSync(target)) {
		return false;
	}
	if (!fragment) {
		return true;
	}
	if (!target.endsWith('.md')) {
		return false;
	}
	const anchors = getAnchorIndex(target);
	return anchors.has(fragment);
};

const scanFile = (filePath) => {
	const failures = [];
	const content = fs.readFileSync(filePath, 'utf8');
	const lines = content.split(/\r?\n/);
	lines.forEach((line, index) => {
		for (const match of line.matchAll(LINK_REGEX)) {
			const link = match[1].trim();
			if (!validateLink(filePath, link)) {
				failures.push([index + 1, link]);
			}
		}
	});
	return failures;
};

const candidates = [];
if (fs.existsSync(readme)) {
	candidates.push(readme);
}
if (fs.existsSync(docsRoot)) {
	candidates.push(...iterMarkdownFiles(docsRoot));
}
if (options.includeTemplates && fs.existsSync(templatesRoot)) {
	candidates.push(...iterMarkdownFiles(templatesRoot));
}

let failures = 0;
for (const filePath of candidates) {
	let hits;
	try {
		hits = scanFile(filePath);
	} catch (error) {
		continue;
	}
	for (const [lineNumber, link] of hits) {
		const rel = path.relative(repoRoot, filePath);
		console.log(`${rel}:${lineNumber}: ${link}`);
		failures += 1;
	}
}

if (failures > 0) {
	console.error(`Found ${failures} broken repo-relative link(s).`);
	process.exit(1);
}

console.log('Markdown link validation passed.');
