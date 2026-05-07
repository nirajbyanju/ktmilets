import type { AccessIdentifier } from '@/types/rbac';

export interface PropertyLikeListFilters {
  search: string;
  is_active: string;
  user_id: string;
  property_id: string;
  limit: string;
}

export interface PropertyLikeListEntry {
  id: AccessIdentifier;
  propertyId: AccessIdentifier | null;
  propertyTitle: string;
  propertySlug: string;
  propertyCode: string;
  propertyPrice: number | null;
  propertyCurrency: string;
  propertyLocation: string;
  propertyLikesCount: number;
  userId: AccessIdentifier | null;
  userName: string;
  userEmail: string;
  isActive: boolean;
  likedAt: string;
  updatedAt: string;
  raw?: unknown;
}
