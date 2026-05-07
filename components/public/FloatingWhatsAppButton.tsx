import Image from 'next/image';
import { ktmBrand, ktmContact } from '@/data/ktm';

const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
  'Hello KTM Test Prep, I would like to know more about IELTS/PTE online classes.'
)}`;

export default function FloatingWhatsAppButton() {
  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-40 sm:bottom-6 sm:right-6 hidden md:block">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label={`Chat with ${ktmBrand.shortName} on WhatsApp`}
        className="pointer-events-auto group flex items-center gap-3 rounded-full border border-white/70 bg-white/95 px-1 py-1  transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,94,84,0.32)]"
      >
        <span className="relative flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 blur-md transition-opacity duration-300 group-hover:opacity-50" />
          <Image
            src="/icon/whatsapp.f83afcf.webp"
            alt="WhatsApp"
            width={50}
            height={50}
            className="relative object-contain"
            priority={false}
          />
        </span>
      </a>
    </div>
  );
}
