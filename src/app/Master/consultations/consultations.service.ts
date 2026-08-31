import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiServiceService } from '../../Service/api-service.service';

export interface ConsultationLead {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  city: string;
  homeType: string;
  designService: string;
  approximateBudget: string;
  preferredDate: string;
  projectDetails: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService {
  constructor(private apiService: ApiServiceService) {}

  getConsultationLeads(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'createdAt',
    sortOrder: string = 'DESC'
  ): Observable<{ items: ConsultationLead[]; total: number }> {
    return this.apiService.getConsultationLeads(page, limit, search, sortBy, sortOrder).pipe(
      map((res: any) => {
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
          } else if (res.data && Array.isArray(res.data.leads)) {
            rawList = res.data.leads;
            total = res.data.total || res.data.totalCount || res.data.leads.length;
          } else if (res.leads && Array.isArray(res.leads)) {
            rawList = res.leads;
            total = res.total || res.totalCount || res.leads.length;
          } else if (Array.isArray(res.result)) {
            rawList = res.result;
            total = res.total || res.totalCount || res.result.length;
          } else if (res.result && Array.isArray(res.result.items)) {
            rawList = res.result.items;
            total = res.result.total !== undefined ? res.result.total : res.result.items.length;
          }

          if (total === 0) {
            if (res.total !== undefined) total = res.total;
            else if (res.totalCount !== undefined) total = res.totalCount;
            else if (res.data && res.data.total !== undefined) total = res.data.total;
          }
        }

        const parseString = (val: any): string => {
          if (val === null || val === undefined) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'number') return String(val);
          if (typeof val === 'object') {
            return val.name || val.cityName || val.title || val.label || '';
          }
          return String(val);
        };

        const parsePhone = (val: any): string => {
          if (val === null || val === undefined || val === '') return '-';
          let str = parseString(val).trim();
          if (!str || str === 'null' || str === 'undefined' || str === '-') return '-';

          if (str.toLowerCase().includes('e+')) {
            try {
              const num = Number(str);
              if (!isNaN(num)) {
                str = BigInt(Math.round(num)).toString();
              }
            } catch {
              // fallback
            }
          }
          return str;
        };

        const items: ConsultationLead[] = rawList.map((item: any, idx: number) => {
          const leadObj = (item.lead && typeof item.lead === 'object') ? item.lead : {};
          const cityObj = (leadObj.city && typeof leadObj.city === 'object') ? leadObj.city : ((item.city && typeof item.city === 'object') ? item.city : null);
          const homeTypeObj = (item.homeType && typeof item.homeType === 'object') ? item.homeType : {};
          const designServiceObj = (item.designService && typeof item.designService === 'object') ? item.designService : {};

          // City
          let cityStr = '-';
          if (cityObj && (cityObj.name || cityObj.cityName)) {
            cityStr = cityObj.name || cityObj.cityName;
          } else if (typeof item.city === 'string' && item.city) {
            cityStr = item.city;
          } else if (typeof leadObj.city === 'string' && leadObj.city) {
            cityStr = leadObj.city;
          }

          // Home Type
          const homeTypeStr = parseString(homeTypeObj.homeType || homeTypeObj.name || item.homeType || item.homeTypeName) || '-';

          // Design Service / What do you want to Design
          const designServiceStr = parseString(designServiceObj.title || designServiceObj.name || item.designService || item.subject || item.service) || '-';

          // Approximate Budget
          const rawBudget = parseString(item.approximateBudget || item.budget || item.budgetBand);
          const budgetStr = rawBudget ? `₹${rawBudget}` : '-';

          // Preferred Date
          const prefDateStr = parseString(item.preferredDate || item.date) || '-';

          // Project Details / Tell us more
          const rawDetails = parseString(item.projectDetails || item.message || item.remarks || item.query || item.description).trim();
          const projectDetailsStr = (rawDetails && rawDetails !== 'null' && rawDetails !== 'undefined') ? rawDetails : '-';

          const nameStr = parseString(leadObj.name || item.name || leadObj.fullName || item.fullName) || 'N/A';
          const emailStr = parseString(leadObj.email || item.email || leadObj.emailId || item.emailId) || '-';
          const phoneStr = parsePhone(leadObj.phone || item.phone || leadObj.mobile || item.mobile);

          return {
            id: item.id || item.ID || item._id || (idx + 1),
            name: nameStr,
            email: emailStr,
            phone: phoneStr,
            city: cityStr,
            homeType: homeTypeStr,
            designService: designServiceStr,
            approximateBudget: budgetStr,
            preferredDate: prefDateStr,
            projectDetails: projectDetailsStr,
            status: parseString(item.status || leadObj.status) || 'New',
            createdAt: parseString(item.createdAt || leadObj.createdAt || item.created_at || item.date || item.createdOn) || '',
            updatedAt: parseString(item.updatedAt || leadObj.updatedAt || item.updated_at) || ''
          };
        });

        return { items, total };
      }),
      catchError((err) => {
        console.warn('ConsultationsService getConsultationLeads Error:', err);
        return of({ items: [], total: 0 });
      })
    );
  }
}
