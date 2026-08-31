import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiServiceService } from '../../Service/api-service.service';

export interface Testimonial {
  id: string | number;
  name: string;
  message: string;
  photo?: string;
  video?: string;
  status?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  constructor(private apiService: ApiServiceService) {}

  getTestimonials(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search: string = ''
  ): Observable<{ items: Testimonial[]; total: number }> {
    return this.apiService.getTestimonials(page, limit, status, search).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to fetch testimonials.');
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

        const items: Testimonial[] = rawList.map((item, idx) => ({
          id: item.id || item._id || (idx + 1),
          name: item.name || 'Anonymous Client',
          message: item.message || item.testimonial || '',
          photo: item.photo || item.photoUrl || item.imageUrl || '',
          video: item.video || item.videoUrl || '',
          status: item.status || 'APPROVED',
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        return { items, total };
      }),
      catchError((err) => {
        console.error('TestimonialService getTestimonials Error:', err);
        return throwError(() => err);
      })
    );
  }

  createTestimonial(formData: FormData): Observable<any> {
    return this.apiService.createTestimonial(formData).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to create testimonial.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('TestimonialService createTestimonial Error:', err);
        return throwError(() => err);
      })
    );
  }

  updateTestimonial(id: string | number, payload: FormData | any): Observable<any> {
    return this.apiService.updateTestimonial(id, payload).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to update testimonial.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('TestimonialService updateTestimonial Error:', err);
        return throwError(() => err);
      })
    );
  }

  deleteTestimonial(id: string | number): Observable<any> {
    return this.apiService.deleteTestimonial(id).pipe(
      map((res: any) => {
        if (res && (res.status === false || res.success === false)) {
          throw new Error(res.message || 'Failed to delete testimonial.');
        }
        return res;
      }),
      catchError((err) => {
        console.error('TestimonialService deleteTestimonial Error:', err);
        return throwError(() => err);
      })
    );
  }
}
