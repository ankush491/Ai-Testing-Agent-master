import { config } from 'dotenv';
config();

import '@/ai/flows/generate-test-cases.ts';
import '@/ai/flows/summarize-test-report.ts';