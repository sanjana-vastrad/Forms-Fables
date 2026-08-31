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
import { AddBlogComponent } from '../add-blog/add-blog.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Blog {
  id?: string | number;
  title: string;
  authorName?: string;
  shortDescription?: string;
  slug?: string;
  categoryId?: string | number;
  categoryName?: string;
  imageUrl?: string;
  image_url?: string;
  displayImageUrl?: string;
  tags?: string[];
  sections?: any[];
  displayOrder: number;
  isActive: boolean;
  statusLoading?: boolean;
}

@Component({
  selector: 'app-blog-list',
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
    AddBlogComponent
  ],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css'
})
export class BlogListComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  loading = false;
  drawerVisible = false;
  selectedCategory: Blog | null = null;
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
      this.loadblogs();
    });

    this.loadblogs();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadblogs(): void {
    this.loading = true;
    this.apiService.getBlogs(
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
          this.blogs = rawList.map((item: any) => ({
            id: item.id || item.ID || item._id,
            title: item.title || item.Title || item.name || '',
            authorName: item.authorName || item.author_name || '',
            shortDescription: item.shortDescription || item.short_description || '',
            slug: item.slug || '',
            imageUrl: item.imageUrl || item.image_url || '',
            displayImageUrl: '',
            categoryId: item.categoryId || item.category_id,
            categoryName: item.categoryName || item.category_name || '',
            displayOrder: item.displayOrder || item.sequenceNo || item.SequenceNo || 0,
            isActive: item.isActive !== undefined ? item.isActive : true,
            tags: item.tags || [],
            sections: item.sections || [],
            statusLoading: false
          }));

          // Fetch image blobs securely for preview
          this.blogs.forEach((blog: any) => {
            if (blog.imageUrl) {
              const fullUrl = this.getAbsoluteImageUrl(blog.imageUrl);
              if (fullUrl.startsWith('data:') || fullUrl.startsWith('blob:')) {
                blog.displayImageUrl = fullUrl;
              } else {
                this.apiService.fetchImageBlob(fullUrl).subscribe({
                  next: (blobData: Blob) => {
                    blog.displayImageUrl = URL.createObjectURL(blobData);
                  },
                  error: (err: any) => console.error('Failed to fetch blog image', err)
                });
              }
            }
          });
        } else {
          this.blogs = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching Blogs:', err);
        this.message.error('Failed to load Blogs');
        this.blogs = [];
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
      this.loadblogs();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadblogs();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.blogs.length === 0) return 0;
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

  openEditDrawer(category: Blog): void {
    this.selectedCategory = category;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedCategory = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadblogs();
  }

  onStatusChange(category: Blog, newStatus: boolean): void {
    category.statusLoading = true;
    this.apiService.toggleBlogActiveStatus(category.id as string, newStatus).subscribe({
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
    this.loadblogs();
  }
  
  deleteCategory(id: string | number): void {
    this.loading = true;
    this.apiService.deleteBlog(id).subscribe({
      next: () => {
        this.message.success('Category deleted successfully');
        this.loadblogs();
      },
      error: (err) => {
        this.loading = false;
        this.message.error('Failed to delete category');
      }
    });
  }

  getAbsoluteImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${environment.authUrl}${cleanPath}`;
  }
}
