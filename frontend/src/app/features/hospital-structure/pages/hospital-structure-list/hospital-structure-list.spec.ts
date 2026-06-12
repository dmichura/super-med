import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalStructureList } from './hospital-structure-list';

describe('HospitalStructureList', () => {
  let component: HospitalStructureList;
  let fixture: ComponentFixture<HospitalStructureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalStructureList],
    }).compileComponents();

    fixture = TestBed.createComponent(HospitalStructureList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
