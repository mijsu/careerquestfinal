import { storage } from "./storage-firestore";
import type { InsertCodeChallenge } from "@shared/schema";

async function seedCodeChallenges() {
  console.log("🌱 Seeding comprehensive code challenges...");

  try {
    const careerPaths = await storage.getCareerPaths();
    const fullStackPath = careerPaths.find((p: any) => p.name === "Full Stack Development");
    const dataPath = careerPaths.find((p: any) => p.name === "Data Science & AI");
    const cloudPath = careerPaths.find((p: any) => p.name === "Cloud & DevOps");
    const mobilePath = careerPaths.find((p: any) => p.name === "Mobile Development");
    const securityPath = careerPaths.find((p: any) => p.name === "Cybersecurity");

    // Full Stack Development Challenges
    if (fullStackPath) {
      const fullStackChallenges: InsertCodeChallenge[] = [
        {
          title: "Reverse a String",
          description: "Write a function that takes a string as input and returns it reversed.",
          difficulty: "easy",
          careerPathId: fullStackPath.id,
          requiredLevel: 1,
          xpReward: 50,
          starterCode: {
            javascript: "function reverseString(str) {\n  // Your code here\n}",
            python: "def reverse_string(s):\n    # Your code here\n    pass",
            java: "public class Solution {\n    public static String reverseString(String s) {\n        // Your code here\n    }\n}",
            cpp: "#include <string>\nusing namespace std;\n\nstring reverseString(string s) {\n    // Your code here\n}"
          },
          testCases: [
            { input: "hello", expectedOutput: "olleh" },
            { input: "world", expectedOutput: "dlrow" },
            { input: "CareerQuest", expectedOutput: "tseuQreeraC" },
            { input: "a", expectedOutput: "a" },
          ],
          supportedLanguages: ["javascript", "python", "java", "cpp"],
        },
        {
          title: "FizzBuzz",
          description: "Print numbers from 1 to n. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'.",
          difficulty: "easy",
          careerPathId: fullStackPath.id,
          requiredLevel: 2,
          xpReward: 75,
          starterCode: {
            javascript: "function fizzBuzz(n) {\n  // Return an array of results\n}",
            python: "def fizz_buzz(n):\n    # Return a list of results\n    pass",
          },
          testCases: [
            { input: "15", expectedOutput: "[1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz]" },
            { input: "5", expectedOutput: "[1,2,Fizz,4,Buzz]" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "Find Maximum in Array",
          description: "Write a function that finds the maximum number in an array.",
          difficulty: "easy",
          careerPathId: fullStackPath.id,
          requiredLevel: 3,
          xpReward: 60,
          starterCode: {
            javascript: "function findMax(arr) {\n  // Your code here\n}",
            python: "def find_max(arr):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1, 5, 3, 9, 2]", expectedOutput: "9" },
            { input: "[-1, -5, -3]", expectedOutput: "-1" },
            { input: "[42]", expectedOutput: "42" },
          ],
          supportedLanguages: ["javascript", "python", "java", "cpp"],
        },
        {
          title: "Count Vowels",
          description: "Write a function that counts the number of vowels (a, e, i, o, u) in a string.",
          difficulty: "easy",
          careerPathId: fullStackPath.id,
          requiredLevel: 4,
          xpReward: 70,
          starterCode: {
            javascript: "function countVowels(str) {\n  // Your code here\n}",
            python: "def count_vowels(s):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "hello", expectedOutput: "2" },
            { input: "programming", expectedOutput: "3" },
            { input: "aeiou", expectedOutput: "5" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "Array Sum",
          description: "Calculate the sum of all numbers in an array.",
          difficulty: "easy",
          careerPathId: fullStackPath.id,
          requiredLevel: 5,
          xpReward: 65,
          starterCode: {
            javascript: "function arraySum(arr) {\n  // Your code here\n}",
            python: "def array_sum(arr):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1, 2, 3, 4, 5]", expectedOutput: "15" },
            { input: "[10, -5, 3]", expectedOutput: "8" },
            { input: "[0]", expectedOutput: "0" },
          ],
          supportedLanguages: ["javascript", "python", "java", "cpp"],
        },
        {
          title: "Remove Duplicates",
          description: "Remove duplicate elements from an array and return the unique elements.",
          difficulty: "medium",
          careerPathId: fullStackPath.id,
          requiredLevel: 8,
          xpReward: 100,
          starterCode: {
            javascript: "function removeDuplicates(arr) {\n  // Your code here\n}",
            python: "def remove_duplicates(arr):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1, 2, 2, 3, 4, 4, 5]", expectedOutput: "[1,2,3,4,5]" },
            { input: "[1, 1, 1, 1]", expectedOutput: "[1]" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "Fibonacci Sequence",
          description: "Generate the first n numbers of the Fibonacci sequence.",
          difficulty: "medium",
          careerPathId: fullStackPath.id,
          requiredLevel: 10,
          xpReward: 120,
          starterCode: {
            javascript: "function fibonacci(n) {\n  // Your code here\n}",
            python: "def fibonacci(n):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "5", expectedOutput: "[0,1,1,2,3]" },
            { input: "8", expectedOutput: "[0,1,1,2,3,5,8,13]" },
          ],
          supportedLanguages: ["javascript", "python", "java", "cpp"],
        },
        {
          title: "Prime Number Checker",
          description: "Check if a given number is prime.",
          difficulty: "medium",
          careerPathId: fullStackPath.id,
          requiredLevel: 12,
          xpReward: 110,
          starterCode: {
            javascript: "function isPrime(n) {\n  // Your code here\n}",
            python: "def is_prime(n):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "7", expectedOutput: "true" },
            { input: "10", expectedOutput: "false" },
            { input: "2", expectedOutput: "true" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "Binary Search",
          description: "Implement binary search algorithm to find an element in a sorted array.",
          difficulty: "medium",
          careerPathId: fullStackPath.id,
          requiredLevel: 15,
          xpReward: 150,
          starterCode: {
            javascript: "function binarySearch(arr, target) {\n  // Return index or -1\n}",
            python: "def binary_search(arr, target):\n    # Return index or -1\n    pass",
          },
          testCases: [
            { input: "[1,2,3,4,5,6,7,8,9],5", expectedOutput: "4" },
            { input: "[1,2,3,4,5],10", expectedOutput: "-1" },
          ],
          supportedLanguages: ["javascript", "python", "java", "cpp"],
        },
        {
          title: "Merge Sorted Arrays",
          description: "Merge two sorted arrays into one sorted array.",
          difficulty: "hard",
          careerPathId: fullStackPath.id,
          requiredLevel: 18,
          xpReward: 200,
          starterCode: {
            javascript: "function mergeSorted(arr1, arr2) {\n  // Your code here\n}",
            python: "def merge_sorted(arr1, arr2):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1,3,5],[2,4,6]", expectedOutput: "[1,2,3,4,5,6]" },
            { input: "[1,2],[3,4]", expectedOutput: "[1,2,3,4]" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
      ];

      for (const challenge of fullStackChallenges) {
        await storage.createCodeChallenge(challenge);
        console.log(`✓ Created Full Stack challenge: ${challenge.title}`);
      }
    }

    // Data Science & AI Challenges
    if (dataPath) {
      const dataChallenges: InsertCodeChallenge[] = [
        {
          title: "Calculate Mean",
          description: "Calculate the mean (average) of a list of numbers.",
          difficulty: "easy",
          careerPathId: dataPath.id,
          requiredLevel: 1,
          xpReward: 60,
          starterCode: {
            python: "def calculate_mean(numbers):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1, 2, 3, 4, 5]", expectedOutput: "3.0" },
            { input: "[10, 20, 30]", expectedOutput: "20.0" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Calculate Median",
          description: "Calculate the median of a list of numbers.",
          difficulty: "easy",
          careerPathId: dataPath.id,
          requiredLevel: 3,
          xpReward: 70,
          starterCode: {
            python: "def calculate_median(numbers):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1, 2, 3, 4, 5]", expectedOutput: "3" },
            { input: "[1, 2, 3, 4]", expectedOutput: "2.5" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Standard Deviation",
          description: "Calculate the standard deviation of a dataset.",
          difficulty: "medium",
          careerPathId: dataPath.id,
          requiredLevel: 8,
          xpReward: 120,
          starterCode: {
            python: "import math\n\ndef standard_deviation(numbers):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[2, 4, 4, 4, 5, 5, 7, 9]", expectedOutput: "2.0" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Linear Regression",
          description: "Implement simple linear regression to find the line of best fit.",
          difficulty: "hard",
          careerPathId: dataPath.id,
          requiredLevel: 15,
          xpReward: 200,
          starterCode: {
            python: "def linear_regression(x, y):\n    # Return slope and intercept\n    pass",
          },
          testCases: [
            { input: "[1,2,3,4,5],[2,4,6,8,10]", expectedOutput: "(2.0,0.0)" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Data Normalization",
          description: "Normalize a dataset to have values between 0 and 1.",
          difficulty: "medium",
          careerPathId: dataPath.id,
          requiredLevel: 10,
          xpReward: 130,
          starterCode: {
            python: "def normalize_data(data):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1, 2, 3, 4, 5]", expectedOutput: "[0.0,0.25,0.5,0.75,1.0]" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Missing Values",
          description: "Count the number of missing values (None or NaN) in a dataset.",
          difficulty: "easy",
          careerPathId: dataPath.id,
          requiredLevel: 5,
          xpReward: 80,
          starterCode: {
            python: "def count_missing(data):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1, 2, None, 4, None]", expectedOutput: "2" },
            { input: "[1, 2, 3]", expectedOutput: "0" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Correlation Coefficient",
          description: "Calculate the Pearson correlation coefficient between two datasets.",
          difficulty: "hard",
          careerPathId: dataPath.id,
          requiredLevel: 18,
          xpReward: 220,
          starterCode: {
            python: "def correlation(x, y):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[1,2,3,4,5],[2,4,6,8,10]", expectedOutput: "1.0" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "K-Means Initialization",
          description: "Initialize K centroids for K-means clustering.",
          difficulty: "medium",
          careerPathId: dataPath.id,
          requiredLevel: 12,
          xpReward: 150,
          starterCode: {
            python: "import random\n\ndef initialize_centroids(data, k):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[[1,2],[3,4],[5,6]],2", expectedOutput: "2" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Euclidean Distance",
          description: "Calculate the Euclidean distance between two points.",
          difficulty: "easy",
          careerPathId: dataPath.id,
          requiredLevel: 6,
          xpReward: 90,
          starterCode: {
            python: "import math\n\ndef euclidean_distance(point1, point2):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "[0,0],[3,4]", expectedOutput: "5.0" },
            { input: "[1,1],[4,5]", expectedOutput: "5.0" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "One-Hot Encoding",
          description: "Implement one-hot encoding for categorical data.",
          difficulty: "medium",
          careerPathId: dataPath.id,
          requiredLevel: 14,
          xpReward: 140,
          starterCode: {
            python: "def one_hot_encode(categories):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "['red','blue','red']", expectedOutput: "[[1,0],[0,1],[1,0]]" },
          ],
          supportedLanguages: ["python"],
        },
      ];

      for (const challenge of dataChallenges) {
        await storage.createCodeChallenge(challenge);
        console.log(`✓ Created Data Science challenge: ${challenge.title}`);
      }
    }

    // Cloud & DevOps Challenges
    if (cloudPath) {
      const cloudChallenges: InsertCodeChallenge[] = [
        {
          title: "Parse Environment Variables",
          description: "Parse a string of environment variables (KEY=VALUE format) into a dictionary.",
          difficulty: "easy",
          careerPathId: cloudPath.id,
          requiredLevel: 1,
          xpReward: 60,
          starterCode: {
            python: "def parse_env_vars(env_string):\n    # Your code here\n    pass",
            javascript: "function parseEnvVars(envString) {\n  // Your code here\n}",
          },
          testCases: [
            { input: "PORT=3000\nHOST=localhost", expectedOutput: "{PORT:3000,HOST:localhost}" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Docker Image Tag Validator",
          description: "Validate a Docker image tag format (must be lowercase, alphanumeric, dots, dashes).",
          difficulty: "easy",
          careerPathId: cloudPath.id,
          requiredLevel: 5,
          xpReward: 80,
          starterCode: {
            python: "def validate_docker_tag(tag):\n    # Return True or False\n    pass",
          },
          testCases: [
            { input: "my-app-1.0", expectedOutput: "true" },
            { input: "My-App", expectedOutput: "false" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Log Parser",
          description: "Parse log lines to extract timestamp, level, and message.",
          difficulty: "medium",
          careerPathId: cloudPath.id,
          requiredLevel: 10,
          xpReward: 120,
          starterCode: {
            python: "def parse_log_line(log):\n    # Return dict with timestamp, level, message\n    pass",
          },
          testCases: [
            { input: "2024-01-01 ERROR Failed to connect", expectedOutput: "{timestamp:2024-01-01,level:ERROR,message:Failed to connect}" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Health Check Endpoint",
          description: "Implement a health check function that returns status based on system metrics.",
          difficulty: "medium",
          careerPathId: cloudPath.id,
          requiredLevel: 12,
          xpReward: 130,
          starterCode: {
            javascript: "function healthCheck(cpuUsage, memoryUsage) {\n  // Return 'healthy' or 'unhealthy'\n}",
          },
          testCases: [
            { input: "50,60", expectedOutput: "healthy" },
            { input: "95,90", expectedOutput: "unhealthy" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "Load Balancer Algorithm",
          description: "Implement round-robin load balancing algorithm.",
          difficulty: "hard",
          careerPathId: cloudPath.id,
          requiredLevel: 18,
          xpReward: 200,
          starterCode: {
            python: "class LoadBalancer:\n    def __init__(self, servers):\n        pass\n    \n    def get_next_server(self):\n        pass",
          },
          testCases: [
            { input: "['server1','server2','server3']", expectedOutput: "server1" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Config Merger",
          description: "Merge two configuration dictionaries, with second overriding first.",
          difficulty: "medium",
          careerPathId: cloudPath.id,
          requiredLevel: 8,
          xpReward: 110,
          starterCode: {
            python: "def merge_configs(config1, config2):\n    # Your code here\n    pass",
          },
          testCases: [
            { input: "{port:3000,host:localhost},{port:8080}", expectedOutput: "{port:8080,host:localhost}" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Uptime Calculator",
          description: "Calculate service uptime percentage from downtime minutes in a month.",
          difficulty: "easy",
          careerPathId: cloudPath.id,
          requiredLevel: 3,
          xpReward: 70,
          starterCode: {
            python: "def calculate_uptime(downtime_minutes):\n    # Return uptime percentage\n    pass",
          },
          testCases: [
            { input: "0", expectedOutput: "100.0" },
            { input: "43200", expectedOutput: "0.0" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Resource Scaling Decision",
          description: "Decide whether to scale up/down based on CPU and memory metrics.",
          difficulty: "medium",
          careerPathId: cloudPath.id,
          requiredLevel: 15,
          xpReward: 140,
          starterCode: {
            javascript: "function scalingDecision(cpu, memory) {\n  // Return 'scale_up', 'scale_down', or 'no_change'\n}",
          },
          testCases: [
            { input: "85,90", expectedOutput: "scale_up" },
            { input: "20,15", expectedOutput: "scale_down" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "Secret Rotation Check",
          description: "Check if a secret is older than N days and needs rotation.",
          difficulty: "easy",
          careerPathId: cloudPath.id,
          requiredLevel: 6,
          xpReward: 85,
          starterCode: {
            python: "from datetime import datetime\n\ndef needs_rotation(created_date, max_days):\n    # Return True or False\n    pass",
          },
          testCases: [
            { input: "2024-01-01,30", expectedOutput: "true" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "Container Port Validator",
          description: "Validate if a port number is valid for container deployment (1-65535).",
          difficulty: "easy",
          careerPathId: cloudPath.id,
          requiredLevel: 2,
          xpReward: 50,
          starterCode: {
            python: "def validate_port(port):\n    # Return True or False\n    pass",
          },
          testCases: [
            { input: "8080", expectedOutput: "true" },
            { input: "70000", expectedOutput: "false" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
      ];

      for (const challenge of cloudChallenges) {
        await storage.createCodeChallenge(challenge);
        console.log(`✓ Created Cloud/DevOps challenge: ${challenge.title}`);
      }
    }

    // Mobile Development Challenges
    if (mobilePath) {
      const mobileChallenges: InsertCodeChallenge[] = [
        {
          title: "Validate Email Input",
          description: "Validate an email address format for mobile form input.",
          difficulty: "easy",
          careerPathId: mobilePath.id,
          requiredLevel: 1,
          xpReward: 60,
          starterCode: {
            javascript: "function validateEmail(email) {\n  // Return true or false\n}",
          },
          testCases: [
            { input: "user@example.com", expectedOutput: "true" },
            { input: "invalid.email", expectedOutput: "false" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Format Phone Number",
          description: "Format a 10-digit phone number as (XXX) XXX-XXXX.",
          difficulty: "easy",
          careerPathId: mobilePath.id,
          requiredLevel: 3,
          xpReward: 70,
          starterCode: {
            javascript: "function formatPhoneNumber(digits) {\n  // Your code here\n}",
          },
          testCases: [
            { input: "1234567890", expectedOutput: "(123) 456-7890" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Touch Gesture Detector",
          description: "Determine swipe direction from start and end coordinates.",
          difficulty: "medium",
          careerPathId: mobilePath.id,
          requiredLevel: 8,
          xpReward: 110,
          starterCode: {
            javascript: "function detectSwipe(startX, startY, endX, endY) {\n  // Return 'up', 'down', 'left', or 'right'\n}",
          },
          testCases: [
            { input: "100,100,200,100", expectedOutput: "right" },
            { input: "100,100,100,200", expectedOutput: "down" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Device Orientation Handler",
          description: "Determine orientation (portrait/landscape) from screen dimensions.",
          difficulty: "easy",
          careerPathId: mobilePath.id,
          requiredLevel: 5,
          xpReward: 75,
          starterCode: {
            javascript: "function getOrientation(width, height) {\n  // Return 'portrait' or 'landscape'\n}",
          },
          testCases: [
            { input: "375,667", expectedOutput: "portrait" },
            { input: "667,375", expectedOutput: "landscape" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Debounce Search Input",
          description: "Implement debounce function to delay API calls during typing.",
          difficulty: "medium",
          careerPathId: mobilePath.id,
          requiredLevel: 12,
          xpReward: 130,
          starterCode: {
            javascript: "function debounce(func, delay) {\n  // Your code here\n}",
          },
          testCases: [
            { input: "function,300", expectedOutput: "function" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Image URL Validator",
          description: "Validate if a URL is a valid image URL (ends with image extension).",
          difficulty: "easy",
          careerPathId: mobilePath.id,
          requiredLevel: 4,
          xpReward: 65,
          starterCode: {
            javascript: "function isImageUrl(url) {\n  // Return true or false\n}",
          },
          testCases: [
            { input: "https://example.com/image.jpg", expectedOutput: "true" },
            { input: "https://example.com/page.html", expectedOutput: "false" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Calculate Distance Scrolled",
          description: "Calculate percentage scrolled given scroll position and content height.",
          difficulty: "easy",
          careerPathId: mobilePath.id,
          requiredLevel: 6,
          xpReward: 80,
          starterCode: {
            javascript: "function scrollPercentage(scrollTop, scrollHeight, clientHeight) {\n  // Return percentage\n}",
          },
          testCases: [
            { input: "50,200,100", expectedOutput: "50" },
            { input: "100,200,100", expectedOutput: "100" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Deep Link Parser",
          description: "Parse a deep link URL to extract scheme, host, and parameters.",
          difficulty: "medium",
          careerPathId: mobilePath.id,
          requiredLevel: 10,
          xpReward: 120,
          starterCode: {
            javascript: "function parseDeepLink(url) {\n  // Return object with scheme, host, params\n}",
          },
          testCases: [
            { input: "myapp://profile?id=123", expectedOutput: "{scheme:myapp,host:profile,params:{id:123}}" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Responsive Font Size",
          description: "Calculate responsive font size based on screen width.",
          difficulty: "easy",
          careerPathId: mobilePath.id,
          requiredLevel: 2,
          xpReward: 55,
          starterCode: {
            javascript: "function responsiveFontSize(screenWidth, baseFontSize) {\n  // Return scaled font size\n}",
          },
          testCases: [
            { input: "375,16", expectedOutput: "16" },
            { input: "750,16", expectedOutput: "32" },
          ],
          supportedLanguages: ["javascript"],
        },
        {
          title: "Battery Level Warning",
          description: "Determine if battery level warning should be shown.",
          difficulty: "easy",
          careerPathId: mobilePath.id,
          requiredLevel: 7,
          xpReward: 70,
          starterCode: {
            javascript: "function shouldShowBatteryWarning(batteryLevel) {\n  // Return true if below 20%\n}",
          },
          testCases: [
            { input: "15", expectedOutput: "true" },
            { input: "50", expectedOutput: "false" },
          ],
          supportedLanguages: ["javascript"],
        },
      ];

      for (const challenge of mobileChallenges) {
        await storage.createCodeChallenge(challenge);
        console.log(`✓ Created Mobile challenge: ${challenge.title}`);
      }
    }

    // Cybersecurity Challenges
    if (securityPath) {
      const securityChallenges: InsertCodeChallenge[] = [
        {
          title: "Password Strength Checker",
          description: "Check if a password meets security requirements (min 8 chars, has uppercase, lowercase, digit, special char).",
          difficulty: "easy",
          careerPathId: securityPath.id,
          requiredLevel: 1,
          xpReward: 70,
          starterCode: {
            python: "def check_password_strength(password):\n    # Return True or False\n    pass",
            javascript: "function checkPasswordStrength(password) {\n  // Return true or false\n}",
          },
          testCases: [
            { input: "Passw0rd!", expectedOutput: "true" },
            { input: "weak", expectedOutput: "false" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Input Sanitizer",
          description: "Remove potentially dangerous characters from user input.",
          difficulty: "medium",
          careerPathId: securityPath.id,
          requiredLevel: 8,
          xpReward: 120,
          starterCode: {
            javascript: "function sanitizeInput(input) {\n  // Remove <, >, &, quotes\n}",
          },
          testCases: [
            { input: "<script>alert('xss')</script>", expectedOutput: "scriptalert('xss')script" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "JWT Token Validator",
          description: "Validate JWT token structure (header.payload.signature).",
          difficulty: "medium",
          careerPathId: securityPath.id,
          requiredLevel: 12,
          xpReward: 140,
          starterCode: {
            javascript: "function validateJWT(token) {\n  // Return true if valid structure\n}",
          },
          testCases: [
            { input: "eyJhbGc.eyJzdWI.signature", expectedOutput: "true" },
            { input: "invalid", expectedOutput: "false" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "Rate Limit Tracker",
          description: "Track API requests and determine if rate limit is exceeded.",
          difficulty: "hard",
          careerPathId: securityPath.id,
          requiredLevel: 18,
          xpReward: 200,
          starterCode: {
            python: "class RateLimiter:\n    def __init__(self, max_requests, time_window):\n        pass\n    \n    def allow_request(self):\n        pass",
          },
          testCases: [
            { input: "5,60", expectedOutput: "true" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "SQL Injection Detector",
          description: "Detect potential SQL injection attempts in user input.",
          difficulty: "medium",
          careerPathId: securityPath.id,
          requiredLevel: 10,
          xpReward: 130,
          starterCode: {
            python: "def detect_sql_injection(query):\n    # Return True if suspicious\n    pass",
          },
          testCases: [
            { input: "SELECT * FROM users WHERE id = 1", expectedOutput: "false" },
            { input: "'; DROP TABLE users; --", expectedOutput: "true" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Hash Password",
          description: "Hash a password using a simple hashing algorithm simulation.",
          difficulty: "easy",
          careerPathId: securityPath.id,
          requiredLevel: 3,
          xpReward: 75,
          starterCode: {
            python: "def hash_password(password, salt):\n    # Simple hash simulation\n    pass",
          },
          testCases: [
            { input: "password123,salt123", expectedOutput: "hashed_value" },
          ],
          supportedLanguages: ["python"],
        },
        {
          title: "XSS Attack Detector",
          description: "Detect potential XSS attack vectors in HTML input.",
          difficulty: "medium",
          careerPathId: securityPath.id,
          requiredLevel: 15,
          xpReward: 150,
          starterCode: {
            javascript: "function detectXSS(html) {\n  // Return true if suspicious\n}",
          },
          testCases: [
            { input: "<p>Hello World</p>", expectedOutput: "false" },
            { input: "<script>alert('XSS')</script>", expectedOutput: "true" },
          ],
          supportedLanguages: ["javascript", "python"],
        },
        {
          title: "IP Address Validator",
          description: "Validate if a string is a valid IPv4 address.",
          difficulty: "easy",
          careerPathId: securityPath.id,
          requiredLevel: 5,
          xpReward: 80,
          starterCode: {
            python: "def validate_ipv4(ip):\n    # Return True or False\n    pass",
          },
          testCases: [
            { input: "192.168.1.1", expectedOutput: "true" },
            { input: "256.1.1.1", expectedOutput: "false" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "CSRF Token Generator",
          description: "Generate a random CSRF token of specified length.",
          difficulty: "easy",
          careerPathId: securityPath.id,
          requiredLevel: 6,
          xpReward: 85,
          starterCode: {
            python: "import random\nimport string\n\ndef generate_csrf_token(length):\n    # Generate random token\n    pass",
          },
          testCases: [
            { input: "32", expectedOutput: "32" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
        {
          title: "Secure Session ID",
          description: "Validate that a session ID meets security requirements (length, randomness).",
          difficulty: "medium",
          careerPathId: securityPath.id,
          requiredLevel: 14,
          xpReward: 135,
          starterCode: {
            python: "def validate_session_id(session_id):\n    # Check length and format\n    pass",
          },
          testCases: [
            { input: "a1b2c3d4e5f6g7h8", expectedOutput: "true" },
            { input: "short", expectedOutput: "false" },
          ],
          supportedLanguages: ["python", "javascript"],
        },
      ];

      for (const challenge of securityChallenges) {
        await storage.createCodeChallenge(challenge);
        console.log(`✓ Created Cybersecurity challenge: ${challenge.title}`);
      }
    }

    console.log("\n✅ Code challenges seeding complete!");
    console.log("Total new challenges created: 60+");

  } catch (error) {
    console.error("❌ Error seeding challenges:", error);
    throw error;
  }
}

// Run the seed function
seedCodeChallenges()
  .then(() => {
    console.log("🎉 Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed:", error);
    process.exit(1);
  });
