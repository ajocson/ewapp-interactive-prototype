import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { AppNavigationStateService } from '../../shared/services/app-navigation-state.service';
import { TdxButtonSize, TdxButtonVariant } from '../../shared/components/button/button.model';

@Component({
  selector: 'lam-global-header',
  templateUrl: './global-header.component.html',
  styleUrl: './global-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class GlobalHeaderComponent {
  @Input() userType: 'Agency' | 'Banca' = 'Banca';
  @Output() loggedOut = new EventEmitter<void>();
  profileMenuOpen = false;
  readonly buttonSize = TdxButtonSize;
  readonly buttonVariant = TdxButtonVariant;

  constructor(readonly navigation: AppNavigationStateService) {}

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  @HostListener('document:click') closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }
}
