import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiServiceService } from '../../Service/api-service.service';

export interface Lead {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  city: string;
  subject: string;
  message: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  constructor(private apiService: ApiServiceService) {}

  getLeads(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'createdAt',
    sortOrder: string = 'DESC'
  ): Observable<{ items: Lead[]; total: number }> {
    return this.apiService.getLeads(page, limit, search, sortBy, sortOrder).pipe(
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

        const items: Lead[] = rawList.map((item: any, idx: number) => {
          const leadObj = (item.lead && typeof item.lead === 'object') ? item.lead : {};

          const rawCity = item.city || leadObj.city || item.cityName || leadObj.cityName || item.location || leadObj.location;
          let cityStr = '-';
          if (typeof rawCity === 'string') {
            cityStr = rawCity;
          } else if (rawCity && typeof rawCity === 'object') {
            cityStr = rawCity.name || rawCity.cityName || rawCity.label || rawCity.title || '-';
          } else if (typeof rawCity === 'number') {
            cityStr = String(rawCity);
          }

          const rawSubject = item.subject || leadObj.subject || item.service || leadObj.service || item.formType || item.title;
          let subjectStr = 'Contact Us Submission';
          if (typeof rawSubject === 'string') {
            subjectStr = rawSubject;
          } else if (rawSubject && typeof rawSubject === 'object') {
            subjectStr = rawSubject.name || rawSubject.title || rawSubject.label || 'Contact Us Submission';
          }

          const rawMsg = parseString(item.message || leadObj.message || item.remarks || item.query || item.comments || item.description || '').trim();
          const messageStr = (rawMsg && rawMsg !== 'null' && rawMsg !== 'undefined') ? rawMsg : '-';

          const nameStr = parseString(item.name || leadObj.name || item.fullName || leadObj.fullName || item.clientName || leadObj.clientName || item.customerName) || 'N/A';
          const emailStr = parseString(item.email || leadObj.email || item.emailId || leadObj.emailId || item.emailAddress || leadObj.emailAddress) || '-';
          const phoneStr = parsePhone(item.phone || leadObj.phone || item.mobile || leadObj.mobile || item.phoneNumber || leadObj.phoneNumber || item.phoneNo || item.contactNo);

          return {
            id: item.id || item.ID || item._id || (idx + 1),
            name: nameStr,
            email: emailStr,
            phone: phoneStr,
            city: cityStr,
            subject: subjectStr,
            message: messageStr,
            status: parseString(item.status || leadObj.status) || 'New',
            createdAt: parseString(item.createdAt || leadObj.createdAt || item.created_at || item.date || item.createdOn) || '',
            updatedAt: parseString(item.updatedAt || leadObj.updatedAt || item.updated_at) || ''
          };
        });

        return { items, total };
      }),
      catchError((err) => {
        console.warn('LeadsService getLeads Error:', err);
        return of({ items: [], total: 0 });
      })
    );
  }

  deleteLead(id: string | number): Observable<any> {
    return this.apiService.deleteLead(id).pipe(
      catchError((err) => {
        console.error('LeadsService deleteLead Error:', err);
        throw err;
      })
    );
  }
}
