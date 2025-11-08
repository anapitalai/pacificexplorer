#!/usr/bin/env node

/**
 * Script to remove duplicate destinations from database
 * Keeps the oldest destination (smallest ID) for each name+province combination
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicateDestinations() {
  console.log('🧹 Removing duplicate destinations...\n');

  try {
    // Get all destinations grouped by name+province
    const allDestinations = await prisma.destination.findMany({
      orderBy: { id: 'asc' } // Oldest first
    });

    console.log(`📊 Found ${allDestinations.length} total destinations`);

    // Group by name+province
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
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`❌ Found ${duplicates.length} sets of duplicates\n`);

    // Remove duplicates, keeping only the first (oldest) one
    let totalDeleted = 0;
    let skippedDueToRelations = 0;

    for (const dup of duplicates) {
      const toDelete = dup.destinations.slice(1); // Keep first, delete rest
      console.log(`🗑️  ${dup.name} (${dup.province}): keeping ID ${dup.destinations[0].id}, deleting ${toDelete.length} duplicates`);

      for (const dest of toDelete) {
        // Check if this destination has related records
        const bookingCount = await prisma.booking.count({
          where: { destinationId: dest.id }
        });

        const hotelCount = await prisma.hotel.count({
          where: { destinationId: dest.id }
        });

        if (bookingCount > 0 || hotelCount > 0) {
          console.log(`   ⚠️  Skipping ID ${dest.id} - has ${bookingCount} bookings and ${hotelCount} hotels`);
          skippedDueToRelations++;
          continue;
        }

        try {
          await prisma.destination.delete({
            where: { id: dest.id }
          });
          totalDeleted++;
          console.log(`   ✅ Deleted ID ${dest.id}`);
        } catch (error) {
          console.log(`   ❌ Failed to delete ID ${dest.id}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Successfully removed ${totalDeleted} duplicate destinations`);
    console.log(`⚠️  Skipped ${skippedDueToRelations} destinations due to existing relationships`);
    console.log(`📊 Remaining destinations: ${allDestinations.length - totalDeleted}`);

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
removeDuplicateDestinations();
