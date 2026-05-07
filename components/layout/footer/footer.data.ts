export type FooterMobileMenuItem = {
  id: "home" | "sell-property" | "search" | "about-us" | "profile";
  label: "Home" | "Sell" | "Search" | "About" | "Profile";
};

export const footerMobileMenuItems: FooterMobileMenuItem[] = [
  {
    id: "home",
    label: "Home",
  },
  {
    id: "sell-property",
    label: "Sell",
  },
  {
    id: "search",
    label: "Search",
  },
  {
    id: "about-us",
    label: "About",
  },
  {
    id: "profile",
    label: "Profile",
  },
];

export const footerCompanyLinks = [
  { label: "About Us", path: "/about-us" },
  { label: "Services", path: "/services" },
  { label: "Contact Us", path: "/contact-us" },
  { label: "Blog", path: "/blog" },
  { label: "FAQs", path: "/faqs" },
];

export const footerBrowseLinks = [
  { label: "House", path: "/properties-list?listing_type_slug=sale&property_type_slug=house" },
  { label: "Land", path: "/properties-list?listing_type_slug=sale&property_type_slug=land" },
  { label: "Apartment", path: "/properties-list?listing_type_slug=sale&property_type_slug=apartment" },
  { label: "Rentals", path: "/properties-list?listing_type_slug=rent" },
];

export const footerContactItems = [
  {
    type: "address" as const,
    label: "Bhaktapur, Nepal",
    href: "",
  },
  {
    type: "phone" as const,
    label: "+977-9841923202",
    href: "tel:+977-9841923202",
  },
  {
    type: "email" as const,
    label: "info@samriddhirealestate.com",
    href: "mailto:info@samriddhirealestate.com",
  },
];
