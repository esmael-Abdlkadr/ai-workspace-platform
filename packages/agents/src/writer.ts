import { logger } from '@workspace/db';
import { callLLM } from './base.js';
import { AgentOutputSchema } from './types.js';
import type { AgentInput, AgentOutput } from './types.js';

const SYSTEM_PROMPT = `You are a professional technical writer. Given a task and research findings, write a well-structured markdown document.

Requirements:
- Start with a clear # Title
- Use ## sections to organize content
- Include a ## Summary or ## Conclusion at the end
- Write in clear, professional prose
- Base content strictly on the provided research findings`;

export async function writerAgent(input: AgentInput): Promise<AgentOutput> {
  logger.info({ task: input.task }, 'WriterAgent started');

  if (!input.context) throw new Error('WriterAgent requires context (research findings)');

  const output = await callLLM(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'human',
        content: `Task: ${input.task}\n\nResearch Findings:\n${input.context}\n\nWrite the markdown document now:`,
      },
    ],
    'writer',
  );

  const result = AgentOutputSchema.parse({
    agentName: 'writer',
    output,
    confidence: 7,
    metadata: { wordCount: output.split(/\s+/).length },
  });

  logger.info({ wordCount: result.metadata?.wordCount }, 'WriterAgent complete');
  return result;
}
