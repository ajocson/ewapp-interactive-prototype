import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperComponent } from './stepper.component';
import { StepperModule } from './stepper.module';

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StepperModule] }).compileComponents();
    fixture = TestBed.createComponent(StepperComponent);
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.componentRef.setInput('currentIndex', 1);
    fixture.componentRef.setInput('steps', [
      { label: 'Contacted' }, { label: 'Appointment' }, { label: 'Meeting' }, { label: 'Application' }
    ]);
    fixture.detectChanges();
  });

  it('maps progress to the TDX visual states', () => {
    const elements = fixture.nativeElement.querySelectorAll('[data-state]') as NodeListOf<Element>;
    const states = Array.from(elements).map(element => element.getAttribute('data-state'));

    expect(states).toEqual(['completed', 'current', 'upcoming', 'upcoming']);
  });
});
