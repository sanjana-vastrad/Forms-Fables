import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';
import { AddFormComponent } from '../add-form/add-form.component';

export interface FormMasterItem {
  id: string | number;
  name: string;
  slug?: string;
  routePath?: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  statusLoading?: boolean;
}

@Component({
  selector: 'app-forms-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSwitchModule,
    NzToolTipModule,
    AddFormComponent
  ],
  templateUrl: './forms-list.component.html',
  styleUrl: './forms-list.component.css'
})
export class FormsListComponent implements OnInit {
  forms: FormMasterItem[] = [];
  loading = false;
  drawerVisible = false;
  selectedForm: FormMasterItem | null = null;
  updatingStatusId: string | number | null = null;

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'name';
  sortOrder: string = 'DESC';
  totalCount: number = 0;
  nextDisplayOrder: number = 1;

  constructor(
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadForms();
    this.loadAllFormsForLookup();
  }

  loadAllFormsForLookup(): void {
    this.apiService.getV1Forms(1, 10, '', 'name', 'ASC').subscribe({
      next: (res: any) => {
        let rawList: any[] = [];
        if (res) {
          if (Array.isArray(res)) rawList = res;
          else if (res.items && Array.isArray(res.items)) rawList = res.items;
          else if (res.data && Array.isArray(res.data.items)) rawList = res.data.items;
          else if (Array.isArray(res.data)) rawList = res.data;
          else if (res.data && Array.isArray(res.data.forms)) rawList = res.data.forms;
        }
        this.allFormsForLookup = rawList.map((item: any) => ({
          id: item.id || item.ID || item._id,
          name: item.name || item.title || item.FORM_NAME || 'Untitled Form'
        }));
      }
    });
  }

  loadForms(): void {
    this.loading = true;
    this.apiService.getV1Forms(
      this.pageIndex,
      this.pageSize,
      this.searchQuery,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (res: any) => {
        this.loading = false;

        let rawList: any[] = [];
        let total = 0;

        if (res && res.message === 'Authentication token missing.') {
          this.message.warning('Authentication token missing. Please log in to access forms.');
          this.forms = [];
          this.totalCount = 0;
          return;
        }

        if (res) {
          if (Array.isArray(res)) {
            rawList = res;
            total = res.length;
          } else if (res.items && Array.isArray(res.items)) {
            rawList = res.items;
            total = res.total !== undefined ? res.total : res.items.length;
          } else if (res.data && Array.isArray(res.data.items)) {
            rawList = res.data.items;
            total = res.data.total !== undefined ? res.data.total : (res.total !== undefined ? res.total : res.data.items.length);
          } else if (Array.isArray(res.data)) {
            rawList = res.data;
            total = res.total || res.totalCount || res.data.length;
          } else if (res.data && Array.isArray(res.data.forms)) {
            rawList = res.data.forms;
            total = res.data.total || res.data.totalCount || res.data.forms.length;
          }
        }

        this.totalCount = total;

        if (rawList && rawList.length > 0) {
          this.forms = rawList.map((item: any) => ({
            id: item.id || item.ID || item._id,
            name: item.name || item.title || item.FORM_NAME || 'Untitled Form',
            slug: item.slug || item.key || '',
            routePath: item.routePath || item.path || '',
            description: item.description || item.DESCRIPTION || '',
            displayOrder: item.displayOrder !== undefined ? item.displayOrder : 1,
            isActive: item.isActive !== undefined ? item.isActive : true,
            statusLoading: false
          }));

          const maxOrder = Math.max(...this.forms.map(f => f.displayOrder || 0), 0);
          this.nextDisplayOrder = maxOrder + 1;
        } else {
          this.forms = [];
          this.nextDisplayOrder = 1;
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching forms:', err);
        if (err?.status === 401) {
          this.message.error('Authentication token missing or session expired. Please log in again.');
        } else {
          this.message.error('Failed to fetch forms list.');
        }
        this.forms = [];
        this.totalCount = 0;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadForms();
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadForms();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadForms();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.forms.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedForm = null;
    this.drawerVisible = true;
  }

  openEditDrawer(formItem: FormMasterItem): void {
    this.selectedForm = formItem;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedForm = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadForms();
  }

  toggleStatus(formItem: FormMasterItem, newStatus: boolean): void {
    this.updatingStatusId = formItem.id;

    // Call update API or deactivate API
    const updateObs = !newStatus
      ? this.apiService.deactivateV1Form(formItem.id)
      : this.apiService.updateV1Form(formItem.id, { isActive: true });

    updateObs.subscribe({
      next: () => {
        this.updatingStatusId = null;
        formItem.isActive = newStatus;
        this.message.success(`Form status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      },
      error: (err) => {
        this.updatingStatusId = null;
        formItem.isActive = !newStatus; // revert on error
        const errMsg = err?.error?.message || err?.message || 'Failed to update Form status.';
        this.message.error(errMsg);
      }
    });
  }

  deactivateForm(formItem: FormMasterItem): void {
    if (!formItem.isActive) {
      return;
    }
    this.updatingStatusId = formItem.id;
    this.apiService.deactivateV1Form(formItem.id).subscribe({
      next: () => {
        this.updatingStatusId = null;
        formItem.isActive = false;
        this.message.success(`${formItem.name} deactivated successfully!`);
      },
      error: (err) => {
        this.updatingStatusId = null;
        const errMsg = err?.error?.message || err?.message || 'Failed to deactivate Form.';
        this.message.error(errMsg);
      }
    });
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortOrder = 'ASC';
    }
    this.loadForms();
  }
}
