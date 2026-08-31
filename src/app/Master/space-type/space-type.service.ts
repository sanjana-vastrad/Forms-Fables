import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiServiceService } from '../../Service/api-service.service';

export interface SpaceType {
  id: string | number;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpaceTypeService {
  private storageKey = 'forms_fables_space_types_data';

  private initialSpaceTypes: SpaceType[] = [
    { id: 'st_001', name: 'Kitchen', displayOrder: 1, isActive: true },
    { id: 'st_002', name: 'Living Room', displayOrder: 2, isActive: true },
    { id: 'st_003', name: 'Bedroom', displayOrder: 3, isActive: true },
    { id: 'st_004', name: 'Dining Room', displayOrder: 4, isActive: true },
    { id: 'st_005', name: 'Bathroom', displayOrder: 5, isActive: true },
    { id: 'st_006', name: 'Balcony & Terrace', displayOrder: 6, isActive: true },
    { id: 'st_007', name: 'Home Office', displayOrder: 7, isActive: true },
    { id: 'st_008', name: 'Pooja Room', displayOrder: 8, isActive: true }
  ];

  constructor(private apiService: ApiServiceService) {
    this.initLocalData();
  }

  private initLocalData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.initialSpaceTypes));
      }
    }
  }

  private getLocalSpaceTypes(): SpaceType[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return [...this.initialSpaceTypes];
        }
      }
    }
    return [...this.initialSpaceTypes];
  }

  private saveLocalSpaceTypes(items: SpaceType[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }

  getSpaceTypes(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'displayOrder',
    sortOrder: string = 'ASC'
  ): Observable<{ items: SpaceType[]; total: number }> {
    return this.apiService.getSpaceTypes(page, limit, search, sortBy, sortOrder).pipe(
      map((res: any) => {
        let rawList: any[] = [];
        let total = 0;

        if (Array.isArray(res)) {
          rawList = res;
          total = res.length;
        } else if (res.items && Array.isArray(res.items)) {
          rawList = res.items;
          total = res.total !== undefined ? res.total : res.items.length;
        } else if (res.data && Array.isArray(res.data.items)) {
          rawList = res.data.items;
          total = res.data.total !== undefined ? res.data.total : res.data.items.length;
        } else if (res.data && Array.isArray(res.data)) {
          rawList = res.data;
          total = res.total || res.data.length;
        }

        const items: SpaceType[] = rawList.map((item, idx) => ({
          id: item.id || item._id || `st_${idx + 1}`,
          name: item.name || '',
          displayOrder: item.displayOrder !== undefined ? Number(item.displayOrder) : idx + 1,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        return { items, total };
      }),
      catchError(() => {
        // Fallback offline mode
        let list = this.getLocalSpaceTypes();
        if (search) {
          const q = search.toLowerCase().trim();
          list = list.filter(item => item.name.toLowerCase().includes(q));
        }

        list.sort((a, b) => {
          if (sortBy === 'name') {
            return sortOrder === 'ASC'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
          return sortOrder === 'ASC'
            ? a.displayOrder - b.displayOrder
            : b.displayOrder - a.displayOrder;
        });

        const total = list.length;
        const startIndex = (page - 1) * limit;
        const items = list.slice(startIndex, startIndex + limit);

        return of({ items, total });
      })
    );
  }

  createSpaceType(data: { name: string; displayOrder?: number; isActive?: boolean }): Observable<SpaceType> {
    return this.apiService.createSpaceType(data).pipe(
      map((res: any) => {
        const item = res.data || res;
        return {
          id: item.id || item._id || Date.now(),
          name: item.name || data.name,
          displayOrder: item.displayOrder !== undefined ? Number(item.displayOrder) : (data.displayOrder || 1),
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true
        };
      }),
      catchError(() => {
        const list = this.getLocalSpaceTypes();
        const newRecord: SpaceType = {
          id: `st_${Date.now()}`,
          name: data.name,
          displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : list.length + 1,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
        };
        list.push(newRecord);
        this.saveLocalSpaceTypes(list);
        return of(newRecord);
      })
    );
  }

  updateSpaceType(id: string | number, data: { name?: string; displayOrder?: number; isActive?: boolean }): Observable<SpaceType> {
    return this.apiService.updateSpaceType(id, data).pipe(
      map((res: any) => {
        const item = res.data || res;
        return {
          id: item.id || id,
          name: item.name !== undefined ? item.name : (data.name || ''),
          displayOrder: item.displayOrder !== undefined ? Number(item.displayOrder) : (data.displayOrder || 1),
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true
        };
      }),
      catchError(() => {
        const list = this.getLocalSpaceTypes();
        const index = list.findIndex(item => String(item.id) === String(id));
        if (index !== -1) {
          list[index] = {
            ...list[index],
            ...data
          };
          this.saveLocalSpaceTypes(list);
          return of(list[index]);
        }
        return of({
          id,
          name: data.name || '',
          displayOrder: data.displayOrder || 1,
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      })
    );
  }

  deactivateSpaceType(id: string | number): Observable<boolean> {
    return this.apiService.deactivateSpaceType(id).pipe(
      map(() => true),
      catchError(() => {
        const list = this.getLocalSpaceTypes();
        const index = list.findIndex(item => String(item.id) === String(id));
        if (index !== -1) {
          list[index].isActive = false;
          this.saveLocalSpaceTypes(list);
        }
        return of(true);
      })
    );
  }
}
