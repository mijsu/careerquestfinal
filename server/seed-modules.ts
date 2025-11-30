import { storage } from "./storage-firestore";

async function seedModules() {
  console.log("Seeding comprehensive modules and lessons...");

  // Get career paths
  const paths = await storage.getCareerPaths();
  const fullStackPath = paths.find(p => p.name.includes("Full Stack"));
  const dataSciencePath = paths.find(p => p.name.includes("Data Science"));
  const cloudPath = paths.find(p => p.name.includes("Cloud"));
  const mobilePath = paths.find(p => p.name.includes("Mobile"));
  const securityPath = paths.find(p => p.name.includes("Cybersecurity"));

  // Create general modules (for AI-guided users before Level 20)
  const generalModules = [
    {
      title: "Programming Fundamentals",
      description: "Master the basics of programming logic and problem-solving",
      careerPath: null,
      requiredLevel: 1,
      order: 1,
    },
    {
      title: "Data Structures Basics",
      description: "Learn essential data structures: arrays, lists, and maps",
      careerPath: null,
      requiredLevel: 5,
      order: 2,
    },
    {
      title: "Algorithm Thinking",
      description: "Develop algorithmic thinking and problem-solving skills",
      careerPath: null,
      requiredLevel: 10,
      order: 3,
    },
    {
      title: "Version Control with Git",
      description: "Learn Git and GitHub for collaborative development",
      careerPath: null,
      requiredLevel: 3,
      order: 4,
    },
  ];

  for (const moduleData of generalModules) {
    const module = await storage.createModule(moduleData);
    console.log(`Created module: ${module.title}`);

    const lessons = getGeneralLessons(moduleData.title);
    for (const lessonData of lessons) {
      const lesson = await storage.createLesson({
        ...lessonData,
        moduleId: module.id,
      });
      console.log(`  - Created lesson: ${lesson.title}`);
    }
  }

  // Full Stack Developer modules
  if (fullStackPath) {
    const fullStackModules = [
      {
        title: "HTML & CSS Mastery",
        description: "Build beautiful and responsive web layouts",
        careerPath: fullStackPath.id,
        requiredLevel: 1,
        order: 1,
      },
      {
        title: "JavaScript Essentials",
        description: "Master JavaScript fundamentals and ES6+ features",
        careerPath: fullStackPath.id,
        requiredLevel: 8,
        order: 2,
      },
      {
        title: "React Development",
        description: "Build modern web apps with React and hooks",
        careerPath: fullStackPath.id,
        requiredLevel: 15,
        order: 3,
      },
      {
        title: "Node.js Backend",
        description: "Create server-side applications with Node.js",
        careerPath: fullStackPath.id,
        requiredLevel: 20,
        order: 4,
      },
      {
        title: "Database Integration",
        description: "Connect your applications to databases",
        careerPath: fullStackPath.id,
        requiredLevel: 25,
        order: 5,
      },
    ];

    for (const moduleData of fullStackModules) {
      const module = await storage.createModule(moduleData);
      console.log(`Created Full Stack module: ${module.title}`);

      const lessons = getFullStackLessons(moduleData.title);
      for (const lessonData of lessons) {
        const lesson = await storage.createLesson({
          ...lessonData,
          moduleId: module.id,
        });
        console.log(`  - Created lesson: ${lesson.title}`);
      }
    }
  }

  // Data Science modules
  if (dataSciencePath) {
    const dataScienceModules = [
      {
        title: "Python for Data Science",
        description: "Learn Python programming for data analysis",
        careerPath: dataSciencePath.id,
        requiredLevel: 1,
        order: 1,
      },
      {
        title: "Statistics and Probability",
        description: "Master statistical concepts for data analysis",
        careerPath: dataSciencePath.id,
        requiredLevel: 10,
        order: 2,
      },
      {
        title: "Data Visualization",
        description: "Create compelling data visualizations",
        careerPath: dataSciencePath.id,
        requiredLevel: 15,
        order: 3,
      },
      {
        title: "Machine Learning Basics",
        description: "Introduction to ML algorithms and models",
        careerPath: dataSciencePath.id,
        requiredLevel: 20,
        order: 4,
      },
    ];

    for (const moduleData of dataScienceModules) {
      const module = await storage.createModule(moduleData);
      console.log(`Created Data Science module: ${module.title}`);

      const lessons = getDataScienceLessons(moduleData.title);
      for (const lessonData of lessons) {
        const lesson = await storage.createLesson({
          ...lessonData,
          moduleId: module.id,
        });
        console.log(`  - Created lesson: ${lesson.title}`);
      }
    }
  }

  // Cloud Engineering modules
  if (cloudPath) {
    const cloudModules = [
      {
        title: "Cloud Computing Fundamentals",
        description: "Understand cloud infrastructure and services",
        careerPath: cloudPath.id,
        requiredLevel: 1,
        order: 1,
      },
      {
        title: "AWS Services",
        description: "Master Amazon Web Services core offerings",
        careerPath: cloudPath.id,
        requiredLevel: 10,
        order: 2,
      },
      {
        title: "Docker and Containers",
        description: "Containerize applications with Docker",
        careerPath: cloudPath.id,
        requiredLevel: 15,
        order: 3,
      },
      {
        title: "Kubernetes Orchestration",
        description: "Deploy and manage containerized applications",
        careerPath: cloudPath.id,
        requiredLevel: 25,
        order: 4,
      },
    ];

    for (const moduleData of cloudModules) {
      const module = await storage.createModule(moduleData);
      console.log(`Created Cloud module: ${module.title}`);

      const lessons = getCloudLessons(moduleData.title);
      for (const lessonData of lessons) {
        const lesson = await storage.createLesson({
          ...lessonData,
          moduleId: module.id,
        });
        console.log(`  - Created lesson: ${lesson.title}`);
      }
    }
  }

  // Mobile Development modules
  if (mobilePath) {
    const mobileModules = [
      {
        title: "Mobile UI/UX Principles",
        description: "Design mobile-first user experiences",
        careerPath: mobilePath.id,
        requiredLevel: 1,
        order: 1,
      },
      {
        title: "React Native Basics",
        description: "Build cross-platform mobile apps",
        careerPath: mobilePath.id,
        requiredLevel: 10,
        order: 2,
      },
      {
        title: "Native Mobile Features",
        description: "Access device capabilities and sensors",
        careerPath: mobilePath.id,
        requiredLevel: 20,
        order: 3,
      },
    ];

    for (const moduleData of mobileModules) {
      const module = await storage.createModule(moduleData);
      console.log(`Created Mobile module: ${module.title}`);

      const lessons = getMobileLessons(moduleData.title);
      for (const lessonData of lessons) {
        const lesson = await storage.createLesson({
          ...lessonData,
          moduleId: module.id,
        });
        console.log(`  - Created lesson: ${lesson.title}`);
      }
    }
  }

  // Cybersecurity modules
  if (securityPath) {
    const securityModules = [
      {
        title: "Security Fundamentals",
        description: "Core concepts of cybersecurity",
        careerPath: securityPath.id,
        requiredLevel: 1,
        order: 1,
      },
      {
        title: "Network Security",
        description: "Protect networks from threats",
        careerPath: securityPath.id,
        requiredLevel: 10,
        order: 2,
      },
      {
        title: "Web Application Security",
        description: "Secure web applications from vulnerabilities",
        careerPath: securityPath.id,
        requiredLevel: 15,
        order: 3,
      },
      {
        title: "Ethical Hacking",
        description: "Penetration testing and vulnerability assessment",
        careerPath: securityPath.id,
        requiredLevel: 25,
        order: 4,
      },
    ];

    for (const moduleData of securityModules) {
      const module = await storage.createModule(moduleData);
      console.log(`Created Security module: ${module.title}`);

      const lessons = getSecurityLessons(moduleData.title);
      for (const lessonData of lessons) {
        const lesson = await storage.createLesson({
          ...lessonData,
          moduleId: module.id,
        });
        console.log(`  - Created lesson: ${lesson.title}`);
      }
    }
  }

  console.log("Module seeding complete!");
  process.exit(0);
}

