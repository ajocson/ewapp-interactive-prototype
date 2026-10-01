import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

interface ApplicationPerson {
  readonly title?: string;
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly suffix?: string;
  readonly birthdate?: string;
  readonly gender?: string;
}

@Component({
  selector: 'lam-proposal-application-preview',
  templateUrl: './proposal-application-preview.component.html',
  styleUrl: './proposal-application-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ProposalApplicationPreviewComponent {
  @Input() insured: ApplicationPerson = {};
  @Input() productName = 'Future Assure';
  @Output() sectionRequested = new EventEmitter<'info' | 'profile' | 'proposals'>();

  readonly createdAt = new Date();

  get insuredName(): string {
    return [this.insured.title, this.insured.firstName, this.insured.middleName, this.insured.lastName, this.insured.suffix]
      .filter(Boolean)
      .join(' ') || 'Insured person';
  }

  get birthDateLabel(): string {
    if (!this.insured.birthdate) return '—';
    const [year, month, day] = this.insured.birthdate.split('-').map(Number);
    if (!year || !month || !day) return this.insured.birthdate;
    return new Date(year, month - 1, day).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  get insuredAge(): string {
    if (!this.insured.birthdate) return '—';
    const [year, month, day] = this.insured.birthdate.split('-').map(Number);
    if (!year || !month || !day) return '—';
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
    return String(age);
  }
}
