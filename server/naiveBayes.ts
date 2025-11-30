import { storage } from "./storage-firestore";
import type { QuestionAttempt, InterestResponse } from "@shared/schema";

interface CategoryPerformance {
  [category: string]: {
    correct: number;
    total: number;
  };
}

interface CareerPathProbability {
  careerPathId: string;
  probability: number;
  score: number;
}

/**
 * Naive Bayes Career Path Recommender
 * 
 * This algorithm analyzes:
 * 1. Quiz performance by category (frontend, backend, data, security, etc.)
 * 2. Interest questionnaire responses
 * 
 * To recommend the best career path for a student.
 */
export class NaiveBayesRecommender {
  
  /**
   * Calculate performance metrics by category from question attempts
   */
  private calculateCategoryPerformance(attempts: QuestionAttempt[]): CategoryPerformance {
    const performance: CategoryPerformance = {};

    for (const attempt of attempts) {
      if (!attempt.category) continue;

      if (!performance[attempt.category]) {
        performance[attempt.category] = { correct: 0, total: 0 };
      }

      performance[attempt.category].total++;
      if (attempt.isCorrect) {
        performance[attempt.category].correct++;
      }
    }

    return performance;
  }

  /**
   * Map interest responses to career path affinities
   */
  private analyzeInterestResponses(responses: InterestResponse[]): Record<string, number> {
    const affinities: Record<string, number> = {
      frontend: 0,
      backend: 0,
      data: 0,
      cloud: 0,
      mobile: 0,
      security: 0,
    };

    for (const response of responses) {
      const r = response.response.toString();

      // Question patterns (based on InterestQuestionnaire.tsx)
      switch (response.questionId) {
        case 1: // Visual design and UI
          if (r === "5" || r === "4") {
            affinities.frontend += 2;
            affinities.mobile += 1;
          }
          break;

        case 2: // Backend vs Frontend preference
          if (r.includes("Backend")) {
            affinities.backend += 3;
            affinities.cloud += 1;
          } else if (r.includes("Frontend")) {
            affinities.frontend += 3;
            affinities.mobile += 1;
          } else if (r.includes("Both")) {
            affinities.frontend += 1;
            affinities.backend += 1;
          }
          break;

        case 3: // Math and statistics
          if (r === "5" || r === "4") {
            affinities.data += 3;
            affinities.backend += 1;
          }
          break;

        case 4: // Area of interest
          if (r.includes("web applications")) {
            affinities.frontend += 2;
            affinities.backend += 2;
          } else if (r.includes("data")) {
            affinities.data += 3;
          } else if (r.includes("cloud")) {
            affinities.cloud += 3;
          } else if (r.includes("mobile")) {
            affinities.mobile += 3;
          } else if (r.includes("security")) {
            affinities.security += 3;
          }
          break;

        case 5: // Problem-solving enjoyment
          if (r === "5" || r === "4") {
            affinities.backend += 1;
            affinities.data += 1;
          }
          break;
      }
    }

    return affinities;
  }

  /**
   * Calculate Naive Bayes probability for each career path
   */
  private calculateProbabilities(
    categoryPerformance: CategoryPerformance,
    interestAffinities: Record<string, number>
  ): CareerPathProbability[] {
    // Career path definitions with their category weights
    const careerPathWeights: Record<string, Record<string, number>> = {
      fullstack: {
        frontend: 0.4,
        backend: 0.4,
        data: 0.1,
        cloud: 0.05,
        mobile: 0.05,
        security: 0.0,
      },
      datascience: {
        frontend: 0.05,
        backend: 0.15,
        data: 0.7,
        cloud: 0.05,
        mobile: 0.0,
        security: 0.05,
      },
      cloud: {
        frontend: 0.05,
        backend: 0.25,
        data: 0.1,
        cloud: 0.55,
        mobile: 0.0,
        security: 0.05,
      },
      mobile: {
        frontend: 0.3,
        backend: 0.15,
        data: 0.05,
        cloud: 0.05,
        mobile: 0.45,
        security: 0.0,
      },
      security: {
        frontend: 0.05,
        backend: 0.2,
        data: 0.1,
        cloud: 0.1,
        mobile: 0.0,
        security: 0.55,
      },
    };

    const results: CareerPathProbability[] = [];

    for (const [pathKey, weights] of Object.entries(careerPathWeights)) {
      let performanceScore = 0;
      let interestScore = 0;

      // Calculate weighted performance score
      for (const [category, weight] of Object.entries(weights)) {
        if (categoryPerformance[category]) {
          const accuracy = categoryPerformance[category].correct / categoryPerformance[category].total;
          performanceScore += accuracy * weight;
        }

        // Add interest affinity score
        interestScore += (interestAffinities[category] || 0) * weight;
      }

      // Combine performance (60%) and interest (40%) with normalization
      const normalizedPerformance = performanceScore * 100;
      const normalizedInterest = Math.min(interestScore * 10, 100);
      
      const finalScore = (normalizedPerformance * 0.6) + (normalizedInterest * 0.4);

      // Calculate probability (softmax-like normalization will be applied later)
      results.push({
        careerPathId: pathKey,
        probability: 0, // Will be calculated after
        score: finalScore,
      });
    }

    // Normalize scores to probabilities using softmax
    const totalExp = results.reduce((sum, r) => sum + Math.exp(r.score / 10), 0);
    for (const result of results) {
      result.probability = Math.exp(result.score / 10) / totalExp;
    }

    // Sort by probability descending
    results.sort((a, b) => b.probability - a.probability);

    return results;
  }

