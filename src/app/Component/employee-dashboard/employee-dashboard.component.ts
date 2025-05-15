import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../services/services/token.service';
import { LoginService } from '../../services/services/login.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  userName: string = 'Employee';
  userPosition: string = 'Position';
  notifications: any[] = [];

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    console.log('EmployeeDashboardComponent: ngOnInit called');
    this.loadUserInfo();
    this.loadNotifications();
  }

  loadUserInfo(): void {
    console.log('EmployeeDashboardComponent: loadUserInfo called');
    const token = this.tokenService.token;
    console.log('Token:', token);
    if (!token) {
      console.log('No token found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    const userInfo = this.tokenService.user;
    console.log('UserInfo from TokenService:', userInfo);
    if (userInfo) {
      // Récupérer le nom à partir de firstname ou lastname (selon la casse utilisée par le backend)
      this.userName = userInfo.Firstname || userInfo.Lastname || userInfo.name || 'Employee';
      this.userPosition = userInfo.position || 'Position';
      console.log('UserName:', this.userName, 'UserPosition:', this.userPosition);
    } else {
      console.log('No user info found in TokenService');
      this.userName = 'Employee';
      this.userPosition = 'Position';
    }
  }

  loadNotifications(): void {
    console.log('EmployeeDashboardComponent: loadNotifications called');
    this.notifications = [
      { title: 'New Survey', message: 'A new survey is available.', time: '1 hour ago' },
      { title: 'Reminder', message: 'Don’t forget to check your tasks.', time: '3 hours ago' }
    ];
    console.log('Notifications:', this.notifications);
  }

  logout(): void {
    console.log('EmployeeDashboardComponent: logout called');
    this.loginService.logout();
    this.tokenService.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}