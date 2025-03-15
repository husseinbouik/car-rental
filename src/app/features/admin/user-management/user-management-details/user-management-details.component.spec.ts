import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementDetailsComponent } from './user-management-details.component';

describe('UserManagementDetailsComponent', () => {
  let component: UserManagementDetailsComponent;
  let fixture: ComponentFixture<UserManagementDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserManagementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
