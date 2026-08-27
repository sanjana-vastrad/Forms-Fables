import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSwitchModule,
    NzIconModule,
    NzProgressModule,
    NzToolTipModule,
    NzGridModule
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit, OnChanges {
  @Input() userToEdit: any = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  userForm: FormGroup;
  loading = false;
  uploadingImage = false;
  uploadProgress = 0;
  selectedFile: File | null = null;
  localPreviewUrl: string | null = null;
  profilePhotoUrl: string | null = null;
  passwordVisible = false;
  rolesList: any[] = [];

  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

  passwordTooltipTitle = `Password must contain:
• At least 8 characters
• At least 1 uppercase
• At least 1 lowercase
• At least 1 number
• At least 1 special character`;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.userForm = this.fb.group({
      roleId: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      mobileno: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      password: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
      profilePhoto: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.fetchRoles();
  }

  fetchRoles(): void {
    this.apiService.getV1Roles(1, 1000).subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (res) {
          if (Array.isArray(res)) list = res;
          else if (res.items && Array.isArray(res.items)) list = res.items;
          else if (res.data && Array.isArray(res.data.items)) list = res.data.items;
          else if (Array.isArray(res.data)) list = res.data;
          else if (res.data && Array.isArray(res.data.roles)) list = res.data.roles;
        }

        if (list && list.length > 0) {
          this.rolesList = list.map((item: any) => ({
            id: item.id ?? item.ID ?? item.ROLE_ID ?? item.roleId ?? item.role_id,
            name: item.name || item.roleName || item.ROLE_NAME || 'Untitled Role'
          }));
        }
      },
      error: (err) => {
        console.warn('Could not fetch roles for dropdown:', err);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userToEdit']) {
      if (this.userToEdit) {
        this.patchUserValues(this.userToEdit);
      } else {
        this.resetForm();
      }
    }
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

  loadPreviewFromUrl(url: string | null | undefined): void {
    if (!url) {
      this.profilePhotoUrl = null;
      return;
    }

    if (url.startsWith('data:') || url.startsWith('blob:')) {
      this.profilePhotoUrl = url;
      return;
    }

    const fullUrl = this.getAbsoluteImageUrl(url);
    this.apiService.fetchImageBlob(fullUrl).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.profilePhotoUrl = objectUrl;
      },
      error: (err) => {
        console.warn('Could not fetch profile photo blob via auth headers, fallback to fullUrl:', err);
        this.profilePhotoUrl = fullUrl;
      }
    });
  }

  patchUserValues(user: any): void {
    if (!user) return;

    const rId = user.roleId ?? user.role_id ?? user.ROLE_ID ?? (user.role ? user.role.id : null);
    const parsedRoleId = (rId !== null && rId !== undefined && rId !== '') ? (isNaN(Number(rId)) ? rId : Number(rId)) : null;
    const photo = user.profile_photo || user.profilePhoto || user.profileImage || user.avatar || '';

    this.userForm.patchValue({
      roleId: parsedRoleId,
      name: user.name || user.userName || user.user_name || '',
      email: user.email || '',
      mobileno: user.mobileno || user.mobileNo || user.mobile_no || user.mobile || '',
      password: '',
      profilePhoto: photo,
      isActive: user.is_active !== undefined ? user.is_active : (user.isActive !== undefined ? user.isActive : (user.status === 'Active'))
    });

    // On Edit, password is not strictly required unless provided
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators([Validators.pattern(this.passwordRegex)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.selectedFile = null;
    this.localPreviewUrl = null;
    if (photo) {
      this.loadPreviewFromUrl(photo);
    } else {
      this.profilePhotoUrl = null;
    }
  }

  resetForm(): void {
    if (this.localPreviewUrl) {
      URL.revokeObjectURL(this.localPreviewUrl);
    }
    this.selectedFile = null;
    this.localPreviewUrl = null;
    this.profilePhotoUrl = null;
    this.uploadingImage = false;
    this.uploadProgress = 0;
    this.passwordVisible = false;

    this.userForm.reset({
      roleId: null,
      name: '',
      email: '',
      mobileno: '',
      password: '',
      profilePhoto: '',
      isActive: true
    });

    this.userForm.get('password')?.setValidators([Validators.required, Validators.pattern(this.passwordRegex)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.message.error('File size exceeds maximum limit of 10MB.');
        return;
      }

      this.selectedFile = file;
      if (this.localPreviewUrl) {
        URL.revokeObjectURL(this.localPreviewUrl);
      }
      this.localPreviewUrl = URL.createObjectURL(file);
      this.profilePhotoUrl = this.localPreviewUrl;
      this.message.info('Image selected. It will be uploaded when you click Save.');
    }
  }

  removeProfilePhoto(): void {
    if (this.localPreviewUrl) {
      URL.revokeObjectURL(this.localPreviewUrl);
    }
    this.selectedFile = null;
    this.localPreviewUrl = null;
    this.profilePhotoUrl = null;
    this.userForm.patchValue({ profilePhoto: '' });
  }

  submitForm(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const rawValue = this.userForm.getRawValue();

      const existingPhoto = (this.userToEdit && !this.selectedFile) 
        ? (this.userToEdit.profile_photo || this.userToEdit.profilePhoto || '')
        : (rawValue.profilePhoto || '');

      const payload: any = {
        role_id: rawValue.roleId,
        name: rawValue.name.trim(),
        email: rawValue.email.trim(),
        mobile_no: rawValue.mobileno ? rawValue.mobileno.trim() : '',
        is_active: !!rawValue.isActive,
        profile_photo: existingPhoto
      };

      if (!this.userToEdit && rawValue.password && rawValue.password.trim()) {
        payload.password = rawValue.password.trim();
      }

      // If user selected a new file, upload it FIRST to /api/v1/upload/userProfilePhoto
      if (this.selectedFile) {
        this.uploadingImage = true;
        this.apiService.uploadImage(this.selectedFile, 'userProfilePhoto').subscribe({
          next: (res: any) => {
            this.uploadingImage = false;
            const serverUrl =
              res?.data?.url ||
              res?.url ||
              res?.fileUrl ||
              res?.data?.fileUrl ||
              res?.path ||
              res?.data?.path ||
              res?.imageUrl ||
              res?.data?.imageUrl ||
              (typeof res === 'string' ? res : '');

            if (serverUrl) {
              payload.profile_photo = serverUrl;
            }
            this.saveUser(payload);
          },
          error: (err: any) => {
            console.warn('Initial upload to userProfilePhoto returned error, trying fallback folder user...', err);
            // Fallback retry with 'user' folder endpoint
            this.apiService.uploadImage(this.selectedFile!, 'user').subscribe({
              next: (resFallback: any) => {
                this.uploadingImage = false;
                const serverUrl =
                  resFallback?.data?.url ||
                  resFallback?.url ||
                  resFallback?.fileUrl ||
                  resFallback?.data?.fileUrl ||
                  resFallback?.path ||
                  resFallback?.data?.path ||
                  resFallback?.imageUrl ||
                  resFallback?.data?.imageUrl ||
                  (typeof resFallback === 'string' ? resFallback : '');

                if (serverUrl) {
                  payload.profile_photo = serverUrl;
                }
                this.saveUser(payload);
              },
              error: (fallbackErr: any) => {
                this.loading = false;
                this.uploadingImage = false;
                console.error('Profile photo upload error:', fallbackErr);
                const errMsg = fallbackErr?.error?.message || fallbackErr?.message || 'Failed to upload profile photo.';
                this.message.error(errMsg);
              }
            });
          }
        });
      } else {
        this.saveUser(payload);
      }
    } else {
      Object.values(this.userForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private saveUser(payload: any): void {
    console.log('Sending Final User Payload:', payload);

    if (this.userToEdit) {
      // Update User
      this.apiService.updateV1User(this.userToEdit.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.message.success('User updated successfully!');
          this.resetForm();
          this.onSave.emit();
        },
        error: (err) => {
          this.loading = false;
          const errMsg = err?.error?.message || err?.message || 'Failed to update User.';
          this.message.error(errMsg);
        }
      });
    } else {
      // Create User
      this.apiService.createV1User(payload).subscribe({
        next: () => {
          this.loading = false;
          this.message.success('User created successfully!');
          this.resetForm();
          this.onSave.emit();
        },
        error: (err) => {
          this.loading = false;
          const errMsg = err?.error?.message || err?.message || 'Failed to create User.';
          this.message.error(errMsg);
        }
      });
    }
  }

  handleCancel(): void {
    this.resetForm();
    this.onCancel.emit();
  }
}
