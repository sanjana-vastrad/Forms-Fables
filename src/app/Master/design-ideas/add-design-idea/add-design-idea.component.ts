import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DesignIdeasService, DesignIdea, OverviewAttribute } from '../design-ideas.service';
import { ApiServiceService } from '../../../Service/api-service.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-design-idea',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule
  ],
  templateUrl: './add-design-idea.component.html',
  styleUrl: './add-design-idea.component.css'
})
export class AddDesignIdeaComponent implements OnChanges {
  @Input() designToEdit: DesignIdea | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  designForm: FormGroup;
  loading = false;
  uploadedImages: { preview: string, serverUrl: string, loading?: boolean }[] = [];

  categoryOptions: any[] = [];

  iconOptions = [
    { label: 'Category Grid', value: 'appstore' },
    { label: 'Layout Grid', value: 'layout' },
    { label: 'Location Pin', value: 'environment' },
    { label: 'Tag', value: 'tag' },
    { label: 'Star', value: 'star' },
    { label: 'Check Circle', value: 'check-circle' },
    { label: 'Home', value: 'home' },
    { label: 'Setting', value: 'setting' }
  ];

  constructor(
    private fb: FormBuilder,
    private designIdeasService: DesignIdeasService,
    private message: NzMessageService,
    private apiService: ApiServiceService
  ) {
    this.designForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiService.getDesignIdeaCategories(1, 10, '', 'displayOrder', 'ASC').subscribe({
      next: (res: any) => {
        let rawList: any[] = [];
        if (res) {
          if (Array.isArray(res)) rawList = res;
          else if (res.items && Array.isArray(res.items)) rawList = res.items;
          else if (res.data && Array.isArray(res.data.items)) rawList = res.data.items;
          else if (Array.isArray(res.data)) rawList = res.data;
        }
        if (rawList && rawList.length > 0) {
          this.categoryOptions = rawList.map((item: any) => ({
            id: item.id || item.ID || item._id,
            name: item.name || item.Name
          }));
        }
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required]],
      categoryId: [null, [Validators.required]],
      categoryName: [''],
      slug: ['', [Validators.required]],
      layoutType: ['L-Shape'],
      area: ['13x8 Feet'],
      description: ['', [Validators.required]],
      aboutPoints: this.fb.array([]),
      overviewAttributes: this.fb.array([])
    });
  }

  get aboutPointsArray(): FormArray {
    return this.designForm.get('aboutPoints') as FormArray;
  }

  get overviewAttributesArray(): FormArray {
    return this.designForm.get('overviewAttributes') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['designToEdit']) {
      this.populateForm();
    }
  }

  populateForm(): void {
    this.aboutPointsArray.clear();
    this.overviewAttributesArray.clear();

    if (this.designToEdit) {
      this.uploadedImages = [];
      const images = this.designToEdit.images || (this.designToEdit.thumbnail ? [this.designToEdit.thumbnail] : []);
      images.forEach(imgUrl => {
        const absolute = this.getAbsoluteImageUrl(imgUrl);
        const imgObj = { preview: '', serverUrl: imgUrl, loading: true };
        this.uploadedImages.push(imgObj);
        
        if (absolute) {
          this.apiService.fetchImageBlob(absolute).subscribe({
            next: (blob) => {
              imgObj.preview = URL.createObjectURL(blob);
              imgObj.loading = false;
            },
            error: () => {
              imgObj.preview = absolute;
              imgObj.loading = false;
            }
          });
        } else {
          imgObj.preview = '';
          imgObj.loading = false;
        }
      });

      this.designForm.patchValue({
        title: this.designToEdit.title,
        categoryId: this.designToEdit.categoryId || this.designToEdit.category,
        categoryName: this.designToEdit.categoryName || this.designToEdit.category,
        slug: this.designToEdit.slug,
        layoutType: this.designToEdit.layoutType || 'L-Shape',
        area: this.designToEdit.area || '13x8 Feet',
        description: this.designToEdit.description || ''
      });

      if (this.designToEdit.aboutPoints && this.designToEdit.aboutPoints.length > 0) {
        this.designToEdit.aboutPoints.forEach(pt => this.addAboutPoint(pt));
      } else {
        this.addAboutPoint('Glossy acrylic finish cabinets with soft-close hinges');
        this.addAboutPoint('Smart pull-out pantry & carousel unit');
      }

      if (this.designToEdit.overviewAttributes && this.designToEdit.overviewAttributes.length > 0) {
        this.designToEdit.overviewAttributes.forEach(attr => this.addOverviewAttribute(attr));
      } else {
        this.populateDefaultOverviewAttributes();
      }
    } else {
      // Default initial form for new item
      this.uploadedImages = [
        { preview: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', serverUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
        { preview: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80', serverUrl: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80' }
      ];

      this.designForm.reset({
        title: '',
        categoryId: null,
        categoryName: '',
        slug: '',
        layoutType: 'L-Shape',
        area: '13x8 Feet',
        description: ''
      });

      this.addAboutPoint('');
      this.addAboutPoint('');

      this.populateDefaultOverviewAttributes();
    }
  }

  populateDefaultOverviewAttributes(): void {
    const currentCategory = this.designForm.get('categoryName')?.value || '';
    const currentLayout = this.designForm.get('layoutType')?.value || 'L-Shape';
    const currentArea = this.designForm.get('area')?.value || '13x8 Feet';

    this.addOverviewAttribute({ iconName: 'appstore', label: 'Category', value: currentCategory });
    this.addOverviewAttribute({ iconName: 'layout', label: 'Layout', value: currentLayout });
    this.addOverviewAttribute({ iconName: 'environment', label: 'Area', value: currentArea });
    this.addOverviewAttribute({ iconName: 'tag', label: '', value: '' });
  }

  onTitleChange(): void {
    const titleVal = this.designForm.get('title')?.value || '';
    if (!this.designToEdit || !this.designForm.get('slug')?.dirty) {
      const generatedSlug = '/' + titleVal
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      this.designForm.patchValue({ slug: generatedSlug });
    }
  }

  onCategorySelectChange(catId: any): void {
    const selectedCat = this.categoryOptions.find(c => c.id === catId);
    const catName = selectedCat ? selectedCat.name : '';
    this.designForm.patchValue({ categoryName: catName });

    // Keep category attribute in sync if present
    const attrs = this.overviewAttributesArray.controls;
    attrs.forEach(control => {
      if (control.get('label')?.value === 'Category') {
        control.patchValue({ value: catName });
      }
    });
  }

  // --- About Points ---
  addAboutPoint(val: string = ''): void {
    this.aboutPointsArray.push(this.fb.control(val, [Validators.required]));
  }

  removeAboutPoint(index: number): void {
    if (this.aboutPointsArray.length > 1) {
      this.aboutPointsArray.removeAt(index);
    } else {
      this.aboutPointsArray.at(0).setValue('');
    }
  }

  // --- Overview Attributes ---
  addOverviewAttribute(attr?: OverviewAttribute): void {
    const group = this.fb.group({
      iconName: [attr?.iconName || 'appstore'],
      iconUrl: [attr?.iconUrl || ''],
      previewIconUrl: [''],
      iconLoading: [false],
      label: [attr?.label || ''],
      value: [attr?.value || '']
    });

    if (attr?.iconUrl) {
      const absolute = this.getAbsoluteImageUrl(attr.iconUrl);
      if (absolute) {
        group.patchValue({ iconLoading: true });
        this.apiService.fetchImageBlob(absolute).subscribe({
          next: (blob) => group.patchValue({ previewIconUrl: URL.createObjectURL(blob), iconLoading: false }),
          error: () => group.patchValue({ previewIconUrl: absolute, iconLoading: false })
        });
      }
    }

    this.overviewAttributesArray.push(group);
  }

  removeOverviewAttribute(index: number): void {
    if (this.overviewAttributesArray.length > 1) {
      this.overviewAttributesArray.removeAt(index);
    } else {
      this.overviewAttributesArray.at(0).reset({ iconName: 'appstore', label: '', value: '' });
    }
  }

  handleAttributeIconUpload(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      // Create local preview immediately for UX
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.overviewAttributesArray.at(index).patchValue({ previewIconUrl: e.target.result });
      };
      reader.readAsDataURL(file);

      // Upload to server
      this.apiService.uploadImage(file, 'designIdeaIcon').subscribe({
        next: (res: any) => {
          const serverUrl = res?.data?.url || res?.url || res?.fileUrl || res?.data?.fileUrl || res?.path || res?.data?.path || res?.imageUrl || (typeof res === 'string' ? res : '');
          if (serverUrl) {
            this.overviewAttributesArray.at(index).patchValue({ iconUrl: serverUrl });
            this.message.success('Attribute icon uploaded successfully.');
          } else {
            this.message.warning('Icon uploaded but no URL was returned by server.');
          }
        },
        error: (err) => {
          console.error('Icon upload failed:', err);
          this.message.error('Failed to upload attribute icon.');
        }
      });
    }
  }

  removeAttributeIcon(index: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.overviewAttributesArray.at(index).patchValue({ iconUrl: '' });
    this.message.info('Uploaded icon removed.');
  }

  // --- Images Grid ---
  onImagesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      const remainingSlots = 10 - this.uploadedImages.length;
      if (remainingSlots <= 0) {
        this.message.warning('Maximum 10 images limit reached.');
        return;
      }

      const countToProcess = Math.min(files.length, remainingSlots);
      let successCount = 0;

      for (let i = 0; i < countToProcess; i++) {
        const file = files[i];

        // 1. Show immediate local Base64 preview placeholder
        const reader = new FileReader();
        const placeholderIndex = this.uploadedImages.length;
        
        const imgObj = { preview: '', serverUrl: '' };
        this.uploadedImages.push(imgObj);

        reader.onload = (e: any) => {
          imgObj.preview = e.target.result; // Keep local preview forever for this session
        };
        reader.readAsDataURL(file);

        // 2. Upload to server
        this.apiService.uploadImage(file, 'designIdeaImage').subscribe({
          next: (res: any) => {
            const serverUrl = res?.data?.url || res?.url || res?.fileUrl || res?.data?.fileUrl || res?.path || res?.data?.path || res?.imageUrl || (typeof res === 'string' ? res : '');
            if (serverUrl) {
              imgObj.serverUrl = serverUrl; // Only update the backend url, leaving preview intact!
              successCount++;
              if (successCount === countToProcess) {
                this.message.success(`${successCount} image(s) uploaded successfully.`);
              }
            }
          },
          error: (err) => {
            console.error('Image upload failed:', err);
            this.message.error(`Failed to upload one of the images.`);
          }
        });
      }
    }
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

  moveImage(index: number, direction: 'left' | 'right'): void {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target >= 0 && target < this.uploadedImages.length) {
      const temp = this.uploadedImages[index];
      this.uploadedImages[index] = this.uploadedImages[target];
      this.uploadedImages[target] = temp;
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  submitForm(): void {
    if (this.designForm.invalid) {
      Object.values(this.designForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Please fill out all required fields.');
      return;
    }

    this.loading = true;
    const formVal = this.designForm.value;

    const cleanAboutPoints = (formVal.aboutPoints || []).filter((p: string) => p && p.trim() !== '');
    const cleanOverviewAttrs = (formVal.overviewAttributes || []).filter((a: any) => a.label && a.label.trim() !== '');

    const payload: Partial<DesignIdea> = {
      title: formVal.title,
      categoryId: formVal.categoryId,
      categoryName: formVal.categoryName,
      slug: formVal.slug,
      layoutType: formVal.layoutType,
      area: formVal.area || '13x8 Feet',
      description: formVal.description,
      aboutPoints: cleanAboutPoints,
      overviewAttributes: cleanOverviewAttrs,
      images: this.uploadedImages.map(img => img.serverUrl).filter(url => !!url)
    };

    if (this.designToEdit) {
      this.designIdeasService.updateDesignIdea(this.designToEdit.id, payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false || res.error)) {
            this.message.error(res.message || res.error || 'Failed to update design idea.');
            return;
          }
          this.message.success('Design Idea updated successfully!');
          this.onSave.emit();
        },
        error: (err) => {
          this.loading = false;
          this.message.error(err?.error?.message || err.message || 'Failed to update design idea.');
        }
      });
    } else {
      this.designIdeasService.addDesignIdea(payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && (res.status === false || res.success === false || res.error)) {
            this.message.error(res.message || res.error || 'Failed to create design idea.');
            return;
          }
          this.message.success('New Design Idea created successfully!');
          this.onSave.emit();
        },
        error: (err) => {
          this.loading = false;
          this.message.error(err?.error?.message || err.message || 'Failed to create design idea.');
        }
      });
    }
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
}
