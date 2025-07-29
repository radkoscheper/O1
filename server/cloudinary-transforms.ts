/**
 * Cloudinary AI Transformations voor Ontdek Polen
 * Smart cropping en optimalisatie configuraties
 */

export interface TransformConfig {
  name: string;
  description: string;
  transformation: string;
  useCase: string;
}

export const CLOUDINARY_TRANSFORMS: TransformConfig[] = [
  // Header Images - Perfect voor destination headers
  {
    name: 'header-smart',
    description: 'Smart header cropping met AI focus',
    transformation: 'w_1200,h_480,c_fill,g_auto,q_auto:good,f_auto',
    useCase: 'Destination page headers'
  },
  
  // Card Images - Voor bestemmingen en activiteiten cards
  {
    name: 'card-square',
    description: 'Vierkante cards met AI cropping',
    transformation: 'w_400,h_400,c_fill,g_auto,q_auto:good,f_auto',
    useCase: 'Homepage destination cards'
  },
  
  {
    name: 'card-landscape',
    description: 'Landscape cards met slimme crop',
    transformation: 'w_400,h_250,c_fill,g_auto,q_auto:good,f_auto',
    useCase: 'Activity en guide cards'
  },
  
  // Travel Enhanced - Speciaal voor travel photography
  {
    name: 'travel-enhanced',
    description: 'Travel foto verbetering met AI',
    transformation: 'w_800,h_600,c_fill,g_auto,e_saturation:15,e_auto_contrast,q_auto:good,f_auto',
    useCase: 'Featured travel images'
  },
  
  // Hero Images - Grote banner images
  {
    name: 'hero-banner',
    description: 'Hero banners met perfecte crop',
    transformation: 'w_1920,h_800,c_fill,g_auto,e_improve,q_auto:best,f_auto',
    useCase: 'Homepage hero sections'
  },
  
  // Thumbnail - Kleine previews
  {
    name: 'thumbnail',
    description: 'Kleine thumbnails geoptimaliseerd',
    transformation: 'w_150,h_150,c_thumb,g_auto,q_auto:good,f_auto',
    useCase: 'Gallery thumbnails'
  },
  
  // Mobile Optimized - Voor mobiele apparaten
  {
    name: 'mobile-header',
    description: 'Mobiele headers geoptimaliseerd',
    transformation: 'w_800,h_400,c_fill,g_auto,q_auto:good,f_auto,dpr_auto',
    useCase: 'Mobile destination headers'
  },
  
  // Social Media - Voor sociale media sharing
  {
    name: 'social-share',
    description: 'Social media geoptimaliseerd',
    transformation: 'w_1200,h_630,c_fill,g_auto,q_auto:good,f_auto',
    useCase: 'Open Graph images'
  },
  
  // Architecture Focus - Voor kastelen en gebouwen
  {
    name: 'architecture',
    description: 'Architectuur details versterkt',
    transformation: 'w_800,h_600,c_fill,g_auto,e_sharpen:50,e_auto_contrast,q_auto:good,f_auto',
    useCase: 'Castle and building images'
  },
  
  // Nature Enhanced - Voor natuurfoto\'s
  {
    name: 'nature-enhanced',
    description: 'Natuur kleuren versterkt',
    transformation: 'w_800,h_600,c_fill,g_auto,e_saturation:25,e_vibrance:20,q_auto:good,f_auto',
    useCase: 'Landscape and nature photos'
  }
];

/**
 * Genereert Cloudinary URL met transformatie
 */
export function generateCloudinaryUrl(
  publicId: string, 
  transform: string = 'w_800,h_600,c_fill,g_auto,q_auto:good,f_auto'
): string {
  const cloudName = 'df3i1avwb';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}

/**
 * Krijgt optimale transformatie op basis van gebruik
 */
export function getTransformByUseCase(useCase: string): TransformConfig | null {
  return CLOUDINARY_TRANSFORMS.find(t => t.useCase.toLowerCase().includes(useCase.toLowerCase())) || null;
}

/**
 * Responsive image set generator
 */
export function generateResponsiveSet(publicId: string, baseTransform: string): {
  mobile: string;
  tablet: string;
  desktop: string;
} {
  const cloudName = 'df3i1avwb';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return {
    mobile: `${baseUrl}/w_400,${baseTransform}/${publicId}`,
    tablet: `${baseUrl}/w_800,${baseTransform}/${publicId}`,
    desktop: `${baseUrl}/w_1200,${baseTransform}/${publicId}`
  };
}

/**
 * Auto-detect beste transformatie voor image type
 */
export function detectOptimalTransform(filename: string, context: string): string {
  const isArchitecture = filename.toLowerCase().includes('castle') || 
                        filename.toLowerCase().includes('church') || 
                        filename.toLowerCase().includes('building');
  
  const isNature = filename.toLowerCase().includes('mountain') || 
                  filename.toLowerCase().includes('forest') || 
                  filename.toLowerCase().includes('lake');
  
  if (context === 'header') {
    return 'w_1200,h_480,c_fill,g_auto,q_auto:good,f_auto';
  } else if (context === 'card') {
    return 'w_400,h_250,c_fill,g_auto,q_auto:good,f_auto';
  } else if (isArchitecture) {
    return 'w_800,h_600,c_fill,g_auto,e_sharpen:50,e_auto_contrast,q_auto:good,f_auto';
  } else if (isNature) {
    return 'w_800,h_600,c_fill,g_auto,e_saturation:25,e_vibrance:20,q_auto:good,f_auto';
  }
  
  return 'w_800,h_600,c_fill,g_auto,q_auto:good,f_auto';
}