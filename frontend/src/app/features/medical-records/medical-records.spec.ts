import { TestBed } from '@angular/core/testing';

import { MedicalRecords } from './medical-records';

describe('MedicalRecords', () => {
  let service: MedicalRecords;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalRecords);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
