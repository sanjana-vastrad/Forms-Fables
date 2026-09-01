import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiServiceService } from '../../Service/api-service.service';

export interface CityRoutingRule {
  id: string | number;
  cityId: string | number;
  cityName?: string;
  assignedUserId: string | number;
  assignedUserName?: string;
  assignedUserEmail?: string;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CityRoutingRuleService {
  constructor(private apiService: ApiServiceService) {}

  getCityRoutingRules(
    page: number = 1,
    limit: number = 10,
    cityId?: string | number,
    assignedUserId?: string | number,
    search: string = ''
  ): Observable<{ items: CityRoutingRule[]; total: number }> {
    return this.apiService.getCityRoutingRules(page, limit, cityId, assignedUserId, search).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to fetch city routing rules.');
        }

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

        const items: CityRoutingRule[] = rawList.map((item, idx) => ({
          id: item.id || item._id || (idx + 1),
          cityId: item.cityId || item.city?.id || '',
          cityName: item.cityName || item.city?.name || (typeof item.city === 'string' ? item.city : ''),
          assignedUserId: item.assignedUserId || item.assignedUser?.id || item.user?.id || '',
          assignedUserName: item.assignedUserName || item.assignedUser?.name || item.user?.name || (typeof item.assignedUser === 'string' ? item.assignedUser : ''),
          assignedUserEmail: item.assignedUserEmail || item.assignedUser?.email || item.user?.email || '',
          priority: item.priority !== undefined ? Number(item.priority) : 1,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        return { items, total };
      }),
      catchError((err) => {
        console.warn('CityRoutingRuleService getCityRoutingRules Error:', err);
        return of({ items: [], total: 0 });
      })
    );
  }

  createCityRoutingRule(data: {
    cityId: string | number;
    cityName?: string;
    assignedUserId: string | number;
    assignedUserName?: string;
    assignedUserEmail?: string;
    priority?: number;
    isActive?: boolean;
  }): Observable<any> {
    const payload = {
      cityId: isNaN(Number(data.cityId)) ? data.cityId : Number(data.cityId),
      assignedUserId: isNaN(Number(data.assignedUserId)) ? data.assignedUserId : Number(data.assignedUserId),
      priority: data.priority !== undefined ? Number(data.priority) : 1,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    };

    return this.apiService.createCityRoutingRule(payload).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to create city routing rule.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('CityRoutingRuleService createCityRoutingRule Error:', err);
        return throwError(() => err);
      })
    );
  }

  updateCityRoutingRule(
    id: string | number,
    data: {
      cityId?: string | number;
      cityName?: string;
      assignedUserId?: string | number;
      assignedUserName?: string;
      assignedUserEmail?: string;
      priority?: number;
      isActive?: boolean;
    }
  ): Observable<any> {
    const payload: any = {};
    if (data.cityId !== undefined) payload.cityId = isNaN(Number(data.cityId)) ? data.cityId : Number(data.cityId);
    if (data.assignedUserId !== undefined) payload.assignedUserId = isNaN(Number(data.assignedUserId)) ? data.assignedUserId : Number(data.assignedUserId);
    if (data.priority !== undefined) payload.priority = Number(data.priority);
    if (data.isActive !== undefined) payload.isActive = Boolean(data.isActive);

    return this.apiService.updateCityRoutingRule(id, payload).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to update city routing rule.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('CityRoutingRuleService updateCityRoutingRule Error:', err);
        return throwError(() => err);
      })
    );
  }

  deleteCityRoutingRule(id: string | number): Observable<any> {
    return this.apiService.deleteCityRoutingRule(id).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to delete city routing rule.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('CityRoutingRuleService deleteCityRoutingRule Error:', err);
        return throwError(() => err);
      })
    );
  }
}
