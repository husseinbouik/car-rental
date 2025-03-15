import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementCreateComponent } from './user-management-create.component';

describe('UserManagementCreateComponent', () => {
  let component: UserManagementCreateComponent;
  let fixture: ComponentFixture<UserManagementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserManagementCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
