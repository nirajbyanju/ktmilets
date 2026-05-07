export const ktmBrand = {
  officialName: "KTM Test Preparation Centre",
  shortName: "KTM Test Prep",
  tagline: "IELTS, PTE & English Test Preparation",
  motherCompany: "KTM Educational Consultancy Pvt. Ltd.",
  motherCompanyWebsite: "https://www.ktmeducational.edu.np",
  fiveYearGoal: "18,500 students through phased scaling and system-driven operations",
};

export const ktmContact = {
  phone: "+977 14526263",
  whatsapp: "+977 9747469800",
  whatsappDigits: "9779747469800",
  email: "ktmtestprep@ktmeducational.edu.np",
  address: "Putalisadak (Way to Dillibazar), Kathmandu, Nepal",
  mapUrl: "https://maps.app.goo.gl/Pb8aM8Y8stbB63ed6",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Putalisadak%20Way%20to%20Dillibazar%20Kathmandu%20Nepal&output=embed",
  hours: "8:00 AM to 5:00 PM (Sunday-Friday)",
};

export const ktmSocials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/KTMIMMIGRATION",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ktmeducational/",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@ktm.test.prep?_r=1&_t=ZS-95wtMYSXlaf",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ktmeducationalconsultancy",
  },
];

export const publicNavItems = [
  { label: "Home", href: "/" },
  { label: "IELTS", href: "/ielts" },
  { label: "PTE", href: "/pte" },
  { label: "Demo Class", href: "/demo" },
  { label: "Exam Booking", href: "/exam-booking" },
  { label: "Mock Tests", href: "/mock-tests" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const pricingPlans = [
  {
    name: "Elite Private",
    size: "1:1",
    price: "NPR 30,000",
    note: "Special class time may be arranged",
    featured: false,
  },
  {
    name: "Premium Focus",
    size: "5-11",
    price: "NPR 5,999",
    note: "Higher interaction group",
    featured: false,
  },
  {
    name: "Smart Batch",
    size: "12-20",
    price: "NPR 2,999",
    note: "Main online batch model",
    featured: true,
  },
  {
    name: "Value Batch",
    size: "21-30",
    price: "NPR 2,199",
    note: "Volume model with controlled quality messaging",
    featured: false,
  },
  {
    name: "Weekend Batch",
    size: "Variable",
    price: "Contact",
    note: "For working and day-time learners",
    featured: false,
  },
  {
    name: "Evening Batch",
    size: "Variable",
    price: "Contact",
    note: "For office-going and busy learners",
    featured: false,
  },
  {
    name: "Global Flex Batch",
    size: "Variable",
    price: "Contact",
    note: "For students abroad across time zones",
    featured: false,
  },
];

export const valuePoints = [
  "Live online classes",
  "Recorded 2-hour demo class",
  "Computer-based preparation",
  "All four skills practice",
  "Alfa IELTS and PTE mock tests",
  "Exam booking support",
  "Flexible class options",
  "WhatsApp and email support",
];

export const courseFacts = [
  { label: "Duration", value: "6 weeks / 30 total hours" },
  { label: "Delivery", value: "Live online Zoom classes" },
  { label: "Support", value: "WhatsApp, email, admin, and teacher follow-up" },
  { label: "Instruction", value: "English or Nepanglish" },
];

export const crmWorkflows = [
  "Lead source and CRM tag",
  "Class tag / batch tag",
  "Payment and enrolment status",
  "Attendance tracking",
  "Exam booking workflow",
  "Mock-test access workflow",
  "Follow-up notes and support log",
  "CSV / Excel export",
];

export const bookingStatuses = [
  "New Request",
  "Document Pending",
  "Payment Pending",
  "Booking in Process",
  "Booked",
  "Cancelled",
];

export const mockStatuses = [
  "Paid",
  "Access Sent",
  "Test Completed",
  "Result Shared",
  "Follow-up Required",
];

export const courseTypeOptions = [
  "IELTS Group Class",
  "IELTS One-to-One Class",
  "PTE Group Class",
  "PTE One-to-One Class",
];

export const pricePlanOptions = pricingPlans.map((plan) => plan.name);

export const paymentMethodOptions = [
  "Siddhartha Bank Gateway",
  "NPR Local Payment",
  "International Payment",
  "Bank Transfer",
  "Contact Admin",
];
