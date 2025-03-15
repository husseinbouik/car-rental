import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentExpensesCreateComponent } from './payment-expenses-create.component';

describe('PaymentExpensesCreateComponent', () => {
  let component: PaymentExpensesCreateComponent;
  let fixture: ComponentFixture<PaymentExpensesCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentExpensesCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentExpensesCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
