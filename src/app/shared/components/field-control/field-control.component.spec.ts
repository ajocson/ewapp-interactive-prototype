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

  it('supports a fluid design-system field and menu', () => {
    fixture.componentRef.setInput('fluid', true);
    fixture.componentRef.setInput('options', [{ label: 'All', value: 'All' }]);
    fixture.detectChanges();

    const control = fixture.nativeElement.querySelector('.tdx-field-control') as HTMLElement;
    expect(control.classList).toContain('tdx-field-control--fluid');
    expect(control.style.width).toBe('');

    (fixture.nativeElement.querySelector('.tdx-field-control__trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('.tdx-field-control__menu') as HTMLElement).style.width).toBe('');
  });

  it('keeps a multi-select menu open and emits checkbox selections', () => {
    const values: Array<readonly string[]> = [];
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('selectedValues', ['All']);
    fixture.componentRef.setInput('options', [
      { label: 'All', value: 'All' },
      { label: 'Parked', value: 'Parked' }
    ]);
    fixture.componentInstance.selectedValuesChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.tdx-field-control__trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    inputs[1].click();

    expect(values).toEqual([['Parked']]);
    expect(fixture.componentInstance.isOpen).toBe(true);
  });
});
