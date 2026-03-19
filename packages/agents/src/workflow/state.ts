import { Annotation } from '@langchain/langgraph';

export const WorkflowAnnotation = Annotation.Root({
  taskId: Annotation<string>(),
  prompt: Annotation<string>(),
  workspaceId: Annotation<string>(),
  researchResult: Annotation<string | null>(),
  draftDocument: Annotation<string | null>(),
  criticScore: Annotation<number | null>(),
  criticFeedback: Annotation<string | null>(),
  retryCount: Annotation<number>({ reducer: (_prev, next) => next, default: () => 0 }),
  finalDocument: Annotation<string | null>(),
  error: Annotation<string | null>(),
});

export type WorkflowState = typeof WorkflowAnnotation.State;
