import { Routes } from '@angular/router';
import { MasterDashboardComponent } from './master-dashboard/master-dashboard.component';

export const MASTER_ROUTES: Routes = [
  { path: '', component: MasterDashboardComponent },
  { path: 'city', loadComponent: () => import('./city/city-list/city-list.component').then(c => c.CityListComponent) },
  { path: 'banner', loadComponent: () => import('./banner/banner-list/banner-list.component').then(c => c.BannerListComponent) },
  { path: 'faqs', loadComponent: () => import('./faqs/faqs-list/faqs-list.component').then(c => c.FaqsListComponent) },
  { path: 'forms', loadComponent: () => import('./forms/forms-list/forms-list.component').then(c => c.FormsListComponent) },
  { path: 'roles', loadComponent: () => import('./roles/roles-list/roles-list.component').then(c => c.RolesListComponent) },
  { path: 'users', loadComponent: () => import('./users/users-list/users-list.component').then(c => c.UsersListComponent) },
  { path: 'design-idea-category', loadComponent: () => import('./design-idea-category/design-idea-category-list/design-idea-category-list.component').then(c => c.DesignIdeaCategoryListComponent) },
  { path: 'project-category', loadComponent: () => import('./project-category/project-category-list/project-category-list.component').then(c => c.ProjectCategoryListComponent) },
  { path: 'services', loadComponent: () => import('./services/services-list/services-list.component').then(c => c.ServicesListComponent) }
];
