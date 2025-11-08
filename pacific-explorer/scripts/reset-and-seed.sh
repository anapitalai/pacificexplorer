#!/bin/bash

# 🔄 Database Reset & Seed Script
# This script resets the database and automatically seeds it with default data

set -e  # Exit on error

echo "╔════════════════════════════════════════════════╗"
echo "║  🔄 Database Reset & Seed                      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Confirm action
echo -e "${YELLOW}⚠️  WARNING: This will delete all data in the database!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Operation cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 2: Reset database schema
echo -e "${BLUE}📊 Step 1: Resetting database schema...${NC}"
npx prisma db push --force-reset --accept-data-loss

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database schema reset successfully${NC}"
else
    echo -e "${RED}❌ Failed to reset database schema${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 3: Generate Prisma Client
echo -e "${BLUE}🔧 Step 2: Generating Prisma Client...${NC}"
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 4: Seed database
echo -e "${BLUE}🌱 Step 3: Seeding database with default data...${NC}"
npm run prisma:seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 5: Summary
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Database Reset Complete!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📊 Default data has been seeded:${NC}"
echo "   • Admin account: anapitalai / admin123"
echo "   • Sample destinations"
echo ""
echo -e "${YELLOW}🔐 Login credentials:${NC}"
echo "   📧 Email:    anapitalai@admin.com"
echo "   👤 Username: anapitalai"
echo "   🔑 Password: admin123"
echo ""
echo -e "${YELLOW}⚠️  Remember to change the default password after login!${NC}"
echo ""
