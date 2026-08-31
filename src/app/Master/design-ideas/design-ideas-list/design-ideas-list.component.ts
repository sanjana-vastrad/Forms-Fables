import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DesignIdeasService, DesignIdea } from '../design-ideas.service';
import { ApiServiceService } from '../../../Service/api-service.service';
import { AddDesignIdeaComponent } from '../add-design-idea/add-design-idea.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-design-ideas-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzSpinModule,
    AddDesignIdeaComponent
  ],
  templateUrl: './design-ideas-list.component.html',
  styleUrl: './design-ideas-list.component.css'
})
export class DesignIdeasListComponent implements OnInit {
  // Component state
  @ViewChild(AddDesignIdeaComponent) addDesignComp?: AddDesignIdeaComponent;

  allDesigns: DesignIdea[] = [];
  filteredDesigns: DesignIdea[] = [];
  loading = false;
  drawerVisible = false;
  selectedDesign: DesignIdea | null = null;
  deletingId: string | null = null;

  // Filter Tabs
  filterTabs = ['All', 'Kitchen', 'Living Room', 'Bedroom'];
  activeTab = 'All';

  // Search & Pagination
  searchQuery = '';
  pageIndex = 1;
  pageSize = 10;
  sortBy = 'title';
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  totalCount = 0;

  constructor(
    private designIdeasService: DesignIdeasService,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadDesigns();
  }

  loadDesigns(): void {
    this.loading = true;
    this.designIdeasService.getDesignIdeas(this.pageIndex, this.pageSize, this.searchQuery, this.sortBy, this.sortOrder).subscribe({
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
        this.allDesigns = rawList.map(item => {
          const mappedImages = Array.isArray(item.images) 
            ? item.images.map((img: any) => (typeof img === 'string' ? img : img.imageUrl)).filter((url: any) => !!url)
            : [];
          
          let thumbnail = item.thumbnail;
          if (!thumbnail && mappedImages.length > 0) {
            thumbnail = mappedImages[0];
          }

          const mappedItem = {
            ...item,
            categoryId: item.designIdeaCategoryId || item.categoryId,
            categoryName: item.category?.name || item.categoryName || item.category,
            category: item.category?.name || item.categoryName || item.category, // Fallback for filter tab
            thumbnail: '', // initially empty to avoid CORS
            loadingThumbnail: true,
            images: mappedImages
          };

          const absolute = this.getAbsoluteImageUrl(thumbnail);
          if (absolute) {
            this.apiService.fetchImageBlob(absolute).subscribe({
              next: (blob) => {
                mappedItem.thumbnail = URL.createObjectURL(blob);
                mappedItem.loadingThumbnail = false;
              },
              error: () => {
                mappedItem.thumbnail = absolute;
                mappedItem.loadingThumbnail = false;
              }
            });
          } else {
            mappedItem.loadingThumbnail = false;
          }

          return mappedItem;
        });
        // If we do client-side filtering on active tab, we can still do it, or pass activeTab to API. 
        // For now, we rely on search query to filter by active tab if API doesn't support category filter natively.
        this.applyFilters();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching design ideas:', err);
        this.message.error('Failed to load Design Ideas');
      }
    });
  }

  setFilterTab(tab: string): void {
    this.activeTab = tab;
    this.pageIndex = 1;
    this.applyFilters();
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadDesigns();
  }

  applyFilters(): void {
    let result = [...this.allDesigns];

    // Filter Tab (client-side fallback if server doesn't filter)
    if (this.activeTab !== 'All') {
      result = result.filter(item => item.categoryName ? item.categoryName.toLowerCase() === this.activeTab.toLowerCase() : (item.category && item.category.toLowerCase() === this.activeTab.toLowerCase()));
    }

    this.filteredDesigns = result;
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortOrder = 'ASC';
    }
    this.loadDesigns();
  }

  // Paged dataset slice
  get pagedDesigns(): DesignIdea[] {
    return this.filteredDesigns;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.filteredDesigns.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadDesigns();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadDesigns();
    }
  }

  openAddDrawer(): void {
    this.selectedDesign = null;
    this.drawerVisible = true;
  }

  openEditDrawer(design: DesignIdea, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedDesign = design;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedDesign = null;
  }

  getAbsoluteImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = (environment.authUrl || '').trim().replace(/\/+$/, '');
    const relativePath = url.replace(/^\/+/, '');
    return `${baseUrl}/${relativePath}`;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadDesigns();
  }

  saveDesign(): void {
    if (this.addDesignComp) {
      this.addDesignComp.submitForm();
    }
  }

  isSaveLoading(): boolean {
    return !!this.addDesignComp?.loading;
  }

  deleteDesign(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.deletingId = id;
    this.designIdeasService.deleteDesignIdea(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.message.success('Design Idea deleted successfully.');
        this.loadDesigns();
      },
      error: () => {
        this.deletingId = null;
        this.message.error('Failed to delete design idea.');
      }
    });
  }
}
