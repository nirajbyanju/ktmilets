"use client";

import { ChangeEvent, FormEvent, useId, useState } from "react";
import { FiPhone } from "react-icons/fi";
import { CreateInquiry } from "@/apis/home/home.api";
import { COMPANY_PHONE } from "@/helper/seo/site";
import { toast } from "react-toastify";

type ContactEnquiryProps = {
  property_id: number;
  property_type_id: number;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export default function ContactEnquiry({
  property_id,
  property_type_id,
}: ContactEnquiryProps) {
  const nameId = useId();
  const phoneId = useId();
  const messageId = useId();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("from", "enquery");
      payload.append("property_id", property_id.toString());
      payload.append("inquiry_type_id", "1");
      payload.append("property_type_id", property_type_id.toString());
      payload.append("name", formData.name);
      payload.append("phone", formData.phone);
      payload.append("email", formData.email);
      payload.append("message", formData.message);

      await CreateInquiry(payload);

      toast.success("Viewing request sent successfully.");

      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="rounded-2xl border border-opsh-grey bg-white p-5 shadow-opsh-lg md:sticky md:top-32 md:p-8">
      <div>
        <h3 className="font-brand text-xl text-opsh-primary">
          Interested in this property?
        </h3>
        <p className="mt-4 text-sm leading-7 text-opsh-darkgrey">
          Schedule a viewing with our advisory team. We will accompany you and provide a full briefing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 md:mt-8">
        <div>
          <label
            htmlFor={nameId}
            className="block text-[13px] font-semibold uppercase text-opsh-muted"
          >
            Full Name
          </label>
          <input
            type="text"
            id={nameId}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full rounded-lg border border-opsh-grey bg-opsh-background-muted/50 px-4 py-3 text-sm text-opsh-black outline-none transition-colors placeholder:text-opsh-muted focus:border-opsh-secondary"
            required
          />
        </div>

        <div>
          <label
            htmlFor={phoneId}
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-opsh-muted"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id={phoneId}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+977 9841923202"
            className="w-full rounded-lg border border-opsh-grey bg-opsh-background-muted/50 px-4 py-3 text-sm text-opsh-black outline-none transition-colors placeholder:text-opsh-muted focus:border-opsh-secondary"
            required
          />
        </div>

        <div>
          <label
            htmlFor={messageId}
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-opsh-muted"
          >
            Message
          </label>
          <textarea
            id={messageId}
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="I would like to view this property..."
            className="h-24 w-full resize-none rounded-lg border border-opsh-grey bg-opsh-background-muted/50 px-4 py-3 text-sm text-opsh-black outline-none transition-colors placeholder:text-opsh-muted focus:border-opsh-secondary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded bg-opsh-primary px-4 py-3 text-sm font-semibold text-opsh-text transition-colors hover:bg-opsh-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending Request..." : "Request Viewing"}
        </button>
      </form>

      <div className="mt-8 border-t border-opsh-grey pt-8">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-opsh-background text-opsh-secondary">
            <FiPhone className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-opsh-muted">Call us directly</div>
            <a
              href={`tel:${COMPANY_PHONE.replace(/\s+/g, "")}`}
              className="text-sm font-medium text-opsh-black transition-colors hover:text-opsh-secondary"
            >
              {COMPANY_PHONE}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
