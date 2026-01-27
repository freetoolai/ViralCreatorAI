// --- Platform & Socials ---
export type PlatformName = 'YouTube' | 'Instagram' | 'TikTok' | 'Twitter' | 'Twitch' | 'Other';
export type Tier = 'Nano' | 'Micro' | 'Mid-Tier' | 'Macro' | 'Mega';

export interface SocialProfile {
  platform: PlatformName;
  handle: string;
  link: string;
  followers: number;
  avgViews?: number;
  engagementRate?: number;
  deliverableType?: string; // e.g. "Reel", "Integration"
  price?: number;
}

// --- Influencer ---
export interface Influencer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
  primaryNiche: string;
  secondaryNiches: string[];
  tier: Tier;
  internalNotes?: string;
  platforms: SocialProfile[];
}

// --- Team & Users ---
export type Role = 'Admin' | 'Campaign Manager' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

// --- Client ---
export interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  accessCode: string;
}

// --- Campaigns ---
export type CampaignStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Active' | 'Completed';
export type InfluencerApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CampaignInfluencerRef {
  influencerId: string;
  status: InfluencerApprovalStatus;
  proposedBudget: number;
  deliverables: string; // Brief description
  rejectionReason?: string;
  updatedAt?: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  title: string;
  status: CampaignStatus;
  totalBudget: number;
  platformFocus: PlatformName[];
  requiredNiches: string[];
  influencers: CampaignInfluencerRef[];
  createdAt: string;
}
