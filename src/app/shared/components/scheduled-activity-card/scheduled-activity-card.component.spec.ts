import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ScheduledActivityCardComponent } from './scheduled-activity-card.component';
import { ScheduledActivityCardModule } from './scheduled-activity-card.module';

describe('ScheduledActivityCardComponent', () => {
  let fixture: ComponentFixture<ScheduledActivityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ScheduledActivityCardModule] }).compileComponents();
    fixture = TestBed.createComponent(ScheduledActivityCardComponent);
    fixture.componentRef.setInput('date', 'August 24, 2026');
    fixture.componentRef.setInput('time', '3:00-3:30 PM');
    fixture.detectChanges();
  });

  it('renders compact appointment details and emits both actions', () => {
    const reschedule = vi.fn();
    const cancelAppointment = vi.fn();
    fixture.componentInstance.reschedule.subscribe(reschedule);
    fixture.componentInstance.cancelAppointment.subscribe(cancelAppointment);

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    buttons[1].click();

    expect(fixture.nativeElement.textContent).toContain('August 24, 2026');
    expect(fixture.nativeElement.textContent).toContain('3:00-3:30 PM');
    expect(reschedule).toHaveBeenCalledOnce();
    expect(cancelAppointment).toHaveBeenCalledOnce();
  });
});
