import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import multer from "multer";
import * as client from "openid-client";
import { storage } from "./storage-firestore";
import { hashPassword, requireAuth, requireAdmin } from "./auth";
import type { User } from "@shared/schema";
import { insertUserSchema, registerRequestSchema } from "@shared/schema";
import { generateQuestionsFromText, generateStudySuggestions, generatePracticeQuiz } from "./openai-client";
import { db } from "./firebase";
import { collection, getDocs, updateDoc } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

// In-memory cache for practice quizzes (quiz ID -> quiz data with correct answers)
// This prevents XP farming by validating answers server-side
const practiceQuizCache = new Map<string, { 
  quiz: any; 
  questions: any[];
  createdAt: number;
}>();

// Track completed practice quizzes per user (userId -> Set of completed quiz IDs)
// Prevents XP farming by awarding XP only once per quiz
const completedPracticeQuizzes = new Map<string, Set<string>>();

// Clean up old practice quizzes (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  Array.from(practiceQuizCache.entries()).forEach(([id, data]) => {
    if (data.createdAt < oneHourAgo) {
      practiceQuizCache.delete(id);

      // Clean up completion tracking for expired quizzes
      Array.from(completedPracticeQuizzes.entries()).forEach(([userId, quizSet]) => {
        quizSet.delete(id);
        if (quizSet.size === 0) {
          completedPracticeQuizzes.delete(userId);
        }
      });
    }
  });
}, 15 * 60 * 1000); // Run cleanup every 15 minutes

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Function to check and award badges
async function checkAndAwardBadges(userId: string) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const earnedBadges = await storage.getUserBadges(userId);
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));
  console.log(`[checkAndAwardBadges] User ${userId} (level ${user.level}) already has ${earnedBadgeIds.size} badges:`, Array.from(earnedBadgeIds));

  const badgesToAward: { badgeId: string; reason: string }[] = [];

  // Example badge logic:
  // 1. First Code Challenge Completed
  if (!earnedBadgeIds.has("badge_first_challenge")) {
    const attempts = await storage.getUserChallengeAttempts(userId, 1);
    if (attempts.length > 0) {
      badgesToAward.push({ badgeId: "badge_first_challenge", reason: "Completed your first code challenge!" });
    }
  }

  // 2. Ten Code Challenges Completed
  if (!earnedBadgeIds.has("badge_ten_challenges")) {
    const attempts = await storage.getUserChallengeAttempts(userId);
    if (attempts.length >= 10) {
      badgesToAward.push({ badgeId: "badge_ten_challenges", reason: "Completed 10 code challenges!" });
    }
  }

  // 3. Perfect Score on a Challenge
  if (!earnedBadgeIds.has("badge_perfect_score")) {
    const attempts = await storage.getUserChallengeAttempts(userId);
    if (attempts.some((a: any) => a.passed)) {
      badgesToAward.push({ badgeId: "badge_perfect_score", reason: "Achieved a perfect score on a code challenge!" });
    }
  }

  // 4. Level 10 Reached
  if (!earnedBadgeIds.has("badge_level_10")) {
    if (user.level >= 10) {
      badgesToAward.push({ badgeId: "badge_level_10", reason: "Reached Level 10!" });
    }
  }

  // 5. Level 20 Reached
  if (!earnedBadgeIds.has("badge_level_20")) {
    if (user.level >= 20) {
      badgesToAward.push({ badgeId: "badge_level_20", reason: "Reached Level 20!" });
    }
  }

  // 6. First Quiz Completed
  if (!earnedBadgeIds.has("badge_first_quiz")) {
    const quizAttempts = await storage.getUserQuizAttempts(userId, 1);
    if (quizAttempts.length > 0) {
      badgesToAward.push({ badgeId: "badge_first_quiz", reason: "Completed your first quiz!" });
    }
  }

  // 7. Completed 5 Quizzes
  if (!earnedBadgeIds.has("badge_five_quizzes")) {
    const quizAttempts = await storage.getUserQuizAttempts(userId);
    if (quizAttempts.length >= 5) {
      badgesToAward.push({ badgeId: "badge_five_quizzes", reason: "Completed 5 quizzes!" });
    }
  }

  // 8. Consistent Learner (7-day streak)
  if (!earnedBadgeIds.has("badge_streak_7")) {
    if (user.currentStreak >= 7) {
      badgesToAward.push({ badgeId: "badge_streak_7", reason: "Maintained a 7-day login streak!" });
    }
  }

  // 9. Dedicated Learner (30-day streak)
  if (!earnedBadgeIds.has("badge_streak_30")) {
    if (user.currentStreak >= 30) {
      badgesToAward.push({ badgeId: "badge_streak_30", reason: "Maintained a 30-day login streak!" });
    }
  }


  // Award each badge
  for (const { badgeId, reason } of badgesToAward) {
    console.log(`[checkAndAwardBadges] Awarding badge ${badgeId} to user ${userId}`);
    await storage.awardBadge(userId, badgeId);
    const badge = await storage.getBadge(badgeId);
    // Only include badgeName if badge exists, to avoid undefined values in Firebase
    const metadata = { badgeId };
    if (badge?.name) {
      (metadata as any).badgeName = badge.name;
    }
    await storage.createNotification(
      userId, 
      "badge_earned", 
      "🏆 New Badge Earned!", 
      reason, 
      metadata
    );
    console.log(`[checkAndAwardBadges] Created notification for badge ${badgeId}: ${reason}`);
  }
  console.log(`[checkAndAwardBadges] Total badges awarded: ${badgesToAward.length}`);
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Serve lesson PDFs from attached_assets directory
  const express = await import('express');
  app.use('/assets', express.default.static(path.join(process.cwd(), 'attached_assets')));

  // ===== AUTHROUTES =====

  // Register
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const parsed = registerRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send({ error: "Invalid registration data", details: parsed.error });
      }

      const { confirmPassword, ...registrationData } = parsed.data;
      const { email, username, password, displayName, pathSelectionMode, currentCareerPathId } = registrationData;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).send({ error: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).send({ error: "Username already taken" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        displayName,
        pathSelectionMode: pathSelectionMode || "ai-guided",
        currentCareerPathId: currentCareerPathId || null,
      });

      // Log them in
      req.login(user, (err) => {
        if (err) return next(err);

        // Don't send password back
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).send({ user: userWithoutPassword });
      });
    } catch (error) {
      next(error);
    }
  });

  // Login (with streak tracking)
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).send({ error: info?.message || "Authentication failed" });
      }

      req.login(user, async (err) => {
        if (err) return next(err);

        // Update streak tracking
        await storage.updateLoginStreak(user.id);

        // Get updated user with new streak
        const updatedUser = await storage.getUser(user.id);
        if (!updatedUser) {
          return res.status(404).send({ error: "User not found" });
        }

        // Create notification for streak milestones
        const streak = updatedUser.currentStreak;
        if (streak > 0 && [7, 30, 100, 365].includes(streak)) {
          await storage.createNotification(
            user.id,
            "streak",
            `${streak}-Day Streak! 🔥`,
            `Amazing! You've maintained a ${streak}-day login streak!`,
            { streak }
          );
        }

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.send({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.send({ success: true });
    });
  });

  // Google OAuth routes
  app.get("/api/login", (req, res) => {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.hostname}/api/callback`;
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("openid email profile")}`);
  });

  app.get("/api/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.redirect("/?error=no_code");
      }

      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.redirect("/?error=missing_config");
      }

      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.hostname}/api/callback`;

      // Exchange authorization code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        console.error("Token exchange failed:", await tokenResponse.text());
        return res.redirect("/?error=token_exchange_failed");
      }

      const tokenData = await tokenResponse.json();
      const { id_token } = tokenData;

      // Decode JWT to get user info (without verification for simplicity)
      const parts = id_token.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      
      const { email, name, picture, sub: googleId } = payload;

      // Find or create user
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user from Google info
        user = await storage.createUser({
          email,
          username: email.split("@")[0] + "_" + googleId.substring(0, 8),
          password: "", // OAuth users don't have passwords
          displayName: name || email.split("@")[0],
          pathSelectionMode: "ai-guided",
          currentCareerPathId: null,
        });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login failed:", err);
          return res.redirect("/?error=login_failed");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/?error=oauth_error");
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

  // Alias route for OAuth callback (matches Google registered URI pattern)
  app.get("/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.redirect("/?error=no_code");
      }

      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.redirect("/?error=missing_config");
      }

      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.hostname}/api/callback`;

      // Exchange authorization code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        console.error("Token exchange failed:", await tokenResponse.text());
        return res.redirect("/?error=token_exchange_failed");
      }

      const tokenData = await tokenResponse.json();
      const { id_token } = tokenData;

      // Decode JWT to get user info (without verification for simplicity)
      const parts = id_token.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      
      const { email, name, picture, sub: googleId } = payload;

      // Find or create user
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user from Google info
        user = await storage.createUser({
          email,
          username: email.split("@")[0] + "_" + googleId.substring(0, 8),
          password: "", // OAuth users don't have passwords
          displayName: name || email.split("@")[0],
          pathSelectionMode: "ai-guided",
          currentCareerPathId: null,
        });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login failed:", err);
          return res.redirect("/?error=login_failed");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/?error=oauth_error");
    }
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user as User;
    const { password: _, ...userWithoutPassword } = user;
    res.send({ user: userWithoutPassword });
  });

  // Update user profile
  app.patch("/api/auth/profile", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { displayName, currentCareerPathId } = req.body;

      const updated = await storage.updateUser(user.id, {
        displayName: displayName || user.displayName,
        currentCareerPathId: currentCareerPathId !== undefined ? currentCareerPathId : user.currentCareerPathId,
      });

      if (!updated) {
        return res.status(404).send({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updated;
      res.send({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  });

  // Forgot password - send reset email
  app.post("/api/auth/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(200).send({ success: true });
      }

      const token = require("crypto").randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await storage.createPasswordResetToken(user.id, token, expiresAt);

      const resetLink = `${process.env.VITE_APP_URL || "http://localhost:5000"}/reset-password?token=${token}`;

      console.log(`[Auth] Password reset link for ${email}: ${resetLink}`);

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).send({ error: "Token and password are required" });
      }

      const resetRecord = await storage.getPasswordResetToken(token);
      if (!resetRecord) {
        return res.status(400).send({ error: "Invalid or expired reset token" });
      }

      if (new Date() > resetRecord.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).send({ error: "Reset token has expired" });
      }

      const hashedPassword = await hashPassword(password);
      await storage.updateUser(resetRecord.userId, { password: hashedPassword });

      await storage.deletePasswordResetToken(token);

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // ===== CAREER PATH ROUTES =====

  app.get("/api/career-paths", async (_req, res, next) => {
    try {
      const paths = await storage.getCareerPaths();
      res.send({ paths });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/career-paths/:id", async (req, res, next) => {
    try {
      const path = await storage.getCareerPath(req.params.id);
      if (!path) {
        return res.status(404).send({ error: "Career path not found" });
      }
      res.send({ path });
    } catch (error) {
      next(error);
    }
  });

  // Select career path for user
  app.post("/api/career-paths/select", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { pathId } = req.body;

      if (!pathId) {
        return res.status(400).send({ error: "Career path ID is required" });
      }

      const updated = await storage.updateUser(user.id, {
        currentCareerPathId: pathId,
        pathSelectionMode: "manual",
      });

      if (!updated) {
        return res.status(404).send({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updated;
      res.send({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  });

  // ===== QUIZROUTES =====

  app.get("/api/quizzes", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const quizzes = await storage.getQuizzes(
        user.currentCareerPathId || undefined,
        user.level
      );
      res.send({ quizzes });
    } catch (error) {
      next(error);
    }
  });

  // Generate AI Practice Quiz
  app.post("/api/quizzes/generate-practice", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { topic, difficulty } = req.body;

      // Get career path name
      let careerPathName = "Full Stack Development"; // Default
      if (user.currentCareerPathId) {
        const careerPath = await storage.getCareerPath(user.currentCareerPathId);
        if (careerPath) {
          careerPathName = careerPath.name;
        }
      }

      console.log(`[AI Quiz] Generating practice quiz for ${user.username} (${careerPathName}, Level ${user.level})`);

      // Generate questions using AI
      const generatedQuestions = await generatePracticeQuiz(
        careerPathName,
        user.level,
        topic,
        difficulty
      );

      console.log(`[AI Quiz] Generated ${generatedQuestions.length} questions`);

      // Create a temporary quiz (not saved to database - on-demand generation)
      const tempQuizId = `practice-${Date.now()}-${user.id}`;
      const quiz = {
        id: tempQuizId,
        title: topic ? `Practice: ${topic}` : `${careerPathName} Practice Quiz`,
        description: `AI-generated practice quiz - unlimited retries available`,
        difficulty: difficulty || "intermediate",
        careerPathId: user.currentCareerPathId,
        requiredLevel: user.level,
        xpReward: 50, // Lower XP for practice quizzes
        timeLimit: null, // No time limit for practice
        isFinalAssessment: false,
        isPractice: true, // Mark as practice quiz
      };

      // Format questions for frontend
      const questions = generatedQuestions.map((q, index) => ({
        id: `${tempQuizId}-q${index}`,
        quizId: tempQuizId,
        questionText: q.question,
        questionType: "multiple-choice",
        options: q.options,
        correctAnswer: String(q.correctAnswer),
        explanation: q.explanation,
        category: q.category,
      }));

      // Store quiz in server-side cache for validation during submission
      practiceQuizCache.set(tempQuizId, {
        quiz,
        questions,
        createdAt: Date.now(),
      });

      console.log(`[AI Quiz] Stored practice quiz ${tempQuizId} in cache`);

      res.send({ quiz, questions });
    } catch (error) {
      console.error("[AI Quiz] Generation error:", error);
      next(error);
    }
  });

  // Submit practice quiz (server-side validation against cached answers)
  app.post("/api/quizzes/practice/:id/submit", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { answers } = req.body;
      const quizId = req.params.id;

      // Retrieve quiz from server-side cache
      const cachedQuiz = practiceQuizCache.get(quizId);

      if (!cachedQuiz) {
        return res.status(404).send({ 
          error: "Practice quiz not found or expired. Please generate a new quiz." 
        });
      }

      const { questions } = cachedQuiz;

      // Calculate score using SERVER-SIDE correct answers
      let correctCount = 0;
      const totalQuestions = questions.length;

      for (const question of questions) {
        const userAnswer = answers[question.id];
        const isCorrect = String(userAnswer) === question.correctAnswer;
        if (isCorrect) correctCount++;
      }

      const score = (correctCount / totalQuestions) * 100;

      // Check if user has already completed this quiz
      const userCompletedQuizzes = completedPracticeQuizzes.get(user.id) || new Set();
      const alreadyCompleted = userCompletedQuizzes.has(quizId);

      let xpEarned = 0;
      let newLevel = user.level;
      let finalXp = user.xp;
      let leveledUp = false;

      // Only award XP on first completion to prevent farming
      if (!alreadyCompleted) {
        xpEarned = 50; // Fixed XP for practice quizzes

        // Award XP to user
        const newXp = user.xp + xpEarned;
        const newTotalXp = user.totalXp + xpEarned;

        finalXp = newXp;

        if (newXp >= 1000) {
          newLevel = user.level + 1;
          finalXp = newXp - 1000;
          leveledUp = true;
        }

        // Update user XP and level
        await storage.updateUser(user.id, {
          xp: finalXp,
          totalXp: newTotalXp,
          level: newLevel,
        });

        // Mark quiz as completed
        userCompletedQuizzes.add(quizId);
        completedPracticeQuizzes.set(user.id, userCompletedQuizzes);

        console.log(`[AI Quiz] Practice quiz completed (FIRST): ${user.username} scored ${score.toFixed(1)}% (${correctCount}/${totalQuestions}), earned ${xpEarned} XP`);
      } else {
        console.log(`[AI Quiz] Practice quiz retaken (NO XP): ${user.username} scored ${score.toFixed(1)}% (${correctCount}/${totalQuestions})`);
      }

      res.send({
        score: correctCount,
        totalQuestions,
        xpEarned,
        leveledUp,
        newLevel,
        percentage: score,
        isRetake: alreadyCompleted,
      });
    } catch (error) {
      console.error("[AI Quiz] Submission error:", error);
      next(error);
    }
  });

  // Fisher-Yates shuffle algorithm
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  app.get("/api/quizzes/:id", requireAuth, async (req, res, next) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).send({ error: "Quiz not found" });
      }

      const questions = await storage.getQuestionsByQuiz(req.params.id);

      // Randomize question order using Fisher-Yates shuffle
      const shuffledQuestions = shuffleArray(questions);

      res.send({ quiz, questions: shuffledQuestions });
    } catch (error) {
      next(error);
    }
  });

  // Submit quiz attempt
  app.post("/api/quizzes/:id/submit", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const quiz = await storage.getQuiz(req.params.id);

      if (!quiz) {
        return res.status(404).send({ error: "Quiz not found" });
      }

      const { answers, wasTabSwitched, timeSpent, isDailyChallenge } = req.body;
      const questions = await storage.getQuestionsByQuiz(req.params.id);

      // Calculate score
      let correctCount = 0;
      const questionAttempts = [];

      for (const question of questions) {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;

        questionAttempts.push({
          userId: user.id,
          questionId: question.id,
          selectedAnswer: userAnswer || "",
          isCorrect,
          category: question.category,
        });
      }

      const score = (correctCount / questions.length) * 100;
      const xpEarned = wasTabSwitched ? 0 : Math.floor((score / 100) * quiz.xpReward);

      // Create quiz attempt
      const attempt = await storage.createQuizAttempt({
        userId: user.id,
        quizId: quiz.id,
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        xpEarned,
        wasTabSwitched,
        timeSpent,
      });

      // Save individual question attempts for Naive Bayes
      for (const qa of questionAttempts) {
        await storage.createQuestionAttempt({
          ...qa,
          quizAttemptId: attempt.id,
        });
      }

      // Update user XP and level
      const newTotalXp = user.totalXp + xpEarned;
      const newLevel = Math.floor(newTotalXp / 1000) + 1; // 1000 XP per level
      const newXp = newTotalXp % 1000;
      const oldLevel = user.level;

      await storage.updateUser(user.id, {
        totalXp: newTotalXp,
        xp: newXp,
        level: newLevel,
      });

      // Check for level up and create notification
      if (newLevel > oldLevel) {
        await storage.createNotification(
          user.id,
          "level_up",
          `Level Up! You reached Level ${newLevel}`,
          `Congratulations! You've earned enough XP to reach Level ${newLevel}!`,
          { level: newLevel }
        );

        // Special notification for Level 20 (AI recommendation trigger)
        if (newLevel === 20 && user.pathSelectionMode === "ai-guided" && !user.hasCompletedInterestAssessment) {
          await storage.createNotification(
            user.id,
            "system",
            "🎉 Level 20 Milestone!",
            "Complete the Interest Assessment to receive your AI-powered career path recommendation!",
            { requiresAction: true, action: "interest-assessment" }
          );
        }
      }

      // Check and award badges
      await checkAndAwardBadges(user.id);

      // Mark daily challenge as complete if this is a daily challenge
      if (isDailyChallenge) {
        try {
          const { dailyChallengeGenerator } = await import("./dailyChallenges");
          await dailyChallengeGenerator.completeDailyChallenge(user.id, quiz.id, "quiz");
          console.log(`[Quiz] Marked daily challenge complete for user ${user.id}, quiz ${quiz.id}`);
        } catch (err) {
          console.error(`[Quiz] Failed to mark daily challenge complete:`, err);
          // Don't block quiz submission if daily challenge completion fails
        }
      }

      res.send({ 
        attempt,
        xpEarned,
        newLevel,
        newXp,
        newTotalXp,
        leveledUp: newLevel > oldLevel,
        reachedLevel20: newLevel === 20 && user.pathSelectionMode === "ai-guided" && !user.hasCompletedInterestAssessment,
      });
    } catch (error) {
      next(error);
    }
  });

  // ===== CODE CHALLENGE ROUTES =====

  app.get("/api/challenges", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const challenges = await storage.getCodeChallenges(
        user.currentCareerPathId || undefined,
        user.level
      );
      res.send({ challenges });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/challenges/:id", requireAuth, async (req, res, next) => {
    try {
      const challenge = await storage.getCodeChallenge(req.params.id);
      if (!challenge) {
        return res.status(404).send({ error: "Challenge not found" });
      }
      res.send({ challenge });
    } catch (error) {
      next(error);
    }
  });

  // Submit code challenge with Judge0 integration
  app.post("/api/challenges/:id/submit", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const challenge = await storage.getCodeChallenge(req.params.id);

      if (!challenge) {
        return res.status(404).send({ error: "Challenge not found" });
      }

      const { code, language } = req.body;

      // Import Judge0 service
      const { judge0Service, LANGUAGE_IDS } = await import("./judge0");

      // Map language string to Judge0 language ID
      const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];
      if (!languageId) {
        return res.status(400).send({ error: `Unsupported language: ${language}` });
      }

      // Run test cases using Judge0
      const testResults = await judge0Service.runTestCases({
        sourceCode: code,
        languageId,
        testCases: challenge.testCases,
      });

      const allPassed = testResults.passed === testResults.total;
      const xpEarned = allPassed ? challenge.xpReward : 0;

      const attempt = await storage.createChallengeAttempt({
        userId: user.id,
        challengeId: challenge.id,
        code,
        language,
        passed: allPassed,
        xpEarned,
      });

      // Notify user on successful completion
      if (allPassed) {
        await storage.createNotification(
          user.id,
          "challenge_complete",
          "Code Challenge Completed!",
          `You successfully solved "${challenge.title}"! Earned ${xpEarned} XP.`,
          { challengeId: challenge.id, xpEarned }
        );
      }

      // Update user XP if all tests passed
      let leveledUp = false;
      let reachedLevel20 = false;
      let newLevel = user.level;
      let newXp = user.xp;
      let newTotalXp = user.totalXp;

      if (allPassed) {
        newTotalXp = user.totalXp + xpEarned;
        newLevel = Math.floor(newTotalXp / 1000) + 1;
        newXp = newTotalXp % 1000;
        const oldLevel = user.level;

        await storage.updateUser(user.id, {
          totalXp: newTotalXp,
          xp: newXp,
          level: newLevel,
        });

        // Check for level up and create notification
        if (newLevel > oldLevel) {
          leveledUp = true;
          await storage.createNotification(
            user.id,
            "level_up",
            `Level Up! You reached Level ${newLevel}`,
            `Congratulations! You've earned enough XP to reach Level ${newLevel}!`,
            { level: newLevel }
          );

          // Special notification for Level 20 (AI recommendation trigger)
          if (newLevel === 20 && user.pathSelectionMode === "ai-guided" && !user.hasCompletedInterestAssessment) {
            reachedLevel20 = true;
            await storage.createNotification(
              user.id,
              "system",
              "🎉 Level 20 Milestone!",
              "Complete the Interest Assessment to receive your AI-powered career path recommendation!",
              { requiresAction: true, action: "interest-assessment" }
            );
          }
        }
      }

      // Check and award badges
      await checkAndAwardBadges(user.id);

      res.send({ 
        attempt, 
        passed: allPassed, 
        xpEarned,
        testResults,
        leveledUp,
        newLevel,
        newXp,
        newTotalXp,
        reachedLevel20,
      });
    } catch (error) {
      next(error);
    }
  });

  // ===== LEADERBOARDROUTES =====

  app.get("/api/leaderboard", async (_req, res, next) => {
    try {
      const users = await storage.getUsersForLeaderboard(100);

      // Fetch badge counts for each user
      const leaderboard = await Promise.all(
        users.map(async (u, index) => {
          const userBadges = await storage.getUserBadges(u.id);
          return {
            rank: index + 1,
            userId: u.id,
            username: u.username,
            displayName: u.displayName,
            level: u.level,
            totalXp: u.totalXp,
            badgeCount: userBadges.length,
          };
        })
      );

      res.send({ leaderboard });
    } catch (error) {
      next(error);
    }
  });

  // ===== BADGE ROUTES =====

  // Get all available badges
  app.get("/api/badges", async (_req, res, next) => {
    try {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      const badges = await storage.getBadges();
      console.log(`[GET /api/badges] Returning ${badges.length} badges:`, badges.map(b => ({ id: b.id, name: b.name })));
      res.send({ badges });
    } catch (error) {
      next(error);
    }
  });

  // Get user's earned badges
  app.get("/api/users/me/badges", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      // Set cache-control headers to prevent HTTP caching (fixes stale badge data)
      res.set("Cache-Control", "no-cache, no-store, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      const userBadges = await storage.getUserBadges(user.id);
      console.log(`[GET /api/users/me/badges] User ${user.id} (level ${user.level}) has ${userBadges.length} badges:`, userBadges.map((b: any) => ({ badgeId: b.badgeId, badgeName: b.badge.name })));
      res.send({ badges: userBadges });
    } catch (error) {
      next(error);
    }
  });

  // ===== INTEREST QUESTIONNAIRE ROUTES =====

  app.post("/api/interest/submit", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;

      if (user.level < 20) {
        return res.status(403).send({ error: "Must be level 20 to take interest assessment" });
      }

      const { responses } = req.body; // Array of { questionId, response }

      if (!responses || responses.length === 0) {
        return res.status(400).send({ error: "No responses provided" });
      }

      // Save responses
      for (const r of responses) {
        await storage.createInterestResponse({
          userId: user.id,
          questionId: r.questionId,
          response: r.response,
        });
      }

      // Use Naive Bayes to recommend career path
      const { naiveBayesRecommender } = await import("./naiveBayes");
      let recommendation;
      
      try {
        recommendation = await naiveBayesRecommender.recommendCareerPath(user.id);
      } catch (err) {
        console.error("Naive Bayes recommendation error:", err);
        // Fallback: If no quiz data, assign first career path
        const allPaths = await storage.getCareerPaths();
        if (allPaths.length === 0) {
          return res.status(500).send({ error: "No career paths available" });
        }
        recommendation = {
          recommendedPathId: allPaths[0].id,
          probabilities: allPaths.map((p, i) => ({
            careerPathId: p.id,
            probability: i === 0 ? 0.5 : 0.5 / (allPaths.length - 1),
            score: i === 0 ? 50 : 25,
          })),
          confidence: 50,
        };
      }

      await storage.updateUser(user.id, {
        hasCompletedInterestAssessment: true,
        currentCareerPathId: recommendation.recommendedPathId,
      });

      // Get the recommended path details
      const recommendedPath = await storage.getCareerPath(recommendation.recommendedPathId);

      res.send({ 
        recommendedCareerPathId: recommendation.recommendedPathId,
        recommendedPath,
        confidence: recommendation.confidence,
        allProbabilities: recommendation.probabilities,
      });
    } catch (error) {
      console.error("Interest submit error:", error);
      next(error);
    }
  });

  // ===== DAILY CHALLENGE ROUTES =====

  app.get("/api/daily-challenges", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { dailyChallengeGenerator } = await import("./dailyChallenges");
      const challenges = await dailyChallengeGenerator.getDailyChallenges(user.id);
      res.send(challenges);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/daily-challenges/today", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { dailyChallengeGenerator } = await import("./dailyChallenges");

      // Get both challenges for today
      const result = await dailyChallengeGenerator.getDailyChallenges(user.id);

      // Check if both challenges are completed or unavailable
      const quizCompleted = result.dailyChallenges.find(c => c.challengeType === "quiz")?.completed || false;
      const codeCompleted = result.dailyChallenges.find(c => c.challengeType === "code")?.completed || false;

      // If no challenges can be generated (both null), mark as "all completed"
      const noChallengesAvailable = !result.quizChallenge && !result.codeChallenge;
      const allCompleted = noChallengesAvailable || (quizCompleted && codeCompleted);

      // Prepare quiz challenge response
      let quizChallenge = null;
      if (result.quizChallenge) {
        const quizRecord = result.dailyChallenges.find(c => c.challengeType === "quiz");
        quizChallenge = {
          id: result.quizChallenge.id,
          title: result.quizChallenge.title,
          difficulty: result.quizChallenge.difficulty,
          xpReward: result.quizChallenge.xpReward || 100,
          challengeType: "quiz",
          completed: quizRecord?.completed || false,
        };
      }

      // Prepare code challenge response
      let codeChallenge = null;
      if (result.codeChallenge) {
        const codeRecord = result.dailyChallenges.find(c => c.challengeType === "code");
        codeChallenge = {
          id: result.codeChallenge.id,
          title: result.codeChallenge.title,
          difficulty: result.codeChallenge.difficulty,
          xpReward: result.codeChallenge.xpReward || 100,
          challengeType: "code",
          completed: codeRecord?.completed || false,
        };
      }

      // Prevent HTTP caching - always fetch fresh per user
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      res.send({
        quizChallenge,
        codeChallenge,
        allCompleted,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/daily-challenges/complete", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { challengeId, challengeType } = req.body;
      const { dailyChallengeGenerator } = await import("./dailyChallenges");
      await dailyChallengeGenerator.completeDailyChallenge(user.id, challengeId, challengeType);

      // Create notification for daily challenge completion
      await storage.createNotification(
        user.id,
        "challenge_complete",
        "Daily Challenge Completed!",
        "Great job! You've completed today's challenge.",
        { challengeId }
      );

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // ===== AI STUDY SUGGESTIONS ROUTE =====

  // Cache for AI suggestions (simple in-memory cache)
  const suggestionsCache = new Map<string, { suggestions: any; timestamp: number }>();
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  app.get("/api/study-suggestions", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const cacheKey = `${user.id}-${user.level}`;

      // Check cache first
      const cached = suggestionsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.json({ suggestions: cached.suggestions, cached: true });
      }

      // Get user's recent quiz performance
      const recentAttempts = await storage.getUserQuizAttempts(user.id, 10);
      const questionAttempts = await storage.getUserQuestionAttempts(user.id, 50);

      // Calculate category performance
      const categoryScores: Record<string, { correct: number; total: number }> = {};
      for (const qa of questionAttempts) {
        if (qa.category) {
          if (!categoryScores[qa.category]) {
            categoryScores[qa.category] = { correct: 0, total: 0 };
          }
          categoryScores[qa.category].total++;
          if (qa.isCorrect) {
            categoryScores[qa.category].correct++;
          }
        }
      }

      // Find weak categories (< 60% accuracy)
      const weakCategories = Object.entries(categoryScores)
        .filter(([_, stats]) => (stats.correct / stats.total) < 0.6)
        .map(([category]) => category);

      const recentQuizScores = recentAttempts.map(attempt => ({
        category: "general",
        score: attempt.correctAnswers,
        total: attempt.totalQuestions,
      }));

      // Generate smart fallback based on actual data
      const generateSmartFallback = () => {
        const suggestions = [];

        if (weakCategories.length > 0) {
          suggestions.push(`Focus on improving in: ${weakCategories.join(", ")}`);
        }

        if (user.level < 20) {
          suggestions.push(`Continue learning to reach Level 20 for AI career recommendation`);
        }

        if (recentAttempts.length > 0) {
          const avgScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;
          if (avgScore < 60) {
            suggestions.push(`Review fundamentals - your recent average is ${avgScore.toFixed(0)}%`);
          }
        }

        suggestions.push(`Complete daily challenges for bonus XP`);
        suggestions.push(`Try code challenges to reinforce practical skills`);

        return suggestions.join("\n- ");
      };

      try {
        const suggestions = await generateStudySuggestions({
          level: user.level,
          totalXp: user.totalXp,
          careerPath: user.currentCareerPathId,
          recentQuizScores,
          weakCategories,
        });

        // Cache successful result
        suggestionsCache.set(cacheKey, { suggestions, timestamp: Date.now() });
        res.json({ suggestions, cached: false });
      } catch (aiError) {
        console.error("AI study suggestions failed, using smart fallback:", aiError);
        const fallback = generateSmartFallback();
        res.json({ suggestions: fallback, cached: false, fallback: true });
      }
    } catch (error) {
      next(error);
    }
  });

  // Get available modules for user
  app.get("/api/modules", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const modules = await storage.getModulesForUser(user);

      // Populate lessons for each module
      const modulesWithLessons = await Promise.all(
        modules.map(async (module: any) => {
          const lessons = await storage.getModuleLessons(module.id);
          console.log(`[/api/modules] Module "${module.title}" (${module.id}): ${lessons.length} lessons`);
          return { ...module, lessons };
        })
      );

      console.log(`[/api/modules] Returning ${modulesWithLessons.length} modules for user ${user.id}`);
      
      // Prevent HTTP caching - always fetch fresh
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json({ modules: modulesWithLessons });
    } catch (error) {
      next(error);
    }
  });

  // Get module lessons
  app.get("/api/modules/:moduleId/lessons", requireAuth, async (req, res, next) => {
    try {
      const lessons = await storage.getModuleLessons(req.params.moduleId);
      res.json({ lessons });
    } catch (error) {
      next(error);
    }
  });

  // Get single lesson with module details
  app.get("/api/lessons/:lessonId", requireAuth, async (req, res, next) => {
    try {
      const lesson = await storage.getLesson(req.params.lessonId) as any;
      if (!lesson) {
        return res.status(404).send({ error: "Lesson not found" });
      }
      const module = lesson.moduleId ? await storage.getModule(lesson.moduleId) : null;
      res.send({ lesson, module });
    } catch (error) {
      next(error);
    }
  });

  // Complete a lesson
  app.post("/api/lessons/:lessonId/complete", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { score } = req.body;
      await storage.completeLesson(user.id, req.params.lessonId, score);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Get user progress statistics
  app.get("/api/users/me/progress", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;

      // Get all modules available to user
      const allModules = await storage.getModulesForUser(user);

      // Get user's completed lessons
      const userProgress = await storage.getUserProgress(user.id);
      const completedLessons = userProgress.completedLessons || [];

      // Calculate total lessons and completed count
      let totalLessons = 0;
      for (const module of allModules) {
        const lessons = await storage.getModuleLessons(module.id);
        totalLessons += lessons.length;
      }

      const completedCount = completedLessons.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Prevent HTTP caching - always fetch fresh per user
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      res.json({
        totalModules: allModules.length,
        totalLessons,
        completedLessons: completedCount,
        progressPercentage,
        modules: allModules.map(m => ({ id: m.id, title: m.title })),
        // Include full progress data for Modules page
        progress: {
          completedLessons,
          completedModules: userProgress.completedModules || []
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // ===== NOTIFICATION ROUTES =====

  app.get("/api/notifications", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const notifications = await storage.getUserNotifications(user.id);
      res.send({ notifications });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      await storage.markNotificationRead(user.id, req.params.id);
      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/notifications/mark-all-read", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      await storage.markAllNotificationsRead(user.id);
      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // ===== AI STUDY SUGGESTIONS ROUTE =====

  app.get("/api/ai/study-suggestions", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;

      // Get user's recent quiz performance
      const recentAttempts = await storage.getUserQuizAttempts(user.id, 10);
      const questionAttempts = await storage.getUserQuestionAttempts(user.id, 50);

      // Calculate category performance
      const categoryScores: Record<string, { correct: number; total: number }> = {};
      for (const qa of questionAttempts) {
        if (qa.category) {
          if (!categoryScores[qa.category]) {
            categoryScores[qa.category] = { correct: 0, total: 0 };
          }

  // ===== SEARCH ROUTES =====

  app.get("/api/search", requireAuth, async (req, res, next) => {
    try {
      const { q, type } = req.query;
      const query = (q as string || "").toLowerCase();

      if (!query || query.length < 2) {
        return res.json({ results: [] });
      }

      const results: any = {
        modules: [],
        quizzes: [],
        challenges: [],
        careerPaths: [],
      };

      // Search modules
      if (!type || type === "modules") {
        const user = req.user as User;
        const modules = await storage.getModulesForUser(user);
        results.modules = modules.filter(m => 
          m.title.toLowerCase().includes(query) || 
          m.description.toLowerCase().includes(query)
        );
      }

      // Search quizzes
      if (!type || type === "quizzes") {
        const quizzes = await storage.getQuizzes();
        results.quizzes = quizzes.filter(q => 
          q.title.toLowerCase().includes(query) || 
          q.description.toLowerCase().includes(query)
        );
      }

      // Search code challenges
      if (!type || type === "challenges") {
        const challenges = await storage.getCodeChallenges();
        results.challenges = challenges.filter(c => 
          c.title.toLowerCase().includes(query) || 
          c.description.toLowerCase().includes(query)
        );
      }

      // Search career paths
      if (!type || type === "paths") {
        const paths = await storage.getCareerPaths();
        results.careerPaths = paths.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }

      res.json({ results });
    } catch (error) {
      next(error);
    }
  });

          categoryScores[qa.category].total++;
          if (qa.isCorrect) {
            categoryScores[qa.category].correct++;
          }
        }
      }

      // Find weak categories (< 60% accuracy)
      const weakCategories = Object.entries(categoryScores)
        .filter(([_, stats]) => (stats.correct / stats.total) < 0.6)
        .map(([category]) => category);

      const recentQuizScores = recentAttempts.map(attempt => ({
        category: "general",
        score: attempt.correctAnswers,
        total: attempt.totalQuestions,
      }));

      // Generate AI suggestions
      const suggestions = await generateStudySuggestions({
        level: user.level,
        totalXp: user.totalXp,
        careerPath: user.currentCareerPathId,
        recentQuizScores,
        weakCategories,
      });

      res.send({ suggestions });
    } catch (error) {
      console.error("Study suggestions error:", error);
      next(error);
    }
  });

  // ===== ADMINROUTES =====

  app.get("/api/admin/users", requireAdmin, async (_req, res, next) => {
    try {
      const users = await storage.getUsersForLeaderboard(1000);
      res.send({ users });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res, next) => {
    try {
      const { email, username, password, displayName, isAdmin } = req.body;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).send({ error: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).send({ error: "Username already taken" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      let user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        displayName,
        pathSelectionMode: "ai-guided",
        currentCareerPathId: null,
      });

      // Update isAdmin separately if needed
      if (isAdmin) {
        user = (await storage.updateUser(user.id, { isAdmin: true }))!;
      }

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).send({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const { displayName, isAdmin, level, totalXp } = req.body;
      const updates: any = {};

      if (displayName !== undefined) updates.displayName = displayName;
      if (isAdmin !== undefined) updates.isAdmin = isAdmin;
      if (level !== undefined) updates.level = level;
      if (totalXp !== undefined) updates.totalXp = totalXp;

      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Award badges if level was updated (e.g., reaching level 20 unlocks badge)
      if (level !== undefined) {
        await checkAndAwardBadges(req.params.id);
      }

      const { password: _, ...userWithoutPassword } = user;
      res.send({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      await storage.deleteUser(req.params.id);
      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/audit-logs", requireAdmin, async (_req, res, next) => {
    try {
      const logs = await storage.getAuditLogs(100);
      res.send({ logs });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/quiz-results", requireAdmin, async (_req, res, next) => {
    try {
      const attempts = await storage.getRecentQuizAttempts(100);

      // Enrich attempts with username and quiz title
      const enrichedAttempts = await Promise.all(
        attempts.map(async (attempt) => {
          const user = await storage.getUserById(attempt.userId);
          const quiz = await storage.getQuizById(attempt.quizId);
          return {
            ...attempt,
            username: user?.username || 'Unknown',
            quizTitle: quiz?.title || 'Unknown Quiz',
          };
        })
      );

      res.send({ 
        attempts: enrichedAttempts,
        totalAttempts: enrichedAttempts.length 
      });
    } catch (error) {
      next(error);
    }
  });

  // Syllabus upload with PDF parsing and AI question generation
  app.post("/api/admin/syllabus", requireAdmin, upload.single('file'), async (req, res, next) => {
    try {
      const user = req.user as User;
      const { careerPathId } = req.body;
      const file = req.file;

      if (!file || !careerPathId) {
        return res.status(400).send({ error: "PDF file and career path ID required" });
      }

      // Parse PDF - dynamic import for CommonJS module
      const pdfBuffer = file.buffer;
      const pdfParseModule = await import('pdf-parse') as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfData = await pdfParse(pdfBuffer);
      const syllabusText = pdfData.text;

      // Get career path name
      const careerPath = await storage.getCareerPath(careerPathId);
      if (!careerPath) {
        return res.status(404).send({ error: "Career path not found" });
      }

      // Generate questions using AI
      const generatedQuestions = await generateQuestionsFromText(
        syllabusText,
        careerPath.name,
        15 // Generate 15 questions per syllabus
      );

      // Create a quiz from generated questions
      const quiz = await storage.createQuiz({
        title: `${careerPath.name} - ${file.originalname} Quiz`,
        description: `Auto-generated quiz from ${file.originalname} syllabus`,
        difficulty: "intermediate",
        careerPathId,
        requiredLevel: 5,
        xpReward: 200,
        timeLimit: 1800, // 30 minutes
        isFinalAssessment: false,
      });

      // Create questions in the database
      for (const q of generatedQuestions) {
        await storage.createQuestion({
          quizId: quiz.id,
          questionText: q.question,
          questionType: "multiple-choice",
          options: q.options,
          correctAnswer: String(q.correctAnswer),
          explanation: q.explanation,
          category: q.category,
        });
      }

      const uploadRecord = await storage.createSyllabusUpload({
        uploadedBy: user.id,
        fileName: file.originalname || "syllabus.pdf",
        careerPathId,
        questionsGenerated: generatedQuestions.length,
      });

      // Create audit log
      await storage.createAuditLog({
        userId: user.id,
        action: "Syllabus Upload",
        details: `Uploaded ${file.originalname} - Generated ${generatedQuestions.length} questions for ${careerPath.name}`,
        status: "success",
      });

      res.send({ 
        upload: uploadRecord, 
        quiz,
        questionsGenerated: generatedQuestions.length 
      });
    } catch (error) {
      console.error("Syllabus upload error:", error);
      next(error);
    }
  });

  // Configure multer specifically for PDF uploads with strict validation
  const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
      // Only accept PDF files
      if (file.mimetype === 'application/pdf' && file.originalname.toLowerCase().endsWith('.pdf')) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    }
  });

  // Upload lesson PDF
  app.post("/api/admin/lesson-pdf", requireAdmin, pdfUpload.single('file'), async (req, res, next) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).send({ error: "PDF file required" });
      }

      // Create lesson_pdfs directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'attached_assets', 'lesson_pdfs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${sanitizedFilename}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      fs.writeFileSync(filepath, file.buffer);

      // Return URL path (will be served by Express static middleware)
      const pdfUrl = `/assets/lesson_pdfs/${filename}`;

      res.send({ 
        success: true,
        pdfUrl,
        filename,
        originalName: file.originalname
      });
    } catch (error) {
      console.error("Lesson PDF upload error:", error);
      next(error);
    }
  });

  // ===== MODULE MANAGEMENT ROUTES =====

  // Get all modules (admin view - no filtering)
  app.get("/api/admin/modules", requireAdmin, async (_req, res, next) => {
    try {
      const modulesRef = collection(db, "modules");
      const snapshot = await getDocs(modulesRef);
      const modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get lesson counts for each module
      const modulesWithCounts = await Promise.all(
        modules.map(async (module: any) => {
          const lessons = await storage.getModuleLessons(module.id);
          return {
            ...module,
            lessonCount: lessons.length,
            totalXP: lessons.reduce((sum: number, lesson: any) => sum + (lesson.xpReward || 0), 0)
          };
        })
      );

      res.send({ modules: modulesWithCounts });
    } catch (error) {
      next(error);
    }
  });

  // Create module
  app.post("/api/admin/modules", requireAdmin, async (req, res, next) => {
    try {
      const { title, description, careerPath, requiredLevel, order } = req.body;

      if (!title || !description) {
        return res.status(400).send({ error: "Title and description are required" });
      }

      const module = await storage.createModule({
        title,
        description,
        careerPath: careerPath || null,
        requiredLevel: requiredLevel || 0,
        order: order || 0
      });

      res.send({ module });
    } catch (error) {
      next(error);
    }
  });

  // Update module
  app.patch("/api/admin/modules/:id", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      await storage.updateModule(id, updates);

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Delete module
  app.delete("/api/admin/modules/:id", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;

      await storage.deleteModule(id);

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Get lessons for a module
  app.get("/api/admin/modules/:id/lessons", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const lessons = await storage.getModuleLessons(id);

      res.send({ lessons });
    } catch (error) {
      next(error);
    }
  });

  // Create lesson
  app.post("/api/admin/lessons", requireAdmin, async (req, res, next) => {
    try {
      const { moduleId, title, content, description, type, order, xpReward, requiredLevel, estimatedTime, pdfUrl } = req.body;

      if (!moduleId || !title) {
        return res.status(400).send({ error: "Module ID and title are required" });
      }

      const lesson = await storage.createLesson({
        moduleId,
        title,
        content: content || "",
        description: description || "",
        type: type || "theory",
        order: order || 0,
        xpReward: xpReward || 50,
        requiredLevel: requiredLevel || 0,
        estimatedTime: estimatedTime || "10 min",
        pdfUrl
      });

      res.send({ lesson });
    } catch (error) {
      next(error);
    }
  });

  // Update lesson
  app.patch("/api/admin/lessons/:id", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      await storage.updateLesson(id, updates);

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Delete lesson
  app.delete("/api/admin/lessons/:id", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;

      await storage.deleteLesson(id);

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // ===== DEBUG ENDPOINTS =====
  
  // Show hidden modules for current user (debug)
  app.get("/api/debug/hidden-modules", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const modulesRef = collection(db, "modules");
      const snapshot = await getDocs(modulesRef);
      const allModules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const hiddenModules = allModules.filter((m: any) => {
        // Check if user meets level requirement
        if ((m.requiredLevel || 0) > user.level) {
          return true;
        }
        
        // If user has a career path, check if module is accessible
        if (user.currentCareerPathId) {
          return !(m.careerPath === user.currentCareerPathId || m.careerPath === null);
        }
        
        return false;
      });

      const hiddenWithReasons = hiddenModules.map((m: any) => ({
        id: m.id,
        title: m.title,
        requiredLevel: m.requiredLevel || 0,
        careerPath: m.careerPath || null,
        reason: (m.requiredLevel || 0) > user.level 
          ? `Level requirement ${m.requiredLevel} > your level ${user.level}`
          : user.currentCareerPathId && m.careerPath !== user.currentCareerPathId && m.careerPath !== null
          ? `Career path mismatch: module is for "${m.careerPath}", you are in "${user.currentCareerPathId}"`
          : 'Unknown'
      }));

      res.json({ 
        userLevel: user.level,
        userCareerPath: user.currentCareerPathId || 'None',
        totalModules: allModules.length,
        hiddenModules: hiddenWithReasons,
        hiddenCount: hiddenWithReasons.length
      });
    } catch (error) {
      next(error);
    }
  });

  // Fix: Unlock all modules for all users (make them accessible)
  app.post("/api/admin/unlock-all-modules", requireAdmin, async (req, res, next) => {
    try {
      const modulesRef = collection(db, "modules");
      const snapshot = await getDocs(modulesRef);
      
      let updated = 0;
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if ((data.requiredLevel || 0) !== 0 || data.careerPath !== null) {
          await updateDoc(doc.ref, {
            requiredLevel: 0,
            careerPath: null
          });
          console.log(`[unlock-all-modules] Updated module "${data.title}" (${doc.id})`);
          updated++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Updated ${updated} modules to be accessible to all users`,
        updated 
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}