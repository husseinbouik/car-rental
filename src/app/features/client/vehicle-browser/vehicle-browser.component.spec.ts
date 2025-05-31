import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleBrowserComponent } from './vehicle-browser.component';

describe('VehicleBrowserComponent', () => {
  let component: VehicleBrowserComponent;
  let fixture: ComponentFixture<VehicleBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleBrowserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
