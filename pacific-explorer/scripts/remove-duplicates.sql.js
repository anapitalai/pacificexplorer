#!/usr/bin/env node

/**
 * Script to remove duplicate destinations using raw SQL
 * This script identifies duplicates by name+province and keeps only the oldest one
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicateDestinations() {
  console.log('🧹 Removing duplicate destinations...\n');

  try {
    // Use raw SQL to find and delete duplicates, keeping only the oldest (smallest ID)
    const result = await prisma.$executeRaw`
      DELETE FROM "Destination"
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM "Destination"
        GROUP BY name, province
      )
    `;

    console.log(`✅ Removed ${result} duplicate destinations`);

    // Show remaining destinations
    const remaining = await prisma.destination.findMany({
      select: { id: true, name: true, province: true },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Remaining destinations: ${remaining.length}`);
    remaining.forEach(dest => {
      console.log(`   - ${dest.name} (${dest.province})`);
    });

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
removeDuplicateDestinations();
