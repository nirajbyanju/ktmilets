export type ContactFaq = {
  id: number;
  question: string;
  answer: string;
};

export const contactFaqs: ContactFaq[] = [
  {
    id: 1,
    question: "Do you teach IELTS and PTE online?",
    answer:
      "Yes. KTM Test Preparation Centre provides live online computer-based IELTS and PTE classes through Zoom with admin, teacher, WhatsApp, and email support.",
  },
  {
    id: 2,
    question: "Can students outside Nepal join the classes?",
    answer:
      "Yes. Students in Nepal and abroad can join online classes. Global Flex, evening, weekend, and one-to-one options can be arranged depending on batch availability.",
  },
  {
    id: 3,
    question: "How long is the IELTS or PTE preparation course?",
    answer:
      "The standard course is 6 weeks with 30 total hours. Start date, end date, and class time are confirmed during batch allocation.",
  },
  {
    id: 4,
    question: "How do I pay for a class?",
    answer:
      "Generate or request an invoice, pay by Siddhartha Bank QR or bank transfer, and send the receipt to the official admin WhatsApp number for verification.",
  },
  {
    id: 5,
    question: "When is enrollment confirmed?",
    answer:
      "Enrollment is confirmed only after admin verifies the payment against the bank record, updates the CRM payment status, assigns the batch tag, and sends the confirmation email.",
  },
  {
    id: 6,
    question: "Do you support exam booking?",
    answer:
      "Yes. Students can request IELTS Academic, IELTS General Training, or PTE Academic booking support through the exam booking page.",
  },
  {
    id: 7,
    question: "Do you provide mock-test practice?",
    answer:
      "Yes. Alfa IELTS and Alfa PTE mock-test practice can be requested through the mock-test page, with admin follow-up and access instructions after payment verification.",
  },
  {
    id: 8,
    question: "Which support channels are used?",
    answer:
      "The system uses Zoom for live classes, WhatsApp Community for reminders and coordination, email for formal notices, and CRM records for tracking payment, batch, attendance, and follow-up.",
  },
];
