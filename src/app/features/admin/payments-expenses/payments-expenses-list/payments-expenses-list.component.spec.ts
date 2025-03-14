import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsExpensesListComponent } from './payments-expenses-list.component';

describe('PaymentsExpensesListComponent', () => {
  let component: PaymentsExpensesListComponent;
  let fixture: ComponentFixture<PaymentsExpensesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsExpensesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsExpensesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
