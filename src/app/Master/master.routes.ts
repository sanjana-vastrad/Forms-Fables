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
  { path: 'services', loadComponent: () => import('./services/services-list/services-list.component').then(c => c.ServicesListComponent) },
  { path: 'design-ideas', loadComponent: () => import('./design-ideas/design-ideas-list/design-ideas-list.component').then(c => c.DesignIdeasListComponent) },
  { path: 'space-type', loadComponent: () => import('./space-type/space-type-list/space-type-list.component').then(c => c.SpaceTypeListComponent) },
  { path: 'space-types', loadComponent: () => import('./space-type/space-type-list/space-type-list.component').then(c => c.SpaceTypeListComponent) },
  { path: 'rate-table', loadComponent: () => import('./rate-table/rate-table-list/rate-table-list.component').then(c => c.RateTableListComponent) },
  { path: 'rate-tables', loadComponent: () => import('./rate-table/rate-table-list/rate-table-list.component').then(c => c.RateTableListComponent) },
  { path: 'testimonial', loadComponent: () => import('./testimonial/testimonial-list/testimonial-list.component').then(c => c.TestimonialListComponent) },
  { path: 'testimonials', loadComponent: () => import('./testimonial/testimonial-list/testimonial-list.component').then(c => c.TestimonialListComponent) },
  { path: 'city-routing-rule', loadComponent: () => import('./city-routing-rule/city-routing-rule-list/city-routing-rule-list.component').then(c => c.CityRoutingRuleListComponent) },
  { path: 'city-routing-rules', loadComponent: () => import('./city-routing-rule/city-routing-rule-list/city-routing-rule-list.component').then(c => c.CityRoutingRuleListComponent) },
  { path: 'leads', loadComponent: () => import('./leads/leads-list/leads-list.component').then(c => c.LeadsListComponent) },
  { path: 'contact-us', loadComponent: () => import('./leads/leads-list/leads-list.component').then(c => c.LeadsListComponent) },
  { path: 'consultations', loadComponent: () => import('./consultations/consultations-list/consultations-list.component').then(c => c.ConsultationsListComponent) },
  { path: 'consultation', loadComponent: () => import('./consultations/consultations-list/consultations-list.component').then(c => c.ConsultationsListComponent) }
];
