import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCardModule } from './action-card.module';
import { ActionCardComponent } from './action-card.component';

describe('ActionCardComponent', () => {
  let fixture: ComponentFixture<ActionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActionCardModule] }).compileComponents();
    fixture = TestBed.createComponent(ActionCardComponent);
    fixture.componentRef.setInput('title', 'Schedule Appointment');
    fixture.componentRef.setInput('description', 'Set a date and time for your client appointment.');
    fixture.detectChanges();
  });

  it('emits from a semantic button', () => {
    const activated = vi.fn();
    fixture.componentInstance.activated.subscribe(activated);
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(activated).toHaveBeenCalledOnce();
  });
});

