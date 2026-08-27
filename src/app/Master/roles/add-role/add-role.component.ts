import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSwitchModule
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.css'
})
export class AddRoleComponent implements OnInit, OnChanges {
  @Input() roleToEdit: any = null;
  @Input() rolesList: any[] = [];
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  roleForm: FormGroup;
  loading = false;
  allFetchedRoles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.roleForm = this.fb.group({
      parentRoleId: [0],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.fetchAllRoles();
  }

  fetchAllRoles(): void {
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
          this.allFetchedRoles = list
            .map((item: any, index: number) => {
              const rawId = item.id ?? item.ID ?? item.ROLE_ID ?? item.roleId ?? item.role_id ?? item._id;
              const name = item.name || item.roleName || item.ROLE_NAME || item.title || 'Untitled Role';
              const parsedId = (rawId !== undefined && rawId !== null && rawId !== '') 
                ? (isNaN(Number(rawId)) ? rawId : Number(rawId)) 
                : (index + 1);
              return {
                id: parsedId,
                name: name
              };
            });
        }

        if (this.roleToEdit) {
          this.patchRoleValues(this.roleToEdit);
        }
      },
      error: (err) => {
        console.warn('Could not fetch all roles for dropdown:', err);
      }
    });
  }

  get availableParentRoles(): any[] {
    const listSource = (this.allFetchedRoles && this.allFetchedRoles.length > 0)
      ? this.allFetchedRoles
      : (this.rolesList || [])
          .map((r, index) => {
            const rawId = r.id ?? r.ID ?? r.ROLE_ID ?? r.roleId ?? r.role_id ?? r._id;
            const parsedId = (rawId !== undefined && rawId !== null && rawId !== '') 
              ? (isNaN(Number(rawId)) ? rawId : Number(rawId)) 
              : (index + 1);
            return { id: parsedId, name: r.name };
          });

    if (!this.roleToEdit) return listSource;
    const currentRawId = this.roleToEdit.id ?? this.roleToEdit.ID ?? this.roleToEdit.ROLE_ID ?? this.roleToEdit.roleId ?? this.roleToEdit.role_id ?? this.roleToEdit._id;
    const currentId = currentRawId !== undefined && currentRawId !== null ? (isNaN(Number(currentRawId)) ? currentRawId : Number(currentRawId)) : null;
    return listSource.filter(r => r.id !== currentId);
  }

  public getFormParentId(id: any): any {
    if (id === null || id === undefined || id === '' || id === 'null') return 0;
    const num = Number(id);
    return isNaN(num) ? 0 : num;
  }

  public getPayloadParentId(id: any): any {
    if (id === null || id === undefined || id === '' || id === 'null') return 0;
    const num = Number(id);
    return isNaN(num) ? 0 : num;
  }

  private patchRoleValues(role: any): void {
    if (!role) return;

    let rawId = role.parentId ??
      role.parentRoleId ??
      role.PARENT_ROLE_ID ??
      role.parent_role_id ??
      (role.parentRole ? (role.parentRole.id || role.parentRole.ROLE_ID || role.parentRole.roleId) : null);

    const targetName = role.parent_name || role.parentRoleName || role.parentRoleName;
    if ((rawId === null || rawId === undefined || rawId === 0 || rawId === '0') && targetName) {
      if (targetName && targetName !== 'None') {
        const found = (this.allFetchedRoles || []).find(r => r.name === targetName) || (this.rolesList || []).find(r => r.name === targetName);
        if (found) {
          rawId = found.id;
        }
      }
    }

    const pId = this.getFormParentId(rawId);

    this.roleForm.patchValue({
      parentRoleId: pId,
      name: role.name || role.roleName || '',
      isActive: role.isActive !== undefined ? role.isActive : (role.status === 'Active')
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roleToEdit']) {
      if (this.roleToEdit) {
        this.patchRoleValues(this.roleToEdit);
      } else {
        this.resetForm();
      }
    }
  }

  resetForm(): void {
    this.roleForm.reset({
      parentRoleId: 0,
      name: '',
      isActive: true
    });
  }

  submitForm(): void {
    if (this.roleForm.valid) {
      this.loading = true;
      const rawValue = this.roleForm.getRawValue();
      const parentId = this.getPayloadParentId(rawValue.parentRoleId);

      let parentRoleName = 'None';
      if (parentId !== 0) {
        const foundRole = (this.allFetchedRoles || []).find(r => Number(r.id) === Number(parentId)) ||
          (this.rolesList || []).find(r => Number(r.id) === Number(parentId));
        if (foundRole) {
          parentRoleName = foundRole.name;
        }
      }

      const payload = {
        name: rawValue.name.trim(),
        parentId: parentId,
        parentRoleName: parentRoleName,
        isActive: !!rawValue.isActive
      };

      console.log('Role Payload being sent to API:', payload);

      if (this.roleToEdit) {
        // Update Role
        this.apiService.updateV1Role(this.roleToEdit.id, payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Role updated successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to update Role.';
            this.message.error(errMsg);
          }
        });
      } else {
        // Create Role
        this.apiService.createV1Role(payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Role created successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to create Role.';
            this.message.error(errMsg);
          }
        });
      }
    } else {
      Object.values(this.roleForm.controls).forEach(control => {
        if (control.invalid) {
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
