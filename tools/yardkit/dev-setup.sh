#!/usr/bin/env bash
#
# Local development setup for Yardkit
# Run this script to link the yardkit CLI for local testing
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting up Yardkit for local development..."
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Build the project
echo "🏗️  Building TypeScript..."
npm run build
echo ""

# Make CLI executable
echo "🔗 Marking CLI as executable..."
chmod +x dist/cli.js
echo ""

# Optionally link globally
read -p "🌐 Link yardkit globally? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🔗 Linking globally (requires sudo for global npm)..."
  npm link
  echo ""
  echo "✅ Yardkit linked globally! You can now run:"
  echo "   yardkit --help"
  echo "   yardkit run --task <id>"
  echo ""
else
  echo "✅ Setup complete! Run locally with:"
  echo "   npm start -- --help"
  echo "   npm start -- run --task <id>"
  echo "   or directly:"
  echo "   node dist/cli.js --help"
  echo ""
fi

echo "📖 See README.md for usage documentation"
echo "📋 See BOOTSTRAP_COMPLETE.md for next steps"
