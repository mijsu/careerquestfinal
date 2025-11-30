/**
 * Judge0 API Integration
 * Handles code compilation and execution via Judge0 CE (Community Edition)
 */

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";
const JUDGE0_BASE_URL = `https://${JUDGE0_HOST}`;

// Language IDs from Judge0 CE
export const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  java: 62,        // Java
  cpp: 54,         // C++ (GCC)
  c: 50,           // C (GCC)
  typescript: 74,  // TypeScript
  go: 60,          // Go
  rust: 73,        // Rust
} as const;

interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

export class Judge0Service {
  
  /**
   * Submit code for execution
   */
  async submitCode(params: {
    sourceCode: string;
    languageId: number;
    stdin?: string;
    expectedOutput?: string;
  }): Promise<{ token: string }> {
    if (!JUDGE0_API_KEY) {
      throw new Error("JUDGE0_API_KEY is not configured");
    }

    const response = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': JUDGE0_HOST,
      },
      body: JSON.stringify({
        source_code: params.sourceCode,
        language_id: params.languageId,
        stdin: params.stdin || "",
        expected_output: params.expectedOutput || null,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 submission failed: ${error}`);
    }

    const data = await response.json();
    return { token: data.token };
  }

  /**
   * Get submission result
   */
  async getSubmission(token: string): Promise<SubmissionResult> {
    if (!JUDGE0_API_KEY) {
      throw new Error("JUDGE0_API_KEY is not configured");
    }

    const response = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': JUDGE0_HOST,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 get submission failed: ${error}`);
    }

    return await response.json();
  }

  /**
   * Submit and wait for result (polling)
   */
  async executeCode(params: {
    sourceCode: string;
    languageId: number;
    stdin?: string;
    expectedOutput?: string;
    maxWaitTime?: number;
  }): Promise<SubmissionResult> {
    const { token } = await this.submitCode(params);
    const maxWaitTime = params.maxWaitTime || 10000; // 10 seconds default
    const startTime = Date.now();
    const pollInterval = 500; // 500ms

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getSubmission(token);
      
      // Status IDs: 1=In Queue, 2=Processing
      // Completed: 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded, etc.
      if (result.status.id > 2) {
        return result;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error("Code execution timeout");
  }

  /**
   * Run test cases against code
   */
  async runTestCases(params: {
    sourceCode: string;
    languageId: number;
    testCases: Array<{ input: string; expectedOutput: string }>;
  }): Promise<{
    passed: number;
    total: number;
    results: Array<{
      input: string;
      expectedOutput: string;
      actualOutput: string | null;
      passed: boolean;
      error: string | null;
    }>;
  }> {
    const results = [];
    
    for (const testCase of params.testCases) {
      try {
        const result = await this.executeCode({
          sourceCode: params.sourceCode,
          languageId: params.languageId,
          stdin: testCase.input,
          expectedOutput: testCase.expectedOutput,
        });

        const actualOutput = result.stdout?.trim() || null;
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput && result.status.id === 3;

        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          passed,
          error: result.stderr || result.compile_output || result.message || null,
        });
      } catch (error: any) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: null,
          passed: false,
          error: error.message,
        });
      }
    }

    const passed = results.filter(r => r.passed).length;
    
    return {
      passed,
      total: results.length,
      results,
    };
  }
}

export const judge0Service = new Judge0Service();
