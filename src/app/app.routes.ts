import { Routes } from '@angular/router';
import { LoginComponent } from './Login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'master',
        loadChildren: () => import('./Master/master.routes').then(m => m.MASTER_ROUTES)
      },
      {
        path: 'report',
        loadChildren: () => import('./Report/report.routes').then(m => m.REPORT_ROUTES)
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
