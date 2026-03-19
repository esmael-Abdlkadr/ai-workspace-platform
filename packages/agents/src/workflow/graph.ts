import { StateGraph, MemorySaver, START, END } from '@langchain/langgraph';
import { WorkflowAnnotation } from './state.js';
import {
  researcherNode,
  writerNode,
  criticNode,
  memoryNode,
  errorNode,
  routeAfterCritic,
} from './nodes.js';

const checkpointer = new MemorySaver();

const graph = new StateGraph(WorkflowAnnotation)
  .addNode('researcher', researcherNode)
  .addNode('writer', writerNode)
  .addNode('critic', criticNode)
  .addNode('memory', memoryNode)
  .addNode('failure', errorNode)
  .addEdge(START, 'researcher')
  .addEdge('researcher', 'writer')
  .addEdge('writer', 'critic')
  .addConditionalEdges('critic', routeAfterCritic, {
    writer: 'writer',
    memory: 'memory',
    error: 'failure',
  })
  .addEdge('memory', END)
  .addEdge('failure', END);

export const compiledGraph = graph.compile({ checkpointer });
