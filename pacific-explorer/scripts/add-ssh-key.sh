#!/bin/bash

# Script to add SSH key to authorized_keys on the server
# Run this on the server: 170.64.195.201

echo "Adding SSH public key to authorized_keys..."

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key to authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE1sHQ3d6KTXK8nWPFc2pkdT3XnS2lSNAeHAJYhFwfeC pacific-explorer-deploy" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

echo "SSH key added successfully!"
echo "You can now use SSH key authentication from your local machine."
