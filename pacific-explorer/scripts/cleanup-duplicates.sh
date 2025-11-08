#!/bin/bash

# Script to reset and reseed the database, which will clean up duplicates
# This runs the reset-and-seed script which clears destinations and recreates them

echo "🔄 Resetting database and reseeding to clean up duplicates..."
echo ""

# Run the reset and seed script
./scripts/reset-and-seed.sh

echo ""
echo "✅ Database has been reset and reseeded."
echo "   Any duplicate destinations have been removed."
echo "   Future runs of the seed script will use upsert to prevent duplicates."
