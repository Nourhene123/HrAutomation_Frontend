import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SurveyService } from '../../services/services/survey.service';
import { SurveyDto } from '../../services/models/survey-dto';
import { TokenService } from '../../services/services/token.service';
import { LoginService } from '../../services/services/login.service';

@Component({
  selector: 'app-employee-survey-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-survey-list.component.html',
  styleUrls: ['./employee-survey-list.component.css']
})
export class EmployeeSurveyListComponent implements OnInit {
  surveys: SurveyDto[] = [];
  userName: string = 'Employee';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private surveyService: SurveyService,
    private tokenService: TokenService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadSurveys();
  }

  loadUserInfo(): void {
    const token = this.tokenService.token;
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const userInfo = this.tokenService.user;
    console.log('UserInfo from TokenService:', userInfo);
    if (userInfo) {
      // Récupérer le nom à partir de Firstname ou Lastname (selon la casse utilisée par le backend)
      this.userName = userInfo.Firstname || userInfo.Lastname || userInfo.name || 'Employee';
      console.log('UserName:', this.userName);
    } else {
      console.log('No user info found in TokenService');
      this.userName = 'Employee';
    }
  }

  loadSurveys(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.surveyService.apiSurveyGetSurveysForEmployeeGet$Json().subscribe({
      next: (surveys: SurveyDto[]) => {
        console.log('Surveys retrieved:', surveys);
        this.surveys = surveys || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error while fetching surveys:', error);
        this.errorMessage = 'An error occurred while fetching the surveys.';
        this.isLoading = false;
      }
    });
  }

  respondToSurvey(surveyId: string): void {
    console.log('respondToSurvey called with surveyId:', surveyId);
    if (!surveyId) {
      console.error('Error: surveyId is empty or undefined');
      this.errorMessage = 'Invalid survey ID.';
      return;
    }
    this.router.navigate(['/survey-form', surveyId]).then(success => {
      console.log('Navigation to /survey-form/' + surveyId + ':', success ? 'Successful' : 'Failed');
    });
  }

  logout(): void {
    this.loginService.logout();
    this.tokenService.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}