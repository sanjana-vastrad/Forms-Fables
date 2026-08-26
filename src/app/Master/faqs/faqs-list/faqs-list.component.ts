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
import { AddFaqComponent } from '../../faqs/add-faq/add-faq.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface Faq {
  id?: string | number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  statusLoading?: boolean;
}

@Component({
  selector: 'app-faqs-list',
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
    AddFaqComponent
  ],
  templateUrl: './faqs-list.component.html',
  styleUrl: './faqs-list.component.css'
})
export class FaqsListComponent implements OnInit, OnDestroy {
  faqs: Faq[] = [];
  loading = false;
  drawerVisible = false;
  selectedFaq: Faq | null = null;
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
    // Setup debounced search to ensure removing text with backspace loads correctly without race conditions
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchQuery = searchTerm;
      this.pageIndex = 1;
      this.loadFaqs();
    });

    this.loadFaqs();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadFaqs(): void {
    this.loading = true;
    this.apiService.getFaqs(
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
          } else if (res.data && Array.isArray(res.data.faqs)) {
            rawList = res.data.faqs;
            total = res.data.total || res.data.totalCount || res.data.faqs.length;
          }

          if (total === 0) {
            if (res.total !== undefined) total = res.total;
            else if (res.totalCount !== undefined) total = res.totalCount;
          }
        }

        this.totalCount = total;

        if (rawList && rawList.length > 0) {
          this.faqs = rawList.map((item: any) => ({
            id: item.id || item.ID || item._id,
            question: item.question || item.Question,
            answer: item.answer || item.Answer,
            displayOrder: item.displayOrder || item.DisplayOrder || 0,
            isActive: item.isActive !== undefined ? item.isActive : true,
            statusLoading: false
          }));
        } else {
          this.faqs = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching FAQs:', err);
        this.message.error('Failed to load FAQs');
        this.faqs = [];
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
      this.loadFaqs();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadFaqs();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.faqs.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedFaq = null;
    this.nextDisplayOrder = this.totalCount + 1;
    this.drawerVisible = true;
  }

  openEditDrawer(faq: Faq): void {
    this.selectedFaq = faq;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedFaq = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadFaqs();
  }

  onStatusChange(faq: Faq, newStatus: boolean): void {
    faq.statusLoading = true;
    this.apiService.toggleFaqActiveStatus(faq.id as string, newStatus).subscribe({
      next: () => {
        faq.statusLoading = false;
        this.message.success(`FAQ status updated successfully!`);
      },
      error: (err) => {
        faq.statusLoading = false;
        faq.isActive = !newStatus; // Revert change on error
        const errMsg = err?.error?.message || err?.message || 'Failed to update FAQ status.';
        this.message.error(errMsg);
      }
    });
  }

  moveUp(index: number): void {
    if (index > 0) {
      this.swapOrder(index, index - 1);
    }
  }

  moveDown(index: number): void {
    if (index < this.faqs.length - 1) {
      this.swapOrder(index, index + 1);
    }
  }

  swapOrder(index1: number, index2: number): void {
    const tempOrder = this.faqs[index1].displayOrder;
    this.faqs[index1].displayOrder = this.faqs[index2].displayOrder;
    this.faqs[index2].displayOrder = tempOrder;

    const tempFaq = this.faqs[index1];
    this.faqs[index1] = this.faqs[index2];
    this.faqs[index2] = tempFaq;

    const reorderPayload = [
      { id: this.faqs[index1].id as string, displayOrder: this.faqs[index1].displayOrder },
      { id: this.faqs[index2].id as string, displayOrder: this.faqs[index2].displayOrder }
    ];

    this.apiService.reorderFaqs(reorderPayload).subscribe({
      next: () => {
        this.message.success('FAQ order updated successfully');
      },
      error: (err) => {
        this.message.error('Failed to update FAQ order');
        this.loadFaqs();
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
    this.loadFaqs();
  }
  deleteFaq(id: string | number): void {
    this.loading = true;
    this.apiService.deleteFaq(id).subscribe({
      next: () => {
        this.message.success('FAQ deleted successfully');
        this.loadFaqs();
      },
      error: (err) => {
        this.loading = false;
        this.message.error('Failed to delete FAQ');
      }
    });
  }
}
