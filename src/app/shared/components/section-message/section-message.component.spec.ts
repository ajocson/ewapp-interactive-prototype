import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionMessageComponent } from './section-message.component';
import { SectionMessageModule } from './section-message.module';

describe('SectionMessageComponent', () => {
  let fixture: ComponentFixture<SectionMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SectionMessageModule] }).compileComponents();
    fixture = TestBed.createComponent(SectionMessageComponent);
  });

  it('renders an informational description without optional controls', () => {
    fixture.componentRef.setInput('description', 'Schedule an appointment.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Schedule an appointment.');
    expect(fixture.nativeElement.querySelector('.section-message__dismiss')).toBeNull();
  });
});
