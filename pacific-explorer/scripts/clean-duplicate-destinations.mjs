#!/usr/bin/env node

/**
 * Script to identify and remove duplicate destinations
 * Run this script to clean up duplicate entries in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAndRemoveDuplicateDestinations() {
  console.log('🔍 Checking for duplicate destinations...\n');

  try {
    // Get all destinations
    const allDestinations = await prisma.destination.findMany({
      orderBy: { createdAt: 'asc' } // Keep oldest first
    });

    console.log(`📊 Total destinations in database: ${allDestinations.length}\n`);

    // Group by name and province to find duplicates
    const grouped = new Map();

    allDestinations.forEach(dest => {
      const key = `${dest.name}|${dest.province}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(dest);
    });

    // Find duplicates
    const duplicates = [];
    for (const [key, dests] of grouped) {
      if (dests.length > 1) {
        duplicates.push({
          key,
          name: dests[0].name,
          province: dests[0].province,
          count: dests.length,
          destinations: dests
        });
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicate destinations found!\n');
      return;
    }

    console.log(`❌ Found ${duplicates.length} sets of duplicate destinations:\n`);

    // Display duplicates
    duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. ${dup.name} (${dup.province}) - ${dup.count} duplicates`);
      dup.destinations.forEach((dest, i) => {
        console.log(`   ${i + 1}. ID: ${dest.id}, Created: ${dest.createdAt.toISOString()}`);
      });
      console.log('');
    });

    // Ask for confirmation before deleting
    console.log('⚠️  This will keep the OLDEST destination (by createdAt) and delete the rest.');
    console.log('💡 Consider backing up your database before proceeding.\n');

    // For now, let's just show what would be deleted
    // In a real scenario, you'd want user confirmation
    console.log('🧹 Destinations that would be DELETED:');
    let totalToDelete = 0;

    duplicates.forEach(dup => {
      const toDelete = dup.destinations.slice(1); // Keep first, delete rest
      totalToDelete += toDelete.length;

      toDelete.forEach(dest => {
        console.log(`   - ID ${dest.id}: ${dest.name} (${dest.province})`);
      });
    });

    console.log(`\n📈 Total destinations to delete: ${totalToDelete}`);
    console.log(`📈 Destinations to keep: ${allDestinations.length - totalToDelete}\n`);

    // Uncomment the following lines to actually perform the deletion
    /*
    console.log('🗑️  Deleting duplicate destinations...');

    for (const dup of duplicates) {
      const toDelete = dup.destinations.slice(1); // Keep first, delete rest

      for (const dest of toDelete) {
        await prisma.destination.delete({
          where: { id: dest.id }
        });
        console.log(`   ✅ Deleted destination ID ${dest.id}`);
      }
    }

    console.log('\n✅ Duplicate cleanup completed!');
    */

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
findAndRemoveDuplicateDestinations();
