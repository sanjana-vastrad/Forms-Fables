import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TestimonialService, Testimonial } from '../testimonial.service';
import { AddTestimonialComponent } from '../add-testimonial/add-testimonial.component';

@Component({
  selector: 'app-testimonial-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSwitchModule,
    NzPopconfirmModule,
    AddTestimonialComponent
  ],
  templateUrl: './testimonial-list.component.html',
  styleUrl: './testimonial-list.component.css'
})
export class TestimonialListComponent implements OnInit {
  testimonials: Testimonial[] = [];
  loading = false;
  drawerVisible = false;
  selectedTestimonial: Testimonial | null = null;
  deletingId: string | number | null = null;

  // Pagination & Filter States
  pageIndex: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  totalCount: number = 0;

  constructor(
    private testimonialService: TestimonialService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadTestimonials();
  }

  loadTestimonials(): void {
    this.loading = true;
    this.testimonialService.getTestimonials(
      this.pageIndex,
      this.pageSize,
      undefined,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.testimonials = res.items || [];
        this.totalCount = res.total || res.items.length;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching Testimonials:', err);
        this.message.error('Failed to load Testimonials.');
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadTestimonials();
  }

  openAddDrawer(): void {
    this.selectedTestimonial = null;
    this.drawerVisible = true;
  }

  openEditDrawer(testimonial: Testimonial): void {
    this.selectedTestimonial = testimonial;
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedTestimonial = null;
  }

  handleSaveSuccess(): void {
    this.closeDrawer();
    this.loadTestimonials();
  }

  toggleStatus(testimonial: Testimonial): void {
    const updatedStatus = !testimonial.isActive;
    this.testimonialService.updateTestimonial(testimonial.id, { isActive: updatedStatus }).subscribe({
      next: () => {
        testimonial.isActive = updatedStatus;
        this.message.success(`Testimonial ${updatedStatus ? 'activated' : 'deactivated'} successfully.`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.message.error('Failed to update Testimonial status.');
      }
    });
  }

  deleteTestimonial(id: string | number): void {
    this.deletingId = id;
    this.testimonialService.deleteTestimonial(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.message.success('Testimonial deleted successfully.');
        this.loadTestimonials();
      },
      error: (err) => {
        this.deletingId = null;
        console.error('Error deleting Testimonial:', err);
        this.message.error('Failed to delete Testimonial.');
      }
    });
  }

  showingStart(): number {
    if (this.totalCount === 0) return 0;
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  showingEnd(): number {
    const end = this.pageIndex * this.pageSize;
    return end > this.totalCount ? this.totalCount : end;
  }

  totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadTestimonials();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages()) {
      this.pageIndex++;
      this.loadTestimonials();
    }
  }
}
