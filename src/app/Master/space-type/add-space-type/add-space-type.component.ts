import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SpaceTypeService, SpaceType } from '../space-type.service';

@Component({
  selector: 'app-add-space-type',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule,
    NzIconModule
  ],
  templateUrl: './add-space-type.component.html',
  styleUrl: './add-space-type.component.css'
})
export class AddSpaceTypeComponent implements OnChanges {
  @Input() spaceTypeToEdit: SpaceType | null = null;
  @Input() nextSequenceNo: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  spaceTypeForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private spaceTypeService: SpaceTypeService,
    private message: NzMessageService
  ) {
    this.spaceTypeForm = this.fb.group({
      name: ['', [Validators.required]],
      displayOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['spaceTypeToEdit'] || changes['nextSequenceNo']) {
      if (this.spaceTypeToEdit) {
        this.spaceTypeForm.patchValue({
          name: this.spaceTypeToEdit.name,
          displayOrder: this.spaceTypeToEdit.displayOrder,
          isActive: this.spaceTypeToEdit.isActive
        });
      } else {
        this.spaceTypeForm.reset({
          name: '',
          displayOrder: this.nextSequenceNo || 1,
          isActive: true
        });
      }
    }
  }

  submitForm(): void {
    if (this.spaceTypeForm.invalid) {
      Object.values(this.spaceTypeForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.loading = true;
    const formValue = this.spaceTypeForm.value;

    if (this.spaceTypeToEdit) {
      this.spaceTypeService.updateSpaceType(this.spaceTypeToEdit.id, formValue).subscribe({
        next: () => {
          this.loading = false;
          this.message.success('Space Type updated successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error updating Space Type:', err);
          this.message.error('Failed to update Space Type.');
        }
      });
    } else {
      this.spaceTypeService.createSpaceType(formValue).subscribe({
        next: () => {
          this.loading = false;
          this.message.success('Space Type created successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error creating Space Type:', err);
          this.message.error('Failed to create Space Type.');
        }
      });
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }
}
