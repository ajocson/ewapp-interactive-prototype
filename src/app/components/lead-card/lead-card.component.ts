import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LeadCardData } from '../../lead-board.model';
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
  @Output() selected = new EventEmitter<LeadCardData>();

  readonly TdxTagEmphasis = TdxTagEmphasis;

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
