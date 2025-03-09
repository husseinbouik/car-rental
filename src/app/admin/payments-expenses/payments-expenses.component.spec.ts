import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsExpensesComponent } from './payments-expenses.component';

describe('PaymentsExpensesComponent', () => {
  let component: PaymentsExpensesComponent;
  let fixture: ComponentFixture<PaymentsExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
