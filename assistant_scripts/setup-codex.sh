#!/bin/bash
set -e

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc || source ~/.zshrc
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed."
    echo "Please install Docker from https://orbstack.dev/ (recommended) or https://docs.docker.com/desktop/setup/install/mac-install/"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
bun install

# Start local Supabase
echo "Starting local Supabase..."
npx supabase start

# Update environment variables
echo "Setting up local environment variables..."
bun run setup-local-env

# Ask if user wants to import data
read -p "Do you want to import data from production? (This requires additional keys) [y/N]: " import_data
if [[ $import_data =~ ^[Yy]$ ]]; then
    echo "Importing data from production..."
    bun run sync-data-from-prod
fi

# Start development server
echo "Starting development server..."
bun run dev:local

echo "✨ Setup complete! The development server is now running." 