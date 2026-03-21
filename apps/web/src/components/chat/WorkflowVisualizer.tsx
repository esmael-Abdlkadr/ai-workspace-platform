'use client';

import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'researcher', label: 'Researcher' },
  { key: 'writer', label: 'Writer' },
  { key: 'critic', label: 'Critic' },
  { key: 'memory', label: 'Memory' },
  { key: 'complete', label: 'Done' },
];

type Props = { currentStep: string | null; status: string | null };

function getStepState(stepKey: string, currentStep: string | null, status: string | null) {
  if (status === 'complete') return 'done';
  if (status === 'error' && stepKey === currentStep) return 'error';
  const order = STEPS.map((s) => s.key);
  const curr = order.indexOf(currentStep ?? '');
  const idx = order.indexOf(stepKey);
  if (idx < curr) return 'done';
  if (idx === curr) return 'active';
  return 'pending';
}

export function WorkflowVisualizer({ currentStep, status }: Props) {
  if (!currentStep && !status) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
    >
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Workflow Progress
      </p>
      <div className="flex items-start gap-1">
        {STEPS.map((step, i) => {
          const state = getStepState(step.key, currentStep, status);
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                  )}
                  style={
                    state === 'done'
                      ? { background: 'var(--success)', color: '#000' }
                      : state === 'active'
                      ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 0 16px var(--accent)40' }
                      : state === 'error'
                      ? { background: 'var(--danger)', color: '#fff' }
                      : { background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  {state === 'done' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : state === 'active' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : state === 'error' ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="h-[2px] flex-1 transition-all duration-500"
                    style={{ background: state === 'done' ? 'var(--success)' : 'var(--border)' }}
                  />
                )}
              </div>
              <span
                className="text-center text-[10px] font-medium"
                style={{ color: state === 'active' ? 'var(--accent-hover)' : state === 'done' ? 'var(--success)' : 'var(--text-muted)' }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
