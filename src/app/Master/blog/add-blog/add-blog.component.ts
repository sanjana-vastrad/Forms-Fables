import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor';
import { ApiServiceService } from '../../../Service/api-service.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-blog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule,
    NzSelectModule,
    NzIconModule,
    AngularEditorModule
  ],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.css'
})
export class AddBlogComponent implements OnChanges, OnInit {
  @Input() blogToEdit: any = null;
  @Input() nextDisplayOrder: number = 1;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('coverInput') coverInput!: ElementRef;

  blogForm: FormGroup;
  loading = false;
  categoriesList: any[] = [];
  coverFile: File | null = null;
  coverPreview: string | null = null;
  coverError: string | null = null;
  
  sectionBuilderForm: FormGroup;
  editingSectionIndex: number | null = null;
  uploadingCover = false;

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
    placeholder: 'Enter content here...',
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

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private message: NzMessageService
  ) {
    this.blogForm = this.fb.group({
      displayOrder: [null, [Validators.required, Validators.min(0)]],
      title: ['', [Validators.required]],
      authorName: ['', [Validators.required]],
      shortDescription: [''],
      categoryId: [null, [Validators.required]],
      tags: [[]],
      imageUrl: [''],
      isActive: [true],
      sections: this.fb.array([])
    });

    this.sectionBuilderForm = this.fb.group({
      sectionTitle: [''],
      sectionType: ['Paragraph'],
      content: [''],
      isActive: [true]
    });
  }

  get sections(): FormArray {
    return this.blogForm.get('sections') as FormArray;
  }

  get builderSectionType(): string {
    return this.sectionBuilderForm.get('sectionType')?.value;
  }

  removeSection(index: number) {
    this.sections.removeAt(index);
  }

  onBuilderSectionTypeChange(type: string) {
    if (type === 'Paragraph') {
      this.sectionBuilderForm.get('content')?.setValue('');
    } else {
      this.sectionBuilderForm.get('content')?.setValue([]);
    }
  }

  addTagToBuilder(inputElement: HTMLInputElement, event?: Event) {
    if (event) event.preventDefault();
    const val = inputElement.value.trim();
    if (!val) return;
    
    const control = this.sectionBuilderForm.get('content');
    const currentTags = control?.value || [];
    if (Array.isArray(currentTags)) {
      control?.setValue([...currentTags, val]);
      inputElement.value = '';
    }
  }

  removeTagFromBuilder(tagIndex: number) {
    const control = this.sectionBuilderForm.get('content');
    const currentTags = control?.value || [];
    if (Array.isArray(currentTags)) {
      const updatedTags = [...currentTags];
      updatedTags.splice(tagIndex, 1);
      control?.setValue(updatedTags);
    }
  }

  addDesignTag(inputElement: HTMLInputElement, event?: Event) {
    if (event) event.preventDefault();
    const val = inputElement.value.trim();
    if (!val) return;
    
    const control = this.blogForm.get('tags');
    const currentTags = control?.value || [];
    if (Array.isArray(currentTags)) {
      control?.setValue([...currentTags, val]);
      inputElement.value = '';
    }
  }

  removeDesignTag(index: number) {
    const control = this.blogForm.get('tags');
    const currentTags = control?.value || [];
    if (Array.isArray(currentTags)) {
      const updatedTags = [...currentTags];
      updatedTags.splice(index, 1);
      control?.setValue(updatedTags);
    }
  }

  addSectionFromBuilder() {
    const val = this.sectionBuilderForm.getRawValue();
    if (!val.sectionTitle && !val.content && (!Array.isArray(val.content) || val.content.length === 0)) {
      this.message.warning('Please enter a title or content before adding a section.');
      return;
    }

    if (this.editingSectionIndex !== null) {
      // Update existing
      this.sections.at(this.editingSectionIndex).patchValue({
        sectionTitle: val.sectionTitle,
        sectionType: val.sectionType,
        content: val.content,
        isActive: val.isActive
      });
      this.editingSectionIndex = null;
    } else {
      // Add new
      this.sections.push(this.fb.group({
        sectionTitle: [val.sectionTitle],
        sectionType: [val.sectionType],
        content: [val.content],
        isActive: [val.isActive !== undefined ? val.isActive : true]
      }));
    }
    
    // Reset builder
    this.sectionBuilderForm.reset({
      sectionTitle: '',
      sectionType: 'Paragraph',
      content: '',
      isActive: true
    });
  }

  editSection(index: number) {
    const sectionToEdit = this.sections.at(index).value;
    this.editingSectionIndex = index;
    this.sectionBuilderForm.patchValue({
      sectionTitle: sectionToEdit.sectionTitle,
      sectionType: sectionToEdit.sectionType,
      content: sectionToEdit.content,
      isActive: sectionToEdit.isActive !== undefined ? sectionToEdit.isActive : true
    });
  }

  ngOnInit(): void {
    this.apiService.getBlogCategories(1, 100).subscribe({
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
          }
        }
        
        if (rawList && rawList.length > 0) {
          this.categoriesList = rawList.map((item: any) => ({
            id: item.id || item.ID || item._id,
            name: item.name || item.Name || item.title || ''
          }));
        } else {
          this.categoriesList = [];
        }
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blogToEdit'] && this.blogToEdit) {
      this.blogForm.patchValue({
        displayOrder: this.blogToEdit.displayOrder || this.blogToEdit.display_order,
        title: this.blogToEdit.title,
        authorName: this.blogToEdit.authorName || this.blogToEdit.author_name,
        shortDescription: this.blogToEdit.shortDescription || this.blogToEdit.short_description,
        categoryId: this.blogToEdit.categoryId || this.blogToEdit.category_id,
        imageUrl: this.blogToEdit.imageUrl || this.blogToEdit.image_url,
        tags: this.blogToEdit.tags || [],
        isActive: this.blogToEdit.isActive !== undefined ? this.blogToEdit.isActive : (this.blogToEdit.is_active !== undefined ? this.blogToEdit.is_active : true)
      });
      const storedImage = this.blogToEdit.imageUrl || this.blogToEdit.image_url;
      if (storedImage) {
        this.coverPreview = this.getAbsoluteImageUrl(storedImage);
      }
      
      this.sections.clear();
      if (this.blogToEdit.sections && Array.isArray(this.blogToEdit.sections)) {
        this.blogToEdit.sections.forEach((sec: any) => {
          this.sections.push(this.fb.group({
            sectionTitle: [sec.sectionTitle || ''],
            sectionType: [sec.sectionType || 'Paragraph'],
            content: [sec.content || (sec.sectionType === 'Paragraph' ? '' : [])],
            isActive: [sec.isActive !== undefined ? sec.isActive : true]
          }));
        });
      }
    } else if ((changes['blogToEdit'] && !this.blogToEdit) || changes['nextDisplayOrder']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.blogForm.reset({
      displayOrder: this.nextDisplayOrder,
      title: '',
      authorName: '',
      shortDescription: '',
      categoryId: null,
      tags: [],
      imageUrl: '',
      isActive: true
    });
    this.coverFile = null;
    this.coverPreview = null;
    this.coverError = null;
    this.sections.clear();
    this.sectionBuilderForm.reset({
      sectionTitle: '',
      sectionType: 'Paragraph',
      content: '',
      isActive: true
    });
    this.editingSectionIndex = null;
    if (this.coverInput?.nativeElement) {
      this.coverInput.nativeElement.value = '';
    }
  }

  submitForm(): void {
    if (this.blogForm.valid) {
      this.loading = true;
      const rawValue = this.blogForm.getRawValue();
      const titleStr = rawValue.title.trim();
      const generatedSlug = titleStr.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      const payload: any = {
        title: titleStr,
        slug: generatedSlug,
        authorName: rawValue.authorName,
        shortDescription: rawValue.shortDescription,
        categoryId: rawValue.categoryId,
        imageUrl: rawValue.imageUrl,
        tags: rawValue.tags || [],
        displayOrder: rawValue.displayOrder,
        isActive: rawValue.isActive,
        sections: rawValue.sections
      };

      if (this.blogToEdit) {
        // Update
        this.apiService.updateBlog(this.blogToEdit.id, payload).subscribe({
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
        this.apiService.createBlog(payload).subscribe({
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
      Object.values(this.blogForm.controls).forEach(control => {
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

  getAbsoluteImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${environment.authUrl}${cleanPath}`;
  }

  triggerCoverUpload(): void {
    this.coverInput.nativeElement.click();
  }

  onCoverSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.coverError = 'Please select a valid image file.';
        return;
      }
      this.coverError = null;
      this.uploadingCover = true;

      this.apiService.uploadImage(file, 'blogs').subscribe({
        next: (res: any) => {
          this.uploadingCover = false;
          const url = res?.data?.url || res?.path || res?.url;
          if (url) {
            this.blogForm.patchValue({ imageUrl: url });
            this.coverPreview = this.getAbsoluteImageUrl(url);
          }
        },
        error: (err) => {
          this.uploadingCover = false;
          this.coverError = 'Failed to upload cover image.';
          console.error(err);
        }
      });
    }
  }
}
