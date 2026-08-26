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
  selector: 'app-add-faq',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule
  ],
  templateUrl: './add-faq.component.html',
  styleUrl: './add-faq.component.css'
})
export class AddFaqComponent implements OnChanges {
  @Input() faqToEdit: any = null;
  @Input() nextDisplayOrder: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  faqForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.faqForm = this.fb.group({
      displayOrder: [null, [Validators.required, Validators.min(0)]],
      question: ['', [Validators.required]],
      answer: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['faqToEdit'] && this.faqToEdit) {
      this.faqForm.patchValue({
        displayOrder: this.faqToEdit.displayOrder,
        question: this.faqToEdit.question,
        answer: this.faqToEdit.answer,
        isActive: this.faqToEdit.isActive !== undefined ? this.faqToEdit.isActive : true
      });
      this.faqForm.get('displayOrder')?.disable();
    } else if ((changes['faqToEdit'] && !this.faqToEdit) || changes['nextDisplayOrder']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.faqForm.reset({
      displayOrder: this.nextDisplayOrder,
      question: '',
      answer: '',
      isActive: true
    });
    this.faqForm.get('displayOrder')?.disable();
  }

  submitForm(): void {
    if (this.faqForm.valid) {
      this.loading = true;
      const rawValue = this.faqForm.getRawValue();

      const payload: any = {
        question: rawValue.question.trim(),
        answer: rawValue.answer.trim(),
        displayOrder: rawValue.displayOrder,
        isActive: rawValue.isActive
      };

      if (this.faqToEdit) {
        // Update FAQ
        this.apiService.updateFaq(this.faqToEdit.id, payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('FAQ updated successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to update FAQ.';
            this.message.error(errMsg);
          }
        });
      } else {
        // Create FAQ
        this.apiService.createFaq(payload).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('FAQ created successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            const errMsg = err?.error?.message || err?.message || 'Failed to create FAQ.';
            this.message.error(errMsg);
          }
        });
      }
    } else {
      Object.values(this.faqForm.controls).forEach(control => {
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
