import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Ajout de RouterModule
import { SurveyService } from '../../services/services/survey.service';
import { SurveyDto, SurveyQuestionDto } from '../../services/models/survey-dto';
import { SubmitSurveyResponseDto } from '../../services/models/submit-survey-response-dto';

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Ajout de RouterModule
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css']
})
export class SurveyFormComponent implements OnInit {
  survey: SurveyDto | null = null;
  surveyId: string | null = null;
  responses: { [key: string]: string | string[] } = {};
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('SurveyFormComponent: ngOnInit called');
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
    console.log('surveyId:', this.surveyId);
    if (this.surveyId) {
      this.loadSurvey();
    } else {
      console.error('Error: surveyId not provided');
      this.errorMessage = 'Survey ID not provided.';
      this.navigateToDashboard();
    }
  }

  loadSurvey(): void {
    if (!this.surveyId) return;
    this.isLoading = true;
    this.surveyService.apiSurveyGetById$Json({ id: this.surveyId }).subscribe({
      next: (survey: SurveyDto) => {
        this.survey = survey;
        this.initializeResponses();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error while fetching the survey:', error);
        this.errorMessage = 'Error while loading the survey.';
        this.isLoading = false;
        this.navigateToDashboard();
      }
    });
  }

  initializeResponses(): void {
    if (this.survey) {
      this.survey.Questions.forEach((question: SurveyQuestionDto) => {
        if (question.Type === 'checkbox') {
          this.responses[question.Id] = [];
        } else {
          this.responses[question.Id] = '';
        }
      });
    }
  }

  isOptionSelected(questionId: string, option: string): boolean {
    const currentResponses = this.responses[questionId] as string[];
    return currentResponses?.includes(option) || false;
  }

  updateCheckbox(questionId: string, option: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      const checked = target.checked;
      const currentResponses = this.responses[questionId] as string[];
      if (checked) {
        currentResponses.push(option);
      } else {
        const index = currentResponses.indexOf(option);
        if (index !== -1) {
          currentResponses.splice(index, 1);
        }
      }
      this.responses[questionId] = currentResponses;
    }
  }

  submitSurvey(): void {
    if (!this.surveyId || !this.survey) {
      console.error('Error: surveyId or survey not defined');
      this.errorMessage = 'Survey data missing.';
      return;
    }

    const responseDtos: SubmitSurveyResponseDto[] = [];
    for (const questionId in this.responses) {
      const question = this.survey.Questions.find(q => q.Id === questionId);
      if (!question) continue;

      let answer = this.responses[questionId];
      let answerString: string;

      if (Array.isArray(answer)) {
        // Checkbox
        answerString = answer.join(',');
      } else if (question.Type === 'rating') {
        // Rating: ensure the value is a valid number between 1 and 5
        const ratingValue = Number(answer);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
          console.error('Invalid rating value:', answer);
          this.errorMessage = `Please enter a rating between 1 and 5 for the question: ${question.Text}`;
          return;
        }
        answerString = ratingValue.toString();
      } else {
        // Text, radio
        answerString = answer?.toString() || '';
      }

      // Check required questions
      if (question.Required && !answerString) {
        console.error('Required question without answer:', question);
        this.errorMessage = `Please answer the question: ${question.Text}`;
        return;
      }

      if (answerString) {
        responseDtos.push({
          surveyId: this.surveyId!,
          questionId: questionId,
          answer: answerString
        });
      }
    }

    console.log('Responses to submit:', responseDtos);

    if (!responseDtos.length) {
      console.error('No responses to submit');
      this.errorMessage = 'Please answer at least one question.';
      return;
    }

    this.isLoading = true;
    this.surveyService.apiSurveyRespondPost$Json({ body: responseDtos }).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('Thank you for your responses! They have been submitted successfully.');
        this.navigateToDashboard();
      },
      error: (error) => {
        console.error('Error while submitting responses:', error);
        this.errorMessage = 'Error while submitting responses. Please try again.';
        this.isLoading = false;
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/employee-dashboard']);
  }
}