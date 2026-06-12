import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditEventsList } from './audit-events-list';

describe('AuditEventsList', () => {
  let component: AuditEventsList;
  let fixture: ComponentFixture<AuditEventsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditEventsList],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditEventsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
