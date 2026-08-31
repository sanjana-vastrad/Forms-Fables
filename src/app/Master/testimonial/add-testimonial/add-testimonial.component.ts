import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { TestimonialService, Testimonial } from '../testimonial.service';
import { ApiServiceService } from '../../../Service/api-service.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-testimonial',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule,
    NzIconModule,
    NzGridModule,
    NzToolTipModule
  ],
  templateUrl: './add-testimonial.component.html',
  styleUrl: './add-testimonial.component.css'
})
export class AddTestimonialComponent implements OnChanges {
  @Input() testimonialToEdit: Testimonial | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  testimonialForm: FormGroup;
  loading = false;

  // File Upload State
  photoFile: File | null = null;
  photoPreview: string | null = null;

  videoFile: File | null = null;
  videoPreviewName: string | null = null;
  videoPreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private testimonialService: TestimonialService,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.testimonialForm = this.fb.group({
      name: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.maxLength(1000)]],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testimonialToEdit']) {
      if (this.testimonialToEdit) {
        this.testimonialForm.patchValue({
          name: this.testimonialToEdit.name,
          message: this.testimonialToEdit.message,
          isActive: this.testimonialToEdit.isActive
        });
        this.photoPreview = this.testimonialToEdit.photo || null;
        this.videoPreviewName = this.testimonialToEdit.video ? 'Attached Video File' : null;
        this.photoFile = null;
        this.videoFile = null;
        this.videoPreviewUrl = null;

        if (this.testimonialToEdit.photo && !this.testimonialToEdit.photo.startsWith('data:')) {
          const absolutePhoto = this.getAbsoluteImageUrl(this.testimonialToEdit.photo);
          this.apiService.fetchImageBlob(absolutePhoto).subscribe({
            next: (blob) => this.photoPreview = URL.createObjectURL(blob),
            error: () => this.photoPreview = absolutePhoto
          });
        }

        if (this.testimonialToEdit.video) {
          const absoluteVideo = this.getAbsoluteImageUrl(this.testimonialToEdit.video);
          this.apiService.fetchImageBlob(absoluteVideo).subscribe({
            next: (blob) => this.videoPreviewUrl = URL.createObjectURL(blob),
            error: () => this.videoPreviewUrl = absoluteVideo
          });
        }
      } else {
        this.testimonialForm.reset({
          name: '',
          message: '',
          isActive: true
        });
        this.photoFile = null;
        this.photoPreview = null;
        this.videoFile = null;
        this.videoPreviewName = null;
        this.videoPreviewUrl = null;
      }
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.message.error('Please select a valid image file for client photo.');
        return;
      }
      this.photoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoFile = null;
    this.photoPreview = null;
  }

  onVideoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        this.message.error('Please select a valid video file.');
        return;
      }
      this.videoFile = file;
      this.videoPreviewName = file.name;
      this.videoPreviewUrl = URL.createObjectURL(file);
    }
  }

  removeVideo(): void {
    this.videoFile = null;
    this.videoPreviewName = null;
    this.videoPreviewUrl = null;
  }

  getAbsoluteImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const baseUrl = (environment.authUrl || '').trim().replace(/\/+$/, '');
    const relativePath = url.replace(/^\/+/, '');
    return `${baseUrl}/${relativePath}`;
  }

  submitForm(): void {
    if (this.testimonialForm.invalid) {
      Object.values(this.testimonialForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.loading = true;
    const formValue = this.testimonialForm.value;

    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('message', formValue.message);
    formData.append('isActive', String(formValue.isActive));

    if (this.photoFile) {
      formData.append('photo', this.photoFile);
    }
    if (this.videoFile) {
      formData.append('video', this.videoFile);
    }

    const recordData: Partial<Testimonial> = {
      name: formValue.name,
      message: formValue.message,
      photo: this.photoPreview || '',
      video: this.videoPreviewName ? 'video_file' : '',
      isActive: formValue.isActive
    };

    if (this.testimonialToEdit) {
      this.testimonialService.updateTestimonial(this.testimonialToEdit.id, formData).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false)) {
            this.message.error(res.message || 'Failed to update Testimonial.');
            return;
          }
          this.message.success('Testimonial updated successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error updating Testimonial:', err);
          this.message.error(err?.error?.message || err?.message || 'Failed to update Testimonial.');
        }
      });
    } else {
      this.testimonialService.createTestimonial(formData).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false)) {
            this.message.error(res.message || 'Failed to create Testimonial.');
            return;
          }
          this.message.success('Testimonial created successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error creating Testimonial:', err);
          this.message.error(err?.error?.message || err?.message || 'Failed to create Testimonial.');
        }
      });
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }
}
