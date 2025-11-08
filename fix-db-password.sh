#!/bin/bash

# PostGIS Database Password Persistence Fix
# This script applies the configuration changes to prevent automatic password resets

echo "🔧 Applying PostGIS database password persistence fix..."

# Change to the correct directory
cd /home/alois/Documents/cassini_hackathon

# Delete the old secret if it exists
echo "🗑️  Removing old secret..."
kubectl delete secret postgis-superuser-secret --ignore-not-found=true

# Apply the updated configuration
echo "📦 Applying updated configuration..."
kubectl apply -f postgis_bare.yaml

# Wait a moment for resources to be created
sleep 3

# Verify the secret exists
echo "🔍 Verifying persistent secret..."
kubectl get secret postgis-superuser-secret-persistent -o yaml | grep -E "(name:|password:)" | head -3

# Check cluster configuration
echo "🔍 Verifying cluster uses persistent secret..."
kubectl get cluster nsdi-postgis -o yaml | grep -A 3 superuserSecret

echo "✅ Password persistence fix applied!"
echo "   Database password 'admin123' should now persist across deployments"
echo "   Secret name: postgis-superuser-secret-persistent"
echo ""
echo "💡 If you still experience password resets, the cluster may need to be recreated:"
echo "   kubectl delete cluster nsdi-postgis"
echo "   kubectl apply -f postgis_bare.yaml"
