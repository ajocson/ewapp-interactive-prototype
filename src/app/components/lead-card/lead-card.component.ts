import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';

import { LeadCardData, leadDisplayName } from '../../lead-board.model';
import { TagTone } from '../../lead-board.model';
import { TdxTagEmphasis, TdxTagVariant } from '../../shared/components/tag/tag.model';

@Component({
  selector: 'lam-lead-card',
  templateUrl: './lead-card.component.html',
  styleUrl: './lead-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LeadCardComponent implements OnDestroy {
  @Input({ required: true }) lead!: LeadCardData;
  @Input() highlighted = false;
  @Input() showTatAging = false;
  @Output() selected = new EventEmitter<LeadCardData>();

  readonly TdxTagEmphasis = TdxTagEmphasis;
  private readonly document = inject(DOCUMENT);
  private tooltipElement: HTMLDivElement | null = null;

  get displayName(): string {
    return leadDisplayName(this.lead);
  }

  get visibleTags() {
    const tags = this.lead.leadType === 'Parked' || this.lead.leadType === 'Dropped'
      ? this.lead.tags.filter((tag) => tag.tone !== 'info')
      : this.lead.tags;

    const activities = this.lead.activities ?? [];
    const followUpCompleted = activities.some((activity) => activity.label === 'Follow-up Presentation Completed');
    return tags.map((tag, index) => {
      if (index !== 0 || tag.label !== 'Follow-up') return tag;
      const scheduledActivities = this.lead.activities.filter((activity) => activity.label === 'Follow Up Scheduled');
      const latestCancellation = activities
        .filter((activity) => activity.label === 'Follow Up Canceled')
        .at(-1)?.occurredAtTimestamp ?? -Infinity;
      const latestUpdate = activities
        .filter((activity) => activity.label === 'Follow-up')
        .at(-1)?.occurredAtTimestamp ?? -Infinity;
      const latestScheduled = scheduledActivities.at(-1)?.occurredAtTimestamp ?? -Infinity;
      const previousScheduled = scheduledActivities.at(-2)?.occurredAtTimestamp ?? -Infinity;
      const followUpCancelled = latestCancellation > latestUpdate && latestCancellation > latestScheduled;
      const appointmentWasCanceledBeforeNewBooking = latestCancellation > previousScheduled && latestCancellation < latestScheduled;
      if (this.lead.appointment && scheduledActivities.length > 1 && !appointmentWasCanceledBeforeNewBooking) return { ...tag, label: 'Follow-up Mtg. Rescheduled', tone: 'primary' as const };
      if (this.lead.appointment) return { ...tag, label: 'Follow-up Mtg. Scheduled' };
      if (followUpCancelled) return { ...tag, label: 'Follow-up Mtg. Cancelled', tone: 'danger' as const };
      if (followUpCompleted) return { ...tag, label: 'Follow-up Mtg. Completed' };
      return tag;
    });
  }

  trackTag(index: number): number {
    return index;
  }

  tagVariant(tone: TagTone): TdxTagVariant {
    return {
      primary: TdxTagVariant.Primary,
      success: TdxTagVariant.Success,
      info: TdxTagVariant.Info,
      danger: TdxTagVariant.Danger,
      neutral: TdxTagVariant.Neutral
    }[tone];
  }

  showAgingTooltip(event: MouseEvent, message: string): void {
    this.hideAgingTooltip();

    const target = event.currentTarget as HTMLElement;
    const tooltip = this.document.createElement('div');
    tooltip.className = 'lead-card-global-tooltip';
    tooltip.textContent = message;
    this.document.body.appendChild(tooltip);

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = this.document.defaultView?.innerWidth ?? tooltipRect.width;
    const left = Math.max(8, Math.min(targetRect.right - tooltipRect.width, viewportWidth - tooltipRect.width - 8));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${targetRect.bottom + 4}px`;
    this.tooltipElement = tooltip;
  }

  hideAgingTooltip(): void {
    this.tooltipElement?.remove();
    this.tooltipElement = null;
  }

  ngOnDestroy(): void {
    this.hideAgingTooltip();
  }
}