  /**
   * Map internal career path keys to actual database IDs
   */
  private async mapToCareerPathIds(
    probabilities: CareerPathProbability[]
  ): Promise<CareerPathProbability[]> {
    const paths = await storage.getCareerPaths();
    
    if (paths.length === 0) {
      console.warn("No career paths found in database");
      return probabilities;
    }
    
    const mapping: Record<string, string> = {};
    
    // Try multiple naming variations
    const pathPatterns: Record<string, RegExp[]> = {
      fullstack: [/full\s*stack/i, /fullstack/i, /full-stack/i],
      datascience: [/data\s*science/i, /datascience/i, /data-science/i],
      cloud: [/cloud/i, /cloud\s*infrastructure/i],
      mobile: [/mobile/i, /mobile\s*dev/i],
      security: [/cybersecurity/i, /security/i],
    };
    
    // First pass: exact pattern matching
    for (const [key, patterns] of Object.entries(pathPatterns)) {
      for (const pattern of patterns) {
        const match = paths.find(p => pattern.test(p.name));
        if (match) {
          mapping[key] = match.id;
          break;
        }
      }
    }
    
    // Fallback: if no matches found, use first path as default for each key
    for (const key of Object.keys(pathPatterns)) {
      if (!mapping[key] && paths.length > 0) {
        mapping[key] = paths[0].id;
      }
    }

    return probabilities.map(p => ({
      ...p,
      careerPathId: mapping[p.careerPathId] || paths[0]?.id || p.careerPathId,
    }));
  }

  /**
   * Main recommendation function
   * Returns the recommended career path ID and probabilities for all paths
   */
  async recommendCareerPath(userId: string): Promise<{
    recommendedPathId: string;
    probabilities: CareerPathProbability[];
    confidence: number;
  }> {
    // Get user's question attempts
    const questionAttempts = await storage.getUserQuestionAttemptsByCategory(userId);
    
    // Get user's interest responses
    const interestResponses = await storage.getUserInterestResponses(userId);

    if (interestResponses.length === 0) {
      throw new Error("Interest assessment not completed");
    }

    // If no quiz data, use only interest responses for recommendation
    let categoryPerformance: CategoryPerformance = {};
    
    if (questionAttempts.length > 0) {
      // Calculate category performance if quiz data exists
      categoryPerformance = this.calculateCategoryPerformance(questionAttempts);
    } else {
      // Create default performance if no quiz data
      categoryPerformance = {
        frontend: { correct: 1, total: 2 },
        backend: { correct: 1, total: 2 },
        data: { correct: 1, total: 2 },
        cloud: { correct: 1, total: 2 },
        mobile: { correct: 1, total: 2 },
        security: { correct: 1, total: 2 },
      };
    }

    // Analyze interest responses
    const interestAffinities = this.analyzeInterestResponses(interestResponses);

    // Calculate probabilities
    let probabilities = this.calculateProbabilities(categoryPerformance, interestAffinities);

    // Map to actual career path IDs
    probabilities = await this.mapToCareerPathIds(probabilities);

    // Verify we have a valid recommendation
    if (probabilities.length === 0 || !probabilities[0].careerPathId) {
      throw new Error("Unable to calculate career recommendation");
    }

    // Get top recommendation
    const recommended = probabilities[0];
    const confidence = Math.min(recommended.probability * 100, 95); // Cap at 95% if no quiz data

    return {
      recommendedPathId: recommended.careerPathId,
      probabilities,
      confidence,
    };
  }
}

export const naiveBayesRecommender = new NaiveBayesRecommender();
