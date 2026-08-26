import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface ReportDetail {
  reportName: string;
  category: string;
  generatedDate: string;
  fileSize: string;
  downloadsCount: number;
}

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './report-dashboard.component.html',
  styleUrl: './report-dashboard.component.css'
})
export class ReportDashboardComponent {
  reports: ReportDetail[] = [
    {
      reportName: 'B2C Signup Conversions Q3',
      category: 'User Growth',
      generatedDate: '2026-08-20',
      fileSize: '2.4 MB',
      downloadsCount: 142
    },
    {
      reportName: 'Feedback Sentiment Analysis August',
      category: 'Customer Satisfaction',
      generatedDate: '2026-08-18',
      fileSize: '4.8 MB',
      downloadsCount: 89
    },
    {
      reportName: 'Product Survey Submissions Summary',
      category: 'Product Feedback',
      generatedDate: '2026-08-15',
      fileSize: '1.2 MB',
      downloadsCount: 320
    },
    {
      reportName: 'Lead Generation Conversion Funnel',
      category: 'Marketing Analytics',
      generatedDate: '2026-08-10',
      fileSize: '3.1 MB',
      downloadsCount: 215
    },
    {
      reportName: 'Website Traffic & Referrals Report',
      category: 'System Performance',
      generatedDate: '2026-08-01',
      fileSize: '5.6 MB',
      downloadsCount: 67
    }
  ];
}
