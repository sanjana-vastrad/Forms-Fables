import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

export interface Banner {
  id: string | number;
  title: string;
  subtitles?: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  displayOrder: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface ReorderItem {
  id: string | number;
  displayOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  constructor(
    private httpClient: HttpClient,
    private cookie: CookieService
  ) {}

  private getAuthOptions() {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') || '';
    }
    if (!token && this.cookie) {
      token = this.cookie.get('token') || '';
      if (token && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', token);
      }
    }
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getBanners(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'displayOrder',
    sortOrder: string = 'ASC'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (search) {
      params = params.set('search', search);
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/banners', requestOptions);
  }

  createBanner(bannerData: {
    title: string;
    subtitles?: string;
    description?: string;
    imageUrl: string;
    linkUrl: string;
    displayOrder: number;
    startsAt: string;
    endsAt: string;
  }): Observable<any> {
    return this.httpClient.post<any>(
      environment.authUrl + 'api/v1/banners',
      bannerData,
      this.getAuthOptions()
    );
  }

  updateBanner(
    id: string | number,
    bannerData: {
      title?: string;
      subtitles?: string;
      description?: string;
      imageUrl?: string;
      linkUrl?: string;
      displayOrder?: number;
      isActive?: boolean;
      startsAt?: string;
      endsAt?: string;
    }
  ): Observable<any> {
    return this.httpClient.put<any>(
      environment.authUrl + `api/v1/banners/${id}`,
      bannerData,
      this.getAuthOptions()
    );
  }

  deleteBanner(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(
      environment.authUrl + `api/v1/banners/${id}`,
      this.getAuthOptions()
    );
  }

  reorderBanners(items: ReorderItem[]): Observable<any> {
    return this.httpClient.patch<any>(
      environment.authUrl + 'api/v1/banners/reorder',
      { items },
      this.getAuthOptions()
    );
  }

  uploadImage(file: File, folderName: string = 'banner'): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') || '';
    }
    if (!token && this.cookie) {
      token = this.cookie.get('token') || '';
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.httpClient.post<any>(
      environment.authUrl + 'api/v1/banners/upload',
      formData,
      { headers }
    );
  }

  uploadImageWithProgress(file: File, folderName: string = 'banner'): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('image', file);

    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') || '';
    }
    if (!token && this.cookie) {
      token = this.cookie.get('token') || '';
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.httpClient.post<any>(
      environment.authUrl + 'api/v1/banners/upload',
      formData,
      {
        headers,
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  fetchImageBlob(imageUrl: string): Observable<Blob> {
    let fullUrl = imageUrl;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('data:')) {
      const baseUrl = (environment.authUrl || '').trim().replace(/\/+$/, '');
      const relativePath = imageUrl.replace(/^\/+/, '');
      fullUrl = `${baseUrl}/${relativePath}`;
    }

    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') || '';
    }
    if (!token && this.cookie) {
      token = this.cookie.get('token') || '';
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.httpClient.get(fullUrl, {
      headers,
      responseType: 'blob'
    });
  }
}
