import { MetadataRoute } from 'next';
import { siteMetadata } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteMetadata.siteUrl;

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];
}
