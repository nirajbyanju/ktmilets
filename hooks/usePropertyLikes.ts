import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/stores/auth/AuthStore';
import {
  PropertyLikeId,
  getLikedPropertyIds,
  likeProperty,
  unlikeProperty,
} from '@/apis/property/propertyLike.api';

const PROPERTY_LIKED_IDS_QUERY_KEY = 'property-liked-ids';
const PROPERTY_CACHE_KEYS = new Set(['properties', 'propertiesList', 'mobileProperties', 'property']);

type PropertyLikeContext = {
  previousLikedIds: PropertyLikeId[];
  wasLiked: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizePropertyId = (value: PropertyLikeId) => String(value);

const getNumericLikeCount = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const isPropertyRecord = (value: unknown): value is Record<string, unknown> => {
  if (!isRecord(value)) {
    return false;
  }

  return 'id' in value && (
    'likes_count' in value ||
    'property_code' in value ||
    'listing_type_id' in value ||
    'advertise_price' in value ||
    'slug' in value
  );
};

const patchPropertyLikeState = (
  payload: unknown,
  propertyId: PropertyLikeId,
  nextLiked: boolean
): unknown => {
  if (Array.isArray(payload)) {
    let changed = false;
    const nextItems = payload.map((entry) => {
      const nextEntry = patchPropertyLikeState(entry, propertyId, nextLiked);
      if (nextEntry !== entry) {
        changed = true;
      }
      return nextEntry;
    });

    return changed ? nextItems : payload;
  }

  if (!isRecord(payload)) {
    return payload;
  }

  let changed = false;
  let nextPayload: Record<string, unknown> = payload;

  if (isPropertyRecord(payload) && normalizePropertyId(payload.id as PropertyLikeId) === normalizePropertyId(propertyId)) {
    const currentLikeCount = getNumericLikeCount(payload.likes_count);
    const nextLikeCount = nextLiked
      ? currentLikeCount + 1
      : Math.max(0, currentLikeCount - 1);

    nextPayload = {
      ...payload,
      likes_count: nextLikeCount,
      likesCount: nextLikeCount,
      is_liked: nextLiked,
      isLiked: nextLiked,
    };
    changed = true;
  }

  const nestedKeys = ['data', 'items', 'result'];

  for (const key of nestedKeys) {
    if (!(key in nextPayload)) {
      continue;
    }

    const nextValue = patchPropertyLikeState(nextPayload[key], propertyId, nextLiked);
    if (nextValue !== nextPayload[key]) {
      if (!changed) {
        nextPayload = { ...nextPayload };
        changed = true;
      }
      nextPayload[key] = nextValue;
    }
  }

  return changed ? nextPayload : payload;
};

const syncLikedIds = (
  currentIds: PropertyLikeId[] | undefined,
  propertyId: PropertyLikeId,
  nextLiked: boolean
) => {
  const normalizedTargetId = normalizePropertyId(propertyId);
  const current = currentIds ?? [];
  const filteredIds = current.filter((entry) => normalizePropertyId(entry) !== normalizedTargetId);

  return nextLiked ? [...filteredIds, propertyId] : filteredIds;
};

export const useLikedPropertyIds = () => {
  const isAuthenticated = useAuthStore((state) => Boolean(state.isAuthenticated && state.token));
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const queryKey = [PROPERTY_LIKED_IDS_QUERY_KEY, userId ?? 'guest'];

  return useQuery({
    queryKey,
    queryFn: getLikedPropertyIds,
    enabled: isAuthenticated && userId !== null,
    initialData: [] as PropertyLikeId[],
    staleTime: 1000 * 60,
  });
};

export const usePropertyLikeToggle = (propertyId: PropertyLikeId) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => Boolean(state.isAuthenticated && state.token));
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const likedIdsQueryKey = [PROPERTY_LIKED_IDS_QUERY_KEY, userId ?? 'guest'];
  const likedIdsQuery = useLikedPropertyIds();
  const effectiveLikedIds = useMemo(
    () => (isAuthenticated ? (likedIdsQuery.data ?? []) : []),
    [isAuthenticated, likedIdsQuery.data]
  );

  const likedIdSet = useMemo(
    () => new Set(effectiveLikedIds.map((entry) => normalizePropertyId(entry))),
    [effectiveLikedIds]
  );

  const isLiked = likedIdSet.has(normalizePropertyId(propertyId));

  const mutation = useMutation<PropertyLikeId, unknown, boolean, PropertyLikeContext>({
    mutationFn: async (currentlyLiked) => {
      if (currentlyLiked) {
        await unlikeProperty(propertyId);
        return propertyId;
      }

      await likeProperty(propertyId);
      return propertyId;
    },
    onMutate: async (currentlyLiked) => {
      const nextLiked = !currentlyLiked;

      await queryClient.cancelQueries({ queryKey: likedIdsQueryKey });

      const previousLikedIds =
        queryClient.getQueryData<PropertyLikeId[]>(likedIdsQueryKey) ?? [];

      queryClient.setQueryData<PropertyLikeId[]>(
        likedIdsQueryKey,
        syncLikedIds(previousLikedIds, propertyId, nextLiked)
      );

      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return typeof queryKey === 'string' && PROPERTY_CACHE_KEYS.has(queryKey);
          },
        },
        (existingData) => patchPropertyLikeState(existingData, propertyId, nextLiked)
      );

      return {
        previousLikedIds,
        wasLiked: currentlyLiked,
      };
    },
    onError: (_error, _currentlyLiked, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(likedIdsQueryKey, context.previousLikedIds);
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return typeof queryKey === 'string' && PROPERTY_CACHE_KEYS.has(queryKey);
          },
        },
        (existingData) => patchPropertyLikeState(existingData, propertyId, context.wasLiked)
      );
    },
    onSettled: () => {
      if (isAuthenticated) {
        void queryClient.invalidateQueries({ queryKey: likedIdsQueryKey });
      }
    },
  });

  const toggleLike = useCallback(async () => mutation.mutateAsync(isLiked), [isLiked, mutation]);

  return {
    isAuthenticated,
    isLiked,
    isPending: mutation.isPending,
    toggleLike,
    likedIds: effectiveLikedIds,
    isLoadingLikedIds: likedIdsQuery.isLoading,
  };
};
