import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { LeadsService, Lead } from '../leads.service';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzTagModule,
    NzToolTipModule
  ],
  templateUrl: './leads-list.component.html',
  styleUrl: './leads-list.component.css'
})
export class LeadsListComponent implements OnInit, OnDestroy {
  leads: Lead[] = [];
  loading = false;
  drawerVisible = false;
  selectedLead: Lead | null = null;
  deletingId: string | number | null = null;

  // Pagination & Filter States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'createdAt';
  sortOrder: string = 'DESC';
  totalCount: number = 0;

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private leadsService: LeadsService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.loadLeads();
    });

    this.loadLeads();
  }

  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  loadLeads(): void {
    this.loading = true;
    this.leadsService.getLeads(
      this.pageIndex,
      this.pageSize,
      this.searchQuery,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (res) => {
        this.loading = false;
        let items = res.items || [];

        // Smart client-side search filtering fallback
        if (this.searchQuery && this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase().trim();
          const filtered = items.filter((item: Lead) =>
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.email && item.email.toLowerCase().includes(q)) ||
            (item.phone && item.phone.toLowerCase().includes(q)) ||
            (item.city && item.city.toLowerCase().includes(q)) ||
            (item.subject && item.subject.toLowerCase().includes(q)) ||
            (item.message && item.message.toLowerCase().includes(q))
          );
          if (filtered.length > 0 || items.length > 0) {
            items = filtered;
          }
        }

        this.leads = items;
        this.totalCount = (this.searchQuery && this.searchQuery.trim()) ? items.length : (res.total !== undefined ? res.total : (res.items?.length || items.length));
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching leads:', err);
        this.message.error('Failed to load leads report.');
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  openDetailDrawer(lead: Lead): void {
    this.selectedLead = lead;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedLead = null;
  }

  deleteLead(id: string | number): void {
    this.deletingId = id;
    this.leadsService.deleteLead(id).subscribe({
      next: (res: any) => {
        this.deletingId = null;
        if (res && (res.status === false || res.success === false)) {
          this.message.error(res.message || 'Failed to delete lead.');
          return;
        }
        this.message.success('Lead deleted successfully.');
        this.loadLeads();
      },
      error: (err) => {
        this.deletingId = null;
        console.error('Error deleting lead:', err);
        this.message.error(err?.error?.message || err?.message || 'Failed to delete lead.');
      }
    });
  }

  exportCSV(): void {
    if (!this.leads || this.leads.length === 0) {
      this.message.warning('No leads available to export.');
      return;
    }

    const headers = ['Date', 'Name', 'Email', 'Phone', 'Subject', 'Message'];
    const csvRows = [headers.join(',')];

    const safeStr = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return val.name || val.cityName || JSON.stringify(val);
      return String(val);
    };

    for (const item of this.leads) {
      const phoneVal = safeStr(item.phone).trim();
      const formattedPhone = (phoneVal && phoneVal !== '-') ? `\t${phoneVal}` : '-';

      const row = [
        `"${this.formatDate(item.createdAt)}"`,
        `"${safeStr(item.name).replace(/"/g, '""')}"`,
        `"${safeStr(item.email).replace(/"/g, '""')}"`,
        `"${formattedPhone.replace(/"/g, '""')}"`,
        `"${safeStr(item.subject).replace(/"/g, '""')}"`,
        `"${safeStr(item.message).replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contact_us_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.message.success('Leads report exported successfully.');
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  showingStart(): number {
    if (this.totalCount === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    const end = this.pageIndex * this.pageSize;
    return end > this.totalCount ? this.totalCount : end;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadLeads();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadLeads();
    }
  }
}
