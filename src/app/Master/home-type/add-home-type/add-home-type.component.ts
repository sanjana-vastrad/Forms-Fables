import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';

@Component({
  selector: 'app-add-home-type',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSwitchModule
  ],
  templateUrl: './add-home-type.component.html',
  styleUrl: './add-home-type.component.css'
})
export class AddHomeTypeComponent implements OnChanges {
  @Input() homeTypeToEdit: any = null;
  @Input() nextSequenceNo: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  homeTypeForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.homeTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true],
      displayOrder: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['homeTypeToEdit'] && this.homeTypeToEdit) {
      this.homeTypeForm.patchValue({
        name: this.homeTypeToEdit.name,
        isActive: this.homeTypeToEdit.isActive !== undefined ? this.homeTypeToEdit.isActive : true,
        displayOrder: this.homeTypeToEdit.displayOrder !== undefined ? this.homeTypeToEdit.displayOrder : this.nextSequenceNo
      });
    } else if ((changes['homeTypeToEdit'] && !this.homeTypeToEdit) || changes['nextSequenceNo']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.homeTypeForm.reset({
      name: '',
      isActive: true,
      displayOrder: this.nextSequenceNo
    });
  }

  submitForm(): void {
    if (this.homeTypeForm.valid) {
      this.loading = true;
      const rawValue = this.homeTypeForm.getRawValue();

      const payload = {
        homeType: rawValue.name.trim(),
        isActive: rawValue.isActive,
        sequenceNo: rawValue.displayOrder
      };

      if (this.homeTypeToEdit) {
        this.apiService.updateHomeType(this.homeTypeToEdit.id, payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Home Type updated successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to update Home Type.';
            this.message.error(errMsg);
          }
        });
      } else {
        this.apiService.createHomeType(payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('Home Type created successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to create Home Type.';
            this.message.error(errMsg);
          }
        });
      }
    } else {
      Object.values(this.homeTypeForm.controls).forEach(control => {
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
