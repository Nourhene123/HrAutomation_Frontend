import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SurveyService } from '../../services/services/survey.service';
import { SurveyDto } from '../../services/models/survey-dto';
import { TokenService } from '../../services/services/token.service';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit {
  surveys: SurveyDto[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private surveyService: SurveyService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserAccess();
    this.loadSurveys();
  }

  checkUserAccess(): void {
    const token = this.tokenService.token;
    if (!token) {
      console.log('Aucun token trouvé, redirection vers /login');
      this.router.navigate(['/login']);
      return;
    }

    const userInfo = this.tokenService.user;
    if (!userInfo || userInfo.UserType !== 1) { // UserType 1 = RH
      console.log('Utilisateur non RH, redirection vers /employee-dashboard');
      this.router.navigate(['/employee-dashboard']);
      return;
    }
  }

  navigateToCreateSurvey(): void {
    this.router.navigate(['/create-survey']);
  }

  loadSurveys(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.surveyService.apiSurveyGetSurveysByRHGet$Json().subscribe({
      next: (surveys: SurveyDto[]) => {
        console.log('Sondages récupérés :', surveys);
        this.surveys = surveys || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des sondages', error);
        this.errorMessage = 'Une erreur est survenue lors de la récupération des sondages.';
        this.isLoading = false;
      }
    });
  }

  viewSurvey(surveyId: string): void {
    this.router.navigate(['/survey-form', surveyId]);
  }

  editSurvey(surveyId: string): void {
    this.router.navigate(['/edit-survey', surveyId]);
  }

  deleteSurvey(surveyId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) {
      this.surveyService.apiSurveyDelete$Json({ id: surveyId }).subscribe({
        next: () => {
          this.surveys = this.surveys.filter(survey => survey.Id !== surveyId);
          alert('Sondage supprimé avec succès.');
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression du sondage', error);
          alert('Une erreur est survenue lors de la suppression du sondage.');
        }
      });
    }
  }

  viewResponses(surveyId: string): void {
    this.router.navigate(['/survey-responses', surveyId]);
  }
}