import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor';
import { ApiServiceService } from '../../../Service/api-service.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzMessageModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule,
    NzIconModule,
    NzProgressModule,
    NzGridModule,
    NzToolTipModule,
    NzCollapseModule,
    AngularEditorModule
  ],
  templateUrl: './add-service.component.html',
  styleUrl: './add-service.component.css'
})
export class AddServiceComponent implements OnChanges {
  @Input() serviceToEdit: any = null;
  @Input() nextDisplayOrder: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  serviceForm: FormGroup;
  loading = false;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '60px',
    minHeight: '60px',
    maxHeight: '150px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter detailed description...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    toolbarHiddenButtons: [
      [
        'subscript',
        'superscript',
        'indent',
        'outdent',
        'heading',
        'fontName'
      ],
      [
        'fontSize',
        'textColor',
        'backgroundColor',
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode'
      ]
    ]
  };

  // Icon Upload State
  iconPreviewUrl: string | null = null;
  uploadingIcon = false;
  iconProgress = 0;
  iconError = false;

  // Hero Image Upload State
  heroPreviewUrl: string | null = null;
  uploadingHero = false;
  heroProgress = 0;
  heroError = false;

  // Additional Upload State for Benefits & Process
  benefitIconPreviewUrl: string | null = null;
  uploadingBenefitIcon = false;
  benefitIconProgress = 0;
  benefitIconError = false;

  processIconPreviewUrl: string | null = null;
  uploadingProcessIcon = false;
  processIconProgress = 0;
  processIconError = false;

  addedBenefits: any[] = [];
  addedProcesses: any[] = [];
  addedFaqs: any[] = [];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private apiService: ApiServiceService
  ) {
    this.serviceForm = this.fb.group({
      // Step 0: Main Info
      title: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      shortDescription: ['', []],
      description: ['', []],
      iconUrl: ['', [Validators.required]],
      heroImage: ['', [Validators.required]],
      displayOrder: [null, [Validators.required, Validators.min(0)]],
      isActive: [true],

      // Step 1: Benefits Section
      benefits: this.fb.group({
        id: [null],
        sectionTitle: [''],
        sectionDesc: [''],
        iconUrl: [''],
        title: [''],
        description: [''],
        displayOrder: [1, [Validators.min(0)]],
        isActive: [true]
      }),

      // Step 2: Process Section
      process: this.fb.group({
        id: [null],
        sectionTitle: [''],
        sectionDesc: [''],
        processNum: [''],
        iconUrl: [''],
        title: [''],
        description: [''],
        details: [''],
        displayOrder: [1, [Validators.min(0)]],
        isActive: [true]
      }),

      // Step 3: FAQs Section
      faqs: this.fb.group({
        id: [null],
        question: [''],
        answer: [''],
        displayOrder: [1, [Validators.min(0)]],
        isActive: [true]
      })
    });
  }

  getAbsoluteImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = (environment.authUrl || '').trim().replace(/\/+$/, '');
    const relativePath = url.replace(/^\/+/, '');
    return `${baseUrl}/${relativePath}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceToEdit'] && this.serviceToEdit) {
      this.serviceForm.patchValue({
        title: this.serviceToEdit.title,
        slug: this.serviceToEdit.slug,
        shortDescription: this.serviceToEdit.shortdescription || '',
        description: this.serviceToEdit.fulldescription || '',
        iconUrl: this.serviceToEdit.icon_url || '',
        heroImage: this.serviceToEdit.hero_url || '',
        displayOrder: this.serviceToEdit.display_order,
        isActive: this.serviceToEdit.is_active !== undefined ? this.serviceToEdit.is_active : true
      });

      // Hydrate nested arrays from backend data structure
      if (this.serviceToEdit.benefit_section) {
        this.serviceForm.get('benefits')?.patchValue({
          sectionTitle: this.serviceToEdit.benefit_section.section_title || '',
          sectionDesc: this.serviceToEdit.benefit_section.section_description || ''
        });
        if (this.serviceToEdit.benefit_section.benefits) {
          this.addedBenefits = this.serviceToEdit.benefit_section.benefits.map((b: any) => ({
            id: b.id,
            iconUrl: b.icon_url,
            title: b.title,
            description: b.description,
            displayOrder: b.display_order,
            isActive: b.status === 1 || b.status === true
          }));
        }
      }

      if (this.serviceToEdit.our_process) {
        this.serviceForm.get('process')?.patchValue({
          sectionTitle: this.serviceToEdit.our_process.section_title || '',
          sectionDesc: this.serviceToEdit.our_process.section_description || ''
        });
        if (this.serviceToEdit.our_process.process_items) {
          this.addedProcesses = this.serviceToEdit.our_process.process_items.map((p: any) => ({
            id: p.id,
            processNum: p.process_number,
            iconUrl: p.icon_url,
            title: p.title,
            description: p.description,
            details: p.details,
            displayOrder: p.display_order,
            isActive: p.status === 1 || p.status === true
          }));
        }
      }

      if (this.serviceToEdit.faqs && this.serviceToEdit.faqs.faq_items) {
        this.addedFaqs = this.serviceToEdit.faqs.faq_items.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          displayOrder: f.display_order,
          isActive: f.status === 1 || f.status === true
        }));
      }

      this.iconPreviewUrl = this.getAbsoluteImageUrl(this.serviceToEdit.icon_url);
      this.heroPreviewUrl = this.getAbsoluteImageUrl(this.serviceToEdit.hero_url);
      this.iconError = false;
      this.heroError = false;

    } else if ((changes['serviceToEdit'] && !this.serviceToEdit) || changes['nextDisplayOrder']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.serviceForm.reset({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      iconUrl: '',
      heroImage: '',
      displayOrder: this.nextDisplayOrder,
      isActive: true,
      benefits: { displayOrder: 1, isActive: true },
      process: { displayOrder: 1, isActive: true },
      faqs: { displayOrder: 1, isActive: true }
    });
    this.iconPreviewUrl = null;
    this.heroPreviewUrl = null;
    this.uploadingIcon = false;
    this.iconProgress = 0;
    this.uploadingHero = false;
    this.heroProgress = 0;

    this.benefitIconPreviewUrl = null;
    this.uploadingBenefitIcon = false;
    this.benefitIconProgress = 0;
    this.benefitIconError = false;

    this.processIconPreviewUrl = null;
    this.uploadingProcessIcon = false;
    this.processIconProgress = 0;
    this.processIconError = false;
  }

  // Title to Slug logic
  onTitleChange(): void {
    const titleControl = this.serviceForm.get('title');
    const slugControl = this.serviceForm.get('slug');
    if (titleControl?.value) {
      const generatedSlug = titleControl.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      slugControl?.setValue(generatedSlug);
    }
  }

  // --- Icon Upload Logic (Mock) ---
  onIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.message.error('Please select a valid image file for Icon');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.iconPreviewUrl = reader.result as string;
        this.iconError = false;
      };
      reader.readAsDataURL(file);

      this.uploadingIcon = true;
      this.iconProgress = 0;

      this.apiService.uploadImage(file, 'services').subscribe({
        next: (res: any) => {
          this.iconProgress = 100;
          this.uploadingIcon = false;
          const serverUrl = res?.data?.url || res?.url || res?.fileUrl || res?.data?.fileUrl || res?.path || res?.data?.path || (typeof res === 'string' ? res : '');
          if (serverUrl) {
            this.serviceForm.patchValue({ iconUrl: serverUrl });
            this.serviceForm.get('iconUrl')?.markAsDirty();
            this.message.success('Icon uploaded successfully!');
          } else {
            this.message.error('Failed to get icon URL from server.');
          }
        },
        error: (err) => {
          this.uploadingIcon = false;
          this.iconError = true;
          this.message.error('Failed to upload icon.');
          console.error(err);
        }
      });
    }
  }

  removeIcon(): void {
    this.iconPreviewUrl = null;
    this.iconError = false;
    this.uploadingIcon = false;
    this.iconProgress = 0;
    this.serviceForm.patchValue({ iconUrl: '' });
    this.serviceForm.get('iconUrl')?.markAsDirty();
  }

  // --- Hero Image Upload Logic (Mock) ---
  onHeroSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.message.error('Please select a valid image file for Hero Image');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.heroPreviewUrl = reader.result as string;
        this.heroError = false;
      };
      reader.readAsDataURL(file);

      this.uploadingHero = true;
      this.heroProgress = 0;

      this.apiService.uploadImage(file, 'services').subscribe({
        next: (res: any) => {
          this.heroProgress = 100;
          this.uploadingHero = false;
          const serverUrl = res?.data?.url || res?.url || res?.fileUrl || res?.data?.fileUrl || res?.path || res?.data?.path || (typeof res === 'string' ? res : '');
          if (serverUrl) {
            this.serviceForm.patchValue({ heroImage: serverUrl });
            this.serviceForm.get('heroImage')?.markAsDirty();
            this.message.success('Hero image uploaded successfully!');
          } else {
            this.message.error('Failed to get hero image URL from server.');
          }
        },
        error: (err) => {
          this.uploadingHero = false;
          this.heroError = true;
          this.message.error('Failed to upload hero image.');
          console.error(err);
        }
      });
    }
  }

  removeHero(): void {
    this.heroPreviewUrl = null;
    this.heroError = false;
    this.uploadingHero = false;
    this.heroProgress = 0;
    this.serviceForm.patchValue({ heroImage: '' });
    this.serviceForm.get('heroImage')?.markAsDirty();
  }

  // --- Benefit Icon Upload Logic ---
  onBenefitIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.message.error('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => { this.benefitIconPreviewUrl = reader.result as string; this.benefitIconError = false; };
      reader.readAsDataURL(file);
      this.uploadingBenefitIcon = true;
      this.benefitIconProgress = 0;
      this.apiService.uploadImage(file, 'services').subscribe({
        next: (res: any) => {
          this.benefitIconProgress = 100;
          this.uploadingBenefitIcon = false;
          const serverUrl = res?.data?.url || res?.url || res?.fileUrl || res?.data?.fileUrl || res?.path || res?.data?.path || (typeof res === 'string' ? res : '');
          if (serverUrl) {
            this.serviceForm.get('benefits')?.patchValue({ iconUrl: serverUrl });
            this.serviceForm.get('benefits.iconUrl')?.markAsDirty();
            this.message.success('Benefit icon uploaded successfully!');
          }
        },
        error: (err) => {
          this.uploadingBenefitIcon = false;
          this.benefitIconError = true;
          this.message.error('Failed to upload benefit icon.');
          console.error(err);
        }
      });
    }
  }

  removeBenefitIcon(): void {
    this.benefitIconPreviewUrl = null;
    this.serviceForm.get('benefits')?.patchValue({ iconUrl: '' });
  }

  // --- Process Icon Upload Logic ---
  onProcessIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.message.error('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => { this.processIconPreviewUrl = reader.result as string; this.processIconError = false; };
      reader.readAsDataURL(file);
      this.uploadingProcessIcon = true;
      this.processIconProgress = 0;
      this.apiService.uploadImage(file, 'services').subscribe({
        next: (res: any) => {
          this.processIconProgress = 100;
          this.uploadingProcessIcon = false;
          const serverUrl = res?.data?.url || res?.url || res?.fileUrl || res?.data?.fileUrl || res?.path || res?.data?.path || (typeof res === 'string' ? res : '');
          if (serverUrl) {
            this.serviceForm.get('process')?.patchValue({ iconUrl: serverUrl });
            this.serviceForm.get('process.iconUrl')?.markAsDirty();
            this.message.success('Process icon uploaded successfully!');
          }
        },
        error: (err) => {
          this.uploadingProcessIcon = false;
          this.processIconError = true;
          this.message.error('Failed to upload process icon.');
          console.error(err);
        }
      });
    }
  }

  removeProcessIcon(): void {
    this.processIconPreviewUrl = null;
    this.serviceForm.get('process')?.patchValue({ iconUrl: '' });
  }

  // --- List Management Logic ---
  addBenefit(): void {
    const group = this.serviceForm.get('benefits') as FormGroup;
    const title = group.get('title')?.value;
    const iconUrl = group.get('iconUrl')?.value;

    if (!title || !iconUrl) {
      this.message.error('Please enter Benefit Title and Icon before adding.');
      return;
    }

    this.addedBenefits.push({
      id: group.get('id')?.value,
      title: title,
      description: group.get('description')?.value,
      iconUrl: iconUrl,
      displayOrder: group.get('displayOrder')?.value,
      isActive: group.get('isActive')?.value
    });

    // Reset item fields
    group.patchValue({
      id: null,
      title: '',
      description: '',
      iconUrl: '',
      displayOrder: this.addedBenefits.length + 1,
      isActive: true
    });
    this.benefitIconPreviewUrl = null;
    this.message.success('Benefit added to list');
  }

  removeBenefit(index: number): void {
    this.addedBenefits.splice(index, 1);
  }

  editBenefit(index: number): void {
    const benefitToEdit = this.addedBenefits[index];
    const group = this.serviceForm.get('benefits') as FormGroup;
    group.patchValue({
      id: benefitToEdit.id || null,
      title: benefitToEdit.title,
      description: benefitToEdit.description,
      iconUrl: benefitToEdit.iconUrl,
      displayOrder: benefitToEdit.displayOrder,
      isActive: benefitToEdit.isActive
    });
    this.benefitIconPreviewUrl = benefitToEdit.iconUrl && benefitToEdit.iconUrl !== 'mock-benefit.png' ? this.getAbsoluteImageUrl(benefitToEdit.iconUrl) : null;
    this.benefitIconError = false;
    this.removeBenefit(index);
  }

  addProcess(): void {
    const group = this.serviceForm.get('process') as FormGroup;
    const title = group.get('title')?.value;
    const processNum = group.get('processNum')?.value;
    const iconUrl = group.get('iconUrl')?.value;

    if (!title || !processNum || !iconUrl) {
      this.message.error('Please enter Process Number, Title, and Icon before adding.');
      return;
    }

    this.addedProcesses.push({
      id: group.get('id')?.value,
      processNum: processNum,
      title: title,
      description: group.get('description')?.value,
      details: group.get('details')?.value,
      iconUrl: iconUrl,
      displayOrder: group.get('displayOrder')?.value,
      isActive: group.get('isActive')?.value
    });

    // Reset item fields
    group.patchValue({
      id: null,
      processNum: '',
      title: '',
      description: '',
      details: '',
      iconUrl: '',
      displayOrder: this.addedProcesses.length + 1,
      isActive: true
    });
    this.processIconPreviewUrl = null;
    this.message.success('Process step added to list');
  }

  removeProcess(index: number): void {
    this.addedProcesses.splice(index, 1);
  }

  editProcess(index: number): void {
    const processToEdit = this.addedProcesses[index];
    const group = this.serviceForm.get('process') as FormGroup;
    group.patchValue({
      id: processToEdit.id || null,
      processNum: processToEdit.processNum,
      title: processToEdit.title,
      description: processToEdit.description,
      details: processToEdit.details,
      iconUrl: processToEdit.iconUrl,
      displayOrder: processToEdit.displayOrder,
      isActive: processToEdit.isActive
    });
    this.processIconPreviewUrl = processToEdit.iconUrl && processToEdit.iconUrl !== 'mock-process.png' ? this.getAbsoluteImageUrl(processToEdit.iconUrl) : null;
    this.processIconError = false;
    this.removeProcess(index);
  }

  addFaq(): void {
    const group = this.serviceForm.get('faqs') as FormGroup;
    const question = group.get('question')?.value;
    const answer = group.get('answer')?.value;

    if (!question || !answer) {
      this.message.error('Please enter Question and Answer before adding.');
      return;
    }

    this.addedFaqs.push({
      id: group.get('id')?.value,
      question: question,
      answer: answer,
      displayOrder: group.get('displayOrder')?.value,
      isActive: group.get('isActive')?.value
    });

    // Reset item fields
    group.patchValue({
      id: null,
      question: '',
      answer: '',
      displayOrder: this.addedFaqs.length + 1,
      isActive: true
    });
    this.message.success('FAQ added to list');
  }

  removeFaq(index: number): void {
    this.addedFaqs.splice(index, 1);
  }

  editFaq(index: number): void {
    const faqToEdit = this.addedFaqs[index];
    const group = this.serviceForm.get('faqs') as FormGroup;
    group.patchValue({
      id: faqToEdit.id || null,
      question: faqToEdit.question,
      answer: faqToEdit.answer,
      displayOrder: faqToEdit.displayOrder,
      isActive: faqToEdit.isActive
    });
    this.removeFaq(index);
  }

  submitForm(): void {
    if (this.serviceForm.valid) {
      // Auto-commit any pending edits/additions in the sub-forms before saving
      const bGroup = this.serviceForm.get('benefits');
      if (bGroup && bGroup.get('title')?.value && bGroup.get('iconUrl')?.value) {
        this.addBenefit();
      }
      
      const pGroup = this.serviceForm.get('process');
      if (pGroup && pGroup.get('title')?.value && pGroup.get('processNum')?.value && pGroup.get('iconUrl')?.value) {
        this.addProcess();
      }
      
      const fGroup = this.serviceForm.get('faqs');
      if (fGroup && fGroup.get('question')?.value && fGroup.get('answer')?.value) {
        this.addFaq();
      }

      this.loading = true;
      const formVal = this.serviceForm.value;

      const payload = {
        title: formVal.title,
        slug: formVal.slug,
        shortdescription: formVal.shortDescription,
        fulldescription: formVal.description,
        icon_url: formVal.iconUrl,
        hero_url: formVal.heroImage,
        display_order: formVal.displayOrder,
        is_active: !!formVal.isActive,
        benefit_section: {
          section_title: formVal.benefits.sectionTitle,
          section_description: formVal.benefits.sectionDesc,
          benefits: this.addedBenefits.map((b, index) => {
            const item: any = {
              icon_url: b.iconUrl,
              title: b.title,
              description: b.description,
              display_order: b.displayOrder || (index + 1),
              status: !!b.isActive
            };
            if (b.id) item.id = b.id;
            return item;
          })
        },
        our_process: {
          section_title: formVal.process.sectionTitle,
          section_description: formVal.process.sectionDesc,
          process_items: this.addedProcesses.map((p, index) => {
            const item: any = {
              process_number: Number(p.processNum) || (index + 1),
              icon_url: p.iconUrl,
              title: p.title,
              description: p.description,
              details: p.details,
              display_order: p.displayOrder || (index + 1),
              status: !!p.isActive
            };
            if (p.id) item.id = p.id;
            return item;
          })
        },
        faqs: {
          faq_items: this.addedFaqs.map((f, index) => {
            const item: any = {
              question: f.question,
              answer: f.answer,
              display_order: f.displayOrder || (index + 1),
              status: !!f.isActive
            };
            if (f.id) item.id = f.id;
            return item;
          })
        }
      };

      if (this.serviceToEdit && this.serviceToEdit.id) {
        this.apiService.updateService(this.serviceToEdit.id, payload).subscribe({
          next: (res) => {
            this.loading = false;
            this.message.success('Service updated successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            this.message.error('Failed to update service.');
            console.error(err);
          }
        });
      } else {
        this.apiService.createService(payload).subscribe({
          next: (res) => {
            this.loading = false;
            this.message.success('Service created successfully!');
            this.resetForm();
            this.onSave.emit();
          },
          error: (err) => {
            this.loading = false;
            this.message.error('Failed to create service.');
            console.error(err);
          }
        });
      }
    } else {
      Object.values(this.serviceForm.controls).forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(subControl => {
            subControl.markAsDirty();
            subControl.updateValueAndValidity({ onlySelf: true });
          });
        } else {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Please fill all required fields across all steps.');
    }
  }

  handleCancel(): void {
    this.resetForm();
    this.onCancel.emit();
  }
}

// Trigger rebuild
