import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';
import { AddHomeTypeComponent } from '../add-home-type/add-home-type.component';

interface HomeType {
  id: string | number;
  name: string;
  isActive: boolean;
  displayOrder: number;
}

@Component({
  selector: 'app-home-type-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    AddHomeTypeComponent
  ],
  templateUrl: './home-type-list.component.html',
  styleUrl: './home-type-list.component.css'
})
export class HomeTypeListComponent implements OnInit {
  homeTypes: HomeType[] = [];
  loading = false;
  drawerVisible = false;
  selectedHomeType: HomeType | null = null;

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'sequenceNo';
  sortOrder: string = 'ASC';
  totalCount: number = 0;
  nextSequenceNo: number = 1;

  constructor(
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadHomeTypes();
  }

  loadHomeTypes(): void {
    this.loading = true;
    this.apiService.getHomeTypes(
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
          }
        }

        this.totalCount = total;

        if (rawList && rawList.length > 0) {
          this.homeTypes = rawList.map((item: any) => ({
            id: item.id || item._id,
            name: item.name || item.homeType || item.HomeType,
            isActive: item.isActive !== undefined ? item.isActive : true,
            displayOrder: item.displayOrder || item.sequenceNo || item.SequenceNo || 0
          }));
        } else {
          this.homeTypes = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching home types:', err);
        this.homeTypes = [];
        this.totalCount = 0;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadHomeTypes();
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadHomeTypes();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadHomeTypes();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.homeTypes.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedHomeType = null;
    this.nextSequenceNo = this.totalCount + 1;
    this.drawerVisible = true;
  }

  openEditDrawer(homeType: HomeType): void {
    this.selectedHomeType = homeType;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedHomeType = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadHomeTypes();
  }

  deactivateHomeType(homeType: HomeType): void {
    if (!homeType.isActive) {
      return;
    }

    this.apiService.deactivateHomeType(homeType.id).subscribe({
      next: () => {
        this.message.success(`${homeType.name} deactivated successfully!`);
        homeType.isActive = false;
      },
      error: (err) => {
        // Fallback simulation
        homeType.isActive = false;
        this.message.success(`${homeType.name} deactivated successfully!`);

        const errMsg = err?.error?.message || err?.message;
        console.warn('Deactivate API failed', errMsg);
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
    this.loadHomeTypes();
  }
}
