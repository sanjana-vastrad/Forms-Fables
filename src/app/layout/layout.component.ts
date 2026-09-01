import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { ApiServiceService } from '../Service/api-service.service';

export interface SidebarMenuItem {
  id: string | number;
  name: string;
  routePath?: string;
  icon?: string;
  displayOrder: number;
  parentId?: string | number | null;
  children: SidebarMenuItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzToolTipModule,
    NzAvatarModule,
    NzDropDownModule,
    NzModalModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isChangePasswordVisible = false;
  changingPassword = false;
  currentPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  changePasswordForm!: FormGroup;

  menuItems: SidebarMenuItem[] = [];
  private formsSub?: Subscription;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private apiService: ApiServiceService,
    private cdr: ChangeDetectorRef
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, this.confirmPasswordValidator.bind(this)]]
    });
  }

  ngOnInit(): void {
    this.loadSidebarMenu();
    this.formsSub = this.apiService.formsUpdated$.subscribe(() => {
      this.loadSidebarMenu();
    });
  }

  ngOnDestroy(): void {
    if (this.formsSub) {
      this.formsSub.unsubscribe();
    }
  }

  loadSidebarMenu(): void {
    this.apiService.getV1Forms(1, 1000, '', 'displayOrder', 'ASC').subscribe({
      next: (res: any) => {
        let rawList: any[] = [];
        if (res) {
          if (Array.isArray(res)) {
            rawList = res;
          } else if (res.items && Array.isArray(res.items)) {
            rawList = res.items;
          } else if (res.data && Array.isArray(res.data.items)) {
            rawList = res.data.items;
          } else if (Array.isArray(res.data)) {
            rawList = res.data;
          } else if (res.data && Array.isArray(res.data.forms)) {
            rawList = res.data.forms;
          } else if (res.forms && Array.isArray(res.forms)) {
            rawList = res.forms;
          } else if (res.result && Array.isArray(res.result)) {
            rawList = res.result;
          }
        }

        const activeItems: SidebarMenuItem[] = rawList
          .filter((item: any) => item.isActive !== false)
          .map((item: any) => ({
            id: item.id || item.ID || item._id,
            name: item.name || item.title || item.FORM_NAME || 'Untitled',
            routePath: item.routePath || item.path || '',
            icon: item.icon || item.ICON || item.iconName || '',
            displayOrder: Number(item.displayOrder !== undefined ? item.displayOrder : 1),
            parentId: item.parentId !== undefined && item.parentId !== null ? item.parentId : (item.parent_id !== undefined && item.parent_id !== null ? item.parent_id : (item.PARENT_ID !== undefined ? item.PARENT_ID : 0)),
            children: []
          }));

        this.menuItems = this.buildMenuTree(activeItems);
        this.cdr.markForCheck();
        this.cdr.detectChanges();

        // TEMPORARY SCRIPT TO SEED MISSING MENUS
        if (typeof window !== 'undefined' && !(window as any)._menusSeeded2) {
          (window as any)._menusSeeded2 = true;
          this.seedMissingForms(rawList);
        }

      },
      error: (err: any) => {
        console.error('Error loading sidebar forms:', err);

      }
    });
  }

  buildMenuTree(items: SidebarMenuItem[]): SidebarMenuItem[] {
    const itemMap = new Map<string, SidebarMenuItem>();

    items.forEach(item => {
      itemMap.set(String(item.id), { ...item, children: [] });
    });

    const rootItems: SidebarMenuItem[] = [];

    itemMap.forEach(item => {
      const pId = item.parentId;
      const pIdStr = (pId !== null && pId !== undefined && pId !== 'null' && pId !== '0' && pId !== 0) ? String(pId) : null;

      if (pIdStr && itemMap.has(pIdStr)) {
        const parent = itemMap.get(pIdStr)!;
        parent.children.push(item);
      } else {
        rootItems.push(item);
      }
    });

    const sortItems = (list: SidebarMenuItem[]) => {
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      list.forEach(child => sortItems(child.children));
    };

    sortItems(rootItems);
    return rootItems;
  }

  getSafeIcon(icon?: string | null, name?: string | null): string {
    const trimmed = (icon && typeof icon === 'string') ? icon.trim().toLowerCase() : '';
    const lowerName = (name || '').toLowerCase().trim();

    // 1. Specific top-level / menu category icon overrides
    if (lowerName.includes('access')) return 'security-scan';
    if (lowerName === 'masters' || lowerName === 'master') return 'database';
    if (lowerName.includes('category') || lowerName.includes('categories')) return 'appstore';

    // 2. Exact icon override mapping
    if (trimmed === 'menu') return 'appstore';
    if (trimmed === 'user' && (lowerName.includes('master') || lowerName.includes('access') || lowerName.includes('category') || lowerName.includes('categories'))) {
      if (lowerName.includes('access')) return 'security-scan';
      if (lowerName.includes('master')) return 'database';
      return 'appstore';
    }
    if (trimmed && trimmed !== 'user') return trimmed;

    // 3. Fallbacks based on form/menu item name
    if (lowerName.includes('lead') || lowerName.includes('contact')) return 'contacts';
    if (lowerName.includes('city')) return 'environment';
    if (lowerName.includes('banner')) return 'picture';
    if (lowerName.includes('faq')) return 'question-circle';
    if (lowerName.includes('service')) return 'tool';
    if (lowerName.includes('design') && !lowerName.includes('category')) return 'bulb';
    if (lowerName.includes('project') && !lowerName.includes('category')) return 'project';
    if (lowerName.includes('form')) return 'form';
    if (lowerName.includes('role')) return 'safety-certificate';
    if (lowerName.includes('user')) return 'user';
    if (lowerName.includes('dash')) return 'dashboard';

    return trimmed || 'file';
  }

  getValidRouteLink(routePath?: string | null): string | null {
    if (!routePath || typeof routePath !== 'string') return null;
    const trimmed = routePath.trim();
    if (trimmed === '' || trimmed === '#' || trimmed === 'javascript:void(0)' || trimmed === 'javascript:void(0);') {
      return null;
    }
    return trimmed;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  openChangePassword(): void {
    this.isChangePasswordVisible = true;
    this.changePasswordForm.reset();
    this.currentPasswordVisible = false;
    this.newPasswordVisible = false;
    this.confirmPasswordVisible = false;
  }

  closeChangePassword(): void {
    this.isChangePasswordVisible = false;
    this.changePasswordForm.reset();
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    if (this.changePasswordForm && control.value !== this.changePasswordForm.get('newPassword')?.value) {
      return { mismatch: true };
    }
    return null;
  }

  submitChangePassword(): void {
    // Re-validate confirm password in case new password changed after confirm was entered
    this.changePasswordForm.get('confirmPassword')?.updateValueAndValidity();

    if (this.changePasswordForm.valid) {
      this.changingPassword = true;
      // TODO: Call your API service to change the password
      // For now, simulate a success response
      setTimeout(() => {
        this.changingPassword = false;
        this.message.success('Password changed successfully!');
        this.closeChangePassword();
      }, 1000);
    } else {
      Object.values(this.changePasswordForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // SCRIPT TO SEED MISSING MENUS (MASTERS & REPORTS)
  seedMissingForms(existingForms: any[]): void {
    const parent = existingForms.find((f: any) => f.name === 'Masters' || f.FORM_NAME === 'Masters');
    const parentId = parent ? (parent.id || parent.ID || parent._id) : 0;

    const missingForms = [
      { name: 'Design Ideas', routePath: '/master/design-ideas', icon: 'bulb', parentId: parentId, displayOrder: 10, isActive: true },
      { name: 'Space Type Master', routePath: '/master/space-type', icon: 'appstore', parentId: parentId, displayOrder: 11, isActive: true },
      { name: 'Rate Tables Master', routePath: '/master/rate-tables', icon: 'tags', parentId: parentId, displayOrder: 12, isActive: true },
      { name: 'Testimonials Master', routePath: '/master/testimonials', icon: 'comment', parentId: parentId, displayOrder: 13, isActive: true },
      { name: 'City Routing Rules', routePath: '/master/city-routing-rules', icon: 'branches', parentId: parentId, displayOrder: 14, isActive: true }
    ];

    let created = false;
    for (const form of missingForms) {
      const exists = existingForms.find((f: any) => 
        (f.name === form.name || f.FORM_NAME === form.name) || 
        (f.routePath === form.routePath || f.path === form.routePath)
      );
      if (!exists) {
        created = true;
        this.apiService.createV1Form(form).subscribe({
          next: () => console.log('Created form:', form.name),
          error: (err) => console.error('Error creating form:', form.name, err)
        });
      }
    }

    // Seed Reports Parent Menu and Contact Us Leads Submenu
    const reportsParent = existingForms.find((f: any) => f.name === 'Reports' || f.FORM_NAME === 'Reports');
    if (!reportsParent) {
      created = true;
      this.apiService.createV1Form({
        name: 'Reports',
        routePath: '',
        icon: 'bar-chart',
        parentId: 0,
        displayOrder: 20,
        isActive: true
      }).subscribe({
        next: (res: any) => {
          const repId = res?.data?.id || res?.id || res?.data?.ID;
          if (repId) {
            this.seedContactUsLeadsChild(existingForms, repId);
          }
        },
        error: (err) => console.error('Error creating Reports parent menu:', err)
      });
    } else {
      const repId = reportsParent.id || reportsParent.ID || reportsParent._id;
      this.seedContactUsLeadsChild(existingForms, repId);
    }
    
    if (created) {
      setTimeout(() => {
         this.apiService.notifyFormsUpdated();
         this.message.success('Successfully added missing menus to the database!');
      }, 2000);
    }
  }

  seedContactUsLeadsChild(existingForms: any[], reportsId: any): void {
    // 1. Seed / Update Contact Us Leads
    const leadsForm = existingForms.find((f: any) =>
      (f.name === 'Contact Us Leads' || f.FORM_NAME === 'Contact Us Leads' || f.name === 'Contact Us' || f.FORM_NAME === 'Contact Us') ||
      (f.routePath === '/master/leads' || f.path === '/master/leads')
    );

    if (!leadsForm) {
      this.apiService.createV1Form({
        name: 'Contact Us Leads',
        routePath: '/master/leads',
        icon: 'contacts',
        parentId: reportsId,
        displayOrder: 1,
        isActive: true
      }).subscribe({
        next: () => this.apiService.notifyFormsUpdated(),
        error: (err) => console.error('Error creating Contact Us Leads form:', err)
      });
    } else if (reportsId && String(leadsForm.parentId) !== String(reportsId)) {
      const leadsId = leadsForm.id || leadsForm.ID || leadsForm._id;
      this.apiService.updateV1Form(leadsId, { parentId: reportsId }).subscribe({
        next: () => this.apiService.notifyFormsUpdated(),
        error: (err) => console.error('Error updating Contact Us Leads parent:', err)
      });
    }

    // 2. Seed / Update Consultation Leads
    const consultForm = existingForms.find((f: any) =>
      (f.name === 'Consultation Leads' || f.FORM_NAME === 'Consultation Leads' || f.name === 'Consultation' || f.FORM_NAME === 'Consultation') ||
      (f.routePath === '/master/consultations' || f.path === '/master/consultations')
    );

    if (!consultForm) {
      this.apiService.createV1Form({
        name: 'Consultation Leads',
        routePath: '/master/consultations',
        icon: 'solution',
        parentId: reportsId,
        displayOrder: 2,
        isActive: true
      }).subscribe({
        next: () => this.apiService.notifyFormsUpdated(),
        error: (err) => console.error('Error creating Consultation Leads form:', err)
      });
    } else if (reportsId && String(consultForm.parentId) !== String(reportsId)) {
      const consultId = consultForm.id || consultForm.ID || consultForm._id;
      this.apiService.updateV1Form(consultId, { parentId: reportsId }).subscribe({
        next: () => this.apiService.notifyFormsUpdated(),
        error: (err) => console.error('Error updating Consultation Leads parent:', err)
      });
    }
  }
}
