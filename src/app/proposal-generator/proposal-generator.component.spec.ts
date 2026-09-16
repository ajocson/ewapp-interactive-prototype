import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LamComponentsModule } from '../components/lam-components.module';
import { ButtonModule } from '../shared/components/button/button.module';
import { FieldControlModule } from '../shared/components/field-control/field-control.module';
import { ProposalGeneratorComponent } from './proposal-generator.component';

describe('ProposalGeneratorComponent', () => {
  let fixture: ComponentFixture<ProposalGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonModule, FieldControlModule, LamComponentsModule, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalGeneratorComponent);
    fixture.detectChanges();
  });

  it('opens the first questionnaire state from the hero CTA', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Get Recommended Proposals')) as HTMLButtonElement;

    cta.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-questionnaire')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('QUESTION 1 OF 5');
    expect(fixture.nativeElement.textContent).toContain('Who will be covered by the plan?');
  });

  it('reveals the details fields after a coverage option is selected', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Get Recommended Proposals')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-details-card')).toBeNull();
    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-details-card')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Few Details to Get Started');
    expect(fixture.nativeElement.querySelector('[aria-label="Birthdate"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Select Gender');
  });

  it('keeps Continue disabled until the details form is complete', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Get Recommended Proposals')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.detectChanges();

    let continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.trim() === 'Continue') as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);

    const birthdateInput = fixture.nativeElement.querySelector('[aria-label="Birthdate"]') as HTMLInputElement;
    birthdateInput.value = '1990-01-01';
    birthdateInput.dispatchEvent(new Event('input'));
    fixture.componentInstance.gender = 'Male';
    fixture.detectChanges();
    continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.trim() === 'Continue') as HTMLButtonElement;
    expect(continueButton.disabled).toBe(false);
  });

  it('moves to Question 2 and toggles multiple plan goals', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Get Recommended Proposals')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.componentInstance.birthdate = '1990-01-01';
    fixture.componentInstance.gender = 'Male';
    fixture.detectChanges();

    const continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.trim() === 'Continue') as HTMLButtonElement;
    continueButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 2 OF 5');
    expect(fixture.nativeElement.textContent).toContain('What would you like the plan to help with?');
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.proposal-details-card')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-questionnaire__footer').textContent).toContain('Back');
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card__checkbox').length).toBe(3);
    expect(getComputedStyle(fixture.nativeElement.querySelector('.proposal-goal-card__checkbox')).width).toBe('14px');
    expect(getComputedStyle(fixture.nativeElement.querySelector('.proposal-goal-card')).minHeight).toBe('0px');

    const goalCards = fixture.nativeElement.querySelectorAll('.proposal-goal-card') as NodeListOf<HTMLButtonElement>;
    goalCards[0].click();
    goalCards[2].click();
    fixture.detectChanges();

    expect(goalCards[0].getAttribute('aria-pressed')).toBe('true');
    expect(goalCards[2].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedGoals).toEqual(['Protect My Loved Ones', 'Grow My Money']);
  });
});
