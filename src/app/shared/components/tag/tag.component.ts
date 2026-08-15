import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TdxTagEmphasis, TdxTagVariant } from './tag.model';

@Component({ selector: 'tdx-tag, app-tag', templateUrl: './tag.component.html', styleUrl: './tag.component.scss', changeDetection: ChangeDetectionStrategy.OnPush, standalone: false })
export class TagComponent {
  @Input() label = 'Tag';
  @Input() variant: TdxTagVariant = TdxTagVariant.Neutral;
  @Input() emphasis: TdxTagEmphasis = TdxTagEmphasis.Subtle;
  get tagClasses(): Record<string, boolean> { return { [`tdx-tag--${this.variant}`]: true, [`tdx-tag--${this.emphasis}`]: true }; }
}
