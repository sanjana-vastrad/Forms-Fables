import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';
import { AddRoleComponent } from '../add-role/add-role.component';

export interface RoleItem {
  id: string | number;
  name: string;
  parentRoleId?: number | string | null;
  parentRoleName?: string;
  isActive: boolean;
  rawItem?: any;
  statusLoading?: boolean;
}

export interface FormAssignmentItem {
  id: number | string;
  formId?: number | string;
  isAllowed: boolean;
  isShowInMenu: boolean;
  formName: string;
  link: string;
  seqNo: number;
  rawItem?: any;
}

@Component({
  selector: 'app-roles-list',
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
    NzSpinModule,
    AddRoleComponent
  ],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css'
})
export class RolesListComponent implements OnInit {
  roles: RoleItem[] = [];
  loading = false;
  drawerVisible = false;
  selectedRole: RoleItem | null = null;
  updatingStatusId: string | number | null = null;
  pageDirection: 'prev' | 'next' | null = null;

  // Forms Assignment Drawer States
  formsDrawerVisible = false;
  selectedRoleForForms: RoleItem | null = null;
  formsSearchQuery: string = '';
  formsLoading: boolean = false;
  formsSaving: boolean = false;
  formsList: FormAssignmentItem[] = [];

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'name';
  sortOrder: string = 'DESC';
  totalCount: number = 0;

