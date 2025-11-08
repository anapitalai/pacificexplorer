#!/bin/bash

# Alternative deployment script that handles SSH setup
# Run this if SSH keys aren't working

set -e

SERVER="root@170.64.195.201"
PROJECT_PATH="/home/alois/Documents/cassini_hackathon"
REMOTE_PATH="/opt/pacific-explorer"

echo "🔧 Setting up SSH key authentication..."

# Check if we have the key
if [ ! -f ~/.ssh/id_ed25519_remote.pub ]; then
    echo "❌ SSH key not found. Please run the key generation first."
    exit 1
fi

echo "📋 Public key to add to server:"
echo "========================================"
cat ~/.ssh/id_ed25519_remote.pub
echo "========================================"
echo ""
echo "📝 Manual steps needed:"
echo "1. SSH to server: ssh root@$SERVER"
echo "2. Edit authorized_keys: nano ~/.ssh/authorized_keys"
echo "3. Add the public key above to the file"
echo "4. Save and exit"
echo "5. Set correct permissions: chmod 600 ~/.ssh/authorized_keys"
echo "6. Test connection: ssh root@$SERVER 'echo success'"
echo ""
read -p "Press Enter after completing the above steps..."

echo "🧪 Testing SSH connection..."
if ssh -o ConnectTimeout=5 root@$SERVER "echo 'SSH connection successful'"; then
    echo "✅ SSH authentication working!"
    echo "🚀 Running deployment..."
    cd $PROJECT_PATH/pacific-explorer
    ./scripts/quick-deploy.sh
else
    echo "❌ SSH still not working. Please check the setup."
    exit 1
fi
