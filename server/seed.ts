import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create career paths
  const careerPaths = await Promise.all([
    storage.createCareerPath({
      name: "Full Stack Development",
      description: "Master both frontend and backend technologies to build complete web applications",
      color: "#10b981",
      icon: "Code",
      progressionRanks: ["Junior Full Stack Developer", "Full Stack Developer", "Senior Full Stack Developer", "Lead Full Stack Engineer"],
      requiredSkills: ["React", "Node.js", "Databases", "REST APIs", "TypeScript"],
    }),
    storage.createCareerPath({
      name: "Data Science & AI",
      description: "Analyze data and build intelligent systems using machine learning and AI",
      color: "#8b5cf6",
      icon: "Brain",
      progressionRanks: ["Junior Data Analyst", "Data Scientist", "Senior Data Scientist", "Principal AI Engineer"],
      requiredSkills: ["Python", "Statistics", "Machine Learning", "Data Visualization", "SQL"],
    }),
    storage.createCareerPath({
      name: "Cloud & DevOps",
      description: "Build and manage scalable cloud infrastructure and deployment pipelines",
      color: "#06b6d4",
      icon: "Cloud",
      progressionRanks: ["Junior DevOps Engineer", "DevOps Engineer", "Senior DevOps Engineer", "Cloud Architect"],
      requiredSkills: ["AWS/Azure/GCP", "Docker", "Kubernetes", "CI/CD", "Linux"],
    }),
    storage.createCareerPath({
      name: "Mobile Development",
      description: "Create native and cross-platform mobile applications for iOS and Android",
      color: "#f59e0b",
      icon: "Smartphone",
      progressionRanks: ["Junior Mobile Developer", "Mobile Developer", "Senior Mobile Developer", "Mobile Architect"],
      requiredSkills: ["React Native/Flutter", "iOS/Android", "Mobile UI/UX", "API Integration", "App Store Deployment"],
    }),
    storage.createCareerPath({
      name: "Cybersecurity",
      description: "Protect systems and data from security threats and vulnerabilities",
      color: "#ef4444",
      icon: "Shield",
      progressionRanks: ["Junior Security Analyst", "Security Engineer", "Senior Security Engineer", "Chief Security Officer"],
      requiredSkills: ["Network Security", "Penetration Testing", "Cryptography", "Security Frameworks", "Incident Response"],
    }),
  ]);

  console.log(`✅ Created ${careerPaths.length} career paths`);

  // Create badges
  const badges = await Promise.all([
    storage.createBadge({
      name: "First Steps",
      description: "Complete your first quiz",
      icon: "Award",
      rarity: "common",
      requirement: "Complete 1 quiz",
    }),
    storage.createBadge({
      name: "Code Warrior",
      description: "Solve 10 code challenges",
      icon: "Sword",
      rarity: "rare",
      requirement: "Complete 10 code challenges",
    }),
    storage.createBadge({
      name: "Perfect Score",
      description: "Get 100% on a quiz",
      icon: "Star",
      rarity: "epic",
      requirement: "Score 100% on any quiz",
    }),
    storage.createBadge({
      name: "Level 20 Legend",
      description: "Reach level 20",
      icon: "Crown",
      rarity: "legendary",
      requirement: "Reach level 20",
    }),
    storage.createBadge({
      name: "Quick Learner",
      description: "Complete 5 quizzes in one day",
      icon: "Zap",
      rarity: "rare",
      requirement: "Complete 5 quizzes in 24 hours",
    }),
  ]);

  console.log(`✅ Created ${badges.length} badges`);

  // Create sample quizzes for Full Stack Development
  const fullStackPath = careerPaths[0];
  
  const quiz1 = await storage.createQuiz({
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of core JavaScript concepts",
    difficulty: "beginner",
    careerPathId: fullStackPath.id,
    requiredLevel: 1,
    xpReward: 100,
    timeLimit: 300, // 5 minutes
    isFinalAssessment: false,
  });

  await storage.createQuestions([
    {
      quizId: quiz1.id,
      questionText: "What is the output of: console.log(typeof null)?",
      questionType: "multiple-choice",
      options: ["'null'", "'undefined'", "'object'", "'number'"],
      correctAnswer: "'object'",
      explanation: "In JavaScript, typeof null returns 'object' due to a historical bug in the language.",
      category: "frontend",
    },
    {
      quizId: quiz1.id,
      questionText: "Which method is used to add an element to the end of an array?",
      questionType: "multiple-choice",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correctAnswer: "push()",
      explanation: "The push() method adds one or more elements to the end of an array.",
      category: "frontend",
    },
    {
      quizId: quiz1.id,
      questionText: "What does the '===' operator do in JavaScript?",
      questionType: "multiple-choice",
      options: ["Assignment", "Comparison with type coercion", "Strict equality comparison", "Logical AND"],
      correctAnswer: "Strict equality comparison",
      explanation: "The === operator performs strict equality comparison without type coercion.",
      category: "frontend",
    },
  ]);

  const quiz2 = await storage.createQuiz({
    title: "RESTful API Design",
    description: "Learn the principles of REST API design",
    difficulty: "intermediate",
    careerPathId: fullStackPath.id,
    requiredLevel: 5,
    xpReward: 200,
    timeLimit: 600,
    isFinalAssessment: false,
  });

  await storage.createQuestions([
    {
      quizId: quiz2.id,
      questionText: "Which HTTP method should be used to update a resource?",
      questionType: "multiple-choice",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctAnswer: "PUT",
      explanation: "PUT is used to update an existing resource or create a new one if it doesn't exist.",
      category: "backend",
    },
    {
      quizId: quiz2.id,
      questionText: "What status code indicates a successful resource creation?",
      questionType: "multiple-choice",
      options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"],
      correctAnswer: "201 Created",
      explanation: "201 Created indicates that a new resource has been successfully created.",
      category: "backend",
    },
  ]);

  console.log(`✅ Created ${2} quizzes with questions`);

  // Create code challenges
  const challenge1 = await storage.createCodeChallenge({
    title: "FizzBuzz Challenge",
    description: "Write a function that prints numbers from 1 to 100. For multiples of 3, print 'Fizz' instead of the number. For multiples of 5, print 'Buzz'. For multiples of both 3 and 5, print 'FizzBuzz'.",
    difficulty: "beginner",
    careerPathId: fullStackPath.id,
    requiredLevel: 2,
    xpReward: 150,
    starterCode: "function fizzBuzz(n) {\n  // Your code here\n}",
    testCases: [
      { input: "15", expectedOutput: "FizzBuzz" },
      { input: "3", expectedOutput: "Fizz" },
      { input: "5", expectedOutput: "Buzz" },
      { input: "7", expectedOutput: "7" },
    ],
    supportedLanguages: ["javascript", "python", "java"],
  });

  console.log(`✅ Created code challenges`);

  // Create test users
  const testUser = await storage.createUser({
    username: "testuser",
    email: "test@careerquest.com",
    password: await hashPassword("password123"),
    displayName: "Test User",
    pathSelectionMode: "ai-guided",
    currentCareerPathId: null,
  });

  const adminUser = await storage.createUser({
    username: "admin",
    email: "admin@careerquest.com",
    password: await hashPassword("admin123"),
    displayName: "Admin User",
    pathSelectionMode: "manual",
    currentCareerPathId: fullStackPath.id,
  });

  // Make admin user actually an admin
  await storage.updateUser(adminUser.id, { isAdmin: true, level: 25, totalXp: 25000, xp: 0 });

  console.log(`✅ Created test users:`);
  console.log(`   - test@careerquest.com / password123`);
  console.log(`   - admin@careerquest.com / admin123 (Admin)`);

  // Award some badges to test user
  await storage.awardBadge(testUser.id, badges[0].id);

  console.log("🎉 Database seeding complete!");
}

// Run seed if called directly
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
