export type FooterMobileMenuItem = {
  id: "home" | "ielts" | "register" | "about" | "profile";
  label: "Home" | "IELTS" | "Register" | "About" | "Profile";
};

export const footerMobileMenuItems: FooterMobileMenuItem[] = [
  {
    id: "home",
    label: "Home",
  },
  {
    id: "ielts",
    label: "IELTS",
  },
  {
    id: "register",
    label: "Register",
  },
  {
    id: "about",
    label: "About",
  },
  {
    id: "profile",
    label: "Profile",
  },
];

export const footerCompanyLinks = [
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Blog", path: "/blog" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms and Conditions", path: "/terms-and-conditions" },
];

export const footerBrowseLinks = [
  { label: "IELTS Online Class", path: "/ielts" },
  { label: "PTE Online Class", path: "/pte" },
  { label: "Demo Class", path: "/demo" },
  { label: "Exam Booking", path: "/exam-booking" },
  { label: "Mock Test Practice", path: "/mock-tests" },
  { label: "Registration", path: "/registration" },
];

export const footerContactItems = [
  {
    type: "address" as const,
    label: "Putalisadak (Way to Dillibazar), Kathmandu, Nepal",
    href: "",
  },
  {
    type: "phone" as const,
    label: "+977 14526263",
    href: "tel:+97714526263",
  },
  {
    type: "email" as const,
    label: "ktmtestprep@ktmeducational.edu.np",
    href: "mailto:ktmtestprep@ktmeducational.edu.np",
  },
];
