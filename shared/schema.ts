import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  json,
  real
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with gamification fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  currentCareerPathId: varchar("current_career_path_id"),
  pathSelectionMode: text("path_selection_mode").notNull().default("ai-guided"), // "ai-guided" | "manual"
  hasCompletedInterestAssessment: boolean("has_completed_interest_assessment").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  currentStreak: integer("current_streak").notNull().default(0),
  lastLoginDate: timestamp("last_login_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Career paths
export const careerPaths = pgTable("career_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  progressionRanks: json("progression_ranks").notNull().$type<string[]>(), // ["Junior Dev", "Mid Dev", "Senior Dev"]
  requiredSkills: json("required_skills").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Badge definitions
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  rarity: text("rarity").notNull(), // "common" | "rare" | "epic" | "legendary"
  requirement: text("requirement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User earned badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // "beginner" | "intermediate" | "advanced"
  careerPathId: varchar("career_path_id").references(() => careerPaths.id),
  requiredLevel: integer("required_level").notNull().default(1),
  xpReward: integer("xp_reward").notNull().default(100),
  timeLimit: integer("time_limit"), // in seconds, null for no limit
  isFinalAssessment: boolean("is_final_assessment").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Questions
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // "multiple-choice" | "true-false" | "scenario"
  options: json("options").notNull().$type<string[]>(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  category: text("category"), // for Naive Bayes classification (e.g., "frontend", "backend", "data", "security")
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  score: real("score").notNull(), // percentage 0-100
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  wasTabSwitched: boolean("was_tab_switched").notNull().default(false),
  timeSpent: integer("time_spent"), // in seconds
});

// Question attempts (for Naive Bayes training data)
export const questionAttempts = pgTable("question_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  quizAttemptId: varchar("quiz_attempt_id").notNull().references(() => quizAttempts.id, { onDelete: "cascade" }),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  category: text("category"), // denormalized from question for faster queries
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
});

// Code challenges
export const codeChallenges = pgTable("code_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  careerPathId: varchar("career_path_id").references(() => careerPaths.id),
  requiredLevel: integer("required_level").notNull().default(1),
  xpReward: integer("xp_reward").notNull().default(150),
  starterCode: text("starter_code").notNull(),
  testCases: json("test_cases").notNull().$type<Array<{ input: string; expectedOutput: string }>>(),
  supportedLanguages: json("supported_languages").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Code challenge attempts
export const challengeAttempts = pgTable("challenge_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id").notNull().references(() => codeChallenges.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  language: text("language").notNull(),
  passed: boolean("passed").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// Interest questionnaire responses
export const interestResponses = pgTable("interest_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull(),
  response: text("response").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// Daily challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeType: text("challenge_type").notNull(), // "quiz" | "code"
  challengeId: varchar("challenge_id").notNull(),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  details: text("details").notNull(),
  status: text("status").notNull(), // "success" | "warning" | "error"
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Syllabus uploads
export const syllabusUploads = pgTable("syllabus_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  careerPathId: varchar("career_path_id").references(() => careerPaths.id),
  questionsGenerated: integer("questions_generated").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  level: true,
  xp: true,
  totalXp: true,
  hasCompletedInterestAssessment: true,
  isAdmin: true,
  createdAt: true,
  lastActiveAt: true,
});

export const registerRequestSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const insertCareerPathSchema = createInsertSchema(careerPaths).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertQuestionAttemptSchema = createInsertSchema(questionAttempts).omit({
  id: true,
  answeredAt: true,
});

export const insertCodeChallengeSchema = createInsertSchema(codeChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeAttemptSchema = createInsertSchema(challengeAttempts).omit({
  id: true,
  submittedAt: true,
});

export const insertInterestResponseSchema = createInsertSchema(interestResponses).omit({
  id: true,
  completedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type User = typeof users.$inferSelect;

export type InsertCareerPath = z.infer<typeof insertCareerPathSchema>;
export type CareerPath = typeof careerPaths.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export type InsertQuestionAttempt = z.infer<typeof insertQuestionAttemptSchema>;
export type QuestionAttempt = typeof questionAttempts.$inferSelect;

export type InsertCodeChallenge = z.infer<typeof insertCodeChallengeSchema>;
export type CodeChallenge = typeof codeChallenges.$inferSelect;

export type InsertChallengeAttempt = z.infer<typeof insertChallengeAttemptSchema>;
export type ChallengeAttempt = typeof challengeAttempts.$inferSelect;

export type InsertInterestResponse = z.infer<typeof insertInterestResponseSchema>;
export type InterestResponse = typeof interestResponses.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type UserBadge = typeof userBadges.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type SyllabusUpload = typeof syllabusUploads.$inferSelect;

export interface Module {
  id: string;
  title: string;
  description: string;
  careerPath: string | null; // null for general modules
  requiredLevel: number;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  pdfUrl?: string; // Optional PDF file URL for lessons
  type: "theory" | "practice" | "quiz";
  order: number;
  xpReward: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
}