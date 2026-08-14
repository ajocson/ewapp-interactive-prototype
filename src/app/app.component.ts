import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lam-root',
  template: '<lam-dashboard />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AppComponent {}
