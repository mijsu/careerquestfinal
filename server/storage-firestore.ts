import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  addDoc,
  Timestamp,
  QueryConstraint,
  increment,
  writeBatch
} from "firebase/firestore";
import type {
  User,
  InsertUser,
  CareerPath,
  InsertCareerPath,
  Badge,
  InsertBadge,
  Quiz,
  InsertQuiz,
  Question,
  InsertQuestion,
  QuizAttempt,
  InsertQuizAttempt,
  QuestionAttempt,
  InsertQuestionAttempt,
  CodeChallenge,
  InsertCodeChallenge,
  ChallengeAttempt,
  InsertChallengeAttempt,
  InterestResponse,
  InsertInterestResponse,
  AuditLog,
  InsertAuditLog,
  UserBadge,
  DailyChallenge,
  SyllabusUpload,
} from "@shared/schema";

function generateId(): string {
  return doc(collection(db, "temp")).id;
}

/**
 * Convert Firestore Timestamp objects to JavaScript Date objects
 * This ensures proper JSON serialization in API responses
 */
function serializeTimestamps<T>(data: any): T {
  if (!data) return data;

  const serialized = { ...data };

  for (const key in serialized) {
    const value = serialized[key];

    // Convert Firestore Timestamp to Date
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      serialized[key] = new Date(value.seconds * 1000);
    }
    // Recursively handle nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      serialized[key] = serializeTimestamps(value);
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      serialized[key] = value.map(item => 
        typeof item === 'object' ? serializeTimestamps(item) : item
      );
    }
  }

  return serialized as T;
}

