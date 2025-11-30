import { storage } from "./storage-firestore";
import type { InsertCareerPath, InsertBadge, InsertQuiz, InsertQuestion, InsertCodeChallenge } from "@shared/schema";
import { hashPassword } from "./auth";

async function seedFirestore() {
  console.log("🌱 Starting Firestore seed...");

  try {
    // 1. Create Career Paths
    console.log("Creating career paths...");
    const careerPaths: InsertCareerPath[] = [
      {
        name: "Full Stack Development",
        description: "Master both frontend and backend technologies to build complete web applications",
        color: "#6366f1",
        icon: "Code2",
        progressionRanks: ["Junior Full Stack", "Mid-Level Full Stack", "Senior Full Stack", "Lead Engineer"],
        requiredSkills: ["JavaScript", "React", "Node.js", "Databases", "REST APIs", "Git"],
      },
      {
        name: "Data Science & AI",
        description: "Analyze data, build machine learning models, and create intelligent systems",
        color: "#8b5cf6",
        icon: "Database",
        progressionRanks: ["Junior Data Analyst", "Data Scientist", "Senior ML Engineer", "AI Research Lead"],
        requiredSkills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization", "Deep Learning"],
      },
      {
        name: "Cloud & DevOps",
        description: "Design scalable infrastructure and automate deployment pipelines",
        color: "#06b6d4",
        icon: "Cloud",
        progressionRanks: ["Junior DevOps", "Cloud Engineer", "Senior DevOps", "Infrastructure Architect"],
        requiredSkills: ["Docker", "Kubernetes", "CI/CD", "AWS/Azure", "Linux", "Terraform"],
      },
      {
        name: "Mobile Development",
        description: "Create native and cross-platform mobile applications",
        color: "#10b981",
        icon: "Smartphone",
        progressionRanks: ["Junior Mobile Dev", "Mobile Developer", "Senior Mobile Dev", "Mobile Architect"],
        requiredSkills: ["React Native", "Swift/Kotlin", "Mobile UI/UX", "API Integration", "App Store Deployment"],
      },
      {
        name: "Cybersecurity",
        description: "Protect systems, networks, and data from cyber threats",
        color: "#ef4444",
        icon: "Shield",
        progressionRanks: ["Security Analyst", "Security Engineer", "Senior Security Engineer", "Security Architect"],
        requiredSkills: ["Network Security", "Cryptography", "Penetration Testing", "Security Compliance", "Incident Response"],
      },
    ];

    const createdPaths = [];
    for (const path of careerPaths) {
      const created = await storage.createCareerPath(path);
      createdPaths.push(created);
      console.log(`✓ Created career path: ${created.name}`);
    }

    // 2. Create Badges
    console.log("\nCreating badges...");
    const badges: InsertBadge[] = [
      { name: "First Steps", description: "Complete your first quiz", icon: "Award", rarity: "common", requirement: "Complete 1 quiz" },
      { name: "Quiz Master", description: "Score 100% on any quiz", icon: "Trophy", rarity: "rare", requirement: "Perfect score" },
      { name: "Code Warrior", description: "Complete 10 code challenges", icon: "Code2", rarity: "epic", requirement: "10 code challenges" },
      { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "Flame", rarity: "rare", requirement: "7-day streak" },
      { name: "Month Master", description: "Maintain a 30-day streak", icon: "Star", rarity: "legendary", requirement: "30-day streak" },
      { name: "Level 10", description: "Reach level 10", icon: "Zap", rarity: "common", requirement: "Level 10" },
      { name: "Level 20", description: "Reach level 20", icon: "Rocket", rarity: "rare", requirement: "Level 20" },
      { name: "Path Finder", description: "Complete interest assessment", icon: "Shield", rarity: "epic", requirement: "Interest assessment" },
    ];

    for (const badge of badges) {
      await storage.createBadge(badge);
      console.log(`✓ Created badge: ${badge.name}`);
    }

    // 3. Create Quizzes for each career path
    console.log("\nCreating quizzes...");

    const fullStackPath = createdPaths.find(p => p.name === "Full Stack Development");
    const dataPath = createdPaths.find(p => p.name === "Data Science & AI");

    if (fullStackPath) {
      const fullStackQuizzes: InsertQuiz[] = [
        {
          title: "JavaScript Fundamentals",
          description: "Test your knowledge of core JavaScript concepts",
          difficulty: "beginner",
          careerPathId: fullStackPath.id,
          requiredLevel: 1,
          xpReward: 100,
          timeLimit: 600,
          isFinalAssessment: false,
        },
        {
          title: "React Basics",
          description: "Learn React components and hooks",
          difficulty: "intermediate",
          careerPathId: fullStackPath.id,
          requiredLevel: 5,
          xpReward: 200,
          timeLimit: 900,
          isFinalAssessment: false,
        },
        {
          title: "Node.js & Express",
          description: "Backend development with Node.js",
          difficulty: "intermediate",
          careerPathId: fullStackPath.id,
          requiredLevel: 8,
          xpReward: 250,
          timeLimit: 1200,
          isFinalAssessment: false,
        },
      ];

      for (const quiz of fullStackQuizzes) {
        const createdQuiz = await storage.createQuiz(quiz);
        console.log(`✓ Created quiz: ${createdQuiz.title}`);

        // Add questions to each quiz
        const questions: InsertQuestion[] = [
          {
            quizId: createdQuiz.id,
            questionText: "What is the correct way to declare a variable in JavaScript?",
            questionType: "multiple-choice",
            options: ["var x = 5", "let x = 5", "const x = 5", "All of the above"],
            correctAnswer: "All of the above",
            explanation: "JavaScript supports var, let, and const for variable declaration",
            category: "frontend",
          },
          {
            quizId: createdQuiz.id,
            questionText: "Which method is used to add an element to the end of an array?",
            questionType: "multiple-choice",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correctAnswer: "push()",
            explanation: "push() adds elements to the end of an array",
            category: "frontend",
          },
          {
            quizId: createdQuiz.id,
            questionText: "What does === operator do in JavaScript?",
            questionType: "multiple-choice",
            options: ["Compares values only", "Compares types only", "Compares both value and type", "Assigns a value"],
            correctAnswer: "Compares both value and type",
            explanation: "=== is the strict equality operator that checks both value and type",
            category: "frontend",
          },
        ];

        await storage.createQuestions(questions);
        console.log(`  ✓ Added ${questions.length} questions`);
      }
    }

    if (dataPath) {
      const dataQuizzes: InsertQuiz[] = [
        {
          title: "Python for Data Science",
          description: "Essential Python concepts for data analysis",
          difficulty: "beginner",
          careerPathId: dataPath.id,
          requiredLevel: 1,
          xpReward: 100,
          timeLimit: 600,
          isFinalAssessment: false,
        },
        {
          title: "Statistics Fundamentals",
          description: "Core statistical concepts for data science",
          difficulty: "intermediate",
          careerPathId: dataPath.id,
          requiredLevel: 5,
          xpReward: 200,
          timeLimit: 900,
          isFinalAssessment: false,
        },
      ];

      for (const quiz of dataQuizzes) {
        const createdQuiz = await storage.createQuiz(quiz);
        console.log(`✓ Created quiz: ${createdQuiz.title}`);

        const questions: InsertQuestion[] = [
          {
            quizId: createdQuiz.id,
            questionText: "Which library is commonly used for data manipulation in Python?",
            questionType: "multiple-choice",
            options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
            correctAnswer: "Pandas",
            explanation: "Pandas is the primary library for data manipulation in Python",
            category: "data",
          },
          {
            quizId: createdQuiz.id,
            questionText: "What does SQL stand for?",
            questionType: "multiple-choice",
            options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
            correctAnswer: "Structured Query Language",
            explanation: "SQL is Structured Query Language for database management",
            category: "data",
          },
        ];

        await storage.createQuestions(questions);
        console.log(`  ✓ Added ${questions.length} questions`);
      }
    }

    // 4. Create Code Challenges
    console.log("\nCreating code challenges...");
    const codeChallenges: InsertCodeChallenge[] = [
      {
        title: "FizzBuzz",
        description: "Print numbers 1-100, but for multiples of 3 print 'Fizz', multiples of 5 print 'Buzz', and multiples of both print 'FizzBuzz'",
        difficulty: "easy",
        careerPathId: fullStackPath?.id,
        requiredLevel: 1,
        xpReward: 150,
        starterCode: "function fizzBuzz(n) {\n  // Your code here\n}",
        testCases: [
          { input: "15", expectedOutput: "FizzBuzz" },
          { input: "9", expectedOutput: "Fizz" },
          { input: "10", expectedOutput: "Buzz" },
          { input: "7", expectedOutput: "7" },
        ],
        supportedLanguages: ["javascript", "python", "java", "cpp"],
      },
      {
        title: "Reverse String",
        description: "Write a function that reverses a string",
        difficulty: "easy",
        careerPathId: fullStackPath?.id,
        requiredLevel: 1,
        xpReward: 120,
        starterCode: "function reverseString(str) {\n  // Your code here\n}",
        testCases: [
          { input: "hello", expectedOutput: "olleh" },
          { input: "world", expectedOutput: "dlrow" },
          { input: "12345", expectedOutput: "54321" },
        ],
        supportedLanguages: ["javascript", "python", "java", "cpp"],
      },
      {
        title: "Palindrome Checker",
        description: "Check if a string is a palindrome (reads the same forwards and backwards)",
        difficulty: "medium",
        careerPathId: fullStackPath?.id,
        requiredLevel: 3,
        xpReward: 200,
        starterCode: "function isPalindrome(str) {\n  // Your code here\n}",
        testCases: [
          { input: "racecar", expectedOutput: "true" },
          { input: "hello", expectedOutput: "false" },
          { input: "A man a plan a canal Panama", expectedOutput: "true" },
        ],
        supportedLanguages: ["javascript", "python", "java", "cpp"],
      },
    ];

    for (const challenge of codeChallenges) {
      await storage.createCodeChallenge(challenge);
      console.log(`✓ Created code challenge: ${challenge.title}`);
    }

    // 5. Create Modules and Lessons
    console.log("\nCreating modules and lessons...");
    
    // General Modules (for all paths, levels 1-20)
    const generalModules = [
      {
        title: "Programming Fundamentals",
        description: "Learn the basics of programming, variables, and control flow",
        careerPath: null,
        requiredLevel: 1,
        order: 1,
        lessons: [
          { title: "Introduction to Programming", content: "What is programming? Understanding computers and code.", type: "theory" as const, xpReward: 50 },
          { title: "Variables and Data Types", content: "Learn about storing and manipulating data.", type: "theory" as const, xpReward: 50 },
          { title: "Control Flow: If/Else", content: "Making decisions in code with conditional statements.", type: "practice" as const, xpReward: 75 },
          { title: "Loops and Iteration", content: "Repeating actions with for and while loops.", type: "practice" as const, xpReward: 75 },
        ]
      },
      {
        title: "Data Structures Basics",
        description: "Understanding arrays, objects, and basic data organization",
        careerPath: null,
        requiredLevel: 3,
        order: 2,
        lessons: [
          { title: "Arrays and Lists", content: "Storing collections of data efficiently.", type: "theory" as const, xpReward: 60 },
          { title: "Objects and Maps", content: "Key-value pairs and structured data.", type: "theory" as const, xpReward: 60 },
          { title: "Stacks and Queues", content: "LIFO and FIFO data structures.", type: "practice" as const, xpReward: 80 },
        ]
      },
      {
        title: "Algorithm Fundamentals",
        description: "Learn basic algorithms and problem-solving strategies",
        careerPath: null,
        requiredLevel: 5,
        order: 3,
        lessons: [
          { title: "Searching Algorithms", content: "Linear and binary search techniques.", type: "theory" as const, xpReward: 70 },
          { title: "Sorting Algorithms", content: "Bubble sort, selection sort, and quick sort.", type: "practice" as const, xpReward: 90 },
          { title: "Big O Notation", content: "Understanding time and space complexity.", type: "theory" as const, xpReward: 60 },
        ]
      },
      {
        title: "Object-Oriented Programming",
        description: "Master classes, objects, and OOP principles",
        careerPath: null,
        requiredLevel: 8,
        order: 4,
        lessons: [
          { title: "Classes and Objects", content: "Creating blueprints for objects.", type: "theory" as const, xpReward: 70 },
          { title: "Inheritance and Polymorphism", content: "Reusing code through inheritance.", type: "practice" as const, xpReward: 85 },
          { title: "Encapsulation and Abstraction", content: "Hiding complexity and protecting data.", type: "theory" as const, xpReward: 65 },
        ]
      },
      {
        title: "Version Control with Git",
        description: "Learn Git and collaborative development workflows",
        careerPath: null,
        requiredLevel: 10,
        order: 5,
        lessons: [
          { title: "Git Basics", content: "Commits, branches, and repositories.", type: "theory" as const, xpReward: 60 },
          { title: "Branching and Merging", content: "Working with feature branches and pull requests.", type: "practice" as const, xpReward: 80 },
          { title: "Collaboration Workflows", content: "Team development with Git.", type: "theory" as const, xpReward: 55 },
        ]
      },
    ];

    for (const moduleData of generalModules) {
      const { lessons, ...moduleInfo } = moduleData;
      const module = await storage.createModule(moduleInfo);
      console.log(`✓ Created module: ${module.title}`);
      
      for (let i = 0; i < lessons.length; i++) {
        await storage.createLesson({
          moduleId: module.id,
          ...lessons[i],
          order: i + 1,
        });
      }
      console.log(`  Added ${lessons.length} lessons`);
    }

    // Full Stack Development Modules
    if (fullStackPath) {
      const fullStackModules = [
        {
          title: "Frontend Web Development",
          description: "HTML, CSS, and JavaScript for building user interfaces",
          careerPath: fullStackPath.id,
          requiredLevel: 12,
          order: 6,
          lessons: [
            { title: "HTML5 Fundamentals", content: "Semantic HTML and document structure.", type: "theory" as const, xpReward: 70 },
            { title: "CSS Styling and Layout", content: "Flexbox, Grid, and responsive design.", type: "practice" as const, xpReward: 90 },
            { title: "JavaScript DOM Manipulation", content: "Interacting with web pages dynamically.", type: "practice" as const, xpReward: 95 },
            { title: "Modern JavaScript (ES6+)", content: "Arrow functions, async/await, and modules.", type: "theory" as const, xpReward: 75 },
          ]
        },
        {
          title: "React Development",
          description: "Building modern UIs with React and hooks",
          careerPath: fullStackPath.id,
          requiredLevel: 15,
          order: 7,
          lessons: [
            { title: "React Components", content: "Function and class components.", type: "theory" as const, xpReward: 80 },
            { title: "State and Props", content: "Managing component data and passing information.", type: "practice" as const, xpReward: 100 },
            { title: "React Hooks", content: "useState, useEffect, and custom hooks.", type: "practice" as const, xpReward: 110 },
            { title: "React Router", content: "Client-side routing and navigation.", type: "practice" as const, xpReward: 90 },
          ]
        },
        {
          title: "Backend with Node.js",
          description: "Server-side JavaScript and API development",
          careerPath: fullStackPath.id,
          requiredLevel: 18,
          order: 8,
          lessons: [
            { title: "Node.js Fundamentals", content: "Event loop, modules, and npm.", type: "theory" as const, xpReward: 85 },
            { title: "Express.js Framework", content: "Building REST APIs with Express.", type: "practice" as const, xpReward: 120 },
            { title: "Database Integration", content: "SQL and NoSQL databases.", type: "practice" as const, xpReward: 130 },
            { title: "Authentication & Security", content: "JWT, sessions, and secure APIs.", type: "theory" as const, xpReward: 100 },
          ]
        },
        {
          title: "Full Stack Project",
          description: "Build a complete web application from scratch",
          careerPath: fullStackPath.id,
          requiredLevel: 22,
          order: 9,
          lessons: [
            { title: "Project Planning", content: "Requirements, architecture, and design.", type: "theory" as const, xpReward: 90 },
            { title: "Frontend Implementation", content: "Building the user interface.", type: "practice" as const, xpReward: 150 },
            { title: "Backend Implementation", content: "Creating the API and database.", type: "practice" as const, xpReward: 150 },
            { title: "Deployment and Testing", content: "Deploying to production.", type: "practice" as const, xpReward: 120 },
          ]
        },
      ];

      for (const moduleData of fullStackModules) {
        const { lessons, ...moduleInfo } = moduleData;
        const module = await storage.createModule(moduleInfo);
        console.log(`✓ Created Full Stack module: ${module.title}`);
        
        for (let i = 0; i < lessons.length; i++) {
          await storage.createLesson({
            moduleId: module.id,
            ...lessons[i],
            order: i + 1,
          });
        }
        console.log(`  Added ${lessons.length} lessons`);
      }
    }

    // Data Science & AI Modules
    if (dataPath) {
      const dataModules = [
        {
          title: "Python for Data Science",
          description: "Master Python libraries for data analysis",
          careerPath: dataPath.id,
          requiredLevel: 12,
          order: 6,
          lessons: [
            { title: "NumPy Fundamentals", content: "Arrays and numerical computing.", type: "theory" as const, xpReward: 80 },
            { title: "Pandas for Data Manipulation", content: "DataFrames and data processing.", type: "practice" as const, xpReward: 100 },
            { title: "Data Visualization with Matplotlib", content: "Creating charts and graphs.", type: "practice" as const, xpReward: 90 },
          ]
        },
        {
          title: "Statistics and Probability",
          description: "Essential math for data science",
          careerPath: dataPath.id,
          requiredLevel: 15,
          order: 7,
          lessons: [
            { title: "Descriptive Statistics", content: "Mean, median, mode, and variance.", type: "theory" as const, xpReward: 75 },
            { title: "Probability Theory", content: "Distributions and probability rules.", type: "theory" as const, xpReward: 85 },
            { title: "Hypothesis Testing", content: "Statistical significance and p-values.", type: "practice" as const, xpReward: 110 },
          ]
        },
        {
          title: "Machine Learning Basics",
          description: "Introduction to ML algorithms and models",
          careerPath: dataPath.id,
          requiredLevel: 18,
          order: 8,
          lessons: [
            { title: "Supervised vs Unsupervised Learning", content: "Types of ML problems.", type: "theory" as const, xpReward: 90 },
            { title: "Linear Regression", content: "Predicting continuous values.", type: "practice" as const, xpReward: 120 },
            { title: "Classification Algorithms", content: "Decision trees and logistic regression.", type: "practice" as const, xpReward: 130 },
            { title: "Model Evaluation", content: "Accuracy, precision, recall, and F1 score.", type: "theory" as const, xpReward: 95 },
          ]
        },
        {
          title: "Deep Learning with Neural Networks",
          description: "Advanced AI with deep learning",
          careerPath: dataPath.id,
          requiredLevel: 22,
          order: 9,
          lessons: [
            { title: "Neural Network Fundamentals", content: "Layers, neurons, and activation functions.", type: "theory" as const, xpReward: 100 },
            { title: "Training Neural Networks", content: "Backpropagation and gradient descent.", type: "practice" as const, xpReward: 140 },
            { title: "Convolutional Neural Networks", content: "Image recognition and computer vision.", type: "practice" as const, xpReward: 150 },
          ]
        },
      ];

      for (const moduleData of dataModules) {
        const { lessons, ...moduleInfo } = moduleData;
        const module = await storage.createModule(moduleInfo);
        console.log(`✓ Created Data Science module: ${module.title}`);
        
        for (let i = 0; i < lessons.length; i++) {
          await storage.createLesson({
            moduleId: module.id,
            ...lessons[i],
            order: i + 1,
          });
        }
        console.log(`  Added ${lessons.length} lessons`);
      }
    }

    // Cloud & DevOps Modules
    const cloudPath = createdPaths.find(p => p.name === "Cloud & DevOps");
    if (cloudPath) {
      const cloudModules = [
        {
          title: "Linux Fundamentals",
          description: "Master the Linux command line and system administration",
          careerPath: cloudPath.id,
          requiredLevel: 12,
          order: 6,
          lessons: [
            { title: "Linux File System", content: "Understanding directories and permissions.", type: "theory" as const, xpReward: 70 },
            { title: "Command Line Basics", content: "Essential Linux commands and navigation.", type: "practice" as const, xpReward: 85 },
            { title: "Process Management", content: "Managing running processes and services.", type: "practice" as const, xpReward: 90 },
          ]
        },
        {
          title: "Docker and Containerization",
          description: "Package applications in containers",
          careerPath: cloudPath.id,
          requiredLevel: 15,
          order: 7,
          lessons: [
            { title: "Docker Fundamentals", content: "Images, containers, and Docker architecture.", type: "theory" as const, xpReward: 90 },
            { title: "Creating Dockerfiles", content: "Building custom container images.", type: "practice" as const, xpReward: 110 },
            { title: "Docker Compose", content: "Multi-container applications.", type: "practice" as const, xpReward: 120 },
          ]
        },
        {
          title: "CI/CD Pipelines",
          description: "Automate testing and deployment",
          careerPath: cloudPath.id,
          requiredLevel: 18,
          order: 8,
          lessons: [
            { title: "Continuous Integration Basics", content: "Automated testing and builds.", type: "theory" as const, xpReward: 85 },
            { title: "GitHub Actions", content: "Creating CI/CD workflows.", type: "practice" as const, xpReward: 130 },
            { title: "Deployment Strategies", content: "Blue-green and canary deployments.", type: "theory" as const, xpReward: 95 },
          ]
        },
        {
          title: "Kubernetes and Orchestration",
          description: "Manage containerized applications at scale",
          careerPath: cloudPath.id,
          requiredLevel: 22,
          order: 9,
          lessons: [
            { title: "Kubernetes Architecture", content: "Pods, nodes, and clusters.", type: "theory" as const, xpReward: 100 },
            { title: "Deploying to Kubernetes", content: "Deployments and services.", type: "practice" as const, xpReward: 150 },
            { title: "Scaling and Load Balancing", content: "Auto-scaling and high availability.", type: "practice" as const, xpReward: 140 },
          ]
        },
      ];

      for (const moduleData of cloudModules) {
        const { lessons, ...moduleInfo } = moduleData;
        const module = await storage.createModule(moduleInfo);
        console.log(`✓ Created Cloud & DevOps module: ${module.title}`);
        
        for (let i = 0; i < lessons.length; i++) {
          await storage.createLesson({
            moduleId: module.id,
            ...lessons[i],
            order: i + 1,
          });
        }
        console.log(`  Added ${lessons.length} lessons`);
      }
    }

    // Mobile Development Modules
    const mobilePath = createdPaths.find(p => p.name === "Mobile Development");
    if (mobilePath) {
      const mobileModules = [
        {
          title: "Mobile UI/UX Basics",
          description: "Design principles for mobile applications",
          careerPath: mobilePath.id,
          requiredLevel: 12,
          order: 6,
          lessons: [
            { title: "Mobile Design Patterns", content: "Common UI patterns for mobile apps.", type: "theory" as const, xpReward: 75 },
            { title: "Responsive Layouts", content: "Adapting to different screen sizes.", type: "practice" as const, xpReward: 90 },
            { title: "Touch Interactions", content: "Gestures and touch events.", type: "practice" as const, xpReward: 85 },
          ]
        },
        {
          title: "React Native Development",
          description: "Build cross-platform mobile apps with React Native",
          careerPath: mobilePath.id,
          requiredLevel: 15,
          order: 7,
          lessons: [
            { title: "React Native Basics", content: "Components and navigation.", type: "theory" as const, xpReward: 90 },
            { title: "Native Modules", content: "Accessing device features.", type: "practice" as const, xpReward: 110 },
            { title: "State Management in Mobile", content: "Redux and Context API.", type: "practice" as const, xpReward: 120 },
          ]
        },
        {
          title: "Native iOS Development",
          description: "Build iOS apps with Swift",
          careerPath: mobilePath.id,
          requiredLevel: 18,
          order: 8,
          lessons: [
            { title: "Swift Programming", content: "Swift syntax and fundamentals.", type: "theory" as const, xpReward: 95 },
            { title: "UIKit and SwiftUI", content: "Building iOS user interfaces.", type: "practice" as const, xpReward: 130 },
            { title: "iOS App Architecture", content: "MVC and MVVM patterns.", type: "theory" as const, xpReward: 100 },
          ]
        },
        {
          title: "App Store Deployment",
          description: "Publishing mobile apps to app stores",
          careerPath: mobilePath.id,
          requiredLevel: 22,
          order: 9,
          lessons: [
            { title: "App Store Guidelines", content: "Apple and Google submission requirements.", type: "theory" as const, xpReward: 85 },
            { title: "App Testing and QA", content: "Testing on real devices.", type: "practice" as const, xpReward: 120 },
            { title: "Release Management", content: "Versioning and updates.", type: "practice" as const, xpReward: 110 },
          ]
        },
      ];

      for (const moduleData of mobileModules) {
        const { lessons, ...moduleInfo } = moduleData;
        const module = await storage.createModule(moduleInfo);
        console.log(`✓ Created Mobile Development module: ${module.title}`);
        
        for (let i = 0; i < lessons.length; i++) {
          await storage.createLesson({
            moduleId: module.id,
            ...lessons[i],
            order: i + 1,
          });
        }
        console.log(`  Added ${lessons.length} lessons`);
      }
    }

    // Cybersecurity Modules
    const securityPath = createdPaths.find(p => p.name === "Cybersecurity");
    if (securityPath) {
      const securityModules = [
        {
          title: "Network Security Fundamentals",
          description: "Secure networks and prevent attacks",
          careerPath: securityPath.id,
          requiredLevel: 12,
          order: 6,
          lessons: [
            { title: "Network Protocols", content: "TCP/IP, HTTP, and DNS.", type: "theory" as const, xpReward: 80 },
            { title: "Firewalls and VPNs", content: "Network security devices.", type: "theory" as const, xpReward: 90 },
            { title: "Network Scanning", content: "Tools like nmap and Wireshark.", type: "practice" as const, xpReward: 100 },
          ]
        },
        {
          title: "Web Application Security",
          description: "Protect web apps from common vulnerabilities",
          careerPath: securityPath.id,
          requiredLevel: 15,
          order: 7,
          lessons: [
            { title: "OWASP Top 10", content: "Common web vulnerabilities.", type: "theory" as const, xpReward: 95 },
            { title: "SQL Injection", content: "Understanding and preventing SQL attacks.", type: "practice" as const, xpReward: 120 },
            { title: "XSS and CSRF", content: "Cross-site scripting and request forgery.", type: "practice" as const, xpReward: 115 },
          ]
        },
        {
          title: "Penetration Testing",
          description: "Ethical hacking and security testing",
          careerPath: securityPath.id,
          requiredLevel: 18,
          order: 8,
          lessons: [
            { title: "Reconnaissance Techniques", content: "Information gathering and footprinting.", type: "theory" as const, xpReward: 90 },
            { title: "Vulnerability Scanning", content: "Using automated tools.", type: "practice" as const, xpReward: 130 },
            { title: "Exploitation Basics", content: "Metasploit and exploit frameworks.", type: "practice" as const, xpReward: 140 },
          ]
        },
        {
          title: "Incident Response & Forensics",
          description: "Handle security breaches and analyze evidence",
          careerPath: securityPath.id,
          requiredLevel: 22,
          order: 9,
          lessons: [
            { title: "Incident Response Plan", content: "Preparation and response procedures.", type: "theory" as const, xpReward: 100 },
            { title: "Digital Forensics", content: "Evidence collection and analysis.", type: "practice" as const, xpReward: 140 },
            { title: "Malware Analysis", content: "Identifying and analyzing malicious software.", type: "practice" as const, xpReward: 150 },
          ]
        },
      ];

      for (const moduleData of securityModules) {
        const { lessons, ...moduleInfo } = moduleData;
        const module = await storage.createModule(moduleInfo);
        console.log(`✓ Created Cybersecurity module: ${module.title}`);
        
        for (let i = 0; i < lessons.length; i++) {
          await storage.createLesson({
            moduleId: module.id,
            ...lessons[i],
            order: i + 1,
          });
        }
        console.log(`  Added ${lessons.length} lessons`);
      }
    }

    // 6. Create sample users and award badges (retaining original intent for users)
    console.log("\nCreating test users...");
    const testUser = await storage.createUser({
      username: "testuser",
      email: "test@careerquest.com",
      password: await hashPassword("password123"),
      displayName: "Test User",
      pathSelectionMode: "ai-guided",
      currentCareerPathId: null,
    });

    // TODO: Award some badges to test user after implementing getBadgeByName method
    // For now, badges are awarded automatically based on achievements

    const adminUser = await storage.createUser({
      username: "admin",
      email: "admin@careerquest.com",
      password: await hashPassword("admin123"),
      displayName: "Admin User",
      pathSelectionMode: "manual",
      currentCareerPathId: fullStackPath?.id,
    });
    await storage.updateUser(adminUser.id, { isAdmin: true, level: 25, totalXp: 25000, xp: 0 });
    console.log(`✓ Created admin user: ${adminUser.username}`);
    console.log(`   - test@careerquest.com / password123`);
    console.log(`   - admin@careerquest.com / admin123 (Admin)`);


    console.log("\n✅ Firestore seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedFirestore()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedFirestore };