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
import { AddServiceComponent } from '../add-service/add-service.component';
import { ApiServiceService } from '../../../Service/api-service.service';

export interface ServiceItem {
  id?: string | number;
  title: string;
  slug: string;
  iconUrl: string;
  heroImage: string;
  shortDescription?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  statusLoading?: boolean;
}

@Component({
  selector: 'app-services-list',
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
    AddServiceComponent
  ],
  templateUrl: './services-list.component.html',
  styleUrl: './services-list.component.css'
})
export class ServicesListComponent implements OnInit, OnDestroy {
  services: ServiceItem[] = [];
  loading = false;
  drawerVisible = false;
  selectedService: ServiceItem | null = null;
  nextDisplayOrder: number = 1;

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'displayOrder';
  sortOrder: string = 'ASC';
  totalCount: number = 0;

  constructor(
    private message: NzMessageService,
    private apiService: ApiServiceService
  ) { }

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
  }

  loadServices(): void {
    this.loading = true;
    this.apiService.getServices().subscribe({
      next: (res: any) => {
        const data = res?.data?.items || res?.data || res;
        if (Array.isArray(data)) {
          this.services = data.map(item => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            iconUrl: item.icon_url,
            heroImage: item.hero_url,
            shortDescription: item.shortdescription,
            description: item.fulldescription,
            displayOrder: item.display_order,
            isActive: item.is_active === 1 || item.is_active === true,
            statusLoading: false,
            // Keep full original data just in case needed for edit
            ...item
          }));
          this.totalCount = res?.data?.total || this.services.length;
        } else {
          this.services = [];
          this.totalCount = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.message.error('Failed to load services.');
        console.error(err);
      }
    });
  }

  onSearch(): void {
    // Mock Search
    this.message.info('Search triggered (Mock)');
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.services.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedService = null;
    this.nextDisplayOrder = this.totalCount + 1;
    this.drawerVisible = true;
  }

  openEditDrawer(service: ServiceItem): void {
    if (!service.id) return;
    this.loading = true;
    this.apiService.getServiceByIdOrSlug(service.id).subscribe({
      next: (res: any) => {
        this.loading = false;
        const fullService = res.data || res;
        this.selectedService = fullService;
        this.drawerVisible = true;
      },
      error: (err: any) => {
        this.loading = false;
        this.message.error('Failed to fetch service details.');
        console.error(err);
      }
    });
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedService = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadServices();
  }

  onStatusChange(service: ServiceItem, newStatus: boolean): void {
    service.statusLoading = true;
    setTimeout(() => {
      service.statusLoading = false;
      this.message.success(`Service status updated successfully! (Mock)`);
    }, 500);
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortOrder = 'ASC';
    }
  }
}
