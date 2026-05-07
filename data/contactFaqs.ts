export type ContactFaq = {
  id: number;
  question: string;
  answer: string;
};

export const contactFaqs: ContactFaq[] = [
  {
    id: 1,
    question: 'How many agents are there in Samriddhi Real Estate?',
    answer:
      'We have a dedicated team of over 26 agents spread throughout the Kathmandu Valley, each specializing in specific areas to provide you with the best possible service.',
  },
  {
    id: 2,
    question: 'What documents are required by the seller to sell property?',
    answer:
      'Essential documents include the land ownership certificate, tax clearance certificate, citizenship certificate, house blueprint when applicable, recent land revenue certificate, and any required no objection certificates. Our team guides sellers through the full documentation process.',
  },
  {
    id: 3,
    question: 'Do you offer services outside the valley?',
    answer:
      'Yes. While our primary focus is the Kathmandu Valley, we also support clients in major cities such as Pokhara, Chitwan, Butwal, and Birgunj depending on the project and property type.',
  },
  {
    id: 4,
    question: 'How long does the property buying process usually take?',
    answer:
      'Most transactions take around 2 to 4 weeks from agreement to final transfer, depending on document verification, financing, and legal requirements.',
  },
  {
    id: 5,
    question: 'What fees are involved in buying or selling property?',
    answer:
      'Our seller commission is typically 2 percent of the property value. Buyer services are generally free, while government taxes and registration fees apply according to current regulations.',
  },
  {
    id: 6,
    question: 'Do you help with home loans and financing?',
    answer:
      'Yes. We help connect buyers with banks and financial institutions in Nepal and guide them through the home loan process.',
  },
  {
    id: 7,
    question: 'Can I list my property for rent instead of sale?',
    answer:
      'Absolutely. We support rental listings, tenant screening, agreement preparation, and ongoing landlord assistance.',
  },
  {
    id: 8,
    question: 'How do you verify property documents?',
    answer:
      'Our team verifies land records, checks for disputes or liens, and reviews documentation with the relevant authorities before a transaction moves forward.',
  },
  {
    id: 9,
    question: 'What makes Samriddhi Real Estate different from other real estate agencies?',
    answer:
      'We combine local market knowledge, transparent communication, technology-driven listing support, legal guidance, and client-first service throughout the property journey.',
  },
];
