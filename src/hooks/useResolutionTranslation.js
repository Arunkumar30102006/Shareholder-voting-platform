import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
export function useResolutionTranslation(resolutionId, originalTitle, originalDescription) {
    const { i18n } = useTranslation();
    const targetLanguage = i18n.language;
    const { data, isLoading, error } = useQuery({
        queryKey: ['resolutionTranslation', resolutionId, targetLanguage],
        queryFn: async () => {
            // If language is English, return original
            if (targetLanguage === 'en') {
                return {
                    translatedTitle: originalTitle,
                    translatedDescription: originalDescription,
                };
            }
            console.log(`Requesting translation for ${resolutionId} to ${targetLanguage}`);
            const { data, error } = await supabase.functions.invoke('translate-text', {
                body: {
                    text: JSON.stringify({ title: originalTitle, description: originalDescription }),
                    targetLanguage,
                    resolutionId
                }
            });
            if (error) {
                console.error("Translation Edge Function Error:", error);
                throw error;
            }
            return {
                translatedTitle: data.translatedTitle || originalTitle,
                translatedDescription: data.translatedDescription || originalDescription
            };
        },
        // Only re-fetch if language or ID changes
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
        enabled: !!resolutionId, // Only run if we have an ID
    });
    return {
        title: data?.translatedTitle || originalTitle,
        description: data?.translatedDescription || originalDescription,
        isTranslating: isLoading && targetLanguage !== 'en',
        error
    };
}
