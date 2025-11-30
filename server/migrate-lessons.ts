import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

/**
 * Migration script to add missing fields to existing lessons
 * Run this once to backfill description, requiredLevel, and estimatedTime
 */
async function migrateLessons() {
  console.log("Starting lesson migration...");
  
  try {
    const lessonsRef = collection(db, "lessons");
    const snapshot = await getDocs(lessonsRef);
    
    console.log(`Found ${snapshot.size} lessons to migrate`);
    
    let updated = 0;
    const promises = snapshot.docs.map(async (lessonDoc) => {
      const lessonData = lessonDoc.data();
      const updates: any = {};
      
      // Add description if missing
      if (lessonData.description === undefined) {
        updates.description = "";
      }
      
      // Add requiredLevel if missing
      if (lessonData.requiredLevel === undefined) {
        updates.requiredLevel = 0;
      }
      
      // Add estimatedTime if missing
      if (lessonData.estimatedTime === undefined) {
        updates.estimatedTime = "10 min";
      }
      
      // Only update if there are missing fields
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "lessons", lessonDoc.id), updates);
        updated++;
        console.log(`Updated lesson: ${lessonData.title} (${lessonDoc.id})`);
      }
    });
    
    await Promise.all(promises);
    
    console.log(`\n✅ Migration complete! Updated ${updated} lessons.`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLessons()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateLessons };
