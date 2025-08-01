import { useQuery } from "@tanstack/react-query";

export function useSiteSettings() {
  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ['/api/site-settings'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    siteSettings: siteSettings || {
      siteName: 'Ontdek Polen',
      siteDescription: 'Mooie plekken in Polen ontdekken',
      metaKeywords: 'Polen, reizen, vakantie, bestemmingen',
      favicon: '/favicon.ico',
      backgroundImage: '',
      backgroundImageAlt: '',
      logoImage: '',
      logoImageAlt: '',
      socialMediaImage: '',
      customCSS: '',
      customJS: '',
      googleAnalyticsId: '',
    },
    isLoading,
  };
}