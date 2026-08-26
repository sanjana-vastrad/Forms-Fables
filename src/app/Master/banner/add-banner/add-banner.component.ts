import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { BannerService, Banner } from '../banner.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-banner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzDatePickerModule,
    NzGridModule,
    NzProgressModule,
    NzSwitchModule
  ],
  templateUrl: './add-banner.component.html',
  styleUrl: './add-banner.component.css'
})
export class AddBannerComponent implements OnChanges {
  @Input() bannerToEdit: Banner | null = null;
  @Input() nextDisplayOrder: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  bannerForm: FormGroup;
  loading = false;
  imagePreviewUrl: string | null = null;
  isVideoPreview = false;
  previewError = false;
  uploadingImage = false;
  uploadProgress = 0;

  constructor(
    private fb: FormBuilder,
    private bannerService: BannerService,
    private message: NzMessageService
  ) {
    this.bannerForm = this.fb.group(
      {
        title: [
          '',
          [
            Validators.maxLength(100)
          ]
        ],
        subtitles: ['', [Validators.maxLength(200)]],
        description: ['', []],
        imageUrl: ['', [Validators.required]],
        linkProtocol: ['https://', []],
        linkPath: ['', []],
        displayOrder: [
          1,
          [
            Validators.required,
            this.positiveIntegerValidator
          ]
        ],
        isActive: [true],
        startsAt: [null, []],
        endsAt: [null, []]
      },
      { validators: this.dateRangeValidator }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bannerToEdit'] && this.bannerToEdit) {
      this.populateForm(this.bannerToEdit);
    } else if (changes['bannerToEdit'] && !this.bannerToEdit) {
      this.resetForm();
    }
  }

  getAbsoluteImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = (environment.authUrl || '').trim().replace(/\/+$/, '');
    const relativePath = url.replace(/^\/+/, '');
    return `${baseUrl}/${relativePath}`;
  }

  private populateForm(banner: Banner): void {
    let protocol = 'https://';
    let path = banner.linkUrl || '';

    if (path.startsWith('http://')) {
      protocol = 'http://';
      path = path.substring(7);
    } else if (path.startsWith('https://')) {
      protocol = 'https://';
      path = path.substring(8);
    }

    this.bannerForm.patchValue({
      title: banner.title,
      subtitles: banner.subtitles || '',
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkProtocol: protocol,
      linkPath: path,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      startsAt: banner.startsAt ? new Date(banner.startsAt) : null,
      endsAt: banner.endsAt ? new Date(banner.endsAt) : null
    });

    if (banner.imageUrl) {
      this.loadPreviewFromUrl(banner.imageUrl);
    } else {
      this.imagePreviewUrl = null;
      this.previewError = false;
    }
  }

  checkIsVideo(url: string | null): boolean {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.ogg') || lowerUrl.startsWith('data:video');
  }

  loadPreviewFromUrl(url: string): void {
    if (!url) {
      this.imagePreviewUrl = null;
      this.isVideoPreview = false;
      this.previewError = false;
      return;
    }

    this.isVideoPreview = this.checkIsVideo(url);

    if (url.startsWith('data:') || url.startsWith('blob:')) {
      this.imagePreviewUrl = url;
      this.previewError = false;
      return;
    }

    const fullUrl = this.getAbsoluteImageUrl(url);
    this.previewError = false;

    // Fetch Blob via HttpClient with Auth headers to bypass Cross-Origin-Resource-Policy / devtunnel blocks
    this.bannerService.fetchImageBlob(fullUrl).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.imagePreviewUrl = objectUrl;
        this.previewError = false;
      },
      error: (err) => {
        console.warn('Could not fetch image blob via auth headers, fallback to fullUrl:', err);
        this.imagePreviewUrl = fullUrl;
      }
    });
  }

  resetForm(): void {
    this.imagePreviewUrl = null;
    this.isVideoPreview = false;
    this.previewError = false;
    this.uploadingImage = false;
    this.uploadProgress = 0;
    this.bannerForm.reset({
      title: '',
      subtitles: '',
      description: '',
      imageUrl: '',
      linkProtocol: 'https://',
      linkPath: '',
      displayOrder: this.nextDisplayOrder,
      isActive: true,
      startsAt: null,
      endsAt: null
    });
  }

  // Handle File Input Selection with Progress
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate Media Type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        this.message.error('Please select a valid image or video file');
        return;
      }

      // Validate File Size: 1MB for images, 5MB for videos
      const isVideo = file.type.startsWith('video/');
      const maxSizeMB = isVideo ? 5 : 1;
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        this.message.error(`File is too large. Maximum allowed size for ${isVideo ? 'videos' : 'images'} is ${maxSizeMB}MB.`);
        return;
      }

      this.isVideoPreview = isVideo;

      // 1. Set instant local Base64 preview for 100% reliable UI display
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        this.imagePreviewUrl = base64Url;
        this.previewError = false;
      };
      reader.readAsDataURL(file);

      // 2. Upload file binary with progress tracking
      this.uploadingImage = true;
      this.uploadProgress = 0;

      this.bannerService.uploadImageWithProgress(file, 'banner').subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const rawPercent = Math.round((100 * event.loaded) / event.total);
            // Show up to 99% while data is being transmitted to server
            this.uploadProgress = Math.min(rawPercent, 99);
          } else if (event.type === HttpEventType.Response) {
            this.uploadProgress = 100;
            this.uploadingImage = false;
            const res = event.body;
            console.log('Backend Upload Response:', res);
            
            const serverUrl =
              res?.data?.url ||
              res?.url ||
              res?.fileUrl ||
              res?.data?.fileUrl ||
              res?.path ||
              res?.data?.path ||
              res?.imageUrl ||
              res?.data?.imageUrl ||
              res?.videoUrl ||
              res?.data?.videoUrl ||
              res?.mediaUrl ||
              res?.data?.mediaUrl ||
              (typeof res === 'string' ? res : '');

            if (serverUrl) {
              this.bannerForm.patchValue({ imageUrl: serverUrl });
              this.bannerForm.get('imageUrl')?.markAsDirty();
              this.message.success('Media uploaded successfully!');
            } else {
              this.message.warning('Upload successful, but no URL was returned by the server.');
              console.warn('Could not extract media URL from backend response.', res);
            }
          }
        },
        error: (err: any) => {
          this.uploadingImage = false;
          this.uploadProgress = 0;
          console.error('Image upload failed:', err);
          const errMsg = err?.error?.message || err?.message || 'Failed to upload image to server.';
          this.message.error(errMsg);
        }
      });
    }
  }

  removeSelectedImage(): void {
    this.imagePreviewUrl = null;
    this.isVideoPreview = false;
    this.previewError = false;
    this.uploadingImage = false;
    this.uploadProgress = 0;
    this.bannerForm.patchValue({ imageUrl: '' });
    this.bannerForm.get('imageUrl')?.markAsDirty();
  }

  // Validator: Only letters and spaces allowed
  textOnlyValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value.toString();
    const valid = /^[a-zA-Z\s]+$/.test(value) && value.trim().length > 0;
    return valid ? null : { textOnly: true };
  }

  // Validator: Positive Integer only (no decimals, no negative numbers)
  positiveIntegerValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value === null || control.value === undefined || control.value === '') return null;
    const val = control.value.toString().trim();
    const isInteger = /^\d+$/.test(val);
    const num = Number(val);
    if (!isInteger || num <= 0) {
      return { positiveInteger: true };
    }
    return null;
  }

  // Form-level validator: Starts At <= Ends At
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startsAt = control.get('startsAt')?.value;
    const endsAt = control.get('endsAt')?.value;

    if (startsAt && endsAt) {
      const startDate = new Date(startsAt);
      const endDate = new Date(endsAt);
      if (endDate < startDate) {
        return { dateRangeInvalid: true };
      }
    }
    return null;
  }

  // Prevent invalid keypresses in display order input
  preventNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  formatDateToISO(dateVal: any): string {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  submitForm(): void {
    // Process input data
    const rawTitle = this.bannerForm.get('title')?.value || '';
    const cleanedTitle = rawTitle.trim().replace(/\s+/g, ' ');
    this.bannerForm.patchValue({ title: cleanedTitle });

    // Validate full URL
    const protocol = this.bannerForm.get('linkProtocol')?.value || 'https://';
    let path = (this.bannerForm.get('linkPath')?.value || '').trim();
    if (path.startsWith('http://') || path.startsWith('https://')) {
      path = path.replace(/^https?:\/\//, '');
    }
    const fullLinkUrl = protocol + path;

    if (this.bannerForm.valid) {
      this.loading = true;
      const formVal = this.bannerForm.value;

      const payload = {
        title: formVal.title,
        subtitles: formVal.subtitles || '',
        description: formVal.description || '',
        imageUrl: (formVal.imageUrl || '').trim(),
        linkUrl: fullLinkUrl,
        displayOrder: Number(formVal.displayOrder),
        isActive: formVal.isActive,
        startsAt: this.formatDateToISO(formVal.startsAt),
        endsAt: this.formatDateToISO(formVal.endsAt)
      };

      if (this.bannerToEdit) {
        this.bannerService.updateBanner(this.bannerToEdit.id, payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Banner updated successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to update banner.';
            this.message.error(errMsg);
          }
        });
      } else {
        this.bannerService.createBanner(payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Banner created successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to create banner.';
            this.message.error(errMsg);
          }
        });
      }
    } else {
      console.log('Form is invalid. Form errors:', this.bannerForm.errors);
      Object.keys(this.bannerForm.controls).forEach(key => {
        const control = this.bannerForm.get(key);
        if (control?.invalid) {
          console.log(`Invalid control: ${key}, errors:`, control.errors);
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancel(): void {
    this.resetForm();
    this.onCancel.emit();
  }
}
