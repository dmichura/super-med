import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordDetails } from './medical-record-details';

describe('MedicalRecordDetails', () => {
  let component: MedicalRecordDetails;
  let fixture: ComponentFixture<MedicalRecordDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalRecordDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
