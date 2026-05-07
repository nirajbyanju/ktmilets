import type { StaticImageData } from "next/image";
import type { IconType } from "react-icons";
import { FiCheckCircle, FiHeart, FiShield } from "react-icons/fi";
import { PiNetworkXBold } from "react-icons/pi";

import about1 from "@/public/images/about1.jpg";
import about2 from "@/public/images/about2.jpg";
import Logo from "@/public/LogoGreen.png";

export type AboutHighlight = {
  label: string;
  value: string;
};

export type AboutPrinciple = {
  number: string;
  title: string;
  description: string;
  focus: string;
  icon: IconType;
};

export type AboutLeader = {
  name: string;
  role: string;
  bio: string;
  image: StaticImageData;
};

export const aboutTitle = "Built on trust. Guided by clarity.";

export const aboutDescription =
  "Samriddhi Real Estate delivers trusted property guidance with professionalism, market awareness, and practical support so every decision feels more transparent and more secure.";

export const aboutNarrative =
  "Samriddhi Real Estate is an emerging real estate company in Nepal focused on service, value, and long-term trust. We believe property decisions are rarely just transactions. They shape homes, businesses, and future opportunities, so our role is to bring structure, honesty, and confidence to every step.";


export const aboutStoryPoints: string[] = [
  "A wide range of residential and commercial opportunities across Nepal.",
  "Support for buying, selling, and renting with grounded market guidance.",
  "Practical help with loans, paperwork, and transaction planning.",
  "Legal and compliance awareness for safer property decisions.",
];

export const aboutPrinciples: AboutPrinciple[] = [
  {
    number: "01",
    title: "Expert Guidance",
    description:
      "Our real estate professionals provide practical advice at every step so clients can make informed decisions with greater confidence.",
    focus: "Clear recommendations shaped by market context and client goals.",
    icon: FiCheckCircle,
  },
  {
    number: "02",
    title: "Trusted and Transparent",
    description:
      "We prioritize honest communication, realistic expectations, and process clarity to build trust across every relationship.",
    focus: "No hidden surprises, just straightforward guidance and accountability.",
    icon: FiShield,
  },
  {
    number: "03",
    title: "Comprehensive Support",
    description:
      "From first inquiry to final handover, we support clients through the broader property journey, not just a single transaction.",
    focus: "Support across paperwork, negotiation, coordination, and follow-through.",
    icon: FiHeart,
  },
  {
    number: "04",
    title: "Strong Network",
    description:
      "Our network of buyers, sellers, landlords, and partners helps clients discover stronger-fit opportunities without unnecessary friction.",
    focus: "A wider reach that improves visibility, access, and responsiveness.",
    icon: PiNetworkXBold,
  },
];

export const aboutLeaders: AboutLeader[] = [
  {
    name: "Bimal Nhemafuki",
    role: "Founder",
    bio: "Guiding the company with a relationship-first mindset grounded in trust, service, and responsible growth.",
    image: about2,
  },
  {
    name: "Niraj Byanju",
    role: "Chief Executive Officer",
    bio: "Focused on modern execution, client experience, and building a more transparent real estate journey in Nepal.",
    image: about1,
  },
];

export const aboutCommitments: string[] = [
  "We recommend only what aligns with the client's real goals and circumstances.",
  "We communicate clearly about process, documents, risks, and next steps.",
  "We stay invested in trust long after a deal moves forward.",
];

export const aboutLogo = Logo;
