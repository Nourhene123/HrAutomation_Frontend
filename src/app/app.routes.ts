import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Component/login/login.component';
import { DashboardComponent } from './Component/dashboard/dashboard.component';
import { LayoutComponent } from './Component/layout/layout.component';
import { RegisterComponent } from './Component/register/register.component';
import { JobOffersComponent } from './Component/job-offers/job-offers.component';
import { JobOfferCandidatesComponent } from './Component/job-offer-candidates/job-offer-candidates.component';
import { CondidatesComponent } from './Component/condidates/condidates.component';
import { EmployeesComponent } from './Component/employees/employees.component';
import { HomeComponent } from './Component/home/home.component';
import { competenceResolver } from './resolver/competence-resolver';
import { authenticationGuard } from './guard/auth-guard.guard';
import { rhGuard } from './guard/rh-guard.guard';
import { candidatGuard } from './guard/candidat-guard.guard';
import { ChatbotComponent } from './Component/shared/chatbot/chatbot.component';
import { EmployeePerformanceComponent } from './Component/employees/employee-performance/employee-performance.component';
import { MyApplicationsComponent } from './Component/my-applications/my-applications.component';
import { SurveyListComponent } from './Component/survey-list/survey-list.component';
import { CreateSurveyComponent } from './Component/create-survey/create-survey.component';
import { SurveyFormComponent } from './Component/survey-form/survey-form.component';
import { EditSurveyComponent } from './edit-survey/edit-survey.component';
import { EmployeeDashboardComponent } from './Component/employee-dashboard/employee-dashboard.component';
import { SurveyResponsesComponent } from './Component/survey-responses/survey-responses.component';
import { EmployeeSurveyListComponent } from './Component/employee-survey-list/employee-survey-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'register',
    component: RegisterComponent,
    resolve: { competences: competenceResolver }
  },
  { path: 'performance/:id', component: EmployeePerformanceComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authenticationGuard, candidatGuard] // Ajout de candidatGuard si applicable
  },
  {
    path: 'applications',
    component: MyApplicationsComponent,
    canActivate: [authenticationGuard]
  },
  {
    path: 'survey-form/:surveyId',
    component: SurveyFormComponent,
    canActivate: [authenticationGuard]
  },
  {
    path: 'employee-dashboard',
    component: EmployeeDashboardComponent,
    canActivate: [authenticationGuard]
  },
  {
    path: 'employee-survey-list',
    component: EmployeeSurveyListComponent,
    canActivate: [authenticationGuard]
  },
  {
    path: 'survey-responses/:surveyId',
    component: SurveyResponsesComponent,
    canActivate: [authenticationGuard, rhGuard]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authenticationGuard, rhGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'create-survey', component: CreateSurveyComponent },
      { path: 'survey-list', component: SurveyListComponent },
      { path: 'edit-survey/:id', component: EditSurveyComponent },
      {
        path: 'JobOffers',
        component: JobOffersComponent,
        resolve: { competences: competenceResolver },
        children: [
          { path: ':id/candidates', component: JobOfferCandidatesComponent }
        ]
      },
      { path: 'Condidates', component: CondidatesComponent },
      { path: 'Employees', component: EmployeesComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];