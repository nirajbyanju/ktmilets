'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaBuilding, FaGlobe, FaClock, FaChevronRight } from 'react-icons/fa';

import { getMockTestPlans } from '@/apis/mock-test-subscription.api';
import useAuthStore from '@/stores/auth/AuthStore';
import LoginModal from '@/components/auth/LoginModal';
import type { MockTestSubscription } from '@/types/mock-test-subscription';

const formatNPR = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return 'Contact for price';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'Contact for price';
  return `NPR ${n.toLocaleString()}`;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MockTestPackageModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const [plans, setPlans] = useState<MockTestSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    setPlans([]);

    getMockTestPlans({ limit: 100 })
      .then((data) => {
        if (!isMounted) return;
        const all = data.data ?? [];
        setPlans(all);
        if (all.length > 0) {
          const firstType = all[0].subscriptions_type;
          setSelectedType(firstType);
          const firstCat = all.find((p) => p.subscriptions_type === firstType)?.subscriptions_category ?? '';
          setSelectedCategory(firstCat);
        }
      })
      .catch(() => { if (isMounted) setPlans([]); })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const types = [...new Set(plans.map((p) => p.subscriptions_type))];
  const categories = [
    ...new Set(
      plans
        .filter((p) => p.subscriptions_type === selectedType)
        .map((p) => p.subscriptions_category),
    ),
  ];
  const filtered = plans.filter(
    (p) => p.subscriptions_type === selectedType && p.subscriptions_category === selectedCategory,
  );

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    const firstCat = plans.find((p) => p.subscriptions_type === type)?.subscriptions_category ?? '';
    setSelectedCategory(firstCat);
  };

  const handleSelect = (plan: MockTestSubscription) => {
    if (plan.price === null || plan.price === undefined) return;
    const path = `/payment?mock_test_id=${plan.id}`;
    if (isAuthenticated && token) {
      onClose();
      router.push(path);
    } else {
      setPendingPlanId(plan.id);
      setLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (pendingPlanId !== null) {
      const id = pendingPlanId;
      setPendingPlanId(null);
      onClose();
      router.push(`/payment?mock_test_id=${id}`);
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
            <h2 className="text-xl font-black">Alfa Mock Test Practice — Choose a Plan</h2>
            <p className="mt-1 text-sm text-white/75">
              Select your exam type, category, and plan. Login to generate an invoice and pay.
            </p>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-opsh-primary border-t-transparent" />
              </div>
            ) : plans.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No mock test plans available right now. Please{' '}
                <a href="/contact" className="text-opsh-primary underline">contact us</a>.
              </p>
            ) : (
              <>
                {/* Type tabs */}
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeClick(type)}
                      className={`rounded-full px-5 py-1.5 text-sm font-black transition ${
                        selectedType === type
                          ? 'bg-opsh-primary text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-opsh-primary'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Category tabs */}
                {categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded px-3 py-1 text-sm font-bold transition ${
                          selectedCategory === cat
                            ? 'bg-opsh-secondary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Plan cards */}
                {filtered.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-slate-500">No plans in this category.</p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {filtered.map((plan) => {
                      const discount =
                        plan.discount !== null &&
                        plan.discount !== undefined &&
                        parseFloat(String(plan.discount)) > 0
                          ? parseFloat(String(plan.discount))
                          : null;
                      const noPrice = plan.price === null || plan.price === undefined;

                      return (
                        <article
                          key={plan.id}
                          className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-opsh-primary/40 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-black leading-tight text-opsh-primary">
                              {plan.subscriptions_name}
                            </h3>
                            <span className="shrink-0 rounded bg-opsh-primary/10 px-2 py-0.5 text-xs font-bold text-opsh-primary">
                              {plan.subscriptions_type}
                            </span>
                          </div>

                          <div className="mt-3 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <FaBuilding className="shrink-0 text-opsh-primary/50" size={11} />
                              <span>{plan.company_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <FaGlobe className="shrink-0 text-opsh-primary/50" size={11} />
                              <span>{plan.country}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <FaClock className="shrink-0 text-opsh-primary/50" size={11} />
                              <span>{plan.duration} {plan.duration_type}</span>
                            </div>
                          </div>

                          <div className="mt-3 border-t border-slate-100 pt-3">
                            <p className="text-lg font-black text-opsh-primary">
                              {formatNPR(plan.price)}
                            </p>
                            {discount !== null && (
                              <p className="mt-0.5 text-xs font-bold text-green-600">
                                Save NPR {discount.toLocaleString()}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelect(plan)}
                            disabled={noPrice}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2 text-sm font-black text-white transition hover:bg-opsh-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {noPrice ? 'Contact for price' : (
                              <>Buy This Plan <FaChevronRight className="text-xs" /></>
                            )}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => { setLoginOpen(false); setPendingPlanId(null); }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
