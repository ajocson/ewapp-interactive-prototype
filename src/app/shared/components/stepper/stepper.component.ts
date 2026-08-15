import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { StepperOrientation, StepperStep, StepperVisualState } from './stepper.model';

@Component({
  selector: 'tdx-stepper, app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StepperComponent {
  @Input() steps: StepperStep[] = [];
  @Input() currentIndex = 0;
  @Input() orientation: StepperOrientation = 'vertical';
  @Input() showLeftConnector = true;
  @Input() showRightConnector = true;

  get hostClasses(): Record<string, boolean> {
    return {
      [`tdx-stepper--${this.orientation}`]: true,
      'tdx-stepper--hide-left-connector': !this.showLeftConnector,
      'tdx-stepper--hide-right-connector': !this.showRightConnector
    };
  }

  getStepVisualState(step: StepperStep, index: number): StepperVisualState {
    if (step.state) return step.state;
    if (index < this.currentIndex) return 'completed';
    if (index === this.currentIndex) return 'current';
    return 'upcoming';
  }

  getStepClasses(step: StepperStep, index: number): Record<string, boolean> {
    return { [`tdx-stepper__item--${this.getStepVisualState(step, index)}`]: true };
  }

  getIndicatorIcon(step: StepperStep, index: number): string {
    const state = this.getStepVisualState(step, index);
    if (state === 'completed') return 'check_circle';
    if (state === 'incomplete') return 'warning';
    return 'circle';
  }

  shouldShowStepNumber(step: StepperStep, index: number): boolean {
    return ['current', 'upcoming', 'disabled'].includes(this.getStepVisualState(step, index));
  }
}
