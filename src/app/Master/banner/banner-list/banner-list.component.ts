import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BannerService, Banner } from '../banner.service';
import { AddBannerComponent } from '../add-banner/add-banner.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-banner-list',
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
    AddBannerComponent
  ],
  templateUrl: './banner-list.component.html',
  styleUrl: './banner-list.component.css'
})
export class BannerListComponent implements OnInit {
  banners: Banner[] = [];
  loading = false;
  drawerVisible = false;
  selectedBanner: Banner | null = null;
  updatingStatusId: string | number | null = null;
  deletingBannerId: string | number | null = null;
  reordering = false;
  nextDisplayOrder: number = 1;

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'displayOrder';
  sortOrder: string = 'ASC';
  totalCount: number = 0;

  constructor(
    private bannerService: BannerService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.loading = true;
    this.bannerService
      .getBanners(
        this.pageIndex,
        this.pageSize,
        this.searchQuery,
        this.sortBy,
        this.sortOrder
      )
      .subscribe({
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
              total = res.data.total !== undefined ? res.data.total : res.data.items.length;
            } else if (Array.isArray(res.data)) {
              rawList = res.data;
              total = res.total || res.totalCount || res.data.length;
            } else if (res.data && Array.isArray(res.data.banners)) {
              rawList = res.data.banners;
              total = res.data.total || res.data.totalCount || res.data.banners.length;
            } else if (Array.isArray(res.result)) {
              rawList = res.result;
              total = res.total || res.totalCount || res.result.length;
            } else if (res.result && Array.isArray(res.result.items)) {
              rawList = res.result.items;
              total = res.result.total !== undefined ? res.result.total : res.result.items.length;
            }

            if (total === 0) {
              if (res.total !== undefined) total = res.total;
              else if (res.totalCount !== undefined) total = res.totalCount;
              else if (res.data && res.data.total !== undefined) total = res.data.total;
              else if (res.data && res.data.totalCount !== undefined) total = res.data.totalCount;
            }
          }

          this.totalCount = total;

          if (rawList && rawList.length > 0) {
            this.banners = rawList.map((item: any) => ({
              id: item.id || item.ID || item._id,
              title: item.title || item.Title || '',
              subtitles: item.subtitles || item.Subtitles || item.subtitle || '',
              description: item.description || item.Description || '',
              imageUrl: item.imageUrl || item.image_url || item.image || '',
              linkUrl: item.linkUrl || item.link_url || item.link || '',
              displayOrder: item.displayOrder !== undefined ? item.displayOrder : item.display_order || 0,
              startsAt: item.startsAt || item.starts_at || '',
              endsAt: item.endsAt || item.ends_at || '',
              isActive: item.isActive !== undefined ? item.isActive : item.is_active !== undefined ? item.is_active : true
            }));
          } else {
            this.banners = [];
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error fetching banners:', err);
          this.banners = [];
          this.totalCount = 0;
        }
      });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadBanners();
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadBanners();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadBanners();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.banners.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedBanner = null;
    this.nextDisplayOrder = this.totalCount + 1;
    this.drawerVisible = true;
  }

  openEditDrawer(banner: Banner): void {
    this.selectedBanner = banner;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedBanner = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadBanners();
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

  openImageInNewTab(url: string): void {
    if (!url) return;
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    const fullUrl = this.getAbsoluteImageUrl(url);
    this.bannerService.fetchImageBlob(fullUrl).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank', 'noopener,noreferrer');
      },
      error: () => {
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
      }
    });
  }

  openLinkInNewTab(url: string): void {
    if (!url) return;
    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }

  copyLinkToClipboard(url: string, event: Event): void {
    event.stopPropagation();
    if (!url) return;
    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        this.message.success('Link copied successfully.');
      }).catch(() => {
        this.fallbackCopyText(fullUrl);
      });
    } else {
      this.fallbackCopyText(fullUrl);
    }
  }

  private fallbackCopyText(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.message.success('Link copied successfully.');
    } catch {
      this.message.error('Failed to copy link.');
    }
    document.body.removeChild(textArea);
  }

  toggleStatus(banner: Banner, newStatus: boolean): void {
    if (this.updatingStatusId) return; // Prevent duplicate requests while updating
    const previousStatus = banner.isActive;
    banner.isActive = newStatus;
    this.updatingStatusId = banner.id;

    this.bannerService.updateBanner(banner.id, { isActive: newStatus }).subscribe({
      next: () => {
        this.updatingStatusId = null;
        this.message.success('Banner status updated successfully.');
      },
      error: (err) => {
        this.updatingStatusId = null;
        banner.isActive = previousStatus; // Revert on failure
        const errMsg = err?.error?.message || err?.message || 'Failed to update banner status.';
        this.message.error(errMsg);
      }
    });
  }

  deleteBanner(banner: Banner): void {
    if (this.deletingBannerId) return; // Prevent duplicate requests
    this.deletingBannerId = banner.id;

    this.bannerService.deleteBanner(banner.id).subscribe({
      next: () => {
        this.deletingBannerId = null;
        this.message.success('Banner deleted successfully.');
        this.loadBanners();
      },
      error: (err) => {
        this.deletingBannerId = null;
        const errMsg = err?.error?.message || err?.message || 'Failed to delete banner.';
        this.message.error(errMsg);
      }
    });
  }

  moveDisplayOrder(banner: Banner, direction: 'UP' | 'DOWN'): void {
    const currentIndex = this.banners.findIndex(b => b.id === banner.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= this.banners.length) return;

    // Swap display orders in UI
    const targetBanner = this.banners[targetIndex];
    const tempOrder = banner.displayOrder;
    banner.displayOrder = targetBanner.displayOrder;
    targetBanner.displayOrder = tempOrder;

    // Re-sort local list
    this.banners.sort((a, b) => a.displayOrder - b.displayOrder);

    // Call Reorder API
    const itemsPayload = this.banners.map(b => ({
      id: b.id,
      displayOrder: b.displayOrder
    }));

    this.reordering = true;
    this.bannerService.reorderBanners(itemsPayload).subscribe({
      next: () => {
        this.reordering = false;
        this.message.success('Banner order updated successfully.');
      },
      error: (err) => {
        this.reordering = false;
        const errMsg = err?.error?.message || err?.message || 'Failed to update banner order.';
        this.message.error(errMsg);
        this.loadBanners(); // Reload original list on error
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
    this.loadBanners();
  }
}
