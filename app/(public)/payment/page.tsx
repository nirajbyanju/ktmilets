import type { Metadata } from "next";
import { Suspense } from "react";
import QRBank from "@/public/QRBank.jpeg";
import Image from 'next/image';

import InvoiceCheckout from "@/components/public/ktm/InvoiceCheckout";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment and Enrollment",
  description:
    "Manual Siddhartha Bank QR and bank-transfer payment verification page for KTM Test Preparation Centre classes and mock-test packages.",
  path: "/payment",
  keywords: ["KTM Test Prep payment", "IELTS class payment Nepal", "PTE class payment Nepal"],
});

export default function PaymentPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Payment", path: "/payment" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "Payment and Checkout",
            description: "Manual QR and bank-transfer payment verification workflow.",
            path: "/payment",
          }),
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr,0.35fr] lg:px-8">
          <div>
            <Suspense fallback={null}>
              <InvoiceCheckout />
            </Suspense>
            </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Payment Instructions</h2>
            <p className="mt-4 text-gray-600">
              Please make your payment using the following details and then fill out the form to verify your payment.
            </p>
            <Image src={QRBank} alt="Siddhartha Bank QR Code" className="mt-6 w-full rounded-lg object-cover  shadow-sm" />
            <p className="mt-4 text-gray-600">
              Please make your payment using the above QR code and then fill out the form to verify your payment.
            </p>
            <p className="mt-4 text-gray-600">
              For bank transfers, please use the following details:
              <br />
              <strong>Bank Name:</strong> Siddhartha Bank
              <br />
              <strong>Account Name:</strong> KTM Test Preparation Centre
              <br />
              <strong>Account Number:</strong> 1234567890
              <br />
              <strong>Branch:</strong> Kathmandu Main Branch
            </p>
            </div>
            <div className="mt-6">
          </div>
        </div>
      </section>
    </>
  );
}
