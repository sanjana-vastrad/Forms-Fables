import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RateTableService, RateTable } from '../rate-table.service';
import { AddRateTableComponent } from '../add-rate-table/add-rate-table.component';

@Component({
  selector: 'app-rate-table-list',
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
    AddRateTableComponent
  ],
  templateUrl: './rate-table-list.component.html',
  styleUrl: './rate-table-list.component.css'
})
export class RateTableListComponent implements OnInit {
  rateTables: RateTable[] = [];
  loading = false;
  drawerVisible = false;
  selectedRateTable: RateTable | null = null;
  deletingId: string | number | null = null;

  // Pagination & Filter States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  totalCount: number = 0;

  constructor(
    private rateTableService: RateTableService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadRateTables();
  }

  loadRateTables(): void {
    this.loading = true;
    this.rateTableService.getRateTables(
      this.pageIndex,
      this.pageSize,
      undefined,
      undefined,
      this.searchQuery,
      undefined
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.rateTables = res.items || [];
        this.totalCount = res.total || res.items.length;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching Rate Tables:', err);
        this.message.error('Failed to load Rate Tables.');
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadRateTables();
  }

  openAddDrawer(): void {
    this.selectedRateTable = null;
    this.drawerVisible = true;
  }

  openEditDrawer(rateTable: RateTable): void {
    this.selectedRateTable = rateTable;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedRateTable = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadRateTables();
  }

  toggleStatus(rateTable: RateTable): void {
    const updatedStatus = !rateTable.isActive;
    this.rateTableService.updateRateTable(rateTable.id, { isActive: updatedStatus }).subscribe({
      next: () => {
        rateTable.isActive = updatedStatus;
        this.message.success(`Rate Table ${updatedStatus ? 'activated' : 'deactivated'} successfully.`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.message.error('Failed to update Rate Table status.');
      }
    });
  }

  deleteRateTable(id: string | number): void {
    this.deletingId = id;
    this.rateTableService.deleteRateTable(id).subscribe({
      next: (res: any) => {
        this.deletingId = null;
        if (res && (res.status === false || res.success === false)) {
          this.message.error(res.message || 'Failed to delete Rate Table.');
          return;
        }
        this.message.success('Rate Table deleted successfully.');
        this.loadRateTables();
      },
      error: (err) => {
        this.deletingId = null;
        console.error('Error deleting Rate Table:', err);
        this.message.error(err?.error?.message || err?.message || 'Failed to delete Rate Table.');
      }
    });
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
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadRateTables();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadRateTables();
    }
  }
}
