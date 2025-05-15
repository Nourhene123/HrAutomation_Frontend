import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { EmployeeService } from '../../../services/services';
import { EmployeDto } from '../../../services/models/employe-dto';
import { PerformanceReview } from '../../../services/models/performance-review.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-performance',
  templateUrl: './employee-performance.component.html',
  styleUrls: ['./employee-performance.component.css'],
  imports: [CommonModule,RouterModule],
  standalone: true
})
export class EmployeePerformanceComponent implements OnInit {
  employeeId!: string;
  employee!: EmployeDto;
  performanceReviews: PerformanceReview[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  charts: Chart[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id')!;
    this.loadEmployeeData();
    this.loadPerformanceReviews();
  }

  loadEmployeeData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.getEmployee(this.employeeId)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Failed to load employee data. Please try again later.';
          console.error('Error fetching employee:', error);
          return of(null);
        })
      )
      .subscribe(employee => {
        if (employee) {
          this.employee = {
            id: employee.Id,
            firstname: employee.Firstname,
            lastname: employee.Lastname,
            email: employee.Email,
            poste: employee.Poste,
            department: employee.Firstname
          } as EmployeDto;
        }
      });
  }

  loadPerformanceReviews(): void {
    this.employeeService.getPerformanceReviews(this.employeeId)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Failed to load performance data. Please try again later.';
          console.error('Error fetching performance reviews:', error);
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(reviews => {
        this.performanceReviews = reviews;
        if (reviews.length > 0) {
          setTimeout(() => this.initCharts(), 100);
        } else {
          this.errorMessage = 'No performance data available for this employee.';
        }
      });
  }

  initCharts(): void {
    // Destroy existing charts to prevent memory leaks
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    // Get the latest performance review
    const latestReview = this.performanceReviews[0];
    const allReviews = [...this.performanceReviews].reverse(); // Oldest first for trends

    // Attendance Data
    const presentDays = 22 - latestReview.Absences; // Assuming 22 working days/month
    const absentDays = latestReview.Absences;

    // Task Performance Data
    const totalTasks = latestReview.TasksCompleted + Math.floor(latestReview.TasksCompleted * (1 - (latestReview.OnTimeCompletionRate / 100)));
    const completedOnTime = Math.floor(latestReview.TasksCompleted * (latestReview.OnTimeCompletionRate / 100));
    const completedLate = latestReview.TasksCompleted - completedOnTime;

    // Productivity Trend Data
    const productivityScores = allReviews.map(review => review.OverallScore);
    const productivityLabels = allReviews.map((_, index) => `Review ${index + 1}`);

    // Client Satisfaction Data
    const clientSatisfactionScores = allReviews.map(review => review.ClientSatisfactionScore);
    const clientSatisfactionLabels = allReviews.map((_, index) => `Review ${index + 1}`);

    // Peer Comparison Data (Fictive data for demonstration)
    const peerData = {
      employee: [latestReview.OutputQualityScore, latestReview.InitiativeScore, latestReview.CommunicationScore],
      average: [7, 6, 8] // Fictive average scores for peers
    };

    // Attendance Chart
    this.charts.push(new Chart('attendanceChart', {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent', 'Late Arrivals'],
        datasets: [{
          data: [presentDays, absentDays, latestReview.LateArrivals],
          backgroundColor: ['#4e73df', '#e74a3b', '#f6c23e'],
          hoverBackgroundColor: ['#2e59d9', '#be2617', '#dda20a'],
          borderWidth: 1,
          borderColor: '#fff',
          hoverBorderColor: '#fff'
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 14 },
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = context.raw as number;
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${value} days (${percentage}%)`;
              }
            }
          }
        }
      }
    }));

    // Task Completion Chart
    this.charts.push(new Chart('taskCompletionChart', {
      type: 'pie',
      data: {
        labels: ['On Time', 'Late', 'Not Completed'],
        datasets: [{
          data: [
            completedOnTime,
            completedLate,
            latestReview.ProcessImprovementIdeas
          ],
          backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b'],
          hoverBackgroundColor: ['#17a673', '#dda20a', '#be2617'],
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 14 },
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = context.raw as number;
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${value} tasks (${percentage}%)`;
              }
            }
          }
        }
      }
    }));

    // Task Quality Ratings Chart
    this.charts.push(new Chart('qualityRatingChart', {
      type: 'radar',
      data: {
        labels: ['Output Quality', 'Initiative', 'Communication', 'Process Improvement', 'Attendance'],
        datasets: [{
          label: 'Performance Scores',
          data: [
            latestReview.OutputQualityScore,
            latestReview.InitiativeScore,
            latestReview.CommunicationScore,
            latestReview.ProcessImprovementIdeas,
            10 - latestReview.Absences
          ],
          backgroundColor: 'rgba(78, 115, 223, 0.2)',
          borderColor: 'rgba(78, 115, 223, 1)',
          pointBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            angleLines: { display: true },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: {
              font: { size: 12 }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { size: 14 }
            }
          }
        }
      }
    }));

    // Productivity Trend Chart (Area Chart)
    this.charts.push(new Chart('productivityChart', {
      type: 'line',
      data: {
        labels: productivityLabels,
        datasets: [
          {
            label: 'Overall Performance',
            data: productivityScores,
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78, 115, 223, 0.3)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            min: 0,
            max: 10,
            ticks: {
              font: { size: 12 }
            }
          },
          x: {
            ticks: {
              font: { size: 12 }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { size: 14 }
            }
          }
        }
      }
    }));

    // Peer Comparison Chart (Bar Chart with Multiple Datasets)
    this.charts.push(new Chart('peerComparisonChart', {
      type: 'bar',
      data: {
        labels: ['Output Quality', 'Initiative', 'Communication'],
        datasets: [
          {
            label: 'Employee',
            data: peerData.employee,
            backgroundColor: 'rgba(78, 115, 223, 0.7)',
            borderColor: 'rgba(78, 115, 223, 1)',
            borderWidth: 1
          },
          {
            label: 'Peer Average',
            data: peerData.average,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              font: { size: 12 }
            }
          },
          x: {
            ticks: {
              font: { size: 12 }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 14 }
            }
          }
        }
      }
    }));

    // Skill Matrix Chart
    this.charts.push(new Chart('skillMatrixChart', {
      type: 'bar',
      data: {
        labels: ['Output Quality', 'Initiative', 'Communication'],
        datasets: [{
          label: 'Scores',
          data: [
            latestReview.OutputQualityScore,
            latestReview.InitiativeScore,
            latestReview.CommunicationScore
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              font: { size: 12 }
            }
          },
          x: {
            ticks: {
              font: { size: 12 }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { size: 14 }
            }
          }
        }
      }
    }));

    // Trend Chart (Client Satisfaction as Area Chart)
    this.charts.push(new Chart('trendChart', {
      type: 'line',
      data: {
        labels: clientSatisfactionLabels,
        datasets: [{
          label: 'Client Satisfaction',
          data: clientSatisfactionScores,
          borderColor: '#3F51B5',
          backgroundColor: 'rgba(63, 81, 181, 0.3)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: v => `${v}%`,
              font: { size: 12 }
            }
          },
          x: {
            ticks: {
              font: { size: 12 }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { size: 14 }
            }
          }
        }
      }
    }));
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }
}