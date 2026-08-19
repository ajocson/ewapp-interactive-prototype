import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldControlComponent } from './field-control.component';
import { FieldControlModule } from './field-control.module';

describe('FieldControlComponent', () => {
  let fixture: ComponentFixture<FieldControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FieldControlModule] }).compileComponents();
    fixture = TestBed.createComponent(FieldControlComponent);
  });

  it('emits a selected value with an accessible label', () => {
    const values: string[] = [];
    fixture.componentRef.setInput('ariaLabel', 'Source of lead');
    fixture.componentRef.setInput('value', 'All Sources');
    fixture.componentRef.setInput('options', [
      { label: 'All Sources', value: 'All Sources' },
      { label: 'Referral', value: 'Referral' }
    ]);
    fixture.componentInstance.valueChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.tdx-field-control__trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('.tdx-field-control__menu button') as NodeListOf<HTMLButtonElement>;
    options[1].click();

    expect(values).toEqual(['Referral']);
    expect(trigger.getAttribute('aria-label')).toBe('Source of lead');
  });

  it('emits activation for an action control', () => {
    let activated = false;
    fixture.componentRef.setInput('label', 'Filter');
    fixture.componentInstance.activated.subscribe(() => activated = true);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(activated).toBe(true);
  });

  it('supports the compact design-system size and a controlled menu width', () => {
    fixture.componentRef.setInput('compact', true);
    fixture.componentRef.setInput('menuWidth', 204);
    fixture.componentRef.setInput('options', [{ label: 'All', value: 'All' }]);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.tdx-field-control__trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.tdx-field-control').classList).toContain('tdx-field-control--compact');
    expect((fixture.nativeElement.querySelector('.tdx-field-control__menu') as HTMLElement).style.width).toBe('204px');
  });
});
