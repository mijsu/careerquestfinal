import OpenAI from "openai";

// Using official OpenAI API
let openai: OpenAI | null = null;
let cachedApiKey: string | undefined = undefined;

function getOpenAIClient(): OpenAI {
  const currentApiKey = process.env.OPENAI_API_KEY;
  
  if (!currentApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set. Please configure your OpenAI API key.");
  }
  
  // Recreate client if API key has changed
  if (!openai || cachedApiKey !== currentApiKey) {
    openai = new OpenAI({ 
      apiKey: currentApiKey,
      baseURL: "https://api.openai.com/v1"
    });
    cachedApiKey = currentApiKey;
  }
  
  return openai;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export interface StudySuggestion {
  topic: string;
  reason: string;
  recommendedAction: string;
  priority: "high" | "medium" | "low";
}

export async function generateQuestionsFromText(
  syllabusText: string,
  careerPath: string,
  count: number = 10
): Promise<GeneratedQuestion[]> {
  const prompt = `You are an expert Computer Science educator. Generate ${count} multiple-choice quiz questions based on the following syllabus content for students pursuing a career in ${careerPath}.

Syllabus Content:
${syllabusText}

Requirements:
- Create diverse questions covering different topics from the syllabus
- Include questions of varying difficulty (easy, medium, hard)
- Each question should have 4 options with only one correct answer
- Categorize questions by topic (frontend, backend, data, security, algorithms, etc.)
- Provide clear explanations for the correct answers

Respond with a JSON array of questions in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "category": "algorithms",
      "difficulty": "medium",
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Computer Science educator who creates high-quality quiz questions. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions from syllabus");
  }
}

export async function generatePracticeQuiz(
  careerPath: string,
  userLevel: number,
  topic?: string,
  difficulty?: "beginner" | "intermediate" | "advanced"
): Promise<GeneratedQuestion[]> {
  const difficultyLevel = difficulty || (userLevel < 5 ? "beginner" : userLevel < 15 ? "intermediate" : "advanced");
  const topicContext = topic ? `focusing on ${topic}` : "covering core concepts";
  
  const prompt = `You are an expert Computer Science educator. Generate 5 high-quality multiple-choice quiz questions for a ${careerPath} student at level ${userLevel} (${difficultyLevel} difficulty), ${topicContext}.

Requirements:
- Questions should be practical and relevant to ${careerPath}
- Include diverse topics (algorithms, data structures, frameworks, best practices, debugging, system design)
- Each question should have 4 options with only one correct answer
- Difficulty: ${difficultyLevel}
- Categorize questions by topic (frontend, backend, data, security, algorithms, etc.)
- Provide clear explanations for correct answers
- Make questions challenging but fair for level ${userLevel}

Respond with a JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "category": "algorithms",
      "difficulty": "${difficultyLevel}",
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Computer Science educator who creates high-quality, practical quiz questions. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 3000,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating practice quiz:", error);
    throw new Error("Failed to generate practice quiz");
  }
}

export async function generateStudySuggestions(
  userPerformance: {
    level: number;
    totalXp: number;
    careerPath: string | null;
    recentQuizScores: Array<{ category: string; score: number; total: number }>;
    weakCategories: string[];
  }
): Promise<StudySuggestion[]> {
  const prompt = `You are a personalized learning advisor for Computer Science students. Analyze the following student performance data and provide 3-5 specific, actionable study suggestions.

Student Profile:
- Current Level: ${userPerformance.level}
- Total XP: ${userPerformance.totalXp}
- Career Path: ${userPerformance.careerPath || "Not selected yet"}
- Recent Quiz Performance: ${JSON.stringify(userPerformance.recentQuizScores)}
- Weak Categories: ${userPerformance.weakCategories.join(", ")}

Provide personalized recommendations for:
1. Topics to review based on weak performance
2. Next courses or challenges to tackle
3. Study strategies to improve

Respond with a JSON object in this exact format:
{
  "suggestions": [
    {
      "topic": "Topic name",
      "reason": "Why this is important for the student",
      "recommendedAction": "Specific action to take",
      "priority": "high"
    }
  ]
}`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a personalized learning advisor who provides specific, actionable study advice. Always respond with valid JSON. Do NOT wrap the JSON in code blocks or markdown.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.7
    });

    let content = response.choices[0].message.content || "{}";
    // Strip markdown code blocks if present
    content = content.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    const result = JSON.parse(content);
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating study suggestions:", error);
    throw new Error("Failed to generate study suggestions");
  }
}

export default getOpenAIClient;
