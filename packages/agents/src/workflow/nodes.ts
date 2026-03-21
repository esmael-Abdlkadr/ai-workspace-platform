import { logger, updateTask } from '@workspace/db';
import { researcherAgent } from '../researcher.js';
import { writerAgent } from '../writer.js';
import { criticAgent } from '../critic.js';
import { memoryAgent } from '../memory.js';
import type { WorkflowState } from './state.js';

const MAX_RETRIES = 3;

export async function researcherNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  logger.info({ taskId: state.taskId }, 'Node: researcher started');
  await updateTask(state.taskId, { currentStep: 'researcher' }).catch(() => undefined);
  try {
    const result = await researcherAgent({ task: state.prompt, workspaceId: state.workspaceId });
    logger.info({ taskId: state.taskId }, 'Node: researcher complete');
    return { researchResult: result.output };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ taskId: state.taskId, error: message }, 'Node: researcher failed');
    return { error: `Researcher failed: ${message}` };
  }
}

export async function writerNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info({ taskId: state.taskId, retryCount: state.retryCount }, 'Node: writer started');
  await updateTask(state.taskId, { currentStep: 'writer' }).catch(() => undefined);
  try {
    const context = state.criticFeedback
      ? `Research:\n${state.researchResult}\n\nPrevious feedback to address:\n${state.criticFeedback}`
      : (state.researchResult ?? '');

    const result = await writerAgent({
      task: state.prompt,
      workspaceId: state.workspaceId,
      context,
    });
    logger.info({ taskId: state.taskId }, 'Node: writer complete');
    return { draftDocument: result.output, retryCount: state.retryCount + 1 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ taskId: state.taskId, error: message }, 'Node: writer failed');
    return { error: `Writer failed: ${message}`, retryCount: state.retryCount + 1 };
  }
}

export async function criticNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info({ taskId: state.taskId }, 'Node: critic started');
  await updateTask(state.taskId, { currentStep: 'critic' }).catch(() => undefined);
  try {
    const result = await criticAgent({
      task: state.prompt,
      workspaceId: state.workspaceId,
      context: state.draftDocument ?? '',
    });
    const score = result.confidence;
    const feedback = (result.metadata?.['feedback'] as string) ?? '';
    logger.info({ taskId: state.taskId, score, feedback }, 'Node: critic complete');
    return { criticScore: score, criticFeedback: feedback };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ taskId: state.taskId, error: message }, 'Node: critic failed');
    return { criticScore: 0, criticFeedback: message };
  }
}

export async function memoryNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info({ taskId: state.taskId }, 'Node: memory started');
  await updateTask(state.taskId, { currentStep: 'memory' }).catch(() => undefined);
  try {
    await memoryAgent({
      task: state.prompt,
      workspaceId: state.workspaceId,
      context: state.draftDocument ?? '',
    });
    logger.info({ taskId: state.taskId }, 'Node: memory complete');
    return { finalDocument: state.draftDocument };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ taskId: state.taskId, error: message }, 'Node: memory failed');
    return { finalDocument: state.draftDocument, error: `Memory failed: ${message}` };
  }
}

export function errorNode(state: WorkflowState): Partial<WorkflowState> {
  const reason =
    state.retryCount >= MAX_RETRIES
      ? `Max retries (${MAX_RETRIES}) exceeded`
      : (state.error ?? 'Unknown error');
  logger.error({ taskId: state.taskId, reason }, 'Node: error — workflow terminated');
  return { error: reason };
}

export function routeAfterCritic(
  state: WorkflowState,
): 'writer' | 'memory' | 'error' {
  if (state.error) return 'error';
  if (state.retryCount >= MAX_RETRIES) return 'error';
  if ((state.criticScore ?? 0) < 7) return 'writer';
  return 'memory';
}
