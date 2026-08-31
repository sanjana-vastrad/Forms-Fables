import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiServiceService } from '../../Service/api-service.service';

export interface OverviewAttribute {
  iconUrl?: string;
  iconName?: string;
  label: string;
  value: string;
}

export interface DesignIdea {
  id: string;
  title: string;
  slug: string;
  categoryId?: string | number;
  categoryName?: string;
  category?: string; // Fallback
  area: string;
  status?: 'Published' | 'Draft';
  imagesCount: number;
  imagesTotal: number;
  thumbnail: string;
  layoutType?: string;
  description?: string;
  aboutPoints?: string[];
  overviewAttributes?: OverviewAttribute[];
  images?: string[];
  loadingThumbnail?: boolean;
}

const INITIAL_DESIGNS: DesignIdea[] = [
  {
    id: 'design_001',
    title: 'Contemporary Kitchen Design with White Cabinets',
    slug: '/contemporary-kitchen-white-cabinets',
    category: 'Kitchen',
    area: '13x8 Feet',
    status: 'Published',
    imagesCount: 7,
    imagesTotal: 10,
    thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
    layoutType: 'L-Shape',
    description: 'A sleek, contemporary kitchen design featuring glossy white cabinets, quartz countertops, and smart storage solutions for modern homes.',
    aboutPoints: [
      'Glossy acrylic finish cabinets with soft-close hinges',
      'Smart pull-out pantry & corner carousel unit',
      'Quartz stone countertop with undermount stainless steel sink',
      'Under-cabinet LED strip lighting for task areas'
    ],
    overviewAttributes: [
      { iconName: 'appstore', label: 'Category', value: 'Kitchen' },
      { iconName: 'layout', label: 'Layout', value: 'L-Shape' },
      { iconName: 'environment', label: 'Area', value: '13x8 Feet' },
      { iconName: 'tag', label: 'Style', value: 'Contemporary' }
    ],
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'design_002',
    title: 'Modern L-Shaped Sofa Living Room with Wooden Accents',
    slug: '/modern-l-shaped-sofa-living-room',
    category: 'Living Room',
    area: '16x12 Feet',
    status: 'Published',
    imagesCount: 4,
    imagesTotal: 10,
    thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
    layoutType: 'Open Plan',
    description: 'Spacious living room design centered around a premium fabric L-shaped sectional sofa with custom wooden wall paneling and cove lighting.',
    aboutPoints: [
      'Custom wooden veneer accent wall with fluted panels',
      'Plush 6-seater modular L-shaped sofa in taupe fabric',
      'Ambient LED cove lighting with warm dimming controls',
      'Floating TV console unit with cable management'
    ],
    overviewAttributes: [
      { iconName: 'appstore', label: 'Category', value: 'Living Room' },
      { iconName: 'layout', label: 'Layout', value: 'Open Plan' },
      { iconName: 'environment', label: 'Area', value: '16x12 Feet' },
      { iconName: 'star', label: 'Theme', value: 'Modern Warm' }
    ],
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'design_003',
    title: 'Elegant U-Shaped Kitchen with Marble Countertops',
    slug: '/elegant-u-shaped-kitchen-marble',
    category: 'Kitchen',
    area: '14x11 Feet',
    status: 'Draft',
    imagesCount: 2,
    imagesTotal: 10,
    thumbnail: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
    layoutType: 'U-Shape',
    description: 'An elegant U-shaped kitchen layout maximizing counter space with Italian marble tops and solid wood cabinetry.',
    aboutPoints: [
      'Italian Carrara marble countertop & full backsplash',
      'Built-in oven and microwave tall unit',
      'Soft-close Blum hardware throughout',
      'Integrated spice rack & cutlery organizers'
    ],
    overviewAttributes: [
      { iconName: 'appstore', label: 'Category', value: 'Kitchen' },
      { iconName: 'layout', label: 'Layout', value: 'U-Shape' },
      { iconName: 'environment', label: 'Area', value: '14x11 Feet' }
    ],
    images: [
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'design_004',
    title: 'Open Kitchen with Island and Pendant Lighting',
    slug: '/open-kitchen-island-pendant-lighting',
    category: 'Kitchen',
    area: '16x12 Feet',
    status: 'Published',
    imagesCount: 6,
    imagesTotal: 10,
    thumbnail: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=400&q=80',
    layoutType: 'Island Kitchen',
    description: 'Open concept kitchen with a multi-functional island bar, brass pendant lights, and two-tone custom cabinets.',
    aboutPoints: [
      'Central island with breakfast bar seating for 4',
      'Designer brass pendant drop lights',
      'Two-tone dark teal and oak wood cabinetry',
      'Pop-up electrical outlets on island top'
    ],
    overviewAttributes: [
      { iconName: 'appstore', label: 'Category', value: 'Kitchen' },
      { iconName: 'layout', label: 'Layout', value: 'Island Kitchen' },
      { iconName: 'environment', label: 'Area', value: '16x12 Feet' }
    ],
    images: [
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'design_005',
    title: 'Classic Kitchen with Warm Wood Finishes',
    slug: '/classic-kitchen-warm-wood-finishes',
    category: 'Kitchen',
    area: '10x8 Feet',
    status: 'Draft',
    imagesCount: 3,
    imagesTotal: 10,
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    layoutType: 'Parallel Kitchen',
    description: 'A cozy, classic parallel kitchen featuring warm teak wood finish cabinets and easy-to-clean granite countertops.',
    aboutPoints: [
      'Natural teak wood textured laminate finish',
      'Durable black granite countertop',
      'Optimized work triangle for efficient cooking'
    ],
    overviewAttributes: [
      { iconName: 'appstore', label: 'Category', value: 'Kitchen' },
      { iconName: 'layout', label: 'Layout', value: 'Parallel Kitchen' },
      { iconName: 'environment', label: 'Area', value: '10x8 Feet' }
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'design_006',
    title: 'Minimalist Kitchen with Handleless Cabinets',
    slug: '/minimalist-kitchen-handleless-cabinets',
    category: 'Kitchen',
    area: '12x9 Feet',
    status: 'Published',
    imagesCount: 5,
    imagesTotal: 10,
    thumbnail: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80',
    layoutType: 'Straight Kitchen',
    description: 'Clean minimalist aesthetic with Gola profile handleless shutters, matte grey finish, and integrated appliances.',
    aboutPoints: [
      'Aluminum Gola profile handleless system',
      'Matte anti-fingerprint slate grey finish',
      'Integrated chimney and dishwasher setup'
    ],
    overviewAttributes: [
      { iconName: 'appstore', label: 'Category', value: 'Kitchen' },
      { iconName: 'layout', label: 'Layout', value: 'Straight Kitchen' },
      { iconName: 'environment', label: 'Area', value: '12x9 Feet' }
    ],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'design_007',
    title: 'Luxurious Master Bedroom with Upholstered Headboard',
    slug: '/luxurious-master-bedroom-upholstered-headboard',
    category: 'Bedroom',
    area: '18x14 Feet',
    status: 'Published',
    imagesCount: 8,
    imagesTotal: 10,
    thumbnail: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80',
    layoutType: 'King Bedroom',
    description: 'Serene master bedroom suite featuring a floor-to-ceiling velvet upholstered headboard and integrated wardrobe.',
    aboutPoints: [
      'Floor-to-ceiling channel-tufted velvet headboard',
      'Floor-to-ceiling glass wardrobe with sensor lights',
      'Hardwood flooring with plush area rug'
    ],
    overviewAttributes: [
      { iconName: 'appstore', label: 'Category', value: 'Bedroom' },
      { iconName: 'layout', label: 'Layout', value: 'King Bedroom' },
      { iconName: 'environment', label: 'Area', value: '18x14 Feet' }
    ],
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class DesignIdeasService {
  constructor(private apiService: ApiServiceService) {}

  getDesignIdeas(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    sortBy: string = 'displayOrder',
    sortOrder: string = 'ASC'
  ): Observable<any> {
    return this.apiService.getV1DesignIdeas(page, limit, search, sortBy, sortOrder);
  }

  addDesignIdea(design: Partial<DesignIdea>): Observable<any> {
    return this.apiService.createV1DesignIdea(design);
  }

  updateDesignIdea(id: string | number, updates: Partial<DesignIdea>): Observable<any> {
    return this.apiService.updateV1DesignIdea(id, updates);
  }

  deleteDesignIdea(id: string | number): Observable<any> {
    return this.apiService.deleteV1DesignIdea(id);
  }

  uploadDesignImage(designId: string | number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.apiService.uploadV1DesignIdeaImage(designId, formData);
  }

  deleteDesignImage(designId: string | number, imageId: string | number): Observable<any> {
    return this.apiService.deleteV1DesignIdeaImage(designId, imageId);
  }
}
