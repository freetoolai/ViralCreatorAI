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
  // CRM Enhancements
  typicalPayout?: number;
  typicalCharge?: number;
  mediaKitUrl?: string;
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

export type InfluencerApprovalStatus =
  | 'Shortlisted'
  | 'Client Review'
  | 'Approved'
  | 'Rejected'
  | 'Contract Sent'
  | 'Contract Signed'
  | 'Product Sent'
  | 'Product Received'
  | 'Draft Under Review'
  | 'Live'
  | 'Paid';

export interface CampaignInfluencerRef {
  influencerId: string;
  status: InfluencerApprovalStatus;
  // Financials
  influencerFee: number; // What we pay them
  clientFee: number;     // What we charge the client
  // Tracking
  deliverables: string;  // e.g. "1x IG Reel"
  productAccess: boolean;
  draftLink?: string;
  plannedDate?: string;
  postLink?: string;
  rejectionReason?: string;
  updatedAt?: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  title: string;
  status: CampaignStatus;
  totalBudget: number; // Campaign-wide cap or target
  platformFocus: PlatformName[];
  requiredNiches: string[];
  influencers: CampaignInfluencerRef[];
  createdAt: string;
  description?: string;
}

// --- Groups for Client Sharing ---
export interface CampaignGroup {
  id: string;
  title: string;
  description?: string;
  campaignIds: string[];
  clientId: string; // The client this group is shared with
  createdAt: string;
}
