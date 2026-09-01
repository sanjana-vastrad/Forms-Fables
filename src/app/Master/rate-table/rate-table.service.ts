import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiServiceService } from '../../Service/api-service.service';

export interface RateTable {
  id: string | number;
  spaceTypeId: string | number;
  spaceTypeName?: string;
  designIdeaCategoryId: string | number;
  designIdeaCategoryName?: string;
  finishTier: string;
  scope: string;
  rateMinPerSqft: number;
  rateMaxPerSqft: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RateTableService {
  constructor(private apiService: ApiServiceService) {}

  getRateTables(
    page: number = 1,
    limit: number = 10,
    spaceTypeId?: string | number,
    designIdeaCategoryId?: string | number,
    scope?: string,
    isActive?: boolean
  ): Observable<{ items: RateTable[]; total: number }> {
    return this.apiService.getRateTables(page, limit, spaceTypeId, designIdeaCategoryId, scope, isActive).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to fetch Rate Tables from backend.');
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

        const items: RateTable[] = rawList.map((item, idx) => ({
          id: item.id || item._id || (idx + 1),
          spaceTypeId: item.spaceTypeId || item.spaceType?.id || '',
          spaceTypeName: item.spaceTypeName || item.spaceType?.name || (typeof item.spaceType === 'string' ? item.spaceType : ''),
          designIdeaCategoryId: item.designIdeaCategoryId || item.designIdeaCategory?.id || item.designCategory?.id || '',
          designIdeaCategoryName: item.designIdeaCategoryName || item.designIdeaCategory?.name || item.designCategory?.name || (typeof item.designCategory === 'string' ? item.designCategory : ''),
          finishTier: item.finishTier || 'Standard',
          scope: item.scope || 'Full Interior',
          rateMinPerSqft: Number(item.rateMinPerSqft || 0),
          rateMaxPerSqft: Number(item.rateMaxPerSqft || 0),
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        return { items, total };
      }),
      catchError((err) => {
        console.error('RateTableService getRateTables Error:', err);
        return throwError(() => err);
      })
    );
  }

  createRateTable(data: {
    spaceTypeId: string | number;
    spaceTypeName?: string;
    designIdeaCategoryId: string | number;
    designIdeaCategoryName?: string;
    finishTier: string;
    scope: string;
    rateMinPerSqft: number;
    rateMaxPerSqft: number;
    isActive?: boolean;
  }): Observable<any> {
    const payload = {
      spaceTypeId: isNaN(Number(data.spaceTypeId)) ? data.spaceTypeId : Number(data.spaceTypeId),
      designIdeaCategoryId: isNaN(Number(data.designIdeaCategoryId)) ? data.designIdeaCategoryId : Number(data.designIdeaCategoryId),
      finishTier: data.finishTier,
      scope: data.scope,
      rateMinPerSqft: Number(data.rateMinPerSqft),
      rateMaxPerSqft: Number(data.rateMaxPerSqft),
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    };

    return this.apiService.createRateTable(payload).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to create rate table.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('RateTableService createRateTable Error:', err);
        return throwError(() => err);
      })
    );
  }

  updateRateTable(
    id: string | number,
    data: {
      spaceTypeId?: string | number;
      spaceTypeName?: string;
      designIdeaCategoryId?: string | number;
      designIdeaCategoryName?: string;
      finishTier?: string;
      scope?: string;
      rateMinPerSqft?: number;
      rateMaxPerSqft?: number;
      isActive?: boolean;
    }
  ): Observable<any> {
    const payload: any = {};
    if (data.spaceTypeId !== undefined) payload.spaceTypeId = isNaN(Number(data.spaceTypeId)) ? data.spaceTypeId : Number(data.spaceTypeId);
    if (data.designIdeaCategoryId !== undefined) payload.designIdeaCategoryId = isNaN(Number(data.designIdeaCategoryId)) ? data.designIdeaCategoryId : Number(data.designIdeaCategoryId);
    if (data.finishTier !== undefined) payload.finishTier = data.finishTier;
    if (data.scope !== undefined) payload.scope = data.scope;
    if (data.rateMinPerSqft !== undefined) payload.rateMinPerSqft = Number(data.rateMinPerSqft);
    if (data.rateMaxPerSqft !== undefined) payload.rateMaxPerSqft = Number(data.rateMaxPerSqft);
    if (data.isActive !== undefined) payload.isActive = Boolean(data.isActive);

    return this.apiService.updateRateTable(id, payload).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to update rate table.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('RateTableService updateRateTable Error:', err);
        return throwError(() => err);
      })
    );
  }

  deleteRateTable(id: string | number): Observable<any> {
    return this.apiService.deleteRateTable(id).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to delete rate table.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('RateTableService deleteRateTable Error:', err);
        return throwError(() => err);
      })
    );
  }
}
