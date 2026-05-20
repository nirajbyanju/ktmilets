'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBuilding, FaGlobe, FaClock, FaChevronRight } from 'react-icons/fa';
import { getMockTestPlans } from '@/apis/mock-test-subscription.api';
import type { MockTestSubscription } from '@/types/mock-test-subscription';
import useAuthStore from '@/stores/auth/AuthStore';
import LoginModal from '@/components/auth/LoginModal';
import { mockStatuses } from '@/data/ktm';

function formatNPR(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return 'Contact for price';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'Contact for price';
  return `NPR ${n.toLocaleString()}`;
}

// ── Main page component ──────────────────────────────────────────────────────

export default function MockTestsClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const [plans, setPlans] = useState<MockTestSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);

  useEffect(() => {
    getMockTestPlans({ limit: 100 })
      .then((data) => {
        const all = data.data ?? [];
        setPlans(all);
        if (all.length > 0) {
          const firstType = all[0].subscriptions_type;
          setSelectedType(firstType);
          const firstCat =
            all.find((p) => p.subscriptions_type === firstType)?.subscriptions_category ?? '';
          setSelectedCategory(firstCat);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const types = [...new Set(plans.map((p) => p.subscriptions_type))];
  const categories = [
    ...new Set(
      plans
        .filter((p) => p.subscriptions_type === selectedType)
        .map((p) => p.subscriptions_category),
    ),
  ];
  const filtered = plans.filter(
    (p) =>
      p.subscriptions_type === selectedType &&
      p.subscriptions_category === selectedCategory,
  );

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    const firstCat =
      plans.find((p) => p.subscriptions_type === type)?.subscriptions_category ?? '';
    setSelectedCategory(firstCat);
  };

  const handleBuy = (plan: MockTestSubscription) => {
    if (isAuthenticated && token) {
      router.push(`/payment?mock_test_id=${plan.id}`);
    } else {
      setPendingPlanId(plan.id);
      setLoginOpen(true);
    }
  };

  // After login, redirect to payment page for the pending plan
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (pendingPlanId !== null) {
      const id = pendingPlanId;
      setPendingPlanId(null);
      router.push(`/payment?mock_test_id=${id}`);
    }
  };

  return (
    <>
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Page header */}
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Mock test practice
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              Alfa IELTS and Alfa PTE Mock-Test Practice
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Select your exam type and category to see available plans. Buy mock-test practice
              only, or add it to IELTS and PTE class preparation.
            </p>
          </div>

          {/* Plans section */}
          <div className="mt-10">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-opsh-primary border-t-transparent" />
              </div>
            ) : plans.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-slate-500">
                  No mock test plans available at this time. Please{' '}
                  <Link href="/contact" className="text-opsh-primary underline">
                    contact us
                  </Link>{' '}
                  directly.
                </p>
              </div>
            ) : (
              <>
                {/* Type selector */}
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeClick(type)}
                      className={`rounded-full px-6 py-2 text-sm font-black transition ${
                        selectedType === type
                          ? 'bg-opsh-primary text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-opsh-primary'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Category selector */}
                {categories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded px-4 py-1.5 text-sm font-bold transition ${
                          selectedCategory === cat
                            ? 'bg-opsh-secondary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Plan cards */}
                {filtered.length === 0 ? (
                  <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 py-10 text-center">
                    <p className="text-slate-500">No plans in this category.</p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((plan) => {
                      const discount =
                        plan.discount !== null &&
                        plan.discount !== undefined &&
                        parseFloat(String(plan.discount)) > 0
                          ? parseFloat(String(plan.discount))
                          : null;

                      return (
                        <article
                          key={plan.id}
                          className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-base font-black leading-tight text-opsh-primary">
                              {plan.subscriptions_name}
                            </h2>
                            <span className="shrink-0 rounded bg-opsh-primary/10 px-2 py-0.5 text-xs font-bold text-opsh-primary">
                              {plan.subscriptions_type}
                            </span>
                          </div>

                          <div className="mt-4 flex-1 space-y-2.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaBuilding className="shrink-0 text-opsh-primary/50" />
                              <span>{plan.company_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaGlobe className="shrink-0 text-opsh-primary/50" />
                              <span>{plan.country}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaClock className="shrink-0 text-opsh-primary/50" />
                              <span>{plan.duration} {plan.duration_type}</span>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="text-xl font-black text-opsh-primary">
                              {formatNPR(plan.price)}
                            </p>
                            {discount !== null && (
                              <p className="mt-0.5 text-sm font-bold text-green-600">
                                Save NPR {discount.toLocaleString()}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleBuy(plan)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
                          >
                            Buy Mock Test Practice
                            <FaChevronRight className="text-xs" />
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom info row */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-black text-opsh-primary">Mock status workflow</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {mockStatuses.map((status, i) => (
                  <div key={status} className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-opsh-primary/10 text-xs font-black text-opsh-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-700">{status}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-black text-opsh-primary">Need classes too?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                IELTS and PTE class registration can include mock-test support and exam booking
                guidance.
              </p>
              <Link
                href="/registration"
                className="mt-4 inline-flex rounded bg-opsh-primary px-5 py-3 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
              >
                Register for Class
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => { setLoginOpen(false); setPendingPlanId(null); }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
