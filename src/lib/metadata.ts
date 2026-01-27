import type { Metadata } from 'next';

export const siteMetadata = {
    title: 'ViralCreatorAI - AI-Powered Influencer Management Platform',
    description: 'Manage influencer campaigns with AI precision. Find creators, automate approvals, and track ROI in one intelligent platform.',
    keywords: 'influencer marketing, creator management, campaign tracking, AI influencer tool, viral marketing, creator partnerships',
    author: 'ViralCreatorAI',
    siteUrl: 'https://viralcreatorai.com',
    ogImage: '/og-image.png',
};

export const defaultMetadata: Metadata = {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
        default: siteMetadata.title,
        template: '%s | ViralCreatorAI',
    },
    description: siteMetadata.description,
    keywords: siteMetadata.keywords,
    authors: [{ name: siteMetadata.author }],
    creator: siteMetadata.author,
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteMetadata.siteUrl,
        title: siteMetadata.title,
        description: siteMetadata.description,
        siteName: 'ViralCreatorAI',
        images: [
            {
                url: siteMetadata.ogImage,
                width: 1200,
                height: 630,
                alt: 'ViralCreatorAI - AI-Powered Influencer Management',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteMetadata.title,
        description: siteMetadata.description,
        images: [siteMetadata.ogImage],
        creator: '@viralcreatorai',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};
