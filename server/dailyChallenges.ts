import { storage } from "./storage-firestore";

/**
 * Daily Challenge Generator
 * Assigns random quizzes and code challenges to users each day
 */
export class DailyChallengeGenerator {
  
  /**
   * Get or create daily challenges for a user
   */
  async getDailyChallenges(userId: string): Promise<{
    quizChallenge: any;
    codeChallenge: any;
    dailyChallenges: any[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existing = await storage.getDailyChallenges(userId, today);

    // Check which challenge types already exist
    const quizRecord = existing.find(c => c.challengeType === "quiz");
    const codeRecord = existing.find(c => c.challengeType === "code");

    // If both challenges exist, return them
    if (quizRecord && codeRecord) {
      const quizChallenge = await storage.getQuiz(quizRecord.challengeId);
      const codeChallenge = await storage.getCodeChallenge(codeRecord.challengeId);

      return {
        quizChallenge,
        codeChallenge,
        dailyChallenges: existing,
      };
    }

    // Get user to determine their level and preferences
    const user = await storage.getUser(userId);
    if (!user) {
      return { quizChallenge: null, codeChallenge: null, dailyChallenges: [] };
    }

    // Difficulty mapping based on level with more variety
    const getDifficultyOptions = (level: number): string[] => {
      if (level < 3) return ["beginner", "easy"];
      if (level < 7) return ["easy", "beginner", "medium"];
      if (level < 12) return ["easy", "medium"];
      if (level < 18) return ["medium", "intermediate"];
      return ["medium", "intermediate", "hard", "advanced"];
    };

    const targetDifficulties = getDifficultyOptions(user.level);
    
    // Variety: Mix difficulties based on day of week
    const dayOfWeek = today.getDay();
    const preferEasier = dayOfWeek === 1 || dayOfWeek === 6; // Monday or Saturday
    const preferHarder = dayOfWeek === 3 || dayOfWeek === 5; // Wednesday or Friday

    // Start with existing challenges
    const challenges = [...existing];
    let finalQuizChallenge = null;
    let finalCodeChallenge = null;

    // Handle quiz challenge
    if (quizRecord) {
      // Quiz already exists, fetch its details
      finalQuizChallenge = await storage.getQuiz(quizRecord.challengeId);
    } else {
      // Need to create a new quiz challenge
      const recentQuizAttempts = await storage.getUserQuizAttempts(userId, 10);
      const recentQuizIds = new Set(recentQuizAttempts.map(a => a.quizId));
      
      let allQuizzes = await storage.getQuizzes(
        user.currentCareerPathId || undefined, 
        user.level
      );
      allQuizzes = allQuizzes.filter(q => !recentQuizIds.has(q.id));

      const suitableQuizzes = allQuizzes.filter(q => 
        targetDifficulties.includes(q.difficulty) ||
        (preferEasier && (q.difficulty === "beginner" || q.difficulty === "easy")) ||
        (preferHarder && (q.difficulty === "advanced" || q.difficulty === "hard"))
      );
      
      const quizzesToChoose = suitableQuizzes.length > 0 ? suitableQuizzes : allQuizzes;
      const randomQuiz = quizzesToChoose.length > 0 
        ? quizzesToChoose[Math.floor(Math.random() * quizzesToChoose.length)]
        : null;
      
      if (randomQuiz) {
        const quizDC = await storage.createDailyChallenge(userId, "quiz", randomQuiz.id);
        challenges.push(quizDC);
        finalQuizChallenge = randomQuiz;
      }
    }

    // Handle code challenge
    if (codeRecord) {
      // Code challenge already exists, fetch its details
      finalCodeChallenge = await storage.getCodeChallenge(codeRecord.challengeId);
    } else {
      // Need to create a new code challenge
      let allCodeChallenges = await storage.getCodeChallenges(
        user.currentCareerPathId || undefined, 
        user.level
      );

      const suitableCodeChallenges = allCodeChallenges.filter(c => 
        targetDifficulties.includes(c.difficulty) ||
        (preferEasier && c.difficulty === "easy") ||
        (preferHarder && c.difficulty === "hard")
      );
      
      const codesToChoose = suitableCodeChallenges.length > 0 ? suitableCodeChallenges : allCodeChallenges;
      const randomCode = codesToChoose.length > 0
        ? codesToChoose[Math.floor(Math.random() * codesToChoose.length)]
        : null;
      
      if (randomCode) {
        const codeDC = await storage.createDailyChallenge(userId, "code", randomCode.id);
        challenges.push(codeDC);
        finalCodeChallenge = randomCode;
      }
    }

    return {
      quizChallenge: finalQuizChallenge,
      codeChallenge: finalCodeChallenge,
      dailyChallenges: challenges,
    };
  }

  /**
   * Get today's challenge for a user
   */
  async getTodayChallenge(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const challenges = await storage.getDailyChallenges(userId, today);
    
    console.log(`[DailyChallenge] getTodayChallenge for user ${userId}`);
    console.log(`[DailyChallenge] Found ${challenges.length} challenges, checking completion status...`);
    
    // Return first uncompleted challenge ONLY
    const uncompleted = challenges.find(c => !c.completed);
    if (uncompleted) {
      console.log(`[DailyChallenge] Returning uncompleted challenge: ${uncompleted.id}`);
      return uncompleted;
    }
    
    // If all completed, return null (don't show completed challenges)
    if (challenges.length > 0) {
      console.log(`[DailyChallenge] All ${challenges.length} challenges completed, returning null`);
      return null;
    }
    
    // If none exist, create new ones
    console.log(`[DailyChallenge] No challenges exist, creating new ones...`);
    const result = await this.getDailyChallenges(userId);
    return result.dailyChallenges[0] || null;
  }

  /**
   * Mark a daily challenge as complete
   */
  async completeDailyChallenge(userId: string, challengeId: string, challengeType: "quiz" | "code"): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const challenges = await storage.getDailyChallenges(userId, today);
    
    console.log(`[DailyChallenge] Marking complete - userId: ${userId}, challengeId: ${challengeId}, type: ${challengeType}`);
    console.log(`[DailyChallenge] Found ${challenges.length} daily challenges for today`);
    
    const challenge = challenges.find(
      c => c.challengeId === challengeId && c.challengeType === challengeType
    );

    if (challenge) {
      console.log(`[DailyChallenge] Found matching challenge record: ${challenge.id}, marking as complete`);
      await storage.markDailyChallengeComplete(challenge.id);
    } else {
      console.log(`[DailyChallenge] WARNING: No matching daily challenge found!`);
      console.log(`[DailyChallenge] Available challenges:`, challenges.map(c => ({ 
        id: c.id, 
        challengeId: c.challengeId, 
        type: c.challengeType,
        completed: c.completed 
      })));
    }
  }
}

export const dailyChallengeGenerator = new DailyChallengeGenerator();
