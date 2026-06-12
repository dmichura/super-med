import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordsList } from './medical-records-list';

describe('MedicalRecordsList', () => {
  let component: MedicalRecordsList;
  let fixture: ComponentFixture<MedicalRecordsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalRecordsList],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
