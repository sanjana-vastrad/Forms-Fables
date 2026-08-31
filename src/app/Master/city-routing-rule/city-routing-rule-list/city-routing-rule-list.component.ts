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
import { CityRoutingRuleService, CityRoutingRule } from '../city-routing-rule.service';
import { AddCityRoutingRuleComponent } from '../add-city-routing-rule/add-city-routing-rule.component';

@Component({
  selector: 'app-city-routing-rule-list',
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
    AddCityRoutingRuleComponent
  ],
  templateUrl: './city-routing-rule-list.component.html',
  styleUrl: './city-routing-rule-list.component.css'
})
export class CityRoutingRuleListComponent implements OnInit {
  rules: CityRoutingRule[] = [];
  loading = false;
  drawerVisible = false;
  selectedRule: CityRoutingRule | null = null;
  deletingId: string | number | null = null;

  // Pagination & Filter States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  totalCount: number = 0;

  constructor(
    private routingRuleService: CityRoutingRuleService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadRoutingRules();
  }

  loadRoutingRules(): void {
    this.loading = true;
    this.routingRuleService.getCityRoutingRules(
      this.pageIndex,
      this.pageSize,
      undefined,
      undefined,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.rules = res.items || [];
        this.totalCount = res.total || res.items.length;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching City Routing Rules:', err);
        this.message.error('Failed to load City Routing Rules.');
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadRoutingRules();
  }

  openAddDrawer(): void {
    this.selectedRule = null;
    this.drawerVisible = true;
  }

  openEditDrawer(rule: CityRoutingRule): void {
    this.selectedRule = rule;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedRule = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadRoutingRules();
  }

  toggleStatus(rule: CityRoutingRule): void {
    const updatedStatus = !rule.isActive;
    this.routingRuleService.updateCityRoutingRule(rule.id, { isActive: updatedStatus }).subscribe({
      next: () => {
        rule.isActive = updatedStatus;
        this.message.success(`City Routing Rule ${updatedStatus ? 'activated' : 'deactivated'} successfully.`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.message.error('Failed to update status.');
      }
    });
  }

  deleteRule(id: string | number): void {
    this.deletingId = id;
    this.routingRuleService.deleteCityRoutingRule(id).subscribe({
      next: (res: any) => {
        this.deletingId = null;
        if (res && (res.status === false || res.success === false)) {
          this.message.error(res.message || 'Failed to delete City Routing Rule.');
          return;
        }
        this.message.success('City Routing Rule deleted successfully.');
        this.loadRoutingRules();
      },
      error: (err) => {
        this.deletingId = null;
        console.error('Error deleting City Routing Rule:', err);
        this.message.error(err?.error?.message || err?.message || 'Failed to delete City Routing Rule.');
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
      this.loadRoutingRules();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadRoutingRules();
    }
  }
}
