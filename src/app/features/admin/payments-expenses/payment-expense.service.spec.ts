import { TestBed } from '@angular/core/testing';

import { PaymentExpenseService } from './payment-expense.service';

describe('PaymentExpenseService', () => {
  let service: PaymentExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
