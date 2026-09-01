import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule,
    NzSelectModule,
    NzIconModule
  ],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.css'
})
export class AddFormComponent implements OnInit, OnChanges {
  @Input() formToEdit: any = null;
  @Input() nextDisplayOrder: number = 1;
  @Input() parentFormOptions: any[] = [];
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  formGroup: FormGroup;
  loading = false;
  localParentOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      slug: ['', [Validators.maxLength(150)]],
      routePath: ['', [Validators.maxLength(250)]],
      parentId: [0],
      icon: [''],
      description: [''],
      displayOrder: [1, [Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadParentForms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentFormOptions'] && this.parentFormOptions?.length > 0) {
      this.localParentOptions = [...this.parentFormOptions];
    }

    if (changes['formToEdit'] && this.formToEdit) {
      this.loadParentForms();
      this.applyFormToEdit();
    } else if ((changes['formToEdit'] && !this.formToEdit) || changes['nextDisplayOrder']) {
      this.resetForm();
      this.loadParentForms();
    }
  }

  applyFormToEdit(): void {
    if (!this.formToEdit) return;

    let pId: any = 0;
    const rawPId = this.formToEdit.parentId !== undefined ? this.formToEdit.parentId : this.formToEdit.parent_id;

    if (rawPId !== undefined && rawPId !== null && rawPId !== 'null' && rawPId !== '' && rawPId !== 0 && rawPId !== '0') {
      const match = this.localParentOptions.find(opt => String(opt.id) === String(rawPId));
      pId = match ? match.id : rawPId;
    }

    this.formGroup.patchValue({
      name: this.formToEdit.name || '',
      slug: this.formToEdit.slug || '',
      routePath: this.formToEdit.routePath || '',
      parentId: pId,
      icon: this.formToEdit.icon || '',
      description: this.formToEdit.description || '',
      displayOrder: this.formToEdit.displayOrder !== undefined ? this.formToEdit.displayOrder : this.nextDisplayOrder,
      isActive: this.formToEdit.isActive !== undefined ? this.formToEdit.isActive : true
    });
  }

  loadParentForms(): void {
    this.apiService.getV1Forms(1, 1000, '', 'name', 'ASC').subscribe({
      next: (res: any) => {
        let rawList: any[] = [];
        if (res) {
          if (Array.isArray(res)) rawList = res;
          else if (res.items && Array.isArray(res.items)) rawList = res.items;
          else if (res.data && Array.isArray(res.data.items)) rawList = res.data.items;
          else if (Array.isArray(res.data)) rawList = res.data;
          else if (res.data && Array.isArray(res.data.forms)) rawList = res.data.forms;
        }
        this.localParentOptions = rawList.map((item: any) => ({
          id: item.id || item.ID || item._id,
          name: item.name || item.title || item.FORM_NAME || 'Untitled Form'
        }));

        if (this.formToEdit) {
          this.applyFormToEdit();
        }
      },
      error: () => {
        // Fallback to parentFormOptions if provided
        if (this.parentFormOptions && this.parentFormOptions.length > 0) {
          this.localParentOptions = [...this.parentFormOptions];
          if (this.formToEdit) {
            this.applyFormToEdit();
          }
        }
      }
    });
  }

  get filteredParentForms(): any[] {
    const list = this.localParentOptions && this.localParentOptions.length > 0
      ? this.localParentOptions
      : this.parentFormOptions;

    if (!this.formToEdit || !this.formToEdit.id) {
      return list;
    }
    const editId = String(this.formToEdit.id);
    return list.filter(f => String(f.id) !== editId);
  }

  resetForm(): void {
    this.formGroup.reset({
      name: '',
      slug: '',
      routePath: '',
      parentId: 0,
      icon: '',
      description: '',
      displayOrder: this.nextDisplayOrder,
      isActive: true
    });
  }

  onNameChange(nameVal: string): void {
    const slugCtrl = this.formGroup.get('slug');
    if (slugCtrl && (!slugCtrl.value || slugCtrl.pristine) && !this.formToEdit) {
      const generatedSlug = nameVal
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      slugCtrl.setValue(generatedSlug, { emitEvent: false });
    }
  }

  submitForm(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      const rawValue = this.formGroup.getRawValue();

      const rawParent = rawValue.parentId;
      const selectedParentId = (rawParent && rawParent !== 'null' && rawParent !== '0' && rawParent !== 0)
        ? (isNaN(Number(rawParent)) ? rawParent : Number(rawParent))
        : 0;

      const payload = {
        name: rawValue.name.trim(),
        slug: rawValue.slug ? rawValue.slug.trim() : undefined,
        routePath: rawValue.routePath ? rawValue.routePath.trim() : undefined,
        parentId: selectedParentId,
        icon: rawValue.icon ? rawValue.icon.trim() : '',
        description: rawValue.description ? rawValue.description.trim() : undefined,
        displayOrder: rawValue.displayOrder !== null && rawValue.displayOrder !== undefined ? Number(rawValue.displayOrder) : undefined,
        isActive: !!rawValue.isActive
      };

      if (this.formToEdit) {
        // Update existing Form
        this.apiService.updateV1Form(this.formToEdit.id, payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Form updated successfully!');
            this.apiService.notifyFormsUpdated();
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to update Form.';
            this.message.error(errMsg);
          }
        });
      } else {
        // Create new Form
        this.apiService.createV1Form(payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Form created successfully!');
            this.apiService.notifyFormsUpdated();
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to create Form.';
            this.message.error(errMsg);
          }
        });
      }
    } else {
      Object.values(this.formGroup.controls).forEach(control => {
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
