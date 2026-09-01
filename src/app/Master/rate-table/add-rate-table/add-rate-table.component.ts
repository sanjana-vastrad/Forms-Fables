import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RateTableService, RateTable } from '../rate-table.service';
import { SpaceTypeService, SpaceType } from '../../space-type/space-type.service';
import { ApiServiceService } from '../../../Service/api-service.service';

export interface DropdownOption {
  id: string | number;
  name: string;
}

@Component({
  selector: 'app-add-rate-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSwitchModule,
    NzIconModule
  ],
  templateUrl: './add-rate-table.component.html',
  styleUrl: './add-rate-table.component.css'
})
export class AddRateTableComponent implements OnInit, OnChanges {
  @Input() rateTableToEdit: RateTable | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  rateTableForm: FormGroup;
  loading = false;

  // Dynamic Dropdown Lists from Masters
  spaceTypesList: DropdownOption[] = [];
  designCategoriesList: DropdownOption[] = [];

  finishTierOptions: string[] = ['Standard', 'Premium', 'Luxury', 'Ultra Luxury'];
  scopeOptions: string[] = ['Full Interior', 'Partial Interior', 'Modular Furniture', 'Civil & Electrical'];

  constructor(
    private fb: FormBuilder,
    private rateTableService: RateTableService,
    private spaceTypeService: SpaceTypeService,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.rateTableForm = this.fb.group({
      spaceTypeId: [null, [Validators.required]],
      designIdeaCategoryId: [null, [Validators.required]],
      finishTier: ['Premium', [Validators.required]],
      scope: ['Full Interior', [Validators.required]],
      rateMinPerSqft: [1000, [Validators.required, Validators.min(0)]],
      rateMaxPerSqft: [1500, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadSpaceTypesDropdown();
    this.loadDesignCategoriesDropdown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rateTableToEdit']) {
      if (this.rateTableToEdit) {
        this.rateTableForm.patchValue({
          spaceTypeId: this.rateTableToEdit.spaceTypeId,
          designIdeaCategoryId: this.rateTableToEdit.designIdeaCategoryId,
          finishTier: this.rateTableToEdit.finishTier || 'Premium',
          scope: this.rateTableToEdit.scope || 'Full Interior',
          rateMinPerSqft: this.rateTableToEdit.rateMinPerSqft || 0,
          rateMaxPerSqft: this.rateTableToEdit.rateMaxPerSqft || 0,
          isActive: this.rateTableToEdit.isActive
        });
      } else {
        this.rateTableForm.reset({
          spaceTypeId: this.spaceTypesList.length > 0 ? this.spaceTypesList[0].id : null,
          designIdeaCategoryId: this.designCategoriesList.length > 0 ? this.designCategoriesList[0].id : null,
          finishTier: 'Premium',
          scope: 'Full Interior',
          rateMinPerSqft: 1000,
          rateMaxPerSqft: 1500,
          isActive: true
        });
      }
    }
  }

  loadSpaceTypesDropdown(): void {
    this.spaceTypeService.getSpaceTypes(1, 100).subscribe({
      next: (res: any) => {
        this.spaceTypesList = (res.items || []).map((item: any) => ({
          id: item.id,
          name: item.name
        }));

        // Default to first item if empty
        if (!this.rateTableToEdit && this.spaceTypesList.length > 0 && !this.rateTableForm.get('spaceTypeId')?.value) {
          this.rateTableForm.patchValue({ spaceTypeId: this.spaceTypesList[0].id });
        }
      },
      error: (err: any) => {
        console.error('Error fetching space types for dropdown:', err);
        // Fallback space types
        this.spaceTypesList = [
          { id: 'st_001', name: 'Kitchen' },
          { id: 'st_002', name: 'Living Room' },
          { id: 'st_003', name: 'Bedroom' },
          { id: 'st_004', name: 'Dining Room' }
        ];
      }
    });
  }

  loadDesignCategoriesDropdown(): void {
    this.apiService.getDesignIdeaCategories(1, 100).subscribe({
      next: (res: any) => {
        let rawList: any[] = [];
        if (Array.isArray(res)) rawList = res;
        else if (res.items && Array.isArray(res.items)) rawList = res.items;
        else if (res.data && Array.isArray(res.data.items)) rawList = res.data.items;
        else if (res.data && Array.isArray(res.data)) rawList = res.data;

        this.designCategoriesList = rawList.map((item, idx) => ({
          id: item.id || item._id || `dic_${idx + 1}`,
          name: item.name || item.title || `Category ${idx + 1}`
        }));

        if (this.designCategoriesList.length === 0) {
          this.designCategoriesList = [
            { id: 'dic_001', name: 'Modular Kitchen' },
            { id: 'dic_002', name: 'Contemporary Living' },
            { id: 'dic_003', name: 'Master Bedroom' },
            { id: 'dic_004', name: 'Luxury Dining' }
          ];
        }

        if (!this.rateTableToEdit && this.designCategoriesList.length > 0 && !this.rateTableForm.get('designIdeaCategoryId')?.value) {
          this.rateTableForm.patchValue({ designIdeaCategoryId: this.designCategoriesList[0].id });
        }
      },
      error: (err: any) => {
        console.error('Error fetching design categories for dropdown:', err);
        this.designCategoriesList = [
          { id: 'dic_001', name: 'Modular Kitchen' },
          { id: 'dic_002', name: 'Contemporary Living' },
          { id: 'dic_003', name: 'Master Bedroom' },
          { id: 'dic_004', name: 'Luxury Dining' }
        ];
      }
    });
  }

  submitForm(): void {
    if (this.rateTableForm.invalid) {
      Object.values(this.rateTableForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.loading = true;
    const formValue = this.rateTableForm.value;

    // Attach resolved names for local display
    const selectedSpaceType = this.spaceTypesList.find(s => String(s.id) === String(formValue.spaceTypeId));
    const selectedDesignCategory = this.designCategoriesList.find(c => String(c.id) === String(formValue.designIdeaCategoryId));

    const payload = {
      ...formValue,
      spaceTypeName: selectedSpaceType ? selectedSpaceType.name : '',
      designIdeaCategoryName: selectedDesignCategory ? selectedDesignCategory.name : ''
    };

    if (this.rateTableToEdit) {
      this.rateTableService.updateRateTable(this.rateTableToEdit.id, payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false)) {
            this.message.error(res.message || 'Failed to update Rate Table.');
            return;
          }
          this.message.success('Rate Table updated successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error updating Rate Table:', err);
          this.message.error(err?.error?.message || err?.message || 'Failed to update Rate Table.');
        }
      });
    } else {
      this.rateTableService.createRateTable(payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false)) {
            this.message.error(res.message || 'Failed to create Rate Table.');
            return;
          }
          this.message.success('Rate Table created successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error creating Rate Table:', err);
          this.message.error(err?.error?.message || err?.message || 'Failed to create Rate Table.');
        }
      });
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }
}