function getGeneralLessons(moduleTitle: string) {
  const lessonsMap: Record<string, any[]> = {
    "Programming Fundamentals": [
      {
        title: "Variables and Data Types",
        content: "Learn about different data types and how to store values in variables. Understanding types is fundamental to all programming languages.",
        type: "theory",
        order: 1,
        xpReward: 50,
      },
      {
        title: "Control Flow: If Statements",
        content: "Master conditional logic with if-else statements. Learn to make decisions in your code based on conditions.",
        type: "theory",
        order: 2,
        xpReward: 50,
      },
      {
        title: "Loops and Iteration",
        content: "Learn how to repeat code efficiently with for, while, and do-while loops. Master iteration patterns.",
        type: "theory",
        order: 3,
        xpReward: 50,
      },
      {
        title: "Functions and Modularity",
        content: "Organize code into reusable functions. Learn about parameters, return values, and function scope.",
        type: "theory",
        order: 4,
        xpReward: 75,
      },
    ],
    "Data Structures Basics": [
      {
        title: "Arrays and Lists",
        content: "Understand how to work with ordered collections of data. Learn array operations and methods.",
        type: "theory",
        order: 1,
        xpReward: 75,
      },
      {
        title: "Hash Maps and Dictionaries",
        content: "Learn key-value pair data structures for fast data lookup and storage.",
        type: "theory",
        order: 2,
        xpReward: 75,
      },
      {
        title: "Stacks and Queues",
        content: "Master LIFO and FIFO data structures and their applications.",
        type: "theory",
        order: 3,
        xpReward: 100,
      },
    ],
    "Algorithm Thinking": [
      {
        title: "Big O Notation",
        content: "Understand algorithm efficiency and time complexity. Learn to analyze algorithm performance.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Search Algorithms",
        content: "Master linear and binary search techniques for finding data efficiently.",
        type: "theory",
        order: 2,
        xpReward: 100,
      },
      {
        title: "Sorting Algorithms",
        content: "Learn bubble sort, merge sort, and quick sort. Understand when to use each algorithm.",
        type: "theory",
        order: 3,
        xpReward: 125,
      },
    ],
    "Version Control with Git": [
      {
        title: "Git Basics",
        content: "Learn to track changes in your code with Git. Master commit, push, and pull operations.",
        type: "theory",
        order: 1,
        xpReward: 75,
      },
      {
        title: "Branching and Merging",
        content: "Work on multiple features simultaneously using Git branches.",
        type: "theory",
        order: 2,
        xpReward: 100,
      },
      {
        title: "Collaboration with GitHub",
        content: "Use GitHub for team collaboration. Learn pull requests and code reviews.",
        type: "theory",
        order: 3,
        xpReward: 100,
      },
    ],
  };

  return lessonsMap[moduleTitle] || [];
}

