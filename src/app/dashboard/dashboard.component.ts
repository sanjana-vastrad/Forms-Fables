import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
}

interface RecentForm {
  name: string;
  createdDate: string;
  submissions: number;
  status: 'Active' | 'Pending' | 'Inactive';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats: DashboardStat[] = [
    {
      title: 'Total Forms Created',
      value: '142',
      change: '+12% from last month',
      changeType: 'increase',
      icon: 'form'
    },
    {
      title: 'Total Submissions',
      value: '3,842',
      change: '+8.4% from last week',
      changeType: 'increase',
      icon: 'file-text'
    },
    {
      title: 'Average Conversion Rate',
      value: '64.2%',
      change: '+2.1% from last month',
      changeType: 'increase',
      icon: 'percentage'
    },
    {
      title: 'Active Forms',
      value: '28',
      change: 'Stable',
      changeType: 'increase',
      icon: 'check-circle'
    }
  ];

  recentForms: RecentForm[] = [
    {
      name: 'Customer Feedback Survey',
      createdDate: '2026-08-15',
      submissions: 342,
      status: 'Active'
    },
    {
      name: 'B2C Newsletter Signup',
      createdDate: '2026-08-12',
      submissions: 1205,
      status: 'Active'
    },
    {
      name: 'Product Registration Form',
      createdDate: '2026-08-10',
      submissions: 84,
      status: 'Pending'
    },
    {
      name: 'Lead Generation Questionnaire',
      createdDate: '2026-07-28',
      submissions: 512,
      status: 'Active'
    },
    {
      name: 'Website Contact Us Form',
      createdDate: '2026-06-15',
      submissions: 1699,
      status: 'Inactive'
    }
  ];
}
