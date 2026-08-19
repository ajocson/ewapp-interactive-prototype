import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LeadCardData } from '../../lead-board.model';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../../shared/components/button/button.model';
import { TdxTabItem } from '../../shared/components/tab-group/tab-group.model';
import { TdxTagEmphasis, TdxTagVariant } from '../../shared/components/tag/tag.model';
import { StepperStep } from '../../shared/components/stepper/stepper.model';

@Component({
  selector: 'lam-lead-activity-drawer',
  templateUrl: './lead-activity-drawer.component.html',
  styleUrl: './lead-activity-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LeadActivityDrawerComponent {
  @Input({ required: true }) lead!: LeadCardData;
  @Output() closed = new EventEmitter<void>();
  @Output() draftSiRequested = new EventEmitter<void>();
  @Output() contacted = new EventEmitter<LeadCardData>();

  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  readonly buttonSize = TdxButtonSize;
  readonly tagVariant = TdxTagVariant;
  readonly tagEmphasis = TdxTagEmphasis;
  readonly tabs: TdxTabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Activity Timeline' }
  ];
  activeTab = 'overview';
  readonly activitySteps: StepperStep[] = [
    { label: 'Contacted', number: 1 },
    { label: 'Appointment', number: 2 },
    { label: 'Meeting', number: 3 }
  ];

  get statusTag(): string {
    return this.lead.tags[0]?.label ?? 'New Lead';
  }

  get statusVariant(): TdxTagVariant {
    return this.statusTag === 'New Lead' ? TdxTagVariant.Primary : TdxTagVariant.Success;
  }

  get isContacted(): boolean {
    return this.statusTag === 'Contacted';
  }

  requestPrimaryAction(): void {
    if (!this.isContacted) {
      this.draftSiRequested.emit();
    }
  }

  markAsContacted(): void {
    if (!this.isContacted) {
      this.contacted.emit(this.lead);
    }
  }
}
