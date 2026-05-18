import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import FloatingWhatsAppButton from "@/components/public/FloatingWhatsAppButton";
import PublicAuthBootstrap from "@/components/auth/PublicAuthBootstrap";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicAuthBootstrap />
      <Navbar />
      <div className="xl:pb-0">{children}</div>
      <FloatingWhatsAppButton />
      <Footer />
      <MobileBottomNav />
    </>
  );
}
