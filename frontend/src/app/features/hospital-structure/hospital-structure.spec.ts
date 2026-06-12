import { TestBed } from '@angular/core/testing';

import { HospitalStructure } from './hospital-structure';

describe('HospitalStructure', () => {
  let service: HospitalStructure;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HospitalStructure);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
