import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSurveyListComponent } from './employee-survey-list.component';

describe('EmployeeSurveyListComponent', () => {
  let component: EmployeeSurveyListComponent;
  let fixture: ComponentFixture<EmployeeSurveyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSurveyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSurveyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
