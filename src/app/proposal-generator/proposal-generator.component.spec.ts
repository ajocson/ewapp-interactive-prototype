import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';

import { LamComponentsModule } from '../components/lam-components.module';
import { ButtonModule } from '../shared/components/button/button.module';
import { FieldControlModule } from '../shared/components/field-control/field-control.module';
import { ProposalGeneratorComponent } from './proposal-generator.component';
import { MeshGradientComponent } from './mesh-gradient.component';
import { ProposalRecommendationDetailModule } from './proposal-recommendation-detail.module';

describe('ProposalGeneratorComponent', () => {
  let fixture: ComponentFixture<ProposalGeneratorComponent>;

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await TestBed.configureTestingModule({
      imports: [ButtonModule, FieldControlModule, LamComponentsModule, MeshGradientComponent, ProposalRecommendationDetailModule, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalGeneratorComponent);
    fixture.detectChanges();
  });

  afterEach(() => vi.restoreAllMocks());

  it('opens the first questionnaire state from the hero CTA', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;

    cta.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-questionnaire')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('QUESTION 1 OF 7');
    expect(fixture.nativeElement.textContent).toContain('Who will be covered by the plan?');
  });

  it('supports opening directly in the recommendations view', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    expect(fixture.componentInstance.showQuestionnaire).toBe(true);
    expect(fixture.componentInstance.showRecommendations).toBe(true);
    expect(fixture.nativeElement.querySelector('#proposal-recommendations-title')?.textContent).toContain('We’ve prepared three proposals for you');
  });

  it('renders the animated gradient inside the recommendations banner', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    const gradient = fixture.nativeElement.querySelector('app-mesh-gradient') as HTMLElement;

    expect(gradient).not.toBeNull();
    expect(gradient.parentElement?.classList.contains('proposal-recommendations__more-options')).toBe(true);
    expect(gradient.classList.contains('mesh-gradient--banner')).toBe(true);
    expect(gradient.getAttribute('aria-hidden')).toBe('true');
  });

  it('opens the selected proposal detail and returns to recommendations', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    const proposalContent = fixture.nativeElement.querySelector('.proposal-generator__content') as HTMLElement;
    proposalContent.scrollTop = 480;
    const viewProposal = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('View Proposal')) as HTMLButtonElement;
    viewProposal.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.showProposalDetails).toBe(true);
    expect(proposalContent.scrollTop).toBe(0);
    expect(fixture.nativeElement.querySelector('#proposal-detail-title')?.textContent).toContain('Dream Builder');
    expect(fixture.nativeElement.querySelector('.proposal-detail__summary')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Benefits and Premiums');
    expect(fixture.nativeElement.textContent).toContain('₱250,000');

    proposalContent.scrollTop = 480;
    (fixture.nativeElement.querySelector('.proposal-detail__back') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.showProposalDetails).toBe(false);
    expect(proposalContent.scrollTop).toBe(0);
    expect(fixture.nativeElement.querySelector('#proposal-recommendations-title')).not.toBeNull();
  });

  it('opens hidden proposal detail tabs from the overflow menu', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('View Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();

    const overflowButton = fixture.nativeElement.querySelector('.proposal-detail__tab-overflow-trigger') as HTMLButtonElement;
    const tabList = fixture.nativeElement.querySelector('.proposal-detail__tabs') as HTMLElement;
    Object.defineProperty(tabList, 'scrollWidth', { configurable: true, value: 700 });
    overflowButton.click();
    fixture.detectChanges();
    expect(overflowButton.getAttribute('aria-expanded')).toBe('true');

    const fundsMenuItem = Array.from(fixture.nativeElement.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Fund Allocation')) as HTMLButtonElement;
    fundsMenuItem.click();
    fixture.detectChanges();

    expect(overflowButton.getAttribute('aria-expanded')).toBe('false');
    expect(tabList.scrollLeft).toBe(700);
    expect(overflowButton.classList.contains('has-active-tab')).toBe(false);
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds h2')?.textContent).toBe('Fund Allocation');
    expect(fixture.nativeElement.querySelectorAll('#proposal-panel-funds .proposal-detail__protection-table tbody tr')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds')?.textContent).toContain('Balanced Fund');
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds')?.textContent).toContain('Asian Equity Fund');
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds')?.textContent).toContain('Total Allocation');
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds .material-symbols-rounded')).toBeNull();

    overflowButton.click();
    fixture.detectChanges();
    const aboutMenuItem = Array.from(fixture.nativeElement.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('About the Product')) as HTMLButtonElement;
    aboutMenuItem.click();
    fixture.detectChanges();

    const aboutPanel = fixture.nativeElement.querySelector('#proposal-panel-about') as HTMLElement;
    expect(aboutPanel.querySelector('h2')?.textContent).toBe('About Dream Builder');
    expect(aboutPanel.querySelectorAll('.proposal-detail__about-list article')).toHaveLength(6);
    expect(aboutPanel.textContent).toContain('Why Future Assure?');
    expect(aboutPanel.textContent).toContain('Important Notes');
    expect(aboutPanel.querySelector('.material-symbols-rounded')).toBeNull();
    expect(aboutPanel.querySelector('button')).toBeNull();
  });

  it('shows carousel indicators and updates the selected recommendation', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.proposal-recommendations__carousel-dots button') as NodeListOf<HTMLButtonElement>;
    const cards = fixture.nativeElement.querySelectorAll('.proposal-recommendation-card') as NodeListOf<HTMLElement>;
    expect(dots).toHaveLength(3);
    expect(fixture.componentInstance.activeRecommendationIndex).toBe(1);
    expect(cards[1].classList.contains('is-centered')).toBe(true);

    dots[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeRecommendationIndex).toBe(0);
    expect(cards[0].classList.contains('is-centered')).toBe(true);
    expect(cards[1].classList.contains('is-centered')).toBe(false);
    expect(dots[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('provides mobile comparison cards with the best match first and all comparison rows', () => {
    const cards = fixture.componentInstance.mobileComparisonCards;

    expect(cards).toHaveLength(3);
    expect(cards[0].recommendation.name).toBe('Future Assure');
    expect(cards[0].bestFor).toBe('Balanced protection and growth');
    expect(cards[0].rows).toHaveLength(7);
    expect(cards[0].rows[0].label).toBe('Annual Premium');
    expect(cards[0].rows[1].label).toBe('Riders');
    expect(cards[0].rows[2].label).toBe('Maximum Coverage Period');
    expect(cards[1].recommendation.name).toBe('Dream Builder');
    expect(cards[2].recommendation.name).toBe('Future Assure Max (Peso)');
  });

  it('shows the details fields after choosing who will be covered', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-details-card')).toBeNull();

    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-details-card')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('A few details about the person being covered');
    expect(fixture.nativeElement.querySelector('[aria-label="Birthdate"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Select Gender');
  });

  it('keeps Next disabled until the details form is complete', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.detectChanges();

    let continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);

    const birthdateInput = fixture.nativeElement.querySelector('[aria-label="Birthdate"]') as HTMLInputElement;
    birthdateInput.value = '1990-01-01';
    birthdateInput.dispatchEvent(new Event('input'));
    fixture.componentInstance.gender = 'Male';
    fixture.detectChanges();
    continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(false);
  });

  it('moves to Question 2 and toggles multiple plan goals', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.componentInstance.birthdate = '1990-01-01';
    fixture.componentInstance.gender = 'Male';
    fixture.detectChanges();

    const continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    continueButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 2 OF 7');
    expect(fixture.nativeElement.textContent).toContain('What would you like the plan to help with?');
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.proposal-details-card')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-questionnaire__footer').textContent).toContain('Back');
    expect(fixture.nativeElement.textContent).toContain('You can select more than one.');
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card__illustration').length).toBe(3);
    const goalCards = fixture.nativeElement.querySelectorAll('.proposal-goal-card') as NodeListOf<HTMLButtonElement>;
    goalCards[0].click();
    goalCards[2].click();
    fixture.detectChanges();

    expect(goalCards[0].getAttribute('aria-pressed')).toBe('true');
    expect(goalCards[2].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card__selection').length).toBe(2);
    expect(fixture.componentInstance.selectedGoals).toEqual(['Protect My Loved Ones', 'Grow My Money']);

    continueButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 3 OF 7');
    expect(fixture.nativeElement.textContent).toContain('How much would you like to set aside each year?');
    expect(fixture.nativeElement.querySelector('#proposal-budget-range')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.proposal-budget-card__quick-select button').length).toBe(6);
    expect(fixture.nativeElement.querySelector('.proposal-budget-card .sr-only')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-budget-card__quick-select button').getAttribute('data-size')).toBe('small');

    const nextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 4 OF 7');
    expect(fixture.nativeElement.textContent).toContain('Tell us a bit about the person being covered.');
    const lifeStageCards = fixture.nativeElement.querySelectorAll('.proposal-life-stage-card') as NodeListOf<HTMLButtonElement>;
    expect(lifeStageCards.length).toBe(5);
    lifeStageCards[1].click();
    fixture.detectChanges();

    expect(lifeStageCards[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedLifeStage).toBe('Growing Family');

    const questionFourNextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    questionFourNextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 5 OF 7');
    expect(fixture.nativeElement.textContent).toContain('What else would you like protection for?');
    const protectionCards = fixture.nativeElement.querySelectorAll('.proposal-protection-card') as NodeListOf<HTMLButtonElement>;
    expect(protectionCards.length).toBe(4);

    protectionCards[0].click();
    protectionCards[1].click();
    fixture.detectChanges();

    expect(protectionCards[0].getAttribute('aria-pressed')).toBe('true');
    expect(protectionCards[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedProtections).toEqual(['Critical Illness', 'Accidents']);

    const questionFiveNextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    questionFiveNextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 6 OF 7');
    expect(fixture.nativeElement.textContent).toContain('How comfortable are you with investment risk?');
    const riskCards = fixture.nativeElement.querySelectorAll('.proposal-risk-card') as NodeListOf<HTMLButtonElement>;
    expect(riskCards.length).toBe(3);

    riskCards[1].click();
    fixture.detectChanges();

    expect(riskCards[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedRiskPreference).toBe('Balanced');

    const questionSixNextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    questionSixNextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 7 OF 7');
    expect(fixture.nativeElement.textContent).toContain('Where would you prefer to invest?');
    const investmentCards = fixture.nativeElement.querySelectorAll('.proposal-investment-card') as NodeListOf<HTMLButtonElement>;
    expect(investmentCards.length).toBe(3);

    investmentCards[2].click();
    fixture.detectChanges();

    expect(investmentCards[2].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedInvestmentPreference).toBe('A Mix of Both');
    expect(fixture.nativeElement.textContent).toContain('Generate Proposals');
  });

  it('shows recommendations after generating proposals', () => {
    vi.useFakeTimers();
    try {
      const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
      cta.click();
      fixture.detectChanges();
      fixture.componentInstance.questionStep = 7;
      fixture.componentInstance.selectedInvestmentPreference = 'A Mix of Both';
      fixture.componentRef.changeDetectorRef.markForCheck();
      fixture.componentRef.changeDetectorRef.detectChanges();

      fixture.componentInstance.continueQuestionnaire();
      expect(fixture.componentInstance.isGeneratingProposals).toBe(true);

      vi.advanceTimersByTime(2400);
      expect(fixture.componentInstance.isGeneratingProposals).toBe(false);
      expect(fixture.componentInstance.showRecommendations).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns to the completed questionnaire or product list from recommendations', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    fixture.componentInstance.showRecommendations = true;
    fixture.componentInstance.questionStep = 7;
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    fixture.componentInstance.returnToQuestionnaire();
    expect(fixture.componentInstance.showRecommendations).toBe(false);
    expect(fixture.componentInstance.isGeneratingProposals).toBe(false);
    expect(fixture.componentInstance.questionStep).toBe(7);

    fixture.componentInstance.showRecommendations = true;
    fixture.componentInstance.browseAllProducts();
    expect(fixture.componentInstance.showQuestionnaire).toBe(false);
    expect(fixture.componentInstance.showRecommendations).toBe(false);
  });

  it('preserves earlier answers when editing and moving through the questionnaire again', () => {
    const component = fixture.componentInstance;
    component.selectedCoverage = 'myself';
    component.birthdate = '1990-01-01';
    component.gender = 'Female';
    component.selectedGoals = ['Build wealth'];
    component.selectedProtections = ['Critical Illness'];
    component.selectedLifeStage = 'Growing Family';
    component.selectedRiskPreference = 'Balanced';
    component.selectedInvestmentPreference = 'Global Opportunities';

    component.editAnswers();
    expect(component.questionStep).toBe(1);
    expect(component.selectedCoverage).toBe('myself');
    expect(component.selectedGoals).toEqual(['Build wealth']);
    expect(component.selectedProtections).toEqual(['Critical Illness']);
    expect(component.selectedLifeStage).toBe('Growing Family');
    expect(component.selectedRiskPreference).toBe('Balanced');
    expect(component.selectedInvestmentPreference).toBe('Global Opportunities');

    component.continueQuestionnaire();
    expect(component.questionStep).toBe(2);
    expect(component.selectedGoals).toEqual(['Build wealth']);
    component.questionStep = 4;
    component.continueQuestionnaire();
    expect(component.questionStep).toBe(5);
    expect(component.selectedProtections).toEqual(['Critical Illness']);
    component.questionStep = 6;
    component.continueQuestionnaire();
    expect(component.questionStep).toBe(7);
    expect(component.selectedInvestmentPreference).toBe('Global Opportunities');
  });
});
