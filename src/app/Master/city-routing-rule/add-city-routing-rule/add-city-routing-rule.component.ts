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
import { CityRoutingRuleService, CityRoutingRule } from '../city-routing-rule.service';
import { ApiServiceService } from '../../../Service/api-service.service';

export interface DropdownOption {
  id: string | number;
  name: string;
  email?: string;
}

@Component({
  selector: 'app-add-city-routing-rule',
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
  templateUrl: './add-city-routing-rule.component.html',
  styleUrl: './add-city-routing-rule.component.css'
})
export class AddCityRoutingRuleComponent implements OnInit, OnChanges {
  @Input() routingRuleToEdit: CityRoutingRule | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  routingRuleForm: FormGroup;
  loading = false;

  // Dynamic Dropdowns from Masters
  citiesList: DropdownOption[] = [];
  usersList: DropdownOption[] = [];

  constructor(
    private fb: FormBuilder,
    private routingRuleService: CityRoutingRuleService,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.routingRuleForm = this.fb.group({
      cityId: [null, [Validators.required]],
      assignedUserId: [null, [Validators.required]],
      priority: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCitiesDropdown();
    this.loadUsersDropdown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['routingRuleToEdit']) {
      if (this.routingRuleToEdit) {
        this.routingRuleForm.patchValue({
          cityId: this.routingRuleToEdit.cityId,
          assignedUserId: this.routingRuleToEdit.assignedUserId,
          priority: this.routingRuleToEdit.priority || 1,
          isActive: this.routingRuleToEdit.isActive
        });
      } else {
        this.routingRuleForm.reset({
          cityId: null,
          assignedUserId: null,
          priority: 1,
          isActive: true
        });
      }
    }
  }

  loadCitiesDropdown(): void {
    this.apiService.getCities(1, 10, '', 'name', 'DESC').subscribe({
      next: (res: any) => {
        let rawList: any[] = [];

        if (res) {
          if (Array.isArray(res)) {
            rawList = res;
          } else if (res.items && Array.isArray(res.items)) {
            rawList = res.items;
          } else if (res.data && Array.isArray(res.data.items)) {
            rawList = res.data.items;
          } else if (Array.isArray(res.data)) {
            rawList = res.data;
          } else if (res.data && Array.isArray(res.data.cities)) {
            rawList = res.data.cities;
          } else if (Array.isArray(res.result)) {
            rawList = res.result;
          } else if (res.result && Array.isArray(res.result.items)) {
            rawList = res.result.items;
          }
        }

        // Filter only Active cities
        const activeCities = rawList.filter((item: any) => {
          if (item.isActive !== undefined) {
            return Boolean(item.isActive);
          }
          if (item.status !== undefined) {
            return String(item.status).toLowerCase() === 'active';
          }
          return true;
        });

        // Map to dropdown options with standard field fallbacks
        this.citiesList = activeCities.map((item: any) => ({
          id: item.id || item.ID || item._id,
          name: item.name || item.cityName || item.City || ''
        }));

        // Sort descending by name
        this.citiesList.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }));
      },
      error: (err: any) => {
        console.error('Error loading cities dropdown:', err);
      }
    });
  }

  loadUsersDropdown(): void {
    this.apiService.getV1Users(1, 100).subscribe({
      next: (res: any) => {
        let rawList: any[] = [];
        if (Array.isArray(res)) rawList = res;
        else if (res.items && Array.isArray(res.items)) rawList = res.items;
        else if (res.data && Array.isArray(res.data.items)) rawList = res.data.items;
        else if (res.data && Array.isArray(res.data)) rawList = res.data;

        this.usersList = rawList.map((item) => ({
          id: item.id || item._id,
          name: item.name || item.fullName || item.username,
          email: item.email || ''
        }));
      },
      error: (err: any) => {
        console.error('Error loading users dropdown:', err);
      }
    });
  }

  submitForm(): void {
    if (this.routingRuleForm.invalid) {
      Object.values(this.routingRuleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.loading = true;
    const formValue = this.routingRuleForm.value;

    const selectedCity = this.citiesList.find(c => String(c.id) === String(formValue.cityId));
    const selectedUser = this.usersList.find(u => String(u.id) === String(formValue.assignedUserId));

    const payload = {
      ...formValue,
      cityName: selectedCity ? selectedCity.name : '',
      assignedUserName: selectedUser ? selectedUser.name : '',
      assignedUserEmail: selectedUser ? selectedUser.email : ''
    };

    if (this.routingRuleToEdit) {
      this.routingRuleService.updateCityRoutingRule(this.routingRuleToEdit.id, payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false)) {
            this.message.error(res.message || 'Failed to update City Routing Rule.');
            return;
          }
          this.message.success('City Routing Rule updated successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error updating City Routing Rule:', err);
          this.message.error(err?.error?.message || err?.message || 'Failed to update City Routing Rule.');
        }
      });
    } else {
      this.routingRuleService.createCityRoutingRule(payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false)) {
            this.message.error(res.message || 'Failed to create City Routing Rule.');
            return;
          }
          this.message.success('City Routing Rule created successfully.');
          this.onSave.emit();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error creating City Routing Rule:', err);
          this.message.error(err?.error?.message || err?.message || 'Failed to create City Routing Rule.');
        }
      });
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }
}
