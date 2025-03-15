import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentExpensesDetailsComponent } from './payment-expenses-details.component';

describe('PaymentExpensesDetailsComponent', () => {
  let component: PaymentExpensesDetailsComponent;
  let fixture: ComponentFixture<PaymentExpensesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentExpensesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentExpensesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
