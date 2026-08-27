import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
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
    NzSwitchModule
  ],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.css'
})
export class AddFormComponent implements OnChanges {
  @Input() formToEdit: any = null;
  @Input() nextDisplayOrder: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  formGroup: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      slug: ['', [Validators.maxLength(150)]],
      routePath: ['', [Validators.maxLength(250)]],
      description: [''],
      displayOrder: [1, [Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formToEdit'] && this.formToEdit) {
      this.formGroup.patchValue({
        name: this.formToEdit.name || '',
        slug: this.formToEdit.slug || '',
        routePath: this.formToEdit.routePath || '',
        description: this.formToEdit.description || '',
        displayOrder: this.formToEdit.displayOrder !== undefined ? this.formToEdit.displayOrder : this.nextDisplayOrder,
        isActive: this.formToEdit.isActive !== undefined ? this.formToEdit.isActive : true
      });
    } else if ((changes['formToEdit'] && !this.formToEdit) || changes['nextDisplayOrder']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.formGroup.reset({
      name: '',
      slug: '',
      routePath: '',
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

      const payload = {
        name: rawValue.name.trim(),
        slug: rawValue.slug ? rawValue.slug.trim() : undefined,
        routePath: rawValue.routePath ? rawValue.routePath.trim() : undefined,
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
