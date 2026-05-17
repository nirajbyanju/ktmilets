import { RiSendPlaneFill } from 'react-icons/ri';
import { contactFaqs } from '@/data/contactFaqs';
import { COMPANY_ADDRESS, COMPANY_EMAIL, COMPANY_PHONE } from '@/helper/seo/site';
import FaqAccordion from '@/components/public/shared/FaqAccordion';

export default function ContactUsContent() {
  return (
    <>
      <section className="py-16 lg:py-24 bg-base-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 left-0 right-0 overflow-hidden lg:h-72 -z-10">
            <div
              aria-hidden="true"
              className="relative h-full w-full bg-cover bg-center"
            >
              <div className="absolute inset-0 bg-opsh-primary" />
            </div>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="h-full pr-6">
              <h1 className="font-brand text-3xl sm:text-4xl text-opsh-text/90 lg:text-5xl font-bold text-base-content mb-2">
                Get in touch with us
              </h1>
              <p className="mb-12 text-opsh-text/85 dark:text-slate-400">
                KTM Test Preparation Centre is here to help with IELTS and PTE online classes,
                mock-test practice, exam booking support, and student onboarding.
              </p>

              <ul className="mb-6 md:mb-0">
                <li className="flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-opsh-primary hover:bg-opsh-primary-hover text-gray-50 cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                      <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 mb-4">
                    <h2 className="text-lg font-medium leading-6 text-gray-900">Our Address</h2>
                    <a
                      href="https://maps.app.goo.gl/Pb8aM8Y8stbB63ed6"
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-600 dark:text-slate-400 hover:text-opsh-secondary"
                    >
                      {COMPANY_ADDRESS}
                    </a>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-opsh-primary hover:bg-opsh-primary-hover text-gray-50 cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                      <path d="M15 7a2 2 0 0 1 2 2" />
                      <path d="M15 3a6 6 0 0 1 6 6" />
                    </svg>
                  </div>
                  <div className="ml-4 mb-4">
                    <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Contact</h2>
                    <p className="text-gray-600 dark:text-slate-400">
                      Mobile:{' '}
                      <a href={`tel:${COMPANY_PHONE}`} className="hover:text-opsh-secondary">
                        {COMPANY_PHONE}
                      </a>
                    </p>
                    <p className="text-gray-600 dark:text-slate-400">
                      Mail:{' '}
                      <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-opsh-secondary">
                        {COMPANY_EMAIL}
                      </a>
                    </p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-opsh-primary hover:bg-opsh-primary-light text-gray-50 cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <div className="ml-4 mb-4">
                    <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Working hours
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400">Sunday - Friday: 08:00 - 17:00</p>
                    <p className="text-gray-600 dark:text-slate-400">Saturday: Closed</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-opsh-primary mb-1">Send us a message</h2>
                <p className="text-base-content/70 text-opsh-secondary">
                  We will get back to you as soon as possible.
                </p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-base-content text-opsh-black">
                      Your Name <span className="text-opsh-danger text-lg">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-base-content">
                      Your Email <span className="text-opsh-danger text-lg">*</span>
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-base-content">
                    Subject <span className="text-opsh-danger text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Enter subject"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-base-content">
                    Message <span className="text-opsh-danger text-lg">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none transition-all"
                    placeholder="Type your message here..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-opsh-primary hover:bg-opsh-primary-light text-opsh-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Send Message
                  <RiSendPlaneFill className="size-5 rotate-[45deg]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="relative overflow-hidden h-96 w-full rounded-lg mb-10">
          <div className="relative min-h-[340px]">
              <iframe
                src="https://www.google.com/maps?q=Putalisadak%20Way%20to%20Dillibazar%20Kathmandu%20Nepal&output=embed"
                width="100%"
                height="100%"
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map to KTM Test Preparation Centre office in Kathmandu, Nepal"
              />
            </div>

        </div>
      </section>

      <FaqAccordion items={contactFaqs} initialVisibleCount={3} />
    </>
  );
}
