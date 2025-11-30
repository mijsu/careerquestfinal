import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
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

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUsersForLeaderboard(limit?: number): Promise<User[]>;
  
  // Password reset operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  
  // Career Path operations
  getCareerPaths(): Promise<CareerPath[]>;
  getCareerPath(id: string): Promise<CareerPath | undefined>;
  createCareerPath(path: InsertCareerPath): Promise<CareerPath>;
  
  // Badge operations
  getBadges(): Promise<Badge[]>;
  getBadge(id: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: string): Promise<Array<UserBadge & { badge: Badge }>>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  
  // Quiz operations
  getQuizzes(careerPathId?: string, userLevel?: number): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizById(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Question operations
  getQuestionsByQuiz(quizId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  
  // Quiz attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  getRecentQuizAttempts(limitCount?: number): Promise<QuizAttempt[]>;
  
  // Question attempt operations (for Naive Bayes)
  createQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt>;
  getUserQuestionAttemptsByCategory(userId: string): Promise<QuestionAttempt[]>;
  
  // Code challenge operations
  getCodeChallenges(careerPathId?: string, userLevel?: number): Promise<CodeChallenge[]>;
  getCodeChallenge(id: string): Promise<CodeChallenge | undefined>;
  createCodeChallenge(challenge: InsertCodeChallenge): Promise<CodeChallenge>;
  createChallengeAttempt(attempt: InsertChallengeAttempt): Promise<ChallengeAttempt>;
  
  // Interest response operations
  createInterestResponse(response: InsertInterestResponse): Promise<InterestResponse>;
  getUserInterestResponses(userId: string): Promise<InterestResponse[]>;
  
  // Daily challenge operations
  getDailyChallenges(userId: string, date: Date): Promise<DailyChallenge[]>;
  createDailyChallenge(userId: string, challengeType: string, challengeId: string): Promise<DailyChallenge>;
  markDailyChallengeComplete(id: string): Promise<void>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // Syllabus upload operations
  createSyllabusUpload(upload: {
    uploadedBy: string;
    fileName: string;
    careerPathId?: string;
    questionsGenerated: number;
  }): Promise<SyllabusUpload>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async getUsersForLeaderboard(limit = 10): Promise<User[]> {
    return db.select().from(schema.users)
      .orderBy(desc(schema.users.totalXp))
      .limit(limit);
  }

  // Password reset operations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(schema.passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date } | undefined> {
    const result = await db.select().from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, token));
    if (result.length === 0) return undefined;
    const record = result[0];
    return {
      userId: record.userId,
      expiresAt: record.expiresAt,
    };
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, token));
  }

  // Career Path operations
  async getCareerPaths(): Promise<CareerPath[]> {
    return db.select().from(schema.careerPaths);
  }

  async getCareerPath(id: string): Promise<CareerPath | undefined> {
    const result = await db.select().from(schema.careerPaths).where(eq(schema.careerPaths.id, id));
    return result[0];
  }

  async createCareerPath(path: InsertCareerPath): Promise<CareerPath> {
    const result = await db.insert(schema.careerPaths).values(path as any).returning();
    return result[0];
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    return db.select().from(schema.badges);
  }

  async getBadge(id: string): Promise<Badge | undefined> {
    const result = await db.select().from(schema.badges).where(eq(schema.badges.id, id));
    return result[0];
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const result = await db.insert(schema.badges).values(badge).returning();
    return result[0];
  }

  async getUserBadges(userId: string): Promise<Array<UserBadge & { badge: Badge }>> {
    return db.select()
      .from(schema.userBadges)
      .innerJoin(schema.badges, eq(schema.userBadges.badgeId, schema.badges.id))
      .where(eq(schema.userBadges.userId, userId))
      .then(results => results.map(r => ({ ...r.user_badges, badge: r.badges })));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const result = await db.insert(schema.userBadges).values({ userId, badgeId }).returning();
    return result[0];
  }

  // Quiz operations
  async getQuizzes(careerPathId?: string, userLevel?: number): Promise<Quiz[]> {
    let query = db.select().from(schema.quizzes);
    
    if (careerPathId && userLevel !== undefined) {
      return db.select().from(schema.quizzes)
        .where(
          and(
            eq(schema.quizzes.careerPathId, careerPathId),
            sql`${schema.quizzes.requiredLevel} <= ${userLevel}`
          )
        );
    } else if (careerPathId) {
      return db.select().from(schema.quizzes).where(eq(schema.quizzes.careerPathId, careerPathId));
    } else if (userLevel !== undefined) {
      return db.select().from(schema.quizzes).where(sql`${schema.quizzes.requiredLevel} <= ${userLevel}`);
    }
    
    return query;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const result = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, id));
    return result[0];
  }

  async getQuizById(id: string): Promise<Quiz | undefined> {
    return this.getQuiz(id);
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await db.insert(schema.quizzes).values(quiz).returning();
    return result[0];
  }

  // Question operations
  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    return db.select().from(schema.questions).where(eq(schema.questions.quizId, quizId));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(schema.questions).values(question as any).returning();
    return result[0];
  }

  async createQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    if (questions.length === 0) return [];
    const result = await db.insert(schema.questions).values(questions as any).returning();
    return result;
  }

  // Quiz attempt operations
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const result = await db.insert(schema.quizAttempts).values(attempt).returning();
    return result[0];
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return db.select().from(schema.quizAttempts)
      .where(eq(schema.quizAttempts.userId, userId))
      .orderBy(desc(schema.quizAttempts.completedAt));
  }

  async getRecentQuizAttempts(limitCount = 50): Promise<QuizAttempt[]> {
    return db.select().from(schema.quizAttempts)
      .orderBy(desc(schema.quizAttempts.completedAt))
      .limit(limitCount);
  }

  // Question attempt operations
  async createQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt> {
    const result = await db.insert(schema.questionAttempts).values(attempt).returning();
    return result[0];
  }

  async getUserQuestionAttemptsByCategory(userId: string): Promise<QuestionAttempt[]> {
    return db.select().from(schema.questionAttempts)
      .where(eq(schema.questionAttempts.userId, userId));
  }

  // Code challenge operations
  async getCodeChallenges(careerPathId?: string, userLevel?: number): Promise<CodeChallenge[]> {
    if (careerPathId && userLevel !== undefined) {
      return db.select().from(schema.codeChallenges)
        .where(
          and(
            eq(schema.codeChallenges.careerPathId, careerPathId),
            sql`${schema.codeChallenges.requiredLevel} <= ${userLevel}`
          )
        );
    } else if (careerPathId) {
      return db.select().from(schema.codeChallenges).where(eq(schema.codeChallenges.careerPathId, careerPathId));
    } else if (userLevel !== undefined) {
      return db.select().from(schema.codeChallenges).where(sql`${schema.codeChallenges.requiredLevel} <= ${userLevel}`);
    }
    
    return db.select().from(schema.codeChallenges);
  }

  async getCodeChallenge(id: string): Promise<CodeChallenge | undefined> {
    const result = await db.select().from(schema.codeChallenges).where(eq(schema.codeChallenges.id, id));
    return result[0];
  }

  async createCodeChallenge(challenge: InsertCodeChallenge): Promise<CodeChallenge> {
    const result = await db.insert(schema.codeChallenges).values(challenge as any).returning();
    return result[0];
  }

  async createChallengeAttempt(attempt: InsertChallengeAttempt): Promise<ChallengeAttempt> {
    const result = await db.insert(schema.challengeAttempts).values(attempt).returning();
    return result[0];
  }

  // Interest response operations
  async createInterestResponse(response: InsertInterestResponse): Promise<InterestResponse> {
    const result = await db.insert(schema.interestResponses).values(response).returning();
    return result[0];
  }

  async getUserInterestResponses(userId: string): Promise<InterestResponse[]> {
    return db.select().from(schema.interestResponses)
      .where(eq(schema.interestResponses.userId, userId));
  }

  // Daily challenge operations
  async getDailyChallenges(userId: string, date: Date): Promise<DailyChallenge[]> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    return db.select().from(schema.dailyChallenges)
      .where(
        and(
          eq(schema.dailyChallenges.userId, userId),
          sql`${schema.dailyChallenges.assignedDate} >= ${startOfDay}`,
          sql`${schema.dailyChallenges.assignedDate} <= ${endOfDay}`
        )
      );
  }

  async createDailyChallenge(userId: string, challengeType: string, challengeId: string): Promise<DailyChallenge> {
    const result = await db.insert(schema.dailyChallenges)
      .values({ userId, challengeType, challengeId })
      .returning();
    return result[0];
  }

  async markDailyChallengeComplete(id: string): Promise<void> {
    await db.update(schema.dailyChallenges)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(schema.dailyChallenges.id, id));
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(schema.auditLogs).values(log).returning();
    return result[0];
  }

  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    return db.select().from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit);
  }

  // Syllabus upload operations
  async createSyllabusUpload(upload: {
    uploadedBy: string;
    fileName: string;
    careerPathId?: string;
    questionsGenerated: number;
  }): Promise<SyllabusUpload> {
    const result = await db.insert(schema.syllabusUploads).values(upload).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
