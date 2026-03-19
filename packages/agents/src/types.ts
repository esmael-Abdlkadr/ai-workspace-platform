import { z } from 'zod';

export type AgentInput = {
  task: string;
  workspaceId: string;
  context?: string;
};

export const AgentOutputSchema = z.object({
  agentName: z.enum(['researcher', 'writer', 'critic', 'memory']),
  output: z.string().min(1),
  confidence: z.number().min(0).max(10),
  metadata: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
});

export type AgentOutput = z.infer<typeof AgentOutputSchema>;
