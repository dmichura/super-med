import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPortalDashboard } from './patient-portal-dashboard';

describe('PatientPortalDashboard', () => {
  let component: PatientPortalDashboard;
  let fixture: ComponentFixture<PatientPortalDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPortalDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPortalDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
