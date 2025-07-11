'use server';

import { z } from 'zod';
import { generateTestCases } from '@/ai/flows/generate-test-cases';
import { summarizeTestReport } from '@/ai/flows/summarize-test-report';

const testRequestSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

export type Report = {
  summary: string;
  actions: string;
};

type ActionResult = {
  success: boolean;
  data?: Report;
  error?: string;
}

export async function runTest(values: { url: string; prompt: string }): Promise<ActionResult> {
  const validatedFields = testRequestSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid input. Please check the URL and prompt.',
    };
  }

  const { url, prompt: testingPrompt } = validatedFields.data;

  try {
    const { testCases } = await generateTestCases({ url, testingPrompt });

    if (!testCases) {
      throw new Error('Failed to generate test cases.');
    }

    // In a real scenario, you would run Playwright with the generated test cases here.
    // For this demo, we'll pass the generated test cases directly to the summary flow.
    const testResults = `Generated Test Plan:\n\n${testCases}`;
    
    const report = await summarizeTestReport({ testResults });

    if (!report || !report.summary) {
      throw new Error('Failed to generate test report.');
    }

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `An unexpected error occurred: ${errorMessage}`,
    };
  }
}
