import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/services/employe-management.service';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeEditDialogComponent } from './edit/employee-edit-dialog/employee-edit-dialog.component';
import { EmployeeCreateDialogComponent } from './employee-form-dialog/employee-form-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    MatSidenavModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
})
export class EmployeesComponent implements OnInit {
  searchTerm: string = '';
  positionFilter: string = '';
  departmentFilter: string = '';
  isLoading: boolean = false;
  employees: any[] = [];
  filteredEmployees: any[] = [];
  positions: string[] = ['Developer', 'Manager', 'Designer', 'Intern'];
  departments: any[] = [
    { id: 1, name: 'IT' },
    { id: 2, name: 'HR' },
    { id: 3, name: 'Finance' },
  ];

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        this.isLoading = false;
        
       // Log each employee's ID
      data.forEach(employee => {
        console.log('Employee ID:', employee.Id); // Adjust 'id' to the actual property name if different
      });

      this.snackBar.open('Employees loaded successfully', 'Close', { duration: 2000 });
    },
      
              error: (err) => {
        this.isLoading = false;
        this.showError('Failed to load employees');
      },
     
    });
    
  }

  filterEmployees(): void {
    this.filteredEmployees = this.employees.filter((employee) => {
      const matchesSearch =
        employee.Lastname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.Firstname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.Email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesPosition = !this.positionFilter || employee.Poste === this.positionFilter;
      const matchesDepartment = !this.departmentFilter || employee.Department === this.departmentFilter;
      return matchesSearch && matchesPosition && matchesDepartment;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.positionFilter = '';
    this.departmentFilter = '';
    this.filterEmployees();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(EmployeeCreateDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEmployees();
        this.snackBar.open('Employee created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(employee: any): void {
    const dialogRef = this.dialog.open(EmployeeEditDialogComponent, {
      width: '500px',
      data: { ...employee },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEmployees();
        this.snackBar.open('Employee updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteEmployee(id: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
          this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
        },
        error: () => this.showError('Failed to delete employee'),
      });
    }
  }

  viewPerformance(employeeId: number): void {
    this.router.navigate(['/performance', employeeId]);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}