import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { AppNavigationStateService } from '../shared/services/app-navigation-state.service';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';
import { TdxFieldControlOption } from '../shared/components/field-control/field-control.component';

interface ProposalProduct {
  readonly name: string;
  readonly icon: string;
}

interface ProposalGoal {
  readonly title: string;
  readonly description: string;
}

type ProposalQuestionStep = 1 | 2;

@Component({
  selector: 'lam-proposal-generator',
  templateUrl: './proposal-generator.component.html',
  styleUrl: './proposal-generator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ProposalGeneratorComponent {
  @Input() userType: 'Agency' | 'Banca' = 'Banca';
  @Output() loggedOut = new EventEmitter<void>();
  @Output() newLeadRequested = new EventEmitter<void>();
  @Output() draftSiRequested = new EventEmitter<void>();

  readonly buttonSize = TdxButtonSize;
  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  readonly genderOptions: readonly TdxFieldControlOption[] = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];
  showQuestionnaire = false;
  questionStep: ProposalQuestionStep = 1;
  selectedCoverage: 'myself' | 'someone-else' | null = null;
  selectedGoals: string[] = [];
  birthdate = '';
  gender = '';
  readonly proposalGoals: readonly ProposalGoal[] = [
    {
      title: 'Protect My Loved Ones',
      description: 'Help provide financial security for the people who depend on you.'
    },
    {
      title: 'Prepare for Health Needs',
      description: 'Be financially prepared for unexpected illness or injury.'
    },
    {
      title: 'Grow My Money',
      description: 'Be financially prepared for unexpected illness or injury.'
    }
  ];
  readonly products: readonly ProposalProduct[] = [
    { name: 'Dream Builder', icon: 'assets/proposal-product-dream-builder.png' },
    { name: 'Endowment', icon: 'assets/proposal-product-dream-builder.png' },
    { name: 'Future Assure', icon: 'assets/proposal-product-future-assure.png' },
    { name: 'Future Assure Max (Peso)', icon: 'assets/proposal-product-future-assure-max.png' },
    { name: 'Future Assure Max (US Dollar)', icon: 'assets/proposal-product-future-assure-max.png' },
    { name: 'Future Assure Regular Pay', icon: 'assets/proposal-product-future-assure.png' },
    { name: 'Life Essentials', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Sure Start', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Troo Big 3 Umbrella', icon: 'assets/proposal-product-life-essentials.png' }
  ];

  constructor(readonly navigation: AppNavigationStateService) {}

  get progressPercent(): number {
    return this.questionStep * 20;
  }

  get isQuestionOneComplete(): boolean {
    return Boolean(this.selectedCoverage && this.birthdate.trim() && this.gender);
  }

  get isQuestionTwoComplete(): boolean {
    return this.selectedGoals.length > 0;
  }

  openProposalGenerator(): void {
    this.showQuestionnaire = true;
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.proposal-generator__content')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  cancelQuestionnaire(): void {
    this.showQuestionnaire = false;
    this.questionStep = 1;
    this.selectedCoverage = null;
    this.selectedGoals = [];
    this.birthdate = '';
    this.gender = '';
  }

  continueQuestionnaire(): void {
    if (this.questionStep === 1 && this.isQuestionOneComplete) {
      this.questionStep = 2;
      this.selectedGoals = [];
      this.scrollQuestionnaireToTop();
    }
  }

  toggleGoal(goalTitle: string): void {
    this.selectedGoals = this.selectedGoals.includes(goalTitle)
      ? this.selectedGoals.filter(selectedGoal => selectedGoal !== goalTitle)
      : [...this.selectedGoals, goalTitle];
  }

  private scrollQuestionnaireToTop(): void {
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.proposal-generator__content')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
