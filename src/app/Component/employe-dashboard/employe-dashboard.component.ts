import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SurveyService } from '../../services/services/survey.service';
import { TokenService } from '../../services/services/token.service';
import { LoginService } from '../../services/services/login.service';
import { SurveyDto } from '../../services/models/survey-dto';
import { UserType } from '../../services/models/UserType';
import { ChatbotComponent } from "../shared/chatbot/chatbot.component";
import { Chart } from 'chart.js';
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Suppression de ChatbotComponent
  templateUrl: './employee-dashboard-component.component.html',
  styleUrls: ['./employee-dashboard-component.component.css']
})
export class EmployeeDashboardComponent implements OnInit {

  userName: string = '';
  userRole: string = '';
  userPosition: string = '';
  
  // Notification data
  notificationCount: number = 3;
  notifications: any[] = [
    {
      title: "Nouvelle tâche assignée",
      message: "Vous avez une nouvelle tâche: 'Mettre à jour le module d'authentification'",
      time: "10MIN"
    },
    {
      title: "Sondage bien-être",
      message: "Nouveau sondage disponible sur votre bien-être au travail",
      time: "1H"
    },
    {
      title: "Document RH",
      message: "Votre contrat de travail a été mis à jour",
      time: "2J"
    }
  ];

  // Quick stats
  taskCount: number = 5;
  leaveDays: number = 12;
  performanceScore: number = 8.5;

  // Recent tasks
  recentTasks: any[] = [
    {
      id: 1,
      title: "Corriger le bug de connexion",
      dueDate: new Date('2023-06-15'),
      priority: "Haute",
      priorityClass: "danger",
      completed: false
    },
    {
      id: 2,
      title: "Mettre à jour la documentation",
      dueDate: new Date('2023-06-18'),
      priority: "Moyenne",
      priorityClass: "warning",
      completed: true
    },
    {
      id: 3,
      title: "Préparer la présentation pour l'équipe",
      dueDate: new Date('2023-06-20'),
      priority: "Basse",
      priorityClass: "success",
      completed: false
    }
  ];

  // Survey data
  surveyCompletion: number = 30;

  // Performance metrics
  attendancePercentage: number = 95;
  taskCompletion: number = 85;
  qualityScore: number = 4.2;
  productivityScore: number = 88;
  performanceChart: any;
  constructor(private router: Router) {}


  ngOnInit(): void {
    this.createPerformanceChart();
  }

  createPerformanceChart(): void {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    
    this.performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Performance',
          data: [7.2, 7.5, 8.0, 8.3, 8.1, 8.5],
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          pointBackgroundColor: '#4e73df',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#4e73df',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 6,
            max: 10,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  toggleTask(taskId: number): void {
    const task = this.recentTasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.updateTaskStats();
    }
  }

  updateTaskStats(): void {
    const completedTasks = this.recentTasks.filter(t => t.completed).length;
    this.taskCompletion = Math.round((completedTasks / this.recentTasks.length) * 100);
  }

  logout(): void {
    console.log('Déconnexion de l\'utilisateur');
    // this.router.navigate(['/login']);
  }
}