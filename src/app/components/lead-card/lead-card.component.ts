import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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
export class LeadCardComponent {
  @Input({ required: true }) lead!: LeadCardData;
  @Input() highlighted = false;
  @Output() selected = new EventEmitter<LeadCardData>();

  readonly TdxTagEmphasis = TdxTagEmphasis;

  get displayName(): string {
    return leadDisplayName(this.lead);
  }

  get visibleTags() {
    return this.lead.leadType === 'Parked' || this.lead.leadType === 'Dropped'
      ? this.lead.tags.filter((tag) => tag.tone !== 'info')
      : this.lead.tags;
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
}