  constructor(
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.apiService.getV1Roles(
      this.pageIndex,
      this.pageSize,
      this.searchQuery,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.pageDirection = null;

        let rawList: any[] = [];
        let total = 0;

        if (res && res.message === 'Authentication token missing.') {
          this.message.warning('Authentication token missing. Please log in to access roles.');
          this.roles = [];
          this.totalCount = 0;
          return;
        }

        if (res) {
          if (Array.isArray(res)) {
            rawList = res;
            total = res.length;
          } else if (res.items && Array.isArray(res.items)) {
            rawList = res.items;
            total = res.total ?? res.totalCount ?? res.count ?? res.items.length;
          } else if (res.data && Array.isArray(res.data.items)) {
            rawList = res.data.items;
            total = res.data.total ?? res.data.totalCount ?? res.data.count ?? res.total ?? res.data.items.length;
          } else if (res.data && Array.isArray(res.data.roles)) {
            rawList = res.data.roles;
            total = res.data.total ?? res.data.totalCount ?? res.data.count ?? res.total ?? res.data.roles.length;
          } else if (res.data && Array.isArray(res.data)) {
            rawList = res.data;
            total = res.total ?? res.totalCount ?? res.count ?? res.data.length;
          } else if (res.roles && Array.isArray(res.roles)) {
            rawList = res.roles;
            total = res.total ?? res.totalCount ?? res.count ?? res.roles.length;
          }
        }

        this.totalCount = total;

        // If backend returned more than pageSize (e.g. unpaginated flat array), slice for current page
        if (rawList.length > this.pageSize && total === rawList.length) {
          const startIndex = (this.pageIndex - 1) * this.pageSize;
          const endIndex = startIndex + this.pageSize;
          rawList = rawList.slice(startIndex, endIndex);
        }

        if (rawList && rawList.length > 0) {
          this.roles = rawList.map((item: any) => {
            const roleId = item.id ?? item.ID ?? item.ROLE_ID ?? item.roleId ?? item.role_id ?? item._id;
            const pId = item.parentId ?? item.parentRoleId ?? item.PARENT_ROLE_ID ?? item.parent_role_id ?? (item.parentRole ? (item.parentRole.id || item.parentRole.ROLE_ID || item.parentRole.roleId) : null);
            const parentObj = item.parentRole || rawList.find((r: any) => {
              const rId = r.id ?? r.ID ?? r.ROLE_ID ?? r.roleId ?? r.role_id ?? r._id;
              return String(rId) === String(pId);
            });

            let parentName = item.parent_name ?? item.parentName ?? item.parentRoleName ?? item.parent_role_name ?? (parentObj ? (parentObj.name || parentObj.roleName) : null) ?? item.PARENT_ROLE_NAME ?? 'None';
            if (parentName === null || parentName === undefined || parentName === '' || parentName === 'null') {
              parentName = 'None';
            }

            const normalizedPId = (pId !== null && pId !== undefined && pId !== '' && pId !== 'null') ? (isNaN(Number(pId)) ? pId : Number(pId)) : 0;

            return {
              id: roleId,
              name: item.name || item.roleName || item.ROLE_NAME || 'Untitled Role',
              parentRoleId: normalizedPId,
              parentRoleName: parentName,
              isActive: item.isActive !== undefined ? item.isActive : (item.status === 'Active'),
              rawItem: item,
              statusLoading: false
            };
          });
        } else {
          this.roles = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.pageDirection = null;
        console.error('Error fetching roles:', err);
        if (err?.status === 401) {
          this.message.error('Authentication token missing or session expired. Please log in again.');
        } else {
          this.message.error('Failed to fetch roles list.');
        }
        this.roles = [];
        this.totalCount = 0;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadRoles();
  }

  prevPage(): void {
    if (this.pageIndex > 1 && !this.loading) {
      this.pageDirection = 'prev';
      this.pageIndex--;
      this.loadRoles();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages() && !this.loading) {
      this.pageDirection = 'next';
      this.pageIndex++;
      this.loadRoles();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.roles.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedRole = null;
    this.drawerVisible = true;
  }

  openEditDrawer(roleItem: RoleItem): void {
    this.selectedRole = roleItem;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedRole = null;
  }

  openFormsDrawer(roleItem: RoleItem): void {
    this.selectedRoleForForms = roleItem;
    this.formsSearchQuery = '';
    this.formsList = [];
    this.formsDrawerVisible = true;
    this.loadRoleFormMappings(roleItem.id);
  }

  loadRoleFormMappings(roleId: string | number): void {
    this.formsLoading = true;
    this.apiService.getV1RoleFormMappingsByRoleId(roleId).subscribe({
      next: (res: any) => {
        this.formsLoading = false;
        let rawList: any[] = [];
        if (res) {
          if (Array.isArray(res)) {
            rawList = res;
          } else if (res.items && Array.isArray(res.items)) {
            rawList = res.items;
          } else if (res.data && Array.isArray(res.data.items)) {
            rawList = res.data.items;
          } else if (res.data && Array.isArray(res.data)) {
            rawList = res.data;
          } else if (res.mappings && Array.isArray(res.mappings)) {
            rawList = res.mappings;
          } else if (res.forms && Array.isArray(res.forms)) {
            rawList = res.forms;
          }
        }

        this.formsList = rawList.map((item: any, idx: number) => {
          const itemForm = item.form || item.Form || {};
          const isAllowedVal = item.isAllowed ?? item.is_allowed ?? item.allowed ?? item.isActive ?? item.is_active ?? false;
          const isShowInMenuVal = item.isShowInMenu ?? item.is_show_in_menu ?? item.showInMenu ?? item.show_in_menu ?? item.inMenu ?? item.in_menu ?? false;
          const nameVal = item.formName ?? item.form_name ?? item.name ?? item.title ?? itemForm.name ?? itemForm.formName ?? itemForm.title ?? `Form #${item.formId || idx + 1}`;
          const linkVal = item.link ?? item.formLink ?? item.form_link ?? item.url ?? item.path ?? itemForm.link ?? itemForm.url ?? '#';
          const seqVal = item.seqNo ?? item.seq_no ?? item.sequenceNo ?? item.sequence_no ?? item.displayOrder ?? item.display_order ?? item.seq ?? 0;

          return {
            id: item.id ?? item.mappingId ?? item.mapping_id ?? item.formId ?? item.form_id ?? idx + 1,
            formId: item.formId ?? item.form_id ?? item.id,
            isAllowed: !!isAllowedVal,
            isShowInMenu: !!isShowInMenuVal,
            formName: nameVal,
            link: linkVal,
            seqNo: Number(seqVal) || 0,
            rawItem: item
          };
        });
      },
      error: (err: any) => {
        this.formsLoading = false;
        console.error('Error fetching role-form mappings:', err);
        const errMsg = err?.error?.message || err?.message || 'Failed to fetch form assignments for this role.';
        this.message.error(errMsg);
        this.formsList = [];
      }
    });
  }

  closeFormsDrawer(): void {
    this.formsDrawerVisible = false;
    this.selectedRoleForForms = null;
  }

  filteredFormsList(): FormAssignmentItem[] {
    if (!this.formsSearchQuery || !this.formsSearchQuery.trim()) {
      return this.formsList;
    }
    const q = this.formsSearchQuery.toLowerCase().trim();
    return this.formsList.filter(item =>
      item.formName.toLowerCase().includes(q) || item.link.toLowerCase().includes(q)
    );
  }

  saveFormsAssignment(): void {
    if (!this.selectedRoleForForms) return;

    this.formsSaving = true;
    const rId = this.selectedRoleForForms.id;
    const parsedRoleId = (rId !== null && rId !== undefined && rId !== '' && !isNaN(Number(rId)))
      ? Number(rId)
      : rId;

    const itemsPayload = this.formsList.map(item => {
      const fId = item.formId ?? item.id;
      const parsedFormId = (fId !== null && fId !== undefined && fId !== '' && !isNaN(Number(fId)))
        ? Number(fId)
        : fId;

      return {
        formId: parsedFormId,
        isAllowed: item.isAllowed ? 1 : 0,
        isShowInMenu: item.isShowInMenu ? 1 : 0,
        seqNo: Number(item.seqNo) || 0
      };
    });

    const payload = {
      roleId: parsedRoleId,
      items: itemsPayload
    };

    console.log('Sending Bulk Role Form Mapping Payload:', payload);

    this.apiService.bulkSaveRoleFormMappings(payload).subscribe({
      next: () => {
        this.formsSaving = false;
        this.message.success(`Form assignment updated for ${this.selectedRoleForForms?.name || 'Role'}`);
        this.closeFormsDrawer();
      },
      error: (err: any) => {
        this.formsSaving = false;
        console.error('Error saving bulk role-form mappings:', err);
        const errMsg = err?.error?.message || err?.message || 'Failed to save form assignment.';
        this.message.error(errMsg);
      }
    });
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadRoles();
  }

  toggleStatus(roleItem: RoleItem, newStatus: boolean): void {
    this.updatingStatusId = roleItem.id;

    const updateObs = newStatus
      ? this.apiService.activateV1Role(roleItem.id)
      : this.apiService.deactivateV1Role(roleItem.id);

    updateObs.subscribe({
      next: () => {
        this.updatingStatusId = null;
        roleItem.isActive = newStatus;
        this.message.success(`Role status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      },
      error: () => {
        this.apiService.updateV1Role(roleItem.id, { isActive: newStatus }).subscribe({
          next: () => {
            this.updatingStatusId = null;
            roleItem.isActive = newStatus;
            this.message.success(`Role status updated to ${newStatus ? 'Active' : 'Inactive'}`);
          },
          error: (fallbackErr) => {
            this.updatingStatusId = null;
            roleItem.isActive = !newStatus;
            const errMsg = fallbackErr?.error?.message || fallbackErr?.message || 'Failed to update Role status.';
            this.message.error(errMsg);
          }
        });
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
    this.loadRoles();
  }
}
