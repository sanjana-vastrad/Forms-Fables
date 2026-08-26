import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiServiceService } from '../../../Service/api-service.service';

@Component({
  selector: 'app-add-city',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzSwitchModule
  ],
  templateUrl: './add-city.component.html',
  styleUrl: './add-city.component.css'
})
export class AddCityComponent implements OnChanges {
  @Input() cityToEdit: any = null;
  @Input() nextSequenceNo: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  cityForm: FormGroup;
  loading = false;

  // List of Indian States and Union Territories
  statesList: string[] = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry'
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.cityForm = this.fb.group({
      state: [null, [Validators.required]],
      cityName: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true],
      sequenceNo: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cityToEdit'] && this.cityToEdit) {
      this.cityForm.patchValue({
        state: this.cityToEdit.state,
        cityName: this.cityToEdit.name,
        isActive: this.cityToEdit.isActive !== undefined ? this.cityToEdit.isActive : true,
        sequenceNo: this.cityToEdit.sequenceNo !== undefined ? this.cityToEdit.sequenceNo : this.nextSequenceNo
      });
    } else if ((changes['cityToEdit'] && !this.cityToEdit) || changes['nextSequenceNo']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.cityForm.reset({
      state: null,
      cityName: '',
      isActive: true,
      sequenceNo: this.nextSequenceNo
    });
  }

  submitForm(): void {
    if (this.cityForm.valid) {
      this.loading = true;
      const rawValue = this.cityForm.getRawValue();

      const payload = {
        name: rawValue.cityName.trim(),
        state: rawValue.state,
        isActive: rawValue.isActive,
        sequenceNo: rawValue.sequenceNo
      };

      if (this.cityToEdit) {
        // Update city
        this.apiService.updateCity(this.cityToEdit.id, payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('City updated successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to update city.';
            this.message.error(errMsg);
          }
        });
      } else {
        // Create city
        this.apiService.createCity(payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('City created successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to create city.';
            this.message.error(errMsg);
          }
        });
      }
    } else {
      Object.values(this.cityForm.controls).forEach(control => {
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
