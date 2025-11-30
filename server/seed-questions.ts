import { storage } from "./storage-firestore";
import type { InsertQuestion } from "@shared/schema";

async function seedQuestions() {
  console.log("🌱 Seeding comprehensive quiz questions...");

  try {
    // Get career paths
    const careerPaths = await storage.getCareerPaths();
    const fullStackPath = careerPaths.find((p: any) => p.name === "Full Stack Development");
    const dataPath = careerPaths.find((p: any) => p.name === "Data Science & AI");
    const cloudPath = careerPaths.find((p: any) => p.name === "Cloud & DevOps");
    const mobilePath = careerPaths.find((p: any) => p.name === "Mobile Development");
    const securityPath = careerPaths.find((p: any) => p.name === "Cybersecurity");

    // Full Stack Development Questions
    if (fullStackPath) {
      const jsQuiz = await storage.createQuiz({
        title: "JavaScript Advanced",
        description: "Advanced JavaScript concepts and patterns",
        difficulty: "intermediate",
        careerPathId: fullStackPath.id,
        requiredLevel: 10,
        xpReward: 150,
        timeLimit: 900,
        isFinalAssessment: false,
      });

      const jsQuestions: InsertQuestion[] = [
        {
          quizId: jsQuiz.id,
          questionText: "What is a closure in JavaScript?",
          questionType: "multiple-choice",
          options: ["A function that has access to its outer scope", "A way to close browser windows", "A method to end loops", "A data structure"],
          correctAnswer: "A function that has access to its outer scope",
          explanation: "Closures allow functions to access variables from their outer scope",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What does 'this' keyword refer to in JavaScript?",
          questionType: "multiple-choice",
          options: ["The current function", "The current object", "The global window", "Depends on context"],
          correctAnswer: "Depends on context",
          explanation: "'this' refers to different objects depending on how the function is called",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "Which array method creates a new array with results of calling a function?",
          questionType: "multiple-choice",
          options: ["map()", "filter()", "forEach()", "reduce()"],
          correctAnswer: "map()",
          explanation: "map() creates a new array with the results of calling a function on every element",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What is the purpose of 'async/await' in JavaScript?",
          questionType: "multiple-choice",
          options: ["To handle asynchronous operations", "To create synchronous code", "To define classes", "To import modules"],
          correctAnswer: "To handle asynchronous operations",
          explanation: "async/await provides a cleaner way to work with promises",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What does JSON.parse() do?",
          questionType: "multiple-choice",
          options: ["Converts JSON to JavaScript object", "Converts object to JSON", "Validates JSON", "Compresses JSON"],
          correctAnswer: "Converts JSON to JavaScript object",
          explanation: "JSON.parse() parses a JSON string and returns a JavaScript object",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What is event bubbling in JavaScript?",
          questionType: "multiple-choice",
          options: ["Events propagate from child to parent", "Events propagate from parent to child", "Events are cancelled", "Events are cloned"],
          correctAnswer: "Events propagate from child to parent",
          explanation: "Event bubbling means events propagate up through the DOM tree",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What is destructuring in JavaScript?",
          questionType: "multiple-choice",
          options: ["Unpacking values from arrays or objects", "Deleting objects", "Breaking code", "Error handling"],
          correctAnswer: "Unpacking values from arrays or objects",
          explanation: "Destructuring allows extracting values from arrays or properties from objects",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What is the spread operator (...) used for?",
          questionType: "multiple-choice",
          options: ["Expanding iterables", "Mathematical operations", "String concatenation", "Type checking"],
          correctAnswer: "Expanding iterables",
          explanation: "The spread operator expands iterables like arrays and objects",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What is a Promise in JavaScript?",
          questionType: "multiple-choice",
          options: ["An object representing eventual completion of async operation", "A guarantee", "A function", "A variable type"],
          correctAnswer: "An object representing eventual completion of async operation",
          explanation: "Promises represent the eventual completion or failure of an async operation",
          category: "frontend",
        },
        {
          quizId: jsQuiz.id,
          questionText: "What is hoisting in JavaScript?",
          questionType: "multiple-choice",
          options: ["Moving declarations to the top of scope", "Lifting weights", "Raising errors", "Sorting arrays"],
          correctAnswer: "Moving declarations to the top of scope",
          explanation: "Hoisting is JavaScript's behavior of moving declarations to the top",
          category: "frontend",
        },
      ];

      await storage.createQuestions(jsQuestions);
      console.log(`✓ Created ${jsQuestions.length} Advanced JavaScript questions`);

      // HTML/CSS Quiz
      const htmlCssQuiz = await storage.createQuiz({
        title: "HTML & CSS Mastery",
        description: "Modern HTML5 and CSS3 techniques",
        difficulty: "intermediate",
        careerPathId: fullStackPath.id,
        requiredLevel: 5,
        xpReward: 150,
        timeLimit: 900,
        isFinalAssessment: false,
      });

      const htmlCssQuestions: InsertQuestion[] = [
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is semantic HTML?",
          questionType: "multiple-choice",
          options: ["HTML with meaningful tags", "Styled HTML", "Dynamic HTML", "Interactive HTML"],
          correctAnswer: "HTML with meaningful tags",
          explanation: "Semantic HTML uses tags that convey meaning about their content",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is Flexbox used for?",
          questionType: "multiple-choice",
          options: ["One-dimensional layouts", "Grid layouts", "Animations", "Forms"],
          correctAnswer: "One-dimensional layouts",
          explanation: "Flexbox is designed for one-dimensional layouts (row or column)",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is CSS Grid used for?",
          questionType: "multiple-choice",
          options: ["Two-dimensional layouts", "One-dimensional layouts", "Animations", "Colors"],
          correctAnswer: "Two-dimensional layouts",
          explanation: "CSS Grid is designed for two-dimensional layouts (rows and columns)",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is a media query?",
          questionType: "multiple-choice",
          options: ["CSS technique for responsive design", "Database query", "API request", "Image loader"],
          correctAnswer: "CSS technique for responsive design",
          explanation: "Media queries allow applying styles based on device characteristics",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What does CSS specificity determine?",
          questionType: "multiple-choice",
          options: ["Which styles take precedence", "Code speed", "Browser compatibility", "File size"],
          correctAnswer: "Which styles take precedence",
          explanation: "Specificity determines which CSS rules are applied when conflicts occur",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is the box model in CSS?",
          questionType: "multiple-choice",
          options: ["Content, padding, border, margin", "Width and height only", "Color scheme", "Font properties"],
          correctAnswer: "Content, padding, border, margin",
          explanation: "The box model describes how elements take up space on a page",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is a CSS pseudo-class?",
          questionType: "multiple-choice",
          options: ["Keyword that specifies element state", "Fake class", "JavaScript class", "HTML class"],
          correctAnswer: "Keyword that specifies element state",
          explanation: "Pseudo-classes select elements based on their state (e.g., :hover)",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is the purpose of viewport meta tag?",
          questionType: "multiple-choice",
          options: ["Control page dimensions on mobile", "Add images", "Define colors", "Create animations"],
          correctAnswer: "Control page dimensions on mobile",
          explanation: "Viewport meta tag controls how pages are displayed on mobile devices",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What is CSS position: absolute?",
          questionType: "multiple-choice",
          options: ["Position relative to nearest positioned ancestor", "Position in normal flow", "Fixed to viewport", "No positioning"],
          correctAnswer: "Position relative to nearest positioned ancestor",
          explanation: "Absolute positioning removes element from flow and positions relative to ancestor",
          category: "frontend",
        },
        {
          quizId: htmlCssQuiz.id,
          questionText: "What are CSS variables?",
          questionType: "multiple-choice",
          options: ["Custom properties for reusable values", "JavaScript variables", "HTML attributes", "Browser settings"],
          correctAnswer: "Custom properties for reusable values",
          explanation: "CSS variables (custom properties) store values for reuse throughout stylesheets",
          category: "frontend",
        },
      ];

      await storage.createQuestions(htmlCssQuestions);
      console.log(`✓ Created ${htmlCssQuestions.length} HTML/CSS questions`);

      // Database Quiz
      const dbQuiz = await storage.createQuiz({
        title: "Database Fundamentals",
        description: "SQL and database design principles",
        difficulty: "intermediate",
        careerPathId: fullStackPath.id,
        requiredLevel: 12,
        xpReward: 200,
        timeLimit: 1200,
        isFinalAssessment: false,
      });

      const dbQuestions: InsertQuestion[] = [
        {
          quizId: dbQuiz.id,
          questionText: "What does SQL stand for?",
          questionType: "multiple-choice",
          options: ["Structured Query Language", "Simple Query Language", "System Query Logic", "Standard Quality Level"],
          correctAnswer: "Structured Query Language",
          explanation: "SQL is the standard language for relational database management",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is a primary key?",
          questionType: "multiple-choice",
          options: ["Unique identifier for a record", "Foreign key reference", "Index type", "Database name"],
          correctAnswer: "Unique identifier for a record",
          explanation: "A primary key uniquely identifies each record in a table",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is a foreign key?",
          questionType: "multiple-choice",
          options: ["Reference to primary key in another table", "Backup key", "Encryption key", "Password"],
          correctAnswer: "Reference to primary key in another table",
          explanation: "Foreign keys create relationships between tables",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is database normalization?",
          questionType: "multiple-choice",
          options: ["Organizing data to reduce redundancy", "Making data normal", "Backing up data", "Encrypting data"],
          correctAnswer: "Organizing data to reduce redundancy",
          explanation: "Normalization organizes tables to minimize redundancy and dependency",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is a JOIN in SQL?",
          questionType: "multiple-choice",
          options: ["Combining rows from multiple tables", "Adding rows", "Deleting data", "Creating tables"],
          correctAnswer: "Combining rows from multiple tables",
          explanation: "JOINs combine data from multiple tables based on related columns",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is an index in a database?",
          questionType: "multiple-choice",
          options: ["Data structure for faster queries", "Table of contents", "Primary key", "Backup"],
          correctAnswer: "Data structure for faster queries",
          explanation: "Indexes improve the speed of data retrieval operations",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is a transaction?",
          questionType: "multiple-choice",
          options: ["Sequence of operations treated as single unit", "Database backup", "Table creation", "Data type"],
          correctAnswer: "Sequence of operations treated as single unit",
          explanation: "Transactions ensure data integrity by treating operations as atomic units",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What does ACID stand for in databases?",
          questionType: "multiple-choice",
          options: ["Atomicity, Consistency, Isolation, Durability", "Advanced Computing Interface Design", "Automatic Content Integration Database", "Application Control Interface Development"],
          correctAnswer: "Atomicity, Consistency, Isolation, Durability",
          explanation: "ACID properties ensure reliable database transactions",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is NoSQL?",
          questionType: "multiple-choice",
          options: ["Non-relational database", "No SQL allowed", "New SQL version", "Network SQL"],
          correctAnswer: "Non-relational database",
          explanation: "NoSQL databases don't use traditional relational table structure",
          category: "backend",
        },
        {
          quizId: dbQuiz.id,
          questionText: "What is database replication?",
          questionType: "multiple-choice",
          options: ["Copying data to multiple databases", "Deleting duplicates", "Creating backups", "Encrypting data"],
          correctAnswer: "Copying data to multiple databases",
          explanation: "Replication maintains copies of data across multiple database servers",
          category: "backend",
        },
      ];

      await storage.createQuestions(dbQuestions);
      console.log(`✓ Created ${dbQuestions.length} Database questions`);
    }

    // Data Science Questions
    if (dataPath) {
      const mlQuiz = await storage.createQuiz({
        title: "Machine Learning Basics",
        description: "Fundamental ML concepts and algorithms",
        difficulty: "intermediate",
        careerPathId: dataPath.id,
        requiredLevel: 10,
        xpReward: 200,
        timeLimit: 1200,
        isFinalAssessment: false,
      });

      const mlQuestions: InsertQuestion[] = [
        {
          quizId: mlQuiz.id,
          questionText: "What is supervised learning?",
          questionType: "multiple-choice",
          options: ["Learning from labeled data", "Learning without labels", "Random learning", "Manual training"],
          correctAnswer: "Learning from labeled data",
          explanation: "Supervised learning uses labeled training data",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is unsupervised learning?",
          questionType: "multiple-choice",
          options: ["Finding patterns without labels", "Using labeled data", "Manual classification", "Supervised by humans"],
          correctAnswer: "Finding patterns without labels",
          explanation: "Unsupervised learning finds patterns in unlabeled data",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is the purpose of train-test split?",
          questionType: "multiple-choice",
          options: ["Evaluate model performance", "Clean data", "Visualize data", "Store data"],
          correctAnswer: "Evaluate model performance",
          explanation: "Train-test split helps evaluate how well the model generalizes",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is overfitting?",
          questionType: "multiple-choice",
          options: ["Model learns training data too well", "Model is too simple", "Model is fast", "Model is accurate"],
          correctAnswer: "Model learns training data too well",
          explanation: "Overfitting occurs when a model learns noise in the training data",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is cross-validation?",
          questionType: "multiple-choice",
          options: ["Technique to assess model generalization", "Data cleaning", "Feature selection", "Model deployment"],
          correctAnswer: "Technique to assess model generalization",
          explanation: "Cross-validation evaluates model performance on different data subsets",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is a neural network?",
          questionType: "multiple-choice",
          options: ["Model inspired by biological neurons", "Network cable", "Database system", "File system"],
          correctAnswer: "Model inspired by biological neurons",
          explanation: "Neural networks are computing systems inspired by biological neural networks",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is feature engineering?",
          questionType: "multiple-choice",
          options: ["Creating new features from existing data", "Removing features", "Storing features", "Visualizing features"],
          correctAnswer: "Creating new features from existing data",
          explanation: "Feature engineering transforms raw data into features for better model performance",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is gradient descent?",
          questionType: "multiple-choice",
          options: ["Optimization algorithm", "Data cleaning method", "Visualization technique", "Database query"],
          correctAnswer: "Optimization algorithm",
          explanation: "Gradient descent is an iterative optimization algorithm for finding minima",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is a confusion matrix?",
          questionType: "multiple-choice",
          options: ["Table showing classification results", "Confusing data", "Error log", "Data transformation"],
          correctAnswer: "Table showing classification results",
          explanation: "Confusion matrix shows true/false positives and negatives",
          category: "data",
        },
        {
          quizId: mlQuiz.id,
          questionText: "What is regularization?",
          questionType: "multiple-choice",
          options: ["Technique to prevent overfitting", "Making data regular", "Cleaning data", "Normalizing features"],
          correctAnswer: "Technique to prevent overfitting",
          explanation: "Regularization adds penalty terms to prevent overfitting",
          category: "data",
        },
      ];

      await storage.createQuestions(mlQuestions);
      console.log(`✓ Created ${mlQuestions.length} Machine Learning questions`);
    }

    // Cloud & DevOps Questions
    if (cloudPath) {
      const dockerQuiz = await storage.createQuiz({
        title: "Docker & Containers",
        description: "Containerization fundamentals",
        difficulty: "intermediate",
        careerPathId: cloudPath.id,
        requiredLevel: 10,
        xpReward: 200,
        timeLimit: 900,
        isFinalAssessment: false,
      });

      const dockerQuestions: InsertQuestion[] = [
        {
          quizId: dockerQuiz.id,
          questionText: "What is Docker?",
          questionType: "multiple-choice",
          options: ["Containerization platform", "Database", "Programming language", "Web server"],
          correctAnswer: "Containerization platform",
          explanation: "Docker packages applications into standardized containers",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is a Docker image?",
          questionType: "multiple-choice",
          options: ["Template for creating containers", "Photo file", "Virtual machine", "Database backup"],
          correctAnswer: "Template for creating containers",
          explanation: "Docker images are read-only templates containing application code and dependencies",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is a Docker container?",
          questionType: "multiple-choice",
          options: ["Running instance of an image", "Storage unit", "Network device", "Database"],
          correctAnswer: "Running instance of an image",
          explanation: "Containers are runnable instances of Docker images",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is Kubernetes?",
          questionType: "multiple-choice",
          options: ["Container orchestration platform", "Database", "CI/CD tool", "Text editor"],
          correctAnswer: "Container orchestration platform",
          explanation: "Kubernetes orchestrates and manages containerized applications",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is a Dockerfile?",
          questionType: "multiple-choice",
          options: ["Text file with image build instructions", "Database file", "Configuration file", "Log file"],
          correctAnswer: "Text file with image build instructions",
          explanation: "Dockerfile contains instructions for building Docker images",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is Docker Compose?",
          questionType: "multiple-choice",
          options: ["Tool for multi-container applications", "Music software", "Text editor", "Database tool"],
          correctAnswer: "Tool for multi-container applications",
          explanation: "Docker Compose defines and runs multi-container applications",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is a Docker volume?",
          questionType: "multiple-choice",
          options: ["Persistent data storage", "Audio control", "Network volume", "Memory size"],
          correctAnswer: "Persistent data storage",
          explanation: "Volumes provide persistent storage for Docker containers",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is Docker Hub?",
          questionType: "multiple-choice",
          options: ["Container image registry", "Social network", "Code editor", "Database"],
          correctAnswer: "Container image registry",
          explanation: "Docker Hub is a cloud-based registry for Docker images",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is container orchestration?",
          questionType: "multiple-choice",
          options: ["Managing lifecycle of containers", "Playing music", "Arranging files", "Sorting data"],
          correctAnswer: "Managing lifecycle of containers",
          explanation: "Orchestration automates deployment, scaling, and management of containers",
          category: "cloud",
        },
        {
          quizId: dockerQuiz.id,
          questionText: "What is a microservice?",
          questionType: "multiple-choice",
          options: ["Small, independent service", "Tiny computer", "Database query", "UI component"],
          correctAnswer: "Small, independent service",
          explanation: "Microservices are small, loosely coupled services in an application",
          category: "cloud",
        },
      ];

      await storage.createQuestions(dockerQuestions);
      console.log(`✓ Created ${dockerQuestions.length} Docker/Cloud questions`);
    }

    // Mobile Development Questions
    if (mobilePath) {
      const mobileQuiz = await storage.createQuiz({
        title: "React Native Development",
        description: "Building cross-platform mobile apps",
        difficulty: "intermediate",
        careerPathId: mobilePath.id,
        requiredLevel: 10,
        xpReward: 200,
        timeLimit: 900,
        isFinalAssessment: false,
      });

      const mobileQuestions: InsertQuestion[] = [
        {
          quizId: mobileQuiz.id,
          questionText: "What is React Native?",
          questionType: "multiple-choice",
          options: ["Framework for building mobile apps with React", "Web framework", "Database", "Testing tool"],
          correctAnswer: "Framework for building mobile apps with React",
          explanation: "React Native builds native mobile apps using React",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is the difference between native and hybrid apps?",
          questionType: "multiple-choice",
          options: ["Native built for one platform, hybrid for multiple", "Native is slower", "Hybrid is more expensive", "No difference"],
          correctAnswer: "Native built for one platform, hybrid for multiple",
          explanation: "Native apps are platform-specific, hybrid apps work across platforms",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is a View in React Native?",
          questionType: "multiple-choice",
          options: ["Container component", "Screen view", "Database view", "Network view"],
          correctAnswer: "Container component",
          explanation: "View is a container that supports layout with flexbox and styling",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is Expo?",
          questionType: "multiple-choice",
          options: ["Platform for React Native development", "Conference", "Database", "Web server"],
          correctAnswer: "Platform for React Native development",
          explanation: "Expo provides tools and services for React Native development",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is navigation in mobile apps?",
          questionType: "multiple-choice",
          options: ["Moving between screens", "GPS functionality", "Network requests", "Data storage"],
          correctAnswer: "Moving between screens",
          explanation: "Navigation manages movement between different screens in an app",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is AsyncStorage?",
          questionType: "multiple-choice",
          options: ["Key-value storage system", "Cloud storage", "Image storage", "Cache system"],
          correctAnswer: "Key-value storage system",
          explanation: "AsyncStorage provides simple, asynchronous key-value storage",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is a FlatList?",
          questionType: "multiple-choice",
          options: ["Component for rendering lists", "Flat design style", "Database table", "Network protocol"],
          correctAnswer: "Component for rendering lists",
          explanation: "FlatList efficiently renders large lists of data",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is hot reloading?",
          questionType: "multiple-choice",
          options: ["Instant code changes without restart", "Server restart", "Database refresh", "Cache clearing"],
          correctAnswer: "Instant code changes without restart",
          explanation: "Hot reloading updates the app instantly when code changes",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is a TouchableOpacity?",
          questionType: "multiple-choice",
          options: ["Button with opacity feedback", "Transparent view", "Image component", "Text input"],
          correctAnswer: "Button with opacity feedback",
          explanation: "TouchableOpacity provides visual feedback by reducing opacity on press",
          category: "mobile",
        },
        {
          quizId: mobileQuiz.id,
          questionText: "What is platform-specific code?",
          questionType: "multiple-choice",
          options: ["Code for iOS or Android only", "Cross-platform code", "Web code", "Server code"],
          correctAnswer: "Code for iOS or Android only",
          explanation: "Platform-specific code runs only on particular platforms (iOS or Android)",
          category: "mobile",
        },
      ];

      await storage.createQuestions(mobileQuestions);
      console.log(`✓ Created ${mobileQuestions.length} Mobile Development questions`);
    }

    // Cybersecurity Questions
    if (securityPath) {
      const securityQuiz = await storage.createQuiz({
        title: "Web Security Fundamentals",
        description: "Essential web security concepts",
        difficulty: "intermediate",
        careerPathId: securityPath.id,
        requiredLevel: 10,
        xpReward: 200,
        timeLimit: 900,
        isFinalAssessment: false,
      });

      const securityQuestions: InsertQuestion[] = [
        {
          quizId: securityQuiz.id,
          questionText: "What is XSS (Cross-Site Scripting)?",
          questionType: "multiple-choice",
          options: ["Injecting malicious scripts into web pages", "CSS vulnerability", "Server attack", "Database breach"],
          correctAnswer: "Injecting malicious scripts into web pages",
          explanation: "XSS allows attackers to inject scripts into pages viewed by other users",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is CSRF (Cross-Site Request Forgery)?",
          questionType: "multiple-choice",
          options: ["Tricking users into unwanted actions", "Password attack", "SQL injection", "DDoS attack"],
          correctAnswer: "Tricking users into unwanted actions",
          explanation: "CSRF tricks authenticated users into performing unintended actions",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is SQL injection?",
          questionType: "multiple-choice",
          options: ["Inserting malicious SQL code", "Database backup", "SQL query optimization", "Database design"],
          correctAnswer: "Inserting malicious SQL code",
          explanation: "SQL injection is a code injection technique that attacks databases",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is authentication?",
          questionType: "multiple-choice",
          options: ["Verifying identity", "Granting permissions", "Encrypting data", "Logging actions"],
          correctAnswer: "Verifying identity",
          explanation: "Authentication verifies who a user claims to be",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is authorization?",
          questionType: "multiple-choice",
          options: ["Granting access permissions", "Verifying identity", "Encrypting data", "Logging in"],
          correctAnswer: "Granting access permissions",
          explanation: "Authorization determines what an authenticated user can access",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is a salt in password hashing?",
          questionType: "multiple-choice",
          options: ["Random data added to passwords", "Seasoning", "Encryption key", "Hash function"],
          correctAnswer: "Random data added to passwords",
          explanation: "Salt is random data added to passwords before hashing to prevent rainbow table attacks",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is HTTPS?",
          questionType: "multiple-choice",
          options: ["HTTP with encryption", "Faster HTTP", "New HTTP version", "Mobile HTTP"],
          correctAnswer: "HTTP with encryption",
          explanation: "HTTPS encrypts communication between browser and server using SSL/TLS",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is a DDoS attack?",
          questionType: "multiple-choice",
          options: ["Overwhelming server with traffic", "Password attack", "Data breach", "Virus infection"],
          correctAnswer: "Overwhelming server with traffic",
          explanation: "DDoS attacks flood servers with traffic to make them unavailable",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is input sanitization?",
          questionType: "multiple-choice",
          options: ["Cleaning user input before processing", "Deleting input", "Validating passwords", "Encrypting data"],
          correctAnswer: "Cleaning user input before processing",
          explanation: "Sanitization removes or escapes dangerous characters from user input",
          category: "security",
        },
        {
          quizId: securityQuiz.id,
          questionText: "What is OWASP?",
          questionType: "multiple-choice",
          options: ["Open Web Application Security Project", "Operating Web Access Security Protocol", "Online Web Application Service Provider", "Open Windows Application Security Platform"],
          correctAnswer: "Open Web Application Security Project",
          explanation: "OWASP is a nonprofit foundation focused on improving software security",
          category: "security",
        },
      ];

      await storage.createQuestions(securityQuestions);
      console.log(`✓ Created ${securityQuestions.length} Cybersecurity questions`);
    }

    console.log("\n✅ Quiz questions seeding complete!");
    console.log("Total new questions created: 100+");

  } catch (error) {
    console.error("❌ Error seeding questions:", error);
    throw error;
  }
}

// Run the seed function
seedQuestions()
  .then(() => {
    console.log("🎉 Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed:", error);
    process.exit(1);
  });
