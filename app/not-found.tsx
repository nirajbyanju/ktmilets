import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsAppButton from "@/components/public/FloatingWhatsAppButton";
import PublicAuthBootstrap from "@/components/auth/PublicAuthBootstrap";
import NotFoundContent from "@/components/public/NotFoundContent";

export default function NotFound() {
  return (
    <>
      <PublicAuthBootstrap />
      <Navbar />
      <NotFoundContent />
      <FloatingWhatsAppButton />
      <Footer />
    </>
  );
}
