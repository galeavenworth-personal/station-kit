# Virtual Environment Mandate

You must use the already activated virtual environment for all Python commands and packages. No exceptions.

I have other projects that depend on the exact versions of packages installed, and global package management can break those projects.

## Best Practices

- Always use `{{KFK_PYTHON_RUNNER}} -m ...` for Python execution
- Never install packages globally
- Verify virtual environment is activated before running commands
- Use `which python` to confirm you're using the project's Python

## Examples

```bash
# Correct
{{KFK_PYTHON_RUNNER}} -m pytest
{{KFK_PYTHON_RUNNER}} -m mypy {{KFK_MYPY_TARGET}}
{{KFK_PYTHON_RUNNER}} -m ruff check .

# Incorrect
python -c "import your_project; your_project.main()"  # May use wrong Python
pip install package  # May install globally
```
