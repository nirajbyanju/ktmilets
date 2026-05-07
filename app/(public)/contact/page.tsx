import type { Metadata } from "next";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

import StudentWorkflowForm from "@/components/public/ktm/StudentWorkflowForm";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { ktmBrand, ktmContact, ktmSocials } from "@/data/ktm";
import {
  buildContactPageSchema,
  buildPageMetadata,
  buildWebPageSchema,
} from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Contact KTM Test Preparation Centre by phone, WhatsApp, email, map, or social media.",
  path: "/contact",
  keywords: ["KTM Test Prep contact", "IELTS PTE Kathmandu", "KTM Educational contact"],
});

const socialIcons = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  YouTube: FaYoutube,
};

export default function ContactPage() {
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
    "Hello KTM Test Prep, I would like to know more about IELTS/PTE online classes."
  )}`;

  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
        schemas={[
          buildContactPageSchema(
            "Contact KTM Test Preparation Centre by phone, WhatsApp, email, office address, map, or social media."
          ),
          buildWebPageSchema({
            title: "Contact Us",
            description: "Contact form, map, WhatsApp, phone, email, and social links.",
            path: "/contact",
          }),
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr,1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
              Contact us
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-opsh-primary sm:text-5xl">
              Contact {ktmBrand.officialName}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Reach the team for IELTS classes, PTE classes, demo access, payment help,
              exam booking support, or Alfa mock-test practice.
            </p>

            <div className="mt-7 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <a href={`tel:${ktmContact.phone}`} className="flex gap-3 text-sm font-bold text-slate-700 hover:text-opsh-secondary">
                <FaPhoneAlt className="mt-1 text-opsh-primary" aria-hidden="true" />
                <span>{ktmContact.phone}</span>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex gap-3 text-sm font-bold text-slate-700 hover:text-opsh-secondary">
                <FaWhatsapp className="mt-1 text-emerald-600" aria-hidden="true" />
                <span>{ktmContact.whatsapp}</span>
              </a>
              <a href={`mailto:${ktmContact.email}`} className="flex gap-3 text-sm font-bold text-slate-700 hover:text-opsh-secondary">
                <FaEnvelope className="mt-1 text-opsh-primary" aria-hidden="true" />
                <span>{ktmContact.email}</span>
              </a>
              <a href={ktmContact.mapUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 text-sm font-bold text-slate-700 hover:text-opsh-secondary">
                <FaMapMarkerAlt className="mt-1 text-opsh-primary" aria-hidden="true" />
                <span>{ktmContact.address}</span>
              </a>
              <p className="text-sm font-bold text-slate-700">{ktmContact.hours}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {ktmSocials.map((social) => {
                const Icon = socialIcons[social.label as keyof typeof socialIcons];

                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-black text-opsh-primary transition hover:border-opsh-primary"
                  >
                    {Icon ? <Icon aria-hidden="true" /> : null}
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>

          <StudentWorkflowForm kind="contact" submitLabel="Send Message" />
        </div>
      </section>

      <section className="bg-slate-50 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-opsh-sm">
            <iframe
              src={ktmContact.mapEmbedUrl}
              width="100%"
              height="420"
              className="block w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map to KTM Test Preparation Centre office in Putalisadak, Kathmandu"
            />
          </div>
        </div>
      </section>
    </>
  );
}
