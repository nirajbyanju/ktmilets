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

export const aboutTitle = "Computer-based test preparation with clear support.";

export const aboutDescription =
  "KTM Test Preparation Centre delivers online IELTS and PTE preparation with live Zoom classes, mock-test support, exam booking guidance, and CRM-managed student follow-up.";

export const aboutNarrative =
  "KTM Test Preparation Centre is an online test-preparation unit under KTM Educational Consultancy. We support students in Nepal and abroad with structured computer-based preparation, clear onboarding, WhatsApp support, email communication, and teacher-led academic guidance.";


export const aboutStoryPoints: string[] = [
  "Live online IELTS and PTE classes for students in Nepal and abroad.",
  "Computer-based preparation with demo class, mock-test practice, and flexible batches.",
  "Admin and teacher support through WhatsApp, email, Zoom, and CRM tracking.",
  "Exam booking support and Alfa IELTS/PTE mock-test workflow support.",
];

export const aboutPrinciples: AboutPrinciple[] = [
  {
    number: "01",
    title: "Structured Guidance",
    description:
      "Our academic and admin teams help students understand the course path, batch options, support process, and next steps.",
    focus: "Clear guidance shaped by course goals, target score, and schedule needs.",
    icon: FiCheckCircle,
  },
  {
    number: "02",
    title: "Trusted and Transparent",
    description:
      "We use clear registration, payment verification, onboarding, and communication workflows so students know what happens next.",
    focus: "Straightforward class, payment, and support communication.",
    icon: FiShield,
  },
  {
    number: "03",
    title: "Comprehensive Support",
    description:
      "From inquiry to enrollment and course completion, students receive admin, teacher, WhatsApp, and email support.",
    focus: "Support across registration, batch allocation, class access, and follow-up.",
    icon: FiHeart,
  },
  {
    number: "04",
    title: "System-driven Operations",
    description:
      "CRM tagging, payment status, attendance, and follow-up records help the team operate smoothly as batches grow.",
    focus: "A scalable workflow for students, admin staff, teachers, and managers.",
    icon: PiNetworkXBold,
  },
];

export const aboutLeaders: AboutLeader[] = [
  {
    name: "Bimal Nhemafuki",
    role: "Founder",
    bio: "Guiding the education service with a relationship-first mindset grounded in trust, student support, and responsible growth.",
    image: about2,
  },
  {
    name: "Niraj Byanju",
    role: "Chief Executive Officer",
    bio: "Focused on modern execution, student experience, CRM workflows, and clear online class operations.",
    image: about1,
  },
];

export const aboutCommitments: string[] = [
  "We recommend class options that match the student's goals, schedule, and support needs.",
  "We communicate clearly about registration, payment verification, batch timing, and next steps.",
  "We stay invested in student support before, during, and after enrollment.",
];

export const aboutLogo = Logo;