function getFullStackLessons(moduleTitle: string) {
  const lessonsMap: Record<string, any[]> = {
    "HTML & CSS Mastery": [
      {
        title: "HTML Structure and Semantics",
        content: "Learn proper HTML structure and semantic elements for better accessibility and SEO.",
        type: "theory",
        order: 1,
        xpReward: 50,
      },
      {
        title: "CSS Flexbox Layout",
        content: "Master flexible box layouts for responsive design. Create adaptive page layouts.",
        type: "theory",
        order: 2,
        xpReward: 75,
      },
      {
        title: "CSS Grid System",
        content: "Build complex two-dimensional layouts with CSS Grid.",
        type: "theory",
        order: 3,
        xpReward: 75,
      },
      {
        title: "Responsive Design",
        content: "Create websites that work on all device sizes using media queries.",
        type: "theory",
        order: 4,
        xpReward: 100,
      },
    ],
    "JavaScript Essentials": [
      {
        title: "Functions and Scope",
        content: "Understand function declarations, expressions, arrow functions, and closures.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Array Methods",
        content: "Master map, filter, reduce, and other functional array methods.",
        type: "theory",
        order: 2,
        xpReward: 100,
      },
      {
        title: "Async JavaScript",
        content: "Learn promises, async/await, and handling asynchronous operations.",
        type: "theory",
        order: 3,
        xpReward: 125,
      },
      {
        title: "DOM Manipulation",
        content: "Interact with HTML elements dynamically using JavaScript.",
        type: "theory",
        order: 4,
        xpReward: 100,
      },
    ],
    "React Development": [
      {
        title: "React Components",
        content: "Learn to build reusable React components using JSX.",
        type: "theory",
        order: 1,
        xpReward: 150,
      },
      {
        title: "State and Props",
        content: "Manage component state and pass data with props.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
      {
        title: "React Hooks",
        content: "Master useState, useEffect, and custom hooks.",
        type: "theory",
        order: 3,
        xpReward: 175,
      },
    ],
    "Node.js Backend": [
      {
        title: "HTTP Fundamentals",
        content: "Understand HTTP methods, status codes, and headers.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Express.js Basics",
        content: "Build web servers with Express.js framework.",
        type: "theory",
        order: 2,
        xpReward: 125,
      },
      {
        title: "Middleware and Routing",
        content: "Organize your Express application with middleware and routes.",
        type: "theory",
        order: 3,
        xpReward: 125,
      },
    ],
    "Database Integration": [
      {
        title: "SQL Queries",
        content: "Master SELECT, JOIN, and aggregate functions.",
        type: "theory",
        order: 1,
        xpReward: 150,
      },
      {
        title: "Database Design",
        content: "Design normalized database schemas.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
      {
        title: "ORMs and Prisma",
        content: "Use Object-Relational Mapping tools for database operations.",
        type: "theory",
        order: 3,
        xpReward: 175,
      },
    ],
  };

  return lessonsMap[moduleTitle] || [];
}

function getDataScienceLessons(moduleTitle: string) {
  const lessonsMap: Record<string, any[]> = {
    "Python for Data Science": [
      {
        title: "Python Basics",
        content: "Learn Python syntax, variables, and data types for data science.",
        type: "theory",
        order: 1,
        xpReward: 75,
      },
      {
        title: "NumPy Arrays",
        content: "Work with numerical arrays using NumPy library.",
        type: "theory",
        order: 2,
        xpReward: 100,
      },
      {
        title: "Pandas DataFrames",
        content: "Manipulate tabular data with Pandas.",
        type: "theory",
        order: 3,
        xpReward: 100,
      },
    ],
    "Statistics and Probability": [
      {
        title: "Descriptive Statistics",
        content: "Calculate mean, median, mode, and standard deviation.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Probability Distributions",
        content: "Understand normal, binomial, and Poisson distributions.",
        type: "theory",
        order: 2,
        xpReward: 125,
      },
      {
        title: "Hypothesis Testing",
        content: "Conduct statistical tests and interpret results.",
        type: "theory",
        order: 3,
        xpReward: 150,
      },
    ],
    "Data Visualization": [
      {
        title: "Matplotlib Basics",
        content: "Create charts and graphs with Matplotlib.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Seaborn for Statistics",
        content: "Build statistical visualizations with Seaborn.",
        type: "theory",
        order: 2,
        xpReward: 125,
      },
    ],
    "Machine Learning Basics": [
      {
        title: "Supervised Learning",
        content: "Understand classification and regression algorithms.",
        type: "theory",
        order: 1,
        xpReward: 150,
      },
      {
        title: "Model Evaluation",
        content: "Evaluate model performance with metrics and cross-validation.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
    ],
  };

  return lessonsMap[moduleTitle] || [];
}

function getCloudLessons(moduleTitle: string) {
  const lessonsMap: Record<string, any[]> = {
    "Cloud Computing Fundamentals": [
      {
        title: "IaaS, PaaS, SaaS",
        content: "Understand different cloud service models.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Cloud Deployment Models",
        content: "Learn about public, private, and hybrid clouds.",
        type: "theory",
        order: 2,
        xpReward: 100,
      },
    ],
    "AWS Services": [
      {
        title: "EC2 Compute Instances",
        content: "Launch and manage virtual servers on AWS.",
        type: "theory",
        order: 1,
        xpReward: 125,
      },
      {
        title: "S3 Object Storage",
        content: "Store and retrieve files with Amazon S3.",
        type: "theory",
        order: 2,
        xpReward: 125,
      },
      {
        title: "AWS Lambda",
        content: "Run serverless functions with AWS Lambda.",
        type: "theory",
        order: 3,
        xpReward: 150,
      },
    ],
    "Docker and Containers": [
      {
        title: "Docker Basics",
        content: "Create and run Docker containers.",
        type: "theory",
        order: 1,
        xpReward: 125,
      },
      {
        title: "Dockerfile Best Practices",
        content: "Build efficient Docker images.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
    ],
    "Kubernetes Orchestration": [
      {
        title: "Kubernetes Architecture",
        content: "Understand pods, nodes, and clusters.",
        type: "theory",
        order: 1,
        xpReward: 175,
      },
      {
        title: "Deployments and Services",
        content: "Deploy applications and expose them with services.",
        type: "theory",
        order: 2,
        xpReward: 175,
      },
    ],
  };

  return lessonsMap[moduleTitle] || [];
}

function getMobileLessons(moduleTitle: string) {
  const lessonsMap: Record<string, any[]> = {
    "Mobile UI/UX Principles": [
      {
        title: "Mobile Design Patterns",
        content: "Learn common mobile UI patterns and best practices.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Touch Interactions",
        content: "Design for touch gestures and mobile interactions.",
        type: "theory",
        order: 2,
        xpReward: 100,
      },
    ],
    "React Native Basics": [
      {
        title: "React Native Components",
        content: "Build UI with native mobile components.",
        type: "theory",
        order: 1,
        xpReward: 125,
      },
      {
        title: "Navigation",
        content: "Implement stack and tab navigation.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
    ],
    "Native Mobile Features": [
      {
        title: "Camera and Photos",
        content: "Access device camera and photo library.",
        type: "theory",
        order: 1,
        xpReward: 150,
      },
      {
        title: "Geolocation",
        content: "Use GPS and location services.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
    ],
  };

  return lessonsMap[moduleTitle] || [];
}

function getSecurityLessons(moduleTitle: string) {
  const lessonsMap: Record<string, any[]> = {
    "Security Fundamentals": [
      {
        title: "CIA Triad",
        content: "Understand Confidentiality, Integrity, and Availability.",
        type: "theory",
        order: 1,
        xpReward: 100,
      },
      {
        title: "Cryptography Basics",
        content: "Learn encryption, hashing, and digital signatures.",
        type: "theory",
        order: 2,
        xpReward: 125,
      },
    ],
    "Network Security": [
      {
        title: "Firewalls and IDS",
        content: "Implement network perimeter security.",
        type: "theory",
        order: 1,
        xpReward: 125,
      },
      {
        title: "VPNs and Tunneling",
        content: "Secure network communications.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
    ],
    "Web Application Security": [
      {
        title: "OWASP Top 10",
        content: "Learn the most critical web security risks.",
        type: "theory",
        order: 1,
        xpReward: 150,
      },
      {
        title: "SQL Injection Prevention",
        content: "Protect against SQL injection attacks.",
        type: "theory",
        order: 2,
        xpReward: 150,
      },
    ],
    "Ethical Hacking": [
      {
        title: "Reconnaissance",
        content: "Gather information about target systems.",
        type: "theory",
        order: 1,
        xpReward: 175,
      },
      {
        title: "Vulnerability Scanning",
        content: "Identify security weaknesses.",
        type: "theory",
        order: 2,
        xpReward: 175,
      },
    ],
  };

  return lessonsMap[moduleTitle] || [];
}

seedModules().catch(console.error);
