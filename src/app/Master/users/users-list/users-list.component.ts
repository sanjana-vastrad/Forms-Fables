import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';
import { AddUserComponent } from '../add-user/add-user.component';
import { environment } from '../../../../environments/environment';

export interface UserItem {
  id: string | number;
  name: string;
  email: string;
  mobileno: string;
  roleId?: number | string | null;
  roleName?: string;
  profilePhoto?: string | null;
  isActive: boolean;
  rawItem?: any;
  statusLoading?: boolean;
}

@Component({
  selector: 'app-users-list',
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
    NzAvatarModule,
    NzSpinModule,
    AddUserComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  users: UserItem[] = [];
  loading = false;
  drawerVisible = false;
  selectedUser: UserItem | null = null;
  updatingStatusId: string | number | null = null;
  pageDirection: 'prev' | 'next' | null = null;

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
    this.loadUsers();
  }

  getAbsoluteImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const baseUrl = (environment.authUrl || '').trim().replace(/\/+$/, '');
    const relativePath = url.replace(/^\/+/, '');
    return `${baseUrl}/${relativePath}`;
  }

  loadUserPhotos(): void {
    this.users.forEach((user) => {
      if (user.profilePhoto && !user.profilePhoto.startsWith('blob:') && !user.profilePhoto.startsWith('data:')) {
        const fullUrl = this.getAbsoluteImageUrl(user.profilePhoto);
        this.apiService.fetchImageBlob(fullUrl).subscribe({
          next: (blob: Blob) => {
            user.profilePhoto = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.warn('Could not fetch user avatar blob via auth headers:', err);
            user.profilePhoto = fullUrl;
          }
        });
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.apiService.getV1Users(
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
          this.message.warning('Authentication token missing. Please log in to access users.');
          this.users = [];
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
          } else if (res.data && Array.isArray(res.data.users)) {
            rawList = res.data.users;
            total = res.data.total ?? res.data.totalCount ?? res.data.count ?? res.total ?? res.data.users.length;
          } else if (res.data && Array.isArray(res.data)) {
            rawList = res.data;
            total = res.total ?? res.totalCount ?? res.count ?? res.data.length;
          } else if (res.users && Array.isArray(res.users)) {
            rawList = res.users;
            total = res.total ?? res.totalCount ?? res.count ?? res.users.length;
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
          this.users = rawList.map((item: any) => {
            const userId = item.id ?? item.ID ?? item.USER_ID ?? item.userId ?? item.user_id ?? item._id;
            const rId = item.role_id ?? item.roleId ?? item.ROLE_ID ?? (item.role ? item.role.id : null);
            const rName = item.role_name ?? item.roleName ?? (item.role ? item.role.name : null) ?? item.ROLE_NAME ?? (rId ? `Role #${rId}` : '—');
            const mobile = item.mobile_no ?? item.mobileno ?? item.mobileNo ?? item.mobile ?? '—';
            const photo = item.profile_photo ?? item.profilePhoto ?? item.profileImage ?? item.avatar ?? item.url ?? null;
            const activeStatus = item.is_active !== undefined ? item.is_active : (item.isActive !== undefined ? item.isActive : (item.status === 'Active'));

            return {
              id: userId,
              name: item.name || item.userName || item.user_name || 'Untitled User',
              email: item.email || '—',
              mobileno: mobile,
              roleId: rId,
              roleName: rName,
              profilePhoto: photo ? this.getAbsoluteImageUrl(photo) : null,
              isActive: !!activeStatus,
              rawItem: item,
              statusLoading: false
            };
          });
          this.loadUserPhotos();
        } else {
          this.users = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.pageDirection = null;
        console.error('Error fetching users:', err);
        if (err?.status === 401) {
          this.message.error('Authentication token missing or session expired. Please log in again.');
        } else {
          this.message.error('Failed to fetch users list.');
        }
        this.users = [];
        this.totalCount = 0;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadUsers();
  }

  prevPage(): void {
    if (this.pageIndex > 1 && !this.loading) {
      this.pageDirection = 'prev';
      this.pageIndex--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages() && !this.loading) {
      this.pageDirection = 'next';
      this.pageIndex++;
      this.loadUsers();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.users.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedUser = null;
    this.drawerVisible = true;
  }

  openEditDrawer(userItem: UserItem): void {
    this.selectedUser = userItem;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedUser = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadUsers();
  }

  toggleStatus(userItem: UserItem, newStatus: boolean): void {
    this.updatingStatusId = userItem.id;

    const updateObs = newStatus
      ? this.apiService.activateV1User(userItem.id)
      : this.apiService.deactivateV1User(userItem.id);

    updateObs.subscribe({
      next: () => {
        this.updatingStatusId = null;
        userItem.isActive = newStatus;
        this.message.success(`User status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      },
      error: () => {
        this.apiService.updateV1User(userItem.id, { is_active: newStatus, isActive: newStatus }).subscribe({
          next: () => {
            this.updatingStatusId = null;
            userItem.isActive = newStatus;
            this.message.success(`User status updated to ${newStatus ? 'Active' : 'Inactive'}`);
          },
          error: (fallbackErr) => {
            this.updatingStatusId = null;
            userItem.isActive = !newStatus;
            const errMsg = fallbackErr?.error?.message || fallbackErr?.message || 'Failed to update User status.';
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
    this.loadUsers();
  }
}
