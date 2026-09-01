import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import { CommonFunctionService } from './CommonFunctionService';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  clientId: number = 1;
  public commonFunction = new CommonFunctionService();
  cloudID: any;
  httpHeaders = new HttpHeaders();
  options = {
    headers: this.httpHeaders,
  };
  httpHeaders1 = new HttpHeaders();
  options1 = {
    headers: this.httpHeaders1,
  };
  gmUrl = environment.gmUrl;
  baseUrl = environment.baseUrl;
  url = environment.url;
  retriveimgUrl = environment.retriveimgUrl;
  imgUrl = environment.imgUrl;
  imgUrl1 = environment.imgUrl1;
  dateforlog =
    new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  emailId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('emailId') : null;
  userId = typeof sessionStorage !== 'undefined' ? Number(sessionStorage.getItem('userId')) : 0;
  userName = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('userName') : null;
  roleId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('roleId') : null;
  APPLICATION_KEY: string = 'ZU63HDzj79PEFzz5';
  API_KEY: string = 'WGykEs0b241gNKcDshYU9C4I0Ft1JoSb'
  // For  Testing server
  getheader() {
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdatas(this.APPLICATION_KEY),
      apikey: this.commonFunction.encryptdatas(this.API_KEY),
      deviceid: this.cookie.get('deviceId'),
      supportkey: this.cookie.get('supportKey'),
      Token: this.cookie.get('token'),
      skip_zrok_interstitial: 'true',
      'ngrok-skip-browser-warning': 'true',
    });
    this.options = {
      headers: this.httpHeaders,
    };

  }
  constructor(
    private cookie: CookieService,
    private httpClient: HttpClient) {
    if (
      this.cookie.get('deviceId') === '' ||
      this.cookie.get('deviceId') === null
    ) {
      var deviceId = this.randomstring(16);
      this.cookie.set(
        'deviceId',
        deviceId.toString(),
        365,
        '/',
        '',
        true,
        'None'
      );
    }
    this.getheader();
  }

  logoutcall(): Observable<any> {
    var data = {
      USER_ID: this.commonFunction.decryptdata(
        sessionStorage.getItem('userId') || ''
      ),
      ROLE_ID: this.commonFunction.decryptdata(
        sessionStorage.getItem('roleId') || ''
      )
    };
    return this.httpClient.post<any>(
      this.url + 'user/logout ',
      JSON.stringify(data),
      this.options
    );
  }
  randomstring(L: any) {
    var s = '';
    var randomchar = function () {
      var n = Math.floor(Math.random() * 62);
      if (n < 10) return n; //1-10
      if (n < 36) return String.fromCharCode(n + 55); //A-Z
      return String.fromCharCode(n + 61); //a-z
    };
    while (s.length < L) s += randomchar();
    return s;
  }
  login(email: string, password: string, cloudid: any, type: any) {
    this.getheader();
    this.options = {
      headers: this.httpHeaders,
    };
    var data = {
      username: email,
      password: password,
      cloudid: cloudid,
      DEVICE_ID: this.cookie.get('deviceId'),
      type: type
    };
    return this.httpClient.post(
      this.baseUrl + 'user/login',
      JSON.stringify(data),
      this.options
    );
  }
  loginAuth(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const data = { email, password };
    return this.httpClient.post<any>(
      environment.authUrl + 'api/v1/auth/login',
      data,
      { headers }
    );
  }
  createUser(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    return this.httpClient.post<any>(
      this.baseUrl + 'api/user/create',
      JSON.stringify(user),
      this.options
    );
  }
  loggerInit() {
    this.getheader();
    this.options1 = {
      headers: this.httpHeaders1,
    };
    var data = {
      CLIENT_ID: this.clientId,
    };
    return this.httpClient.post(
      this.gmUrl + 'device/init',
      JSON.stringify(data),
      this.options1
    );
  }
  getForms(roleId: number) {
    this.getheader();
    this.options = {
      headers: this.httpHeaders,
    };
    var data = {
      ROLE_ID: roleId,
    };
    return this.httpClient.post<any>(
      this.url + 'user/getForms',
      JSON.stringify(data),
      this.options
    );
  }
  getAllForms(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'api/form/get',
      JSON.stringify(data),
      this.options
    );
  }
  createForm(form: any): Observable<any> {
    form.CLIENT_ID = this.clientId;
    return this.httpClient.post<any>(
      this.baseUrl + 'api/form/create',
      JSON.stringify(form),
      this.options
    );
  }
  updateForm(form: any): Observable<any> {
    form.CLIENT_ID = this.clientId;
    return this.httpClient.put<any>(
      this.baseUrl + 'api/form/update',
      JSON.stringify(form),
      this.options
    );
  }
  getAllRoles(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'api/role/get',
      JSON.stringify(data),
      this.options
    );
  }
  getCheckAccessOfForm(roleId: number, link: string) {
    var data = {
      ROLE_ID: roleId,
      LINK: link,
    };
    return this.httpClient.post<any>(
      this.url + 'roleDetails/checkAccess',
      JSON.stringify(data),
      this.options
    );
  }
  createRole(application: any): Observable<any> {
    application.CLIENT_ID = this.clientId;
    return this.httpClient.post<any>(
      this.baseUrl + 'api/role/create',
      JSON.stringify(application),
      this.options
    );
  }
  updateRole(application: any): Observable<any> {
    application.CLIENT_ID = this.clientId;
    return this.httpClient.put<any>(
      this.baseUrl + 'api/role/update',
      JSON.stringify(application),
      this.options
    );
  }
  updateUser(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    return this.httpClient.put<any>(
      this.baseUrl + 'api/user/update',
      JSON.stringify(user),
      this.options
    );
  }
  getRoleDetails(roleId: number) {
    var data = {
      ROLE_ID: roleId,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'api/roleDetails/getData',
      JSON.stringify(data),
      this.options
    );
  }
  getAllUsers(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'api/user/get',
      JSON.stringify(data),
      this.options
    );
  }

  getAuthToken(): string {
    let token = '';
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('access_token') || '';
      }
      if (!token && window.sessionStorage) {
        token = sessionStorage.getItem('token') || sessionStorage.getItem('authToken') || sessionStorage.getItem('access_token') || '';
      }
    }
    if (!token && this.cookie) {
      token = this.cookie.get('token') || this.cookie.get('authToken') || '';
      if (token && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', token);
      }
    }
    return token;
  }

  private getAuthOptions() {
    const token = this.getAuthToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // ===== City Master APIs =====
  getCities(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'name',
    sortOrder: string = 'DESC'
  ): Observable<any> {
    const token = this.getAuthToken();
    if (!token) {
      return of({ success: false, data: { items: [], total: 0 }, message: 'Authentication token missing.' });
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('token', token);

    if (search) {
      params = params.set('search', search);
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/cities', requestOptions);
  }

  createCity(cityData: { name: string, state: string, isActive?: boolean, sequenceNo?: number }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/cities', cityData, this.getAuthOptions());
  }

  updateCity(id: string | number, cityData: { name?: string, state?: string, isActive?: boolean, sequenceNo?: number }): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/cities/${id}`, cityData, this.getAuthOptions());
  }

  deactivateCity(id: string | number): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/cities/${id}/deactivate`, {}, this.getAuthOptions());
  }

  // ===== Space Type Master APIs =====
  getSpaceTypes(
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

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/space-types', requestOptions);
  }

  createSpaceType(spaceTypeData: { name: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/space-types', spaceTypeData, this.getAuthOptions());
  }

  updateSpaceType(id: string | number, spaceTypeData: { name?: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/space-types/${id}`, spaceTypeData, this.getAuthOptions());
  }

  deactivateSpaceType(id: string | number): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/space-types/${id}/deactivate`, {}, this.getAuthOptions());
  }

  // ===== FAQs APIs =====
  getFaqs(
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

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/faqs', requestOptions);
  }

  createFaq(faqData: { question: string, answer: string }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/faqs', faqData, this.getAuthOptions());
  }

  updateFaq(id: string | number, faqData: { question?: string, answer?: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/faqs/${id}`, faqData, this.getAuthOptions());
  }

  reorderFaqs(items: { id: string | number, displayOrder: number }[]): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/faqs/reorder`, { items }, this.getAuthOptions());
  }

  toggleFaqActiveStatus(id: string | number, isActive: boolean): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/faqs/${id}`, { isActive }, this.getAuthOptions());
  }

  deleteFaq(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/faqs/${id}`, this.getAuthOptions());
  }

  uploadImage(file: File, folderName: string = 'userProfilePhoto'): Observable<any> {
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
      environment.authUrl + `api/v1/upload/${folderName}`,
      formData,
      { headers }
    );
  }

  // ===== Design Idea Category APIs =====
  getDesignIdeaCategories(
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

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/design-idea-categories', requestOptions);
  }

  createDesignIdeaCategory(categoryData: { name: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/design-idea-categories', categoryData, this.getAuthOptions());
  }

  updateDesignIdeaCategory(id: string | number, categoryData: { name?: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/design-idea-categories/${id}`, categoryData, this.getAuthOptions());
  }

  reorderDesignIdeaCategories(items: { id: string | number, displayOrder: number }[]): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/design-idea-categories/reorder`, { items }, this.getAuthOptions());
  }

  toggleDesignIdeaCategoryActiveStatus(id: string | number, isActive: boolean): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/design-idea-categories/${id}`, { isActive }, this.getAuthOptions());
  }

  deleteDesignIdeaCategory(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/design-idea-categories/${id}`, this.getAuthOptions());
  }

  // ===== Rate Table Master APIs =====
  getRateTables(
    page: number = 1,
    limit: number = 10,
    spaceTypeId?: string | number,
    designIdeaCategoryId?: string | number,
    scope?: string,
    isActive?: boolean
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (spaceTypeId) {
      params = params.set('spaceTypeId', spaceTypeId.toString());
    }
    if (designIdeaCategoryId) {
      params = params.set('designIdeaCategoryId', designIdeaCategoryId.toString());
    }
    if (scope) {
      params = params.set('scope', scope);
    }
    if (isActive !== undefined && isActive !== null) {
      params = params.set('isActive', isActive.toString());
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/rate-tables', requestOptions);
  }

  createRateTable(rateTableData: {
    spaceTypeId: string | number,
    designIdeaCategoryId: string | number,
    finishTier: string,
    scope: string,
    rateMinPerSqft: number,
    rateMaxPerSqft: number,
    isActive?: boolean
  }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/rate-tables', rateTableData, this.getAuthOptions());
  }

  updateRateTable(
    id: string | number,
    rateTableData: {
      spaceTypeId?: string | number,
      designIdeaCategoryId?: string | number,
      finishTier?: string,
      scope?: string,
      rateMinPerSqft?: number,
      rateMaxPerSqft?: number,
      isActive?: boolean
    }
  ): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/rate-tables/${id}`, rateTableData, this.getAuthOptions());
  }

  deleteRateTable(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/rate-tables/${id}`, this.getAuthOptions());
  }

  // ===== Testimonials Master APIs =====
  getTestimonials(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/testimonials', requestOptions);
  }

  createTestimonial(formData: FormData | any): Observable<any> {
    const token = this.getAuthToken();
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (!(formData instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/testimonials', formData, { headers });
  }

  updateTestimonial(id: string | number, formData: FormData | any): Observable<any> {
    const token = this.getAuthToken();
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (!(formData instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.httpClient.put<any>(environment.authUrl + `api/v1/testimonials/${id}`, formData, { headers });
  }

  deleteTestimonial(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/testimonials/${id}`, this.getAuthOptions());
  }

  // ===== City Routing Rule Master APIs =====
  getCityRoutingRules(
    page: number = 1,
    limit: number = 10,
    cityId?: string | number,
    assignedUserId?: string | number,
    search: string = ''
  ): Observable<any> {
    const token = this.getAuthToken();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (token) {
      params = params.set('token', token);
    }

    if (cityId) {
      params = params.set('cityId', cityId.toString());
    }
    if (assignedUserId) {
      params = params.set('assignedUserId', assignedUserId.toString());
    }
    if (search) {
      params = params.set('search', search);
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/city-routing-rules', requestOptions);
  }

  createCityRoutingRule(ruleData: {
    cityId: string | number,
    assignedUserId: string | number,
    priority?: number,
    isActive?: boolean
  }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/city-routing-rules', ruleData, this.getAuthOptions());
  }

  updateCityRoutingRule(
    id: string | number,
    ruleData: {
      cityId?: string | number,
      assignedUserId?: string | number,
      priority?: number,
      isActive?: boolean
    }
  ): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/city-routing-rules/${id}`, ruleData, this.getAuthOptions());
  }

  deleteCityRoutingRule(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/city-routing-rules/${id}`, this.getAuthOptions());
  }

  // ===== Project Category APIs =====
  getProjectCategories(
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

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/project-categories', requestOptions);
  }

  createProjectCategory(categoryData: { name: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/project-categories', categoryData, this.getAuthOptions());
  }

  updateProjectCategory(id: string | number, categoryData: { name?: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/project-categories/${id}`, categoryData, this.getAuthOptions());
  }

  reorderProjectCategories(items: { id: string | number, displayOrder: number }[]): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/project-categories/reorder`, { items }, this.getAuthOptions());
  }

  toggleProjectCategoryActiveStatus(id: string | number, isActive: boolean): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/project-categories/${id}`, { isActive }, this.getAuthOptions());
  }

  deleteProjectCategory(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/project-categories/${id}`, this.getAuthOptions());
  }

  // --- Blog Category APIs ---
  getBlogCategories(
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

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/blog-categories', requestOptions);
  }

  createBlogCategory(categoryData: { name: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/blog-categories', categoryData, this.getAuthOptions());
  }

  updateBlogCategory(id: string | number, categoryData: { name?: string, displayOrder?: number, isActive?: boolean }): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/blog-categories/${id}`, categoryData, this.getAuthOptions());
  }

  reorderBlogCategories(items: { id: string | number, displayOrder: number }[]): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/blog-categories/reorder`, { items }, this.getAuthOptions());
  }

  toggleBlogCategoryActiveStatus(id: string | number, isActive: boolean): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/blog-categories/${id}`, { isActive }, this.getAuthOptions());
  }

  deleteBlogCategory(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/blog-categories/${id}`, this.getAuthOptions());
  }

  // --- Blog APIs ---
  getBlogs(
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

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/blogs', requestOptions);
  }

  getBlogByIdOrSlug(idOrSlug: string | number): Observable<any> {
    return this.httpClient.get<any>(environment.authUrl + `api/v1/blogs/${idOrSlug}`, this.getAuthOptions());
  }

  createBlog(blogData: any): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/blogs', blogData, this.getAuthOptions());
  }

  updateBlog(id: string | number, blogData: any): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/blogs/${id}`, blogData, this.getAuthOptions());
  }

  reorderBlogs(items: { id: string | number, displayOrder: number }[]): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/blogs/reorder`, { items }, this.getAuthOptions());
  }

  toggleBlogActiveStatus(id: string | number, isActive: boolean): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/blogs/${id}`, { isActive }, this.getAuthOptions());
  }

  deleteBlog(id: string | number): Observable<any> {
    return this.httpClient.delete<any>(environment.authUrl + `api/v1/blogs/${id}`, this.getAuthOptions());
  }

  // --- Services API ---
  getServices(): Observable<any> {
    return this.httpClient.get<any>(environment.authUrl + 'api/v1/services', this.getAuthOptions());
  }

  getServiceByIdOrSlug(idOrSlug: string | number): Observable<any> {
    return this.httpClient.get<any>(environment.authUrl + `api/v1/services/${idOrSlug}`, this.getAuthOptions());
  }

  createService(data: any): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/services', data, this.getAuthOptions());
  }

  updateService(id: string | number, data: any): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/services/${id}`, data, this.getAuthOptions());
  }

  reorderServices(data: any): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + 'api/v1/services/reorder', data, this.getAuthOptions());
  }
  fetchImageBlob(imageUrl: string): Observable<Blob> {
    let fullUrl = imageUrl;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('data:') && !fullUrl.startsWith('blob:')) {
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
      'Authorization': `Bearer ${token}`,
      'X-Tunnel-Skip-AntiPhishing-Page': 'true'
    });

    return this.httpClient.get(fullUrl, {
      headers,
      responseType: 'blob'
    });
  }

  private formsUpdatedSubject = new Subject<void>();
  formsUpdated$ = this.formsUpdatedSubject.asObservable();

  notifyFormsUpdated() {
    this.formsUpdatedSubject.next();
  }

  // ===== Form Master V1 APIs =====
  getV1Forms(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'name',
    sortOrder: string = 'DESC'
  ): Observable<any> {
    const token = this.getAuthToken();
    if (!token) {
      return of({ success: false, data: { items: [], total: 0 }, message: 'Authentication token missing.' });
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('token', token);

    if (search) {
      params = params.set('search', search);
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/forms', requestOptions);
  }

  getV1FormById(id: string | number): Observable<any> {
    return this.httpClient.get<any>(environment.authUrl + `api/v1/forms/${id}`, this.getAuthOptions());
  }

  createV1Form(formData: {
    name: string;
    slug?: string;
    routePath?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
    parentId?: number | string | null;
    icon?: string | null;
  }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/forms', formData, this.getAuthOptions());
  }

  updateV1Form(
    id: string | number,
    formData: {
      name?: string;
      slug?: string;
      routePath?: string;
      description?: string;
      displayOrder?: number;
      isActive?: boolean;
      parentId?: number | string | null;
      icon?: string | null;
    }
  ): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/forms/${id}`, formData, this.getAuthOptions());
  }

  deactivateV1Form(id: string | number): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/forms/${id}/deactivate`, {}, this.getAuthOptions());
  }

  // ===== Role Master V1 APIs =====
  getV1Roles(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'name',
    sortOrder: string = 'DESC'
  ): Observable<any> {
    const token = this.getAuthToken();
    if (!token) {
      return of({ success: false, data: { items: [], total: 0 }, message: 'Authentication token missing.' });
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('pageSize', limit.toString())
      .set('pageIndex', page.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('token', token);

    if (search) {
      params = params.set('search', search);
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/roles', requestOptions);
  }

  getV1RoleById(id: string | number): Observable<any> {
    return this.httpClient.get<any>(environment.authUrl + `api/v1/roles/${id}`, this.getAuthOptions());
  }

  createV1Role(roleData: {
    name: string;
    parentId?: number | string | null;
    parentRoleName?: string;
    description?: string;
    isActive?: boolean;
  }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/roles', roleData, this.getAuthOptions());
  }

  updateV1Role(
    id: string | number,
    roleData: {
      name?: string;
      parentId?: number | string | null;
      parentRoleName?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/roles/${id}`, roleData, this.getAuthOptions());
  }

  activateV1Role(id: string | number): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/roles/${id}/activate`, {}, this.getAuthOptions());
  }

  deactivateV1Role(id: string | number): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/roles/${id}/deactivate`, {}, this.getAuthOptions());
  }

  getV1RoleFormMappingsByRoleId(roleId: string | number): Observable<any> {
    return this.httpClient.get<any>(
      environment.authUrl + `api/v1/role-form-mappings/assign/${roleId}`,
      this.getAuthOptions()
    );
  }

  saveV1RoleFormMappings(roleId: string | number, payload: any): Observable<any> {
    return this.httpClient.post<any>(
      environment.authUrl + `api/v1/role-form-mappings/assign/${roleId}`,
      payload,
      this.getAuthOptions()
    );
  }

  bulkSaveRoleFormMappings(payload: {
    roleId: number | string;
    items: Array<{
      formId: number | string;
      isAllowed: number;
      isShowInMenu: number;
      seqNo: number;
    }>;
  }): Observable<any> {
    return this.httpClient.post<any>(
      environment.authUrl + 'api/v1/role-form-mappings/bulk',
      payload,
      this.getAuthOptions()
    );
  }

  // ===== User Master V1 APIs =====
  getV1Users(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'name',
    sortOrder: string = 'DESC'
  ): Observable<any> {
    const token = this.getAuthToken();
    if (!token) {
      return of({ success: false, data: { items: [], total: 0 }, message: 'Authentication token missing.' });
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('pageSize', limit.toString())
      .set('pageIndex', page.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('token', token);

    if (search) {
      params = params.set('search', search);
    }

    const authOptions = this.getAuthOptions();
    const requestOptions = {
      headers: authOptions.headers,
      params: params
    };

    return this.httpClient.get<any>(environment.authUrl + 'api/v1/users', requestOptions);
  }

  getV1UserById(id: string | number): Observable<any> {
    return this.httpClient.get<any>(environment.authUrl + `api/v1/users/${id}`, this.getAuthOptions());
  }

  createV1User(userData: {
    name: string;
    email: string;
    password?: string;
    roleId?: number | string | null;
    mobileno?: string;
    profilePhoto?: string;
    isActive?: boolean;
    [key: string]: any;
  }): Observable<any> {
    return this.httpClient.post<any>(environment.authUrl + 'api/v1/users', userData, this.getAuthOptions());
  }

  updateV1User(
    id: string | number,
    userData: {
      name?: string;
      email?: string;
      password?: string;
      roleId?: number | string | null;
      mobileno?: string;
      profilePhoto?: string;
      isActive?: boolean;
      [key: string]: any;
    }
  ): Observable<any> {
    return this.httpClient.put<any>(environment.authUrl + `api/v1/users/${id}`, userData, this.getAuthOptions());
  }

  activateV1User(id: string | number): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/users/${id}/activate`, {}, this.getAuthOptions());
  }

  deactivateV1User(id: string | number): Observable<any> {
    return this.httpClient.patch<any>(environment.authUrl + `api/v1/users/${id}/deactivate`, {}, this.getAuthOptions());
  }

}
