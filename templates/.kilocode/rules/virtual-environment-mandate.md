# Node Environment Mandate

You must use the project’s pinned Node version and local package manager for all commands. No exceptions.

I have other projects that depend on the exact versions of packages installed, and global package management can break those projects.

## Best Practices

- Always use the repo gate entrypoints (e.g., `{{SK_GATE_CI_CMD}}`)
- Never install packages globally
- Verify the Node version matches `.nvmrc`
- Use `node --version` and `npm --version` to confirm the toolchain

## Examples

```bash
# Correct
{{SK_GATE_CI_CMD}}
{{SK_GATE_TYPECHECK_CMD}}
{{SK_GATE_LINT_CMD}}

# Incorrect
node -e "console.log(process.version)"  # Bypasses pinned version policy
npm install -g package  # May install globally
```
