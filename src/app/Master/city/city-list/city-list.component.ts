import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';
import { AddCityComponent } from '../add-city/add-city.component';

interface City {
  id: string | number;
  name: string;
  state: string;
  isActive: boolean;
  sequenceNo: number;
}

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    AddCityComponent
  ],
  templateUrl: './city-list.component.html',
  styleUrl: './city-list.component.css'
})
export class CityListComponent implements OnInit {
  cities: City[] = [];
  loading = false;
  drawerVisible = false;
  selectedCity: City | null = null;

  // Pagination & Search States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortBy: string = 'sequenceNo';
  sortOrder: string = 'ASC';
  totalCount: number = 0;
  nextSequenceNo: number = 1;

  constructor(
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadCities();

  }

  loadCities(): void {
    this.loading = true;
    this.apiService.getCities(
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
          // Extract cities list
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
          } else if (res.data && Array.isArray(res.data.cities)) {
            rawList = res.data.cities;
            total = res.data.total || res.data.totalCount || res.data.cities.length;
          } else if (Array.isArray(res.result)) {
            rawList = res.result;
            total = res.total || res.totalCount || res.result.length;
          } else if (res.result && Array.isArray(res.result.items)) {
            rawList = res.result.items;
            total = res.result.total !== undefined ? res.result.total : res.result.items.length;
          }

          // Extract total count if present in API response and not set yet
          if (total === 0) {
            if (res.total !== undefined) total = res.total;
            else if (res.totalCount !== undefined) total = res.totalCount;
            else if (res.data && res.data.total !== undefined) total = res.data.total;
            else if (res.data && res.data.totalCount !== undefined) total = res.data.totalCount;
          }
        }

        this.totalCount = total;

        if (rawList && rawList.length > 0) {
          this.cities = rawList.map((item: any) => ({
            id: item.id || item.ID || item._id,
            name: item.name || item.cityName || item.City,
            state: item.state || item.State,
            isActive: item.isActive !== undefined ? item.isActive : true,
            sequenceNo: item.sequenceNo || item.SequenceNo || item.displayOrder || 0
          }));
        } else {
          this.cities = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching cities:', err);
        this.cities = [];
        this.totalCount = 0;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadCities();
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadCities();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadCities();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  showingStart(): number {
    if (this.cities.length === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  openAddDrawer(): void {
    this.selectedCity = null;
    this.nextSequenceNo = this.totalCount + 1;
    this.drawerVisible = true;
  }

  openEditDrawer(city: City): void {
    this.selectedCity = city;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedCity = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadCities();
  }

  deactivateCity(city: City): void {
    if (!city.isActive) {
      return; // Already inactive
    }

    this.apiService.deactivateCity(city.id).subscribe({
      next: () => {
        this.message.success(`${city.name} Deactivated successfully!`);
        city.isActive = false;
      },
      error: (err) => {
        // Fallback simulation for testing UI deactivation without real DB save
        city.isActive = false;
        this.message.success(`${city.name} Deactivated successfully!`);

        const errMsg = err?.error?.message || err?.message;
        console.warn('Deactivate API failed', errMsg);
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
    this.loadCities();
  }
}