export class FirestoreStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;
    return serializeTimestamps<User>({ id: docSnap.id, ...docSnap.data() });
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("username", "==", username), firestoreLimit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return serializeTimestamps<User>({ id: doc.id, ...doc.data() });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("email", "==", email), firestoreLimit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const docData = snapshot.docs[0];
    return serializeTimestamps<User>({ id: docData.id, ...docData.data() });
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = generateId();
    const newUser: User = {
      id,
      ...user,
      level: 1,
      xp: 0,
      totalXp: 0,
      currentCareerPathId: user.currentCareerPathId || null,
      pathSelectionMode: user.pathSelectionMode || "ai-guided",
      hasCompletedInterestAssessment: false,
      isAdmin: false,
      currentStreak: 0,
      lastLoginDate: null,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    await setDoc(doc(db, "users", id), newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, { ...updates, lastActiveAt: new Date() });
    return this.getUser(id);
  }

  async deleteUser(id: string): Promise<void> {
    await deleteDoc(doc(db, "users", id));
  }

  async updateLoginStreak(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const userRef = doc(db, "users", userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get last login date from Firestore (stored as Timestamp)
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    // Fix: Convert Firestore Timestamp to Date using .toDate()
    const lastLoginDate = userData?.lastLoginDate?.toDate ? userData.lastLoginDate.toDate() : null;

    let newStreak = 1;

    if (lastLoginDate) {
      const lastLogin = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, keep current streak
        newStreak = userData?.currentStreak || 1;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak = (userData?.currentStreak || 0) + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    }

    // Calculate current rank based on XP
    const currentRank = this.calculateRank(user.totalXp);

    await updateDoc(userRef, {
      currentStreak: newStreak,
      lastLoginDate: now,
      lastActiveAt: now,
      currentRank,
    });
  }

  calculateRank(totalXp: number): string {
    if (totalXp < 10000) return "Junior";
    if (totalXp < 25000) return "Mid-Level";
    if (totalXp < 50000) return "Senior";
    return "Lead";
  }

  async getUserRank(userId: string): Promise<{ rank: string; progress: number; nextRank: string | null }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { rank: "Junior", progress: 0, nextRank: "Mid-Level" };
    }

    const rank = this.calculateRank(user.totalXp);
    const ranks = [
      { name: "Junior", minXp: 0 },
      { name: "Mid-Level", minXp: 10000 },
      { name: "Senior", minXp: 25000 },
      { name: "Lead", minXp: 50000 },
    ];

    const currentRankIndex = ranks.findIndex(r => r.name === rank);
    const nextRank = currentRankIndex < ranks.length - 1 ? ranks[currentRankIndex + 1] : null;
    
    const progress = nextRank 
      ? ((user.totalXp - ranks[currentRankIndex].minXp) / (nextRank.minXp - ranks[currentRankIndex].minXp)) * 100
      : 100;

    return {
      rank,
      progress,
      nextRank: nextRank?.name || null,
    };
  }

  async getUserQuizAttempts(userId: string, maxResults?: number): Promise<QuizAttempt[]> {
    const constraints: QueryConstraint[] = [where("userId", "==", userId)];
    if (maxResults) {
      constraints.push(orderBy("completedAt", "desc"), firestoreLimit(maxResults));
    }
    const q = query(collection(db, "quizAttempts"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<QuizAttempt>({ id: doc.id, ...doc.data() }));
  }

  async getRecentQuizAttempts(limitCount = 50): Promise<QuizAttempt[]> {
    const q = query(collection(db, "quizAttempts"), orderBy("completedAt", "desc"), firestoreLimit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<QuizAttempt>({ id: doc.id, ...doc.data() }));
  }

  async getUserQuestionAttempts(userId: string, maxResults?: number): Promise<QuestionAttempt[]> {
    const constraints: QueryConstraint[] = [where("userId", "==", userId)];
    if (maxResults) {
      constraints.push(orderBy("answeredAt", "desc"), firestoreLimit(maxResults));
    }
    const q = query(collection(db, "questionAttempts"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<QuestionAttempt>({ id: doc.id, ...doc.data() }));
  }

  async getUsersForLeaderboard(limitCount = 10): Promise<User[]> {
    const q = query(collection(db, "users"), orderBy("totalXp", "desc"), firestoreLimit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<User>({ id: doc.id, ...doc.data() }));
  }

  // Career Path operations
  async getCareerPaths(): Promise<CareerPath[]> {
    const snapshot = await getDocs(collection(db, "careerPaths"));
    return snapshot.docs.map(doc => serializeTimestamps<CareerPath>({ id: doc.id, ...doc.data() }));
  }

  async getCareerPath(id: string): Promise<CareerPath | undefined> {
    const docRef = doc(db, "careerPaths", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;
    return serializeTimestamps<CareerPath>({ id: docSnap.id, ...docSnap.data() });
  }

  async createCareerPath(path: InsertCareerPath): Promise<CareerPath> {
    const id = generateId();
    const newPath = {
      id,
      name: path.name,
      description: path.description,
      color: path.color,
      icon: path.icon,
      progressionRanks: path.progressionRanks as string[],
      requiredSkills: path.requiredSkills as string[],
      createdAt: new Date(),
    };
    await setDoc(doc(db, "careerPaths", id), newPath);
    return newPath as CareerPath;
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    const snapshot = await getDocs(collection(db, "badges"));
    const allBadges = snapshot.docs.map(doc => serializeTimestamps<Badge>({ id: doc.id, ...doc.data() }));
    
    // Deduplicate by name, prioritizing seeded badges (ones with badge_* IDs)
    const seededBadgeIds = new Set([
      "badge_level_10", "badge_level_20", "badge_first_challenge", "badge_ten_challenges",
      "badge_perfect_score", "badge_first_quiz", "badge_five_quizzes", "badge_streak_7",
      "badge_streak_30", "badge_path_finder"
    ]);
    
    const seen = new Set<string>();
    const deduped = allBadges.filter(badge => {
      // Always include seeded badges first
      if (seededBadgeIds.has(badge.id)) {
        if (!seen.has(badge.name)) {
          seen.add(badge.name);
          return true;
        }
        return false;
      }
      // For non-seeded badges, only include if we haven't seen this name yet
      if (!seen.has(badge.name)) {
        seen.add(badge.name);
        return true;
      }
      return false;
    });
    
    // Sort to ensure seeded badges come first
    deduped.sort((a, b) => {
      const aIsSeeded = seededBadgeIds.has(a.id) ? 0 : 1;
      const bIsSeeded = seededBadgeIds.has(b.id) ? 0 : 1;
      return aIsSeeded - bIsSeeded;
    });
    
    console.log(`[getBadges] Returning ${deduped.length} unique badges after deduplication`);
    return deduped;
  }

  async getBadge(id: string): Promise<Badge | undefined> {
    const docRef = doc(db, "badges", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;
    return serializeTimestamps<Badge>({ id: docSnap.id, ...docSnap.data() });
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = generateId();
    const newBadge: Badge = {
      id,
      ...badge,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "badges", id), newBadge);
    return newBadge;
  }

  async seedBadges(): Promise<void> {
    // Define all badges that the system can award
    const badgesToCreate = [
      { id: "badge_level_10", name: "Level 10", description: "Reached Level 10!", rarity: "rare" as const, icon: "Trophy" },
      { id: "badge_level_20", name: "Level 20", description: "Reached Level 20!", rarity: "rare" as const, icon: "Trophy" },
      { id: "badge_first_challenge", name: "Code Challenger", description: "Completed your first code challenge!", rarity: "common" as const, icon: "Code2" },
      { id: "badge_ten_challenges", name: "Code Warrior", description: "Completed 10 code challenges!", rarity: "epic" as const, icon: "Code2" },
      { id: "badge_perfect_score", name: "Perfect Score", description: "Achieved a perfect score on a code challenge!", rarity: "epic" as const, icon: "Star" },
      { id: "badge_first_quiz", name: "Quiz Starter", description: "Completed your first quiz!", rarity: "common" as const, icon: "Award" },
      { id: "badge_five_quizzes", name: "Quiz Master", description: "Completed 5 quizzes!", rarity: "rare" as const, icon: "Award" },
      { id: "badge_streak_7", name: "Week Warrior", description: "Maintained a 7-day login streak!", rarity: "rare" as const, icon: "Flame" },
      { id: "badge_streak_30", name: "Month Master", description: "Maintained a 30-day login streak!", rarity: "legendary" as const, icon: "Flame" },
      { id: "badge_path_finder", name: "Path Finder", description: "Complete interest assessment", rarity: "epic" as const, icon: "Rocket" },
    ];

    // Check which badges already exist and create missing ones
    for (const badgeData of badgesToCreate) {
      const existing = await this.getBadge(badgeData.id);
      if (!existing) {
        console.log(`[seedBadges] Creating badge: ${badgeData.id}`);
        await setDoc(doc(db, "badges", badgeData.id), {
          name: badgeData.name,
          description: badgeData.description,
          rarity: badgeData.rarity,
          icon: badgeData.icon,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  async getUserBadges(userId: string): Promise<Array<UserBadge & { badge: Badge }>> {
    const q = query(collection(db, "userBadges"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    console.log(`[getUserBadges] User ${userId}: Found ${snapshot.docs.length} user badge records`);

    const results = [];
    for (const docData of snapshot.docs) {
      const userBadge = serializeTimestamps<UserBadge>({ id: docData.id, ...docData.data() });
      const badge = await this.getBadge(userBadge.badgeId);
      if (badge) {
        results.push({ ...userBadge, badge });
        console.log(`[getUserBadges] ✓ Found badge definition: ${userBadge.badgeId} (${badge.name})`);
      } else {
        console.log(`[getUserBadges] ✗ Badge definition NOT FOUND: ${userBadge.badgeId}`);
      }
    }
    console.log(`[getUserBadges] Returning ${results.length} badges for user ${userId}`);
    return results;
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    // Check if badge already awarded using direct Firestore query to avoid recursion
    const q = query(
      collection(db, "userBadges"),
      where("userId", "==", userId),
      where("badgeId", "==", badgeId),
      firestoreLimit(1)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Already has this badge, return the existing one
      const existingDoc = snapshot.docs[0];
      return serializeTimestamps<UserBadge>({ id: existingDoc.id, ...existingDoc.data() });
    }

    const id = generateId();
    const userBadge: UserBadge = {
      id,
      userId,
      badgeId,
      earnedAt: new Date(),
    };
    await setDoc(doc(db, "userBadges", id), userBadge);
    return userBadge;
  }

  // Quiz operations
  async getQuizzes(careerPathId?: string, userLevel?: number): Promise<Quiz[]> {
    // Fetch all quizzes and filter in memory to avoid composite index requirement
    const snapshot = await getDocs(collection(db, "quizzes"));
    let quizzes = snapshot.docs.map(doc => serializeTimestamps<Quiz>({ id: doc.id, ...doc.data() }));
    
    // Filter in memory
    if (careerPathId) {
      quizzes = quizzes.filter(q => q.careerPathId === careerPathId || q.careerPathId === null);
    }
    if (userLevel !== undefined) {
      quizzes = quizzes.filter(q => q.requiredLevel <= userLevel);
    }
    
    return quizzes;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const docRef = doc(db, "quizzes", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;
    return serializeTimestamps<Quiz>({ id: docSnap.id, ...docSnap.data() });
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const quiz = await this.getQuiz(id);
    return quiz || null;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = generateId();
    const newQuiz: Quiz = {
      id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      careerPathId: quiz.careerPathId || null,
      requiredLevel: quiz.requiredLevel || 1,
      xpReward: quiz.xpReward || 100,
      timeLimit: quiz.timeLimit || null,
      isFinalAssessment: quiz.isFinalAssessment || false,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "quizzes", id), newQuiz);
    return newQuiz;
  }


  // Question operations
  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    const q = query(collection(db, "questions"), where("quizId", "==", quizId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<Question>({ id: doc.id, ...doc.data() }));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = generateId();
    const newQuestion = {
      id,
      quizId: question.quizId,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options as string[],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || null,
      category: question.category || null,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "questions", id), newQuestion);
    return newQuestion as Question;
  }

  async createQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    const results = [];
    for (const question of questions) {
      results.push(await this.createQuestion(question));
    }
    return results;
  }

  // Quiz attempt operations
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = generateId();
    const newAttempt = {
      id,
      userId: attempt.userId,
      quizId: attempt.quizId,
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      xpEarned: attempt.xpEarned,
      wasTabSwitched: attempt.wasTabSwitched || false,
      timeSpent: attempt.timeSpent || null,
      completedAt: new Date(),
    };
    await setDoc(doc(db, "quizAttempts", id), newAttempt);
    return newAttempt as QuizAttempt;
  }

  // Question attempt operations
  async createQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt> {
    const id = generateId();
    const newAttempt = {
      id,
      userId: attempt.userId,
      questionId: attempt.questionId,
      quizAttemptId: attempt.quizAttemptId,
      selectedAnswer: attempt.selectedAnswer,
      isCorrect: attempt.isCorrect,
      category: attempt.category || null,
      answeredAt: new Date(),
    };
    await setDoc(doc(db, "questionAttempts", id), newAttempt);
    return newAttempt as QuestionAttempt;
  }

  async getUserQuestionAttemptsByCategory(userId: string): Promise<QuestionAttempt[]> {
    const q = query(collection(db, "questionAttempts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<QuestionAttempt>({ id: doc.id, ...doc.data() }));
  }

  // Code challenge operations
  async getCodeChallenges(careerPathId?: string, userLevel?: number): Promise<CodeChallenge[]> {
    // Fetch all code challenges and filter in memory to avoid composite index requirement
    const snapshot = await getDocs(collection(db, "codeChallenges"));
    let challenges = snapshot.docs.map(doc => serializeTimestamps<CodeChallenge>({ id: doc.id, ...doc.data() }));
    
    // Filter in memory
    if (careerPathId) {
      challenges = challenges.filter(c => c.careerPathId === careerPathId || c.careerPathId === null);
    }
    if (userLevel !== undefined) {
      challenges = challenges.filter(c => c.requiredLevel <= userLevel);
    }
    
    return challenges;
  }

  async getCodeChallenge(id: string): Promise<CodeChallenge | undefined> {
    const docRef = doc(db, "codeChallenges", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;
    return serializeTimestamps<CodeChallenge>({ id: docSnap.id, ...docSnap.data() });
  }

  async createCodeChallenge(challenge: InsertCodeChallenge): Promise<CodeChallenge> {
    const id = generateId();
    const newChallenge = {
      id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      careerPathId: challenge.careerPathId || null,
      requiredLevel: challenge.requiredLevel || 1,
      xpReward: challenge.xpReward || 150,
      starterCode: challenge.starterCode,
      testCases: challenge.testCases as Array<{ input: string; expectedOutput: string }>,
      supportedLanguages: challenge.supportedLanguages as string[],
      createdAt: new Date(),
    };
    await setDoc(doc(db, "codeChallenges", id), newChallenge);
    return newChallenge as CodeChallenge;
  }

  async createChallengeAttempt(attempt: InsertChallengeAttempt): Promise<ChallengeAttempt> {
    const id = generateId();
    const newAttempt: ChallengeAttempt = {
      id,
      ...attempt,
      submittedAt: new Date(),
    };
    await setDoc(doc(db, "challengeAttempts", id), newAttempt);
    return newAttempt;
  }

  async getUserChallengeAttempts(userId: string, limit: number = 50): Promise<ChallengeAttempt[]> {
    // Fetch all attempts for user, then sort in memory to avoid composite index requirement
    const q = query(
      collection(db, "challengeAttempts"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map(doc => serializeTimestamps<ChallengeAttempt>({ id: doc.id, ...doc.data() }));
    
    // Sort by submittedAt descending in memory
    return attempts
      .sort((a, b) => {
        const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt);
        const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  // Interest response operations
  async createInterestResponse(response: InsertInterestResponse): Promise<InterestResponse> {
    const id = generateId();
    const newResponse: InterestResponse = {
      id,
      ...response,
      completedAt: new Date(),
    };
    await setDoc(doc(db, "interestResponses", id), newResponse);
    return newResponse;
  }

  async getUserInterestResponses(userId: string): Promise<InterestResponse[]> {
    const q = query(collection(db, "interestResponses"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<InterestResponse>({ id: doc.id, ...doc.data() }));
  }

  // Daily challenge operations
  async getDailyChallenges(userId: string, date: Date): Promise<DailyChallenge[]> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const q = query(
      collection(db, "dailyChallenges"),
      where("userId", "==", userId),
      where("assignedDate", ">=", Timestamp.fromDate(startOfDay)),
      where("assignedDate", "<=", Timestamp.fromDate(endOfDay))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<DailyChallenge>({ id: doc.id, ...doc.data() }));
  }

  async createDailyChallenge(userId: string, challengeType: string, challengeId: string): Promise<DailyChallenge> {
    const id = generateId();
    const challenge: DailyChallenge = {
      id,
      userId,
      challengeType,
      challengeId,
      assignedDate: new Date(),
      completed: false,
      completedAt: null,
    };
    await setDoc(doc(db, "dailyChallenges", id), challenge);
    return challenge;
  }

  async markDailyChallengeComplete(id: string): Promise<void> {
    const docRef = doc(db, "dailyChallenges", id);
    await updateDoc(docRef, { completed: true, completedAt: new Date() });
  }

  // Audit log operations
  async getAuditLogs(maxResults?: number): Promise<AuditLog[]> {
    const constraints: QueryConstraint[] = [orderBy("timestamp", "desc")];
    if (maxResults) {
      constraints.push(firestoreLimit(maxResults));
    }
    const q = query(collection(db, "auditLogs"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializeTimestamps<AuditLog>({ id: doc.id, ...doc.data() }));
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = generateId();
    const newLog = {
      id,
      userId: log.userId || null,
      action: log.action,
      details: log.details,
      status: log.status,
      ipAddress: log.ipAddress || null,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "auditLogs", id), newLog);
    return newLog as AuditLog;
  }

  // Syllabus upload operations
  async createSyllabusUpload(upload: {
    uploadedBy: string;
    fileName: string;
    careerPathId?: string;
    questionsGenerated: number;
  }): Promise<SyllabusUpload> {
    const id = generateId();
    const newUpload: SyllabusUpload = {
      id,
      uploadedBy: upload.uploadedBy,
      fileName: upload.fileName,
      careerPathId: upload.careerPathId || null,
      questionsGenerated: upload.questionsGenerated,
      uploadedAt: new Date(),
    };
    await setDoc(doc(db, "syllabusUploads", id), newUpload);
    return newUpload;
  }

  async generateAIQuestions(syllabusText: string, careerPath: string): Promise<any[]> {
    // This would use OpenAI to generate questions
    // For now, return empty array
    return [];
  }

  async getModulesForUser(user: any): Promise<any[]> {
    const modulesRef = collection(db, "modules");
    
    // Get all modules and filter in memory
    // This avoids Firestore composite index issues and the fact that 'in' operator doesn't work well with null
    const snapshot = await getDocs(modulesRef);
    const allModules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const filtered = allModules
      .filter((m: any) => {
        // Check if user meets level requirement
        if ((m.requiredLevel || 0) > user.level) {
          console.log(`[getModulesForUser] Filtered out module "${m.title}" (${m.id}): Level requirement ${m.requiredLevel} > user level ${user.level}`);
          return false;
        }
        
        // If user has a career path, show both career-specific and general modules
        if (user.currentCareerPathId) {
          const isAccessible = m.careerPath === user.currentCareerPathId || m.careerPath === null;
          if (!isAccessible) {
            console.log(`[getModulesForUser] Filtered out module "${m.title}" (${m.id}): Career path "${m.careerPath}" doesn't match user path "${user.currentCareerPathId}"`);
          }
          return isAccessible;
        }
        
        // If no career path, show all modules (both career-specific and general)
        // This ensures self-registered users see the same modules as admin-created users
        return true;
      })
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    
    console.log(`[getModulesForUser] User ${user.id} (level ${user.level}, career: ${user.currentCareerPathId || 'none'}): ${filtered.length} modules accessible`);
    return filtered;
  }

  async getModuleLessons(moduleId: string): Promise<any[]> {
    const lessonsRef = collection(db, "lessons");
    // Note: Sort in memory to avoid composite index requirement
    const q = query(
      lessonsRef,
      where("moduleId", "==", moduleId)
    );

    try {
      const snapshot = await getDocs(q);
      const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`[getModuleLessons] Module "${moduleId}": Found ${lessons.length} lessons`);
      
      // Sort by order in memory to avoid composite index
      return lessons.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error(`[getModuleLessons] ERROR fetching lessons for module "${moduleId}":`, error);
      throw error;
    }
  }

  async getModule(moduleId: string): Promise<any | null> {
    const moduleRef = doc(db, "modules", moduleId);
    const moduleSnap = await getDoc(moduleRef);
    if (!moduleSnap.exists()) return null;
    const data = moduleSnap.data();
    const lessons = await this.getModuleLessons(moduleId);
    return { id: moduleSnap.id, ...data, lessons };
  }

  async createModule(module: {
    title: string;
    description: string;
    careerPath: string | null;
    requiredLevel: number;
    order: number;
  }): Promise<any> {
    const id = generateId();
    const newModule = {
      id,
      ...module,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "modules", id), newModule);
    return newModule;
  }

  async createLesson(lesson: {
    moduleId: string;
    title: string;
    content: string;
    description?: string;
    type: string;
    order: number;
    xpReward: number;
    requiredLevel?: number;
    estimatedTime?: string;
    pdfUrl?: string;
  }): Promise<any> {
    const id = generateId();
    const newLesson = {
      id,
      ...lesson,
      description: lesson.description || "",
      requiredLevel: lesson.requiredLevel || 0,
      estimatedTime: lesson.estimatedTime || "10 min",
      createdAt: new Date(),
    };
    console.log(`[createLesson] Saving lesson "${newLesson.title}" (${id}) to module "${newLesson.moduleId}"`);
    try {
      await setDoc(doc(db, "lessons", id), newLesson);
      console.log(`[createLesson] SUCCESS: Lesson "${newLesson.title}" saved to Firestore`);
    } catch (error) {
      console.error(`[createLesson] ERROR saving lesson:`, error);
      throw error;
    }
    return newLesson;
  }

  async updateModule(moduleId: string, updates: Partial<{
    title: string;
    description: string;
    careerPath: string | null;
    requiredLevel: number;
    order: number;
  }>): Promise<void> {
    const moduleRef = doc(db, "modules", moduleId);
    await updateDoc(moduleRef, updates);
  }

  async deleteModule(moduleId: string): Promise<void> {
    // Delete all lessons in this module first
    const lessonsRef = collection(db, "lessons");
    const q = query(lessonsRef, where("moduleId", "==", moduleId));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(lessonDoc => 
      deleteDoc(doc(db, "lessons", lessonDoc.id))
    );
    await Promise.all(deletePromises);
    
    // Then delete the module
    await deleteDoc(doc(db, "modules", moduleId));
  }

  async updateLesson(lessonId: string, updates: Partial<{
    title: string;
    content: string;
    description: string;
    type: string;
    order: number;
    xpReward: number;
    requiredLevel: number;
    estimatedTime: string;
    pdfUrl: string;
  }>): Promise<void> {
    const lessonRef = doc(db, "lessons", lessonId);
    await updateDoc(lessonRef, updates);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await deleteDoc(doc(db, "lessons", lessonId));
  }

  async completeLesson(userId: string, lessonId: string, score?: number): Promise<void> {
    // Get or create user progress document
    const progressRef = doc(db, "userProgress", userId);
    const progressDoc = await getDoc(progressRef);

    const currentProgress = progressDoc.exists() 
      ? progressDoc.data() 
      : { completedLessons: [], completedModules: [] };

    // Add lesson to completed list if not already there
    if (!currentProgress.completedLessons.includes(lessonId)) {
      currentProgress.completedLessons.push(lessonId);
      await setDoc(progressRef, currentProgress, { merge: true });

      // Award XP only if this is a new completion
      const lesson = await getDoc(doc(db, "lessons", lessonId));
      if (lesson.exists()) {
        const xpReward = lesson.data().xpReward || 0;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          totalXp: increment(xpReward),
        });
      }
    }
  }

  async getLeaderboard(limit: number = 10) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("xp", "desc"), firestoreLimit(limit));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      userId: doc.id,
      ...doc.data()
    }));
  }

  async getModulesByCareerPath(careerPath: string) {
    const modulesRef = collection(db, "modules");
    const q = query(modulesRef, where("careerPath", "==", careerPath), orderBy("order"));
    const snapshot = await getDocs(q);

    const modules = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const moduleData = { id: doc.id, ...doc.data() };
        const lessonsRef = collection(db, "modules", doc.id, "lessons");
        const lessonsQ = query(lessonsRef, orderBy("order"));
        const lessonsSnapshot = await getDocs(lessonsQ);

        const lessons = lessonsSnapshot.docs.map(lessonDoc => ({
          id: lessonDoc.id,
          ...lessonDoc.data()
        }));

        return {
          ...moduleData,
          lessons,
          totalXP: lessons.reduce((sum: number, lesson: any) => sum + (lesson.xpReward || 0), 0)
        };
      })
    );

    return modules;
  }

  async getLesson(lessonId: string) {
    // Get lesson from top-level lessons collection
    const lessonRef = doc(db, "lessons", lessonId);
    const lessonDoc = await getDoc(lessonRef);

    if (lessonDoc.exists()) {
      return { id: lessonDoc.id, ...lessonDoc.data() };
    }

    return null;
  }

  async getUserProgress(userId: string) {
    const progressRef = doc(db, "userProgress", userId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return { completedLessons: [], completedModules: [] };
    }

    return progressDoc.data();
  }

  async markLessonComplete(userId: string, lessonId: string) {
    const progressRef = doc(db, "userProgress", userId);
    const progressDoc = await getDoc(progressRef);

    const currentProgress = progressDoc.exists() ? progressDoc.data() : { completedLessons: [], completedModules: [] };

    if (!currentProgress.completedLessons.includes(lessonId)) {
      currentProgress.completedLessons.push(lessonId);
      await setDoc(progressRef, currentProgress, { merge: true });
    }
  }

  async createNotification(userId: string, type: string, title: string, message: string, metadata?: any) {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      userId,
      type,
      title,
      message,
      metadata: metadata || {},
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  async getUserNotifications(userId: string) {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      firestoreLimit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notifRef = doc(db, "notifications", notificationId);
    const notifDoc = await getDoc(notifRef);

    if (notifDoc.exists() && notifDoc.data().userId === userId) {
      await updateDoc(notifRef, { read: true });
    }
  }

  async markAllNotificationsRead(userId: string) {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", userId), where("read", "==", false));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  }

  // Password reset operations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const tokenRef = doc(db, "passwordResetTokens", token);
    await setDoc(tokenRef, {
      userId,
      token,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.now(),
    });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date } | undefined> {
    const tokenRef = doc(db, "passwordResetTokens", token);
    const tokenDoc = await getDoc(tokenRef);
    
    if (!tokenDoc.exists()) return undefined;
    
    const data = tokenDoc.data();
    return {
      userId: data.userId,
      expiresAt: data.expiresAt instanceof Timestamp 
        ? data.expiresAt.toDate() 
        : new Date(data.expiresAt),
    };
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    const tokenRef = doc(db, "passwordResetTokens", token);
    await deleteDoc(tokenRef);
  }
}

export const storage = new FirestoreStorage();