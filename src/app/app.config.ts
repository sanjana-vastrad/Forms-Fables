import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { BidiModule } from '@angular/cdk/bidi';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  UserOutline,
  LockOutline,
  EyeOutline,
  EyeInvisibleOutline,
  DashboardOutline,
  DatabaseOutline,
  BarChartOutline,
  FormOutline,
  TableOutline,
  PieChartOutline,
  FileOutline,
  LogoutOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PlusOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  EditOutline,
  BellOutline,
  DownOutline,
  CaretUpOutline,
  CaretDownOutline,
  SearchOutline,
  CopyOutline,
  DeleteOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  CloudDownloadOutline,
  FilterOutline,
  FileTextOutline,
  SettingOutline,
  FilterFill,
  DownloadOutline,
  FileDoneOutline,
  PercentageOutline,
  AppstoreOutline,
  TagsOutline,
  FolderOutline,
  SecurityScanOutline,
  EnvironmentOutline,
  PictureOutline,
  QuestionCircleOutline,
  ToolOutline,
  BulbOutline,
  ProjectOutline,
  SafetyCertificateOutline
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);

const icons = [
  UserOutline,
  LockOutline,
  EyeOutline,
  EyeInvisibleOutline,
  DashboardOutline,
  DatabaseOutline,
  BarChartOutline,
  FormOutline,
  TableOutline,
  PieChartOutline,
  FileOutline,
  LogoutOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PlusOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  EditOutline,
  BellOutline,
  DownOutline,
  CaretUpOutline,
  CaretDownOutline,
  SearchOutline,
  CopyOutline,
  DeleteOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  CloudDownloadOutline,
  FilterOutline,
  FileTextOutline,
  SettingOutline,
  FilterFill,
  DownloadOutline,
  FileDoneOutline,
  PercentageOutline,
  AppstoreOutline,
  TagsOutline,
  FolderOutline,
  SecurityScanOutline,
  EnvironmentOutline,
  PictureOutline,
  QuestionCircleOutline,
  ToolOutline,
  BulbOutline,
  ProjectOutline,
  SafetyCertificateOutline
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule, BidiModule),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideNzIcons(icons)
  ]
};
