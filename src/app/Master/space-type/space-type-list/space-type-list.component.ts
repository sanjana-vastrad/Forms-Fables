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
import { SpaceTypeService, SpaceType } from '../space-type.service';
import { AddSpaceTypeComponent } from '../add-space-type/add-space-type.component';

@Component({
  selector: 'app-space-type-list',
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
    AddSpaceTypeComponent
  ],
  templateUrl: './space-type-list.component.html',
  styleUrl: './space-type-list.component.css'
})
export class SpaceTypeListComponent implements OnInit {
  spaceTypes: SpaceType[] = [];
  loading = false;
  drawerVisible = false;
  selectedSpaceType: SpaceType | null = null;

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'displayOrder';
  sortOrder: string = 'ASC';
  totalCount: number = 0;
  nextSequenceNo: number = 1;

  constructor(
    private spaceTypeService: SpaceTypeService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadSpaceTypes();
  }

  loadSpaceTypes(): void {
    this.loading = true;
    this.spaceTypeService.getSpaceTypes(
      this.pageIndex,
      this.pageSize,
      this.searchQuery,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.spaceTypes = res.items || [];
        this.totalCount = res.total || res.items.length;

        if (this.spaceTypes.length > 0) {
          const maxSeq = Math.max(...this.spaceTypes.map(s => s.displayOrder || 0));
          this.nextSequenceNo = maxSeq + 1;
        } else {
          this.nextSequenceNo = 1;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching Space Types:', err);
        this.message.error('Failed to load Space Types.');
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadSpaceTypes();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortOrder = 'ASC';
    }
    this.loadSpaceTypes();
  }

  openAddDrawer(): void {
    this.selectedSpaceType = null;
    this.drawerVisible = true;
  }

  openEditDrawer(spaceType: SpaceType): void {
    this.selectedSpaceType = spaceType;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedSpaceType = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadSpaceTypes();
  }

  toggleStatus(spaceType: SpaceType): void {
    const updatedStatus = !spaceType.isActive;
    this.spaceTypeService.updateSpaceType(spaceType.id, { isActive: updatedStatus }).subscribe({
      next: () => {
        spaceType.isActive = updatedStatus;
        this.message.success(`Space Type ${updatedStatus ? 'activated' : 'deactivated'} successfully.`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.message.error('Failed to update Space Type status.');
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
      this.loadSpaceTypes();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadSpaceTypes();
    }
  }
}
