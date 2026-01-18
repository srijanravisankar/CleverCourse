"use server";

/**
 * Seed Gamification Data
 *
 * Seeds the default achievements into the database.
 * This should be called once when the app starts or when achievements are missing.
 */

import { achievementRepository } from "@/db/repositories";
import { DEFAULT_ACHIEVEMENTS } from "@/db/achievements";

/**
 * Seed all default achievements into the database
 */
export async function seedAchievements(): Promise<{
  success: boolean;
  seeded: number;
  skipped: number;
}> {
  let seeded = 0;
  let skipped = 0;

  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    try {
      // Check if achievement already exists
      const existing = await achievementRepository.findById(achievement.id);
      if (existing) {
        skipped++;
        continue;
      }

      // Create the achievement
      await achievementRepository.createWithId(achievement);
      seeded++;
    } catch (error) {
      console.error(`Failed to seed achievement ${achievement.id}:`, error);
    }
  }

  console.log(`Seeded ${seeded} achievements, skipped ${skipped} existing`);
  return { success: true, seeded, skipped };
}

/**
 * Check if achievements need to be seeded
 */
export async function checkAchievementsSeeded(): Promise<boolean> {
  const achievements = await achievementRepository.findAll();
  return achievements.length >= DEFAULT_ACHIEVEMENTS.length;
}
