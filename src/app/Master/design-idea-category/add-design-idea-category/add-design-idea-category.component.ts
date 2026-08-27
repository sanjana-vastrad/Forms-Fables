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
  selector: 'app-add-design-idea-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule
  ],
  templateUrl: './add-design-idea-category.component.html',
  styleUrl: './add-design-idea-category.component.css'
})
export class AddDesignIdeaCategoryComponent implements OnChanges {
  @Input() categoryToEdit: any = null;
  @Input() nextDisplayOrder: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.categoryForm = this.fb.group({
      displayOrder: [null, [Validators.required, Validators.min(0)]],
      name: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryToEdit'] && this.categoryToEdit) {
      this.categoryForm.patchValue({
        displayOrder: this.categoryToEdit.displayOrder,
        name: this.categoryToEdit.name,
        isActive: this.categoryToEdit.isActive !== undefined ? this.categoryToEdit.isActive : true
      });
      // this.categoryForm.get('displayOrder')?.disable();
    } else if ((changes['categoryToEdit'] && !this.categoryToEdit) || changes['nextDisplayOrder']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.categoryForm.reset({
      displayOrder: this.nextDisplayOrder,
      name: '',
      isActive: true
    });
    // this.categoryForm.get('displayOrder')?.disable();
  }

  submitForm(): void {
    if (this.categoryForm.valid) {
      this.loading = true;
      const rawValue = this.categoryForm.getRawValue();

      const payload: any = {
        name: rawValue.name.trim(),
        displayOrder: rawValue.displayOrder,
        isActive: rawValue.isActive
      };

      if (this.categoryToEdit) {
        // Update
        this.apiService.updateDesignIdeaCategory(this.categoryToEdit.id, payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Category updated successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to update category.';
            this.message.error(errMsg);
          }
        });
      } else {
        // Create
        this.apiService.createDesignIdeaCategory(payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Category created successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to create category.';
            this.message.error(errMsg);
          }
        });
      }
    } else {
      Object.values(this.categoryForm.controls).forEach(control => {
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
