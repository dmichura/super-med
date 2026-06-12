import { TestBed } from '@angular/core/testing';

import { PatientPortal } from './patient-portal';

describe('PatientPortal', () => {
  let service: PatientPortal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientPortal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
