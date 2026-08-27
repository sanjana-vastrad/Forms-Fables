import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ApiServiceService } from '../../../Service/api-service.service';
import { AddDesignIdeaCategoryComponent } from '../add-design-idea-category/add-design-idea-category.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface DesignIdeaCategory {
  id?: string | number;
  name: string;
  displayOrder: number;
  isActive: boolean;
  statusLoading?: boolean;
}

@Component({
  selector: 'app-design-idea-category-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSwitchModule,
    NzPopconfirmModule,
    NzToolTipModule,
    AddDesignIdeaCategoryComponent
  ],
  templateUrl: './design-idea-category-list.component.html',
  styleUrl: './design-idea-category-list.component.css'
})
export class DesignIdeaCategoryListComponent implements OnInit, OnDestroy {
  categories: DesignIdeaCategory[] = [];
  loading = false;
  drawerVisible = false;
  selectedCategory: DesignIdeaCategory | null = null;
  nextDisplayOrder: number = 1;

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'displayOrder';
  sortOrder: string = 'ASC';
  totalCount: number = 0;

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchQuery = searchTerm;
      this.pageIndex = 1;
      this.loadCategories();
    });

    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadCategories(): void {
    this.loading = true;
    this.apiService.getDesignIdeaCategories(
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
          if (total === 0) {
            if (res.total !== undefined) total = res.total;
            else if (res.totalCount !== undefined) total = res.totalCount;
          }
        }
        this.totalCount = total;

        if (rawList && rawList.length > 0) {
          this.categories = rawList.map((item: any) => ({
            id: item.id || item.ID || item._id,
            name: item.name || item.Name,
            displayOrder: item.displayOrder || item.sequenceNo || item.SequenceNo || 0,
            isActive: item.isActive !== undefined ? item.isActive : true,
            statusLoading: false
          }));
        } else {
          this.categories = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching Design Idea Categories:', err);
        this.message.error('Failed to load Design Idea Categories');
        this.categories = [];
        this.totalCount = 0;
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadCategories();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadCategories();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.categories.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedCategory = null;
    this.nextDisplayOrder = this.totalCount + 1;
    this.drawerVisible = true;
  }

  openEditDrawer(category: DesignIdeaCategory): void {
    this.selectedCategory = category;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedCategory = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadCategories();
  }

  onStatusChange(category: DesignIdeaCategory, newStatus: boolean): void {
    category.statusLoading = true;
    this.apiService.toggleDesignIdeaCategoryActiveStatus(category.id as string, newStatus).subscribe({
      next: () => {
        category.statusLoading = false;
        this.message.success(`Category status updated successfully!`);
      },
      error: (err) => {
        category.statusLoading = false;
        category.isActive = !newStatus; // Revert change on error
        const errMsg = err?.error?.message || err?.message || "Failed to update category status.";
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
    this.loadCategories();
  }
  
  deleteCategory(id: string | number): void {
    this.loading = true;
    this.apiService.deleteDesignIdeaCategory(id).subscribe({
      next: () => {
        this.message.success('Category deleted successfully');
        this.loadCategories();
      },
      error: (err) => {
        this.loading = false;
        this.message.error('Failed to delete category');
      }
    });
  }
}
