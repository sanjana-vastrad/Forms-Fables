import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface MasterRole {
  roleName: string;
  usersCount: number;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-master-dashboard',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './master-dashboard.component.html',
  styleUrl: './master-dashboard.component.css'
})
export class MasterDashboardComponent {
  roles: MasterRole[] = [
    {
      roleName: 'Super Admin',
      usersCount: 3,
      description: 'Full access to all system configurations and management.',
      status: 'Active'
    },
    {
      roleName: 'Content Creator',
      usersCount: 12,
      description: 'Can design forms, create templates, and compile reports.',
      status: 'Active'
    },
    {
      roleName: 'Reviewer',
      usersCount: 24,
      description: 'Can view submissions, add comments, and approve/reject forms.',
      status: 'Active'
    },
    {
      roleName: 'Data Analyst',
      usersCount: 8,
      description: 'Access to analytics, export tools, and reports dashboard.',
      status: 'Active'
    },
    {
      roleName: 'Support Agent',
      usersCount: 15,
      description: 'Can assist users, view tickets, and modify general user info.',
      status: 'Inactive'
    }
  ];
}
