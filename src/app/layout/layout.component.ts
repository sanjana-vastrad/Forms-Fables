import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzToolTipModule,
    NzAvatarModule,
    NzDropDownModule,
    NzModalModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isCollapsed = false;
  isChangePasswordVisible = false;
  changingPassword = false;
  currentPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  changePasswordForm!: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, this.confirmPasswordValidator.bind(this)]]
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    this.router.navigate(['/login']);
  }

  openChangePassword(): void {
    this.isChangePasswordVisible = true;
    this.changePasswordForm.reset();
    this.currentPasswordVisible = false;
    this.newPasswordVisible = false;
    this.confirmPasswordVisible = false;
  }

  closeChangePassword(): void {
    this.isChangePasswordVisible = false;
    this.changePasswordForm.reset();
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    if (this.changePasswordForm && control.value !== this.changePasswordForm.get('newPassword')?.value) {
      return { mismatch: true };
    }
    return null;
  }

  submitChangePassword(): void {
    // Re-validate confirm password in case new password changed after confirm was entered
    this.changePasswordForm.get('confirmPassword')?.updateValueAndValidity();

    if (this.changePasswordForm.valid) {
      this.changingPassword = true;
      // TODO: Call your API service to change the password
      // For now, simulate a success response
      setTimeout(() => {
        this.changingPassword = false;
        this.message.success('Password changed successfully!');
        this.closeChangePassword();
      }, 1000);
    } else {
      Object.values(this.changePasswordForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
