/**
 * Cloudinary AI Transformatie Utilities voor Ontdek Polen
 */

export interface CloudinaryTransform {
  name: string;
  description: string;
  transformation: string;
  useCase: string;
}

// Voorgedefinieerde transformaties voor verschillende use cases
export const CLOUDINARY_TRANSFORMS: CloudinaryTransform[] = [
  {
    name: 'header-smart',
    description: 'Smart header cropping met AI focus',
    transformation: 'w_1200,h_480,c_fill,g_auto,q_auto:good,f_auto',
    useCase: 'Headers voor destination pagina\'s'
  },
  {
    name: 'card-landscape',
    description: 'Landscape cards met slimme crop',
    transformation: 'w_400,h_250,c_fill,g_auto,q_auto:good,f_auto',
    useCase: 'Destination en activity cards'
  },
  {
    name: 'card-square',
    description: 'Vierkante cards met AI cropping',
    transformation: 'w_400,h_400,c_fill,g_auto,q_auto:good,f_auto',
    useCase: 'Homepage bestemmingen grid'
  },
  {
    name: 'travel-enhanced',
    description: 'Travel foto verbetering met AI',
    transformation: 'w_800,h_600,c_fill,g_auto,e_saturation:15,e_auto_contrast,q_auto:good,f_auto',
    useCase: 'Featured travel images'
  },
  {
    name: 'thumbnail',
    description: 'Geoptimaliseerde thumbnails',
    transformation: 'w_150,h_150,c_thumb,g_auto,q_auto:good,f_auto',
    useCase: 'Gallery previews'
  }
];

/**
 * Extraheert Cloudinary public ID uit volledige URL
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  // Matches: https://res.cloudinary.com/df3i1avwb/image/upload/v123456/folder/image.jpg
  const match = cloudinaryUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : null;
}

/**
 * Genereert Cloudinary URL met transformatie
 */
export function generateCloudinaryUrl(
  originalUrl: string, 
  transformation: string = 'w_800,h_600,c_fill,g_auto,q_auto:good,f_auto'
): string {
  const publicId = extractPublicId(originalUrl);
  if (!publicId) return originalUrl;
  
  const cloudName = 'df3i1avwb';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Krijgt transformatie op basis van context
 */
export function getTransformByContext(context: string): string {
  const transform = CLOUDINARY_TRANSFORMS.find(t => 
    t.useCase.toLowerCase().includes(context.toLowerCase())
  );
  
  return transform?.transformation || 'w_800,h_600,c_fill,g_auto,q_auto:good,f_auto';
}

/**
 * Slimme transformatie detector op basis van content type
 */
export function getSmartTransform(filename: string, context: string): string {
  const isArchitecture = filename.toLowerCase().includes('castle') || 
                        filename.toLowerCase().includes('church') || 
                        filename.toLowerCase().includes('building') ||
                        filename.toLowerCase().includes('kasteel');
  
  const isNature = filename.toLowerCase().includes('mountain') || 
                  filename.toLowerCase().includes('forest') || 
                  filename.toLowerCase().includes('lake') ||
                  filename.toLowerCase().includes('tatra') ||
                  filename.toLowerCase().includes('morskie');
  
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

/**
 * Responsive image set generator
 */
export function generateResponsiveSet(originalUrl: string, baseTransform: string): {
  mobile: string;
  tablet: string;
  desktop: string;
} {
  const publicId = extractPublicId(originalUrl);
  if (!publicId) return { mobile: originalUrl, tablet: originalUrl, desktop: originalUrl };
  
  const cloudName = 'df3i1avwb';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return {
    mobile: `${baseUrl}/w_400,${baseTransform}/${publicId}`,
    tablet: `${baseUrl}/w_800,${baseTransform}/${publicId}`,
    desktop: `${baseUrl}/w_1200,${baseTransform}/${publicId}`
  };
}

/**
 * Optimized image component helper
 */
export function getOptimizedImageProps(
  originalUrl: string, 
  context: string = 'default',
  filename: string = ''
): {
  src: string;
  srcSet?: string;
  sizes?: string;
} {
  const transform = getSmartTransform(filename, context);
  const optimizedUrl = generateCloudinaryUrl(originalUrl, transform);
  
  if (context === 'header' || context === 'hero') {
    const responsive = generateResponsiveSet(originalUrl, transform);
    return {
      src: optimizedUrl,
      srcSet: `${responsive.mobile} 400w, ${responsive.tablet} 800w, ${responsive.desktop} 1200w`,
      sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px'
    };
  }
  
  return { src: optimizedUrl };
}