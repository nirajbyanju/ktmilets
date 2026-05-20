'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaUsers, FaTag, FaChevronRight } from 'react-icons/fa';

import { getPublicCourseCatalog } from '@/helper/public/courseCatalog';
import useAuthStore from '@/stores/auth/AuthStore';
import LoginModal from '@/components/auth/LoginModal';
import type { Batch } from '@/types/courseCatalog';

const formatPrice = (batch: Batch): string => {
  if (batch.is_price_variable || batch.price_npr === null || batch.price_npr === undefined) {
    return 'Contact for price';
  }
  return `NPR ${Number(batch.price_npr).toLocaleString('en-NP')}`;
};

const formatBatchSize = (batch: Batch): string => {
  if (batch.min_size && batch.max_size) {
    return batch.min_size === batch.max_size
      ? `${batch.min_size} students`
      : `${batch.min_size}–${batch.max_size} students`;
  }
  return 'Variable';
};

const getDiscountedPrice = (batch: Batch): number | null => {
  if (batch.is_price_variable || !batch.offer_label || !batch.discount_type || !batch.discount_value) return null;
  const price = Number(batch.price_npr ?? 0);
  const disc = Number(batch.discount_value);
  if (price <= 0 || disc <= 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (batch.offer_starts_at && batch.offer_starts_at > today) return null;
  if (batch.offer_ends_at && batch.offer_ends_at < today) return null;
  const discAmt = batch.discount_type === 'percent'
    ? Math.min(price, (price * Math.min(disc, 100)) / 100)
    : Math.min(price, disc);
  return Math.max(0, price - discAmt);
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  courseSlug: string;
  courseTitle: string;
};

export default function CoursePackageModal({ isOpen, onClose, courseSlug, courseTitle }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingBatchId, setPendingBatchId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !courseSlug) return;
    let isMounted = true;
    setLoading(true);
    setBatches([]);

    getPublicCourseCatalog(courseSlug)
      .then((catalog) => {
        if (isMounted) setBatches(catalog?.batches ?? []);
      })
      .catch(() => { if (isMounted) setBatches([]); })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [isOpen, courseSlug]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSelect = (batch: Batch) => {
    if (batch.is_price_variable) return;
    const path = `/payment?batch_id=${batch.id}`;
    if (isAuthenticated && token) {
      onClose();
      router.push(path);
    } else {
      setPendingBatchId(batch.id);
      setLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (pendingBatchId !== null) {
      const id = pendingBatchId;
      setPendingBatchId(null);
      onClose();
      router.push(`/payment?batch_id=${id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-white shadow transition hover:bg-slate-700"
            aria-label="Close"
          >
            <FaTimes size={13} />
          </button>

          {/* Header */}
          <div className="rounded-t-2xl bg-opsh-primary px-6 py-5 text-white">
            <h2 className="text-xl font-black">{courseTitle} — Choose a Plan</h2>
            <p className="mt-1 text-sm text-white/75">
              Select a batch, generate an invoice, then pay via bank QR or transfer.
            </p>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-opsh-primary border-t-transparent" />
              </div>
            ) : batches.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No plans available right now. Please{' '}
                <a href="/contact" className="text-opsh-primary underline">contact us</a>.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {batches.map((batch) => {
                  const discounted = getDiscountedPrice(batch);
                  const isVariable = batch.is_price_variable || batch.price_npr === null;

                  return (
                    <article
                      key={batch.id}
                      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-opsh-primary/40 hover:shadow-md"
                    >
                      <h3 className="text-base font-black text-opsh-primary">{batch.batch_type}</h3>

                      <div className="mt-3 flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FaUsers className="shrink-0 text-opsh-primary/50" size={12} />
                          <span>Batch size: {formatBatchSize(batch)}</span>
                        </div>
                        {batch.schedule_notes && (
                          <p className="text-xs leading-5 text-slate-500">{batch.schedule_notes}</p>
                        )}
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        {discounted !== null ? (
                          <>
                            <p className="text-xl font-black text-opsh-primary">
                              NPR {discounted.toLocaleString('en-NP')}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(batch)}
                              </span>
                              {batch.offer_label && (
                                <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
                                  <FaTag size={9} />
                                  {batch.offer_label}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-xl font-black text-opsh-primary">{formatPrice(batch)}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelect(batch)}
                        disabled={isVariable}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-opsh-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isVariable ? 'Contact for price' : (
                          <>Select Plan <FaChevronRight className="text-xs" /></>
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => { setLoginOpen(false); setPendingBatchId(null); }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
