import { logger, createTask, completeTask, failTask, updateTask, saveNotionReference, type Task } from '@workspace/db';
import { NotionPublisher } from '@workspace/notion';
import { compiledGraph } from './graph.js';
import type { WorkflowState } from './state.js';

export class WorkflowRunner {
  async run(prompt: string, workspaceId: string): Promise<Task> {
    const task = await createTask({ prompt, workspaceId, status: 'running' });
    logger.info({ taskId: task.id, prompt }, 'WorkflowRunner started');

    const threadId = task.id;

    try {
      const initialState: Partial<WorkflowState> = {
        taskId: task.id,
        prompt,
        workspaceId,
        researchResult: null,
        draftDocument: null,
        criticScore: null,
        criticFeedback: null,
        retryCount: 0,
        finalDocument: null,
        error: null,
      };

      const finalState = await compiledGraph.invoke(initialState, {
        configurable: { thread_id: threadId },
      });

      await updateTask(task.id, { langgraphRunId: threadId });

      if (finalState.finalDocument) {
        logger.info(
          { taskId: task.id, criticScore: finalState.criticScore, retryCount: finalState.retryCount },
          'WorkflowRunner complete',
        );
        const completedTask = await completeTask(task.id, finalState.finalDocument);

        try {
          const publisher = new NotionPublisher();
          const { pageId, pageUrl } = await publisher.publish(prompt, finalState.finalDocument);
          await saveNotionReference({ taskId: task.id, notionPageId: pageId, notionPageUrl: pageUrl });
          await updateTask(task.id, { notionPageUrl: pageUrl });
          logger.info({ taskId: task.id, pageUrl }, 'WorkflowRunner: Notion page published');
        } catch (notionError) {
          const message = notionError instanceof Error ? notionError.message : String(notionError);
          logger.warn({ taskId: task.id, error: message }, 'WorkflowRunner: Notion publish failed (non-fatal)');
        }

        return completedTask;
      }

      const errorMsg = finalState.error ?? 'Workflow ended without a final document';
      logger.error({ taskId: task.id, error: errorMsg }, 'WorkflowRunner failed');
      return failTask(task.id, errorMsg);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ taskId: task.id, error: message }, 'WorkflowRunner threw exception');
      return failTask(task.id, message);
    }
  }
}
