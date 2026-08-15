export type StepperOrientation = 'vertical' | 'horizontal';
export type StepperVisualState = 'completed' | 'current' | 'upcoming' | 'incomplete' | 'disabled';

export interface StepperStep {
  label: string;
  number?: number | string;
  state?: StepperVisualState;
}
