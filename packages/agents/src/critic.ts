import { logger } from '@workspace/db';
import { callLLM } from './base.js';
import { AgentOutputSchema } from './types.js';
import type { AgentInput, AgentOutput } from './types.js';

const SYSTEM_PROMPT = `You are a critical document reviewer. Evaluate the provided document and return your assessment as valid JSON only — no markdown, no explanation outside the JSON.

Evaluation criteria:
- Accuracy: Does it accurately reflect the research findings?
- Completeness: Does it cover the task requirements?
- Clarity: Is it well-structured and easy to understand?
- Quality: Is it professional and free of errors?

Return exactly this JSON structure:
{"score": <number 0-10>, "feedback": "<specific actionable feedback>"}`;

function extractCriticJson(raw: string): { score: number; feedback: string } {
  const match = raw.match(/\{[\s\S]*"score"[\s\S]*"feedback"[\s\S]*\}/);
  if (!match) throw new Error('CriticAgent: could not find JSON in response');

  const parsed = JSON.parse(match[0]) as unknown;
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>)['score'] !== 'number' ||
    typeof (parsed as Record<string, unknown>)['feedback'] !== 'string'
  ) {
    throw new Error('CriticAgent: invalid JSON structure');
  }

  const { score, feedback } = parsed as { score: number; feedback: string };

  if (score < 0 || score > 10) throw new Error(`CriticAgent: score ${score} out of range 0-10`);

  return { score, feedback };
}

export async function criticAgent(input: AgentInput): Promise<AgentOutput> {
  logger.info({ task: input.task }, 'CriticAgent started');

  if (!input.context) throw new Error('CriticAgent requires context (document to review)');

  const raw = await callLLM(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'human',
        content: `Task the document should address: ${input.task}\n\nDocument to review:\n${input.context}`,
      },
    ],
    'critic',
  );

  const { score, feedback } = extractCriticJson(raw);

  const result = AgentOutputSchema.parse({
    agentName: 'critic',
    output: `Score: ${score}/10. ${feedback}`,
    confidence: score,
    metadata: { score, feedback },
  });

  logger.info({ score, feedback }, 'CriticAgent complete');
  return result;
}
