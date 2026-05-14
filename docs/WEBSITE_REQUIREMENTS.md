# KTM Test Preparation Centre Website Requirements

Version: Revised Final | April 2026

## Brand and Contact

Client / brand: KTM Test Preparation Centre  
Short name: KTM Test Prep  
Business type: Online computer-based IELTS and PTE classes, exam booking support, Alfa mock-test sales, and CRM-managed student operations.

Phone: +977 14526263  
WhatsApp: +977 9747469800  
Email: ktmtestprep@ktmeducational.edu.np  
Office: Putalisadak (Way to Dillibazar), Kathmandu, Nepal  
Google Map: https://maps.app.goo.gl/Pb8aM8Y8stbB63ed6  
Office Hours: 8:00 AM to 5:00 PM (Sunday-Friday)

Social media:
- Facebook: https://www.facebook.com/KTMIMMIGRATION
- Instagram: https://www.instagram.com/ktmeducational/
- TikTok: https://www.tiktok.com/@ktm.test.prep?_r=1&_t=ZS-95wtMYSXlaf
- YouTube: https://www.youtube.com/@ktmeducationalconsultancy

Mother company: KTM Educational Consultancy Pvt. Ltd.  
Website: https://www.ktmeducational.edu.np

## Objective

The website must work as a complete online IELTS/PTE class platform, exam-booking support portal, Alfa mock-test sales portal, payment collection system, and admin CRM. It must support lead capture, registration, batch tagging, enrollment, payment verification, student tracking, attendance, support notes, exports, and email/WhatsApp operational workflows.

## Positioning

- Separate online test-preparation unit under KTM Educational Consultancy.
- Focused on computer-based IELTS and PTE preparation for students in Nepal and abroad.
- Must support lean launch operations and later multi-batch scaling.
- Main tagline: IELTS, PTE & English Test Preparation.
- Five-year goal: 18,500 students through phased scaling and system-driven operations.
- Theme: deep blue and strong red from the KTM logo, supported by white and neutral backgrounds.

## Public Website Scope

Primary menu:
- Home
- IELTS Online Class
- PTE Online Class
- Demo Class
- Exam Booking
- Mock Test Practice
- About Us
- Contact Us

Required public flows:
- Registration
- Payment and enrollment
- IELTS/PTE exam booking support
- Alfa IELTS/PTE mock-test purchase
- Contact and WhatsApp lead capture

## Pricing and Batch Logic

| Plan | Batch Size | Price | Notes |
| --- | --- | --- | --- |
| Elite Private | 1:1 | NPR 30,000 or USD equivalent | Special class time may be arranged |
| Premium Focus | 5-11 | NPR 5,999 | Higher interaction group |
| Smart Batch | 12-20 | NPR 2,999 | Main business model |
| Value Batch | 21-30 | NPR 2,199 | Volume model with controlled quality messaging |
| Weekend Batch | Variable | Contact / configurable | For working/day-time learners |
| Evening Batch | Variable | Contact / configurable | For office-going / busy learners |
| Global Flex Batch | Variable | Contact / configurable | For students abroad across time zones |

## Registration Fields

- Full name
- Email address
- WhatsApp number
- Country of passport
- Current location / country
- Preferred class time
- Course type
- Price plan
- Instruction type: English / Nepanglish
- Target score / target band
- Payment method
- Message / questions

Course type options:
- IELTS Group Class
- IELTS One-to-One Class
- PTE Group Class
- PTE One-to-One Class

## Payment and Enrollment Workflow

Current implementation follows the manual no-gateway workflow requested in the project:

Lead in CRM -> Registration QR/link -> Student pays by Siddhartha Bank QR or bank transfer -> Student sends receipt to admin WhatsApp -> Admin verifies payment -> CRM payment status updated -> Confirmation email sent -> Student added to WhatsApp Community -> CRM class tag assigned -> Teacher notified -> Student enrolled.

Student must include:
- Full name
- Selected course
- Preferred batch time
- Contact number

Admin process:
- Verify receipt with bank statement or mobile banking notification.
- Update CRM payment status.
- Assign correct batch tag.
- Send onboarding email.
- Add student to WhatsApp Community.
- Notify teacher.

## Core Platforms

| Tool / Platform | Use |
| --- | --- |
| Zoom | Live class delivery, speaking support, mock support, and special support calls |
| CRM | Lead capture, class tagging, attendance, payment status, student tracking, and feedback records |
| Siddhartha Bank QR / Bank Transfer | Manual payment collection and verification |
| Email | Formal communication, onboarding, notices, schedule, and end-of-course reminders |
| WhatsApp Community | Class reminders, announcements, support updates, voice submissions, and assessment coordination |
| Google Drive | Demo class and organised material sharing / backup |
| Laptop + XP Pen tablet | Main teaching setup and live explanation board |
| Noise-cancelling headset | Improved audio quality and professionalism |

## CRM and Admin Requirements

- View all student registrations.
- Manage IELTS and PTE students.
- Manage exam booking requests.
- Manage Alfa IELTS/PTE mock purchases.
- Track leads from website.
- Tag students to specific class batches.
- Update payment status and enrollment status.
- Track attendance.
- Add follow-up notes and communication notes.
- Search, filter, and export to Excel / CSV.
- Separate admin, staff, teacher, marketing, manager, and owner access where needed.

## Automation Requirements

After registration:
- Save lead in CRM.
- Notify admin.
- Send student registration confirmation email.
- Apply course/source tags.

After verified class payment:
- Send payment confirmation email.
- Send class schedule, start date, end date, support contact, and joining instructions/class link.
- Tag student to correct batch.
- Enable attendance tracking.

After exam booking request:
- Save request in CRM.
- Notify admin.
- Send student confirmation.
- Allow admin status updates.

After mock-test purchase:
- Save purchase in CRM.
- Notify admin.
- Send access details or instructions.
- Allow admin status, completion, result, and follow-up tracking.

## Security and Launch Requirements

- SSL / HTTPS.
- Role-based admin access.
- Secure uploads for passport copies and documents.
- Validation, sanitization, and spam protection.
- Privacy policy, terms and conditions, and refund policy.
- Google Analytics and Meta Pixel.
- Basic SEO and Open Graph.
- Backup system.
- Testing before launch.
- Admin handover guide.

## Phasing

Phase 1: Core public pages, registration, payment, contact, CRM basics.  
Phase 2: Exam booking support, mock-test workflow, enhanced automation.  
Phase 3: Advanced CRM notes, batch logic, attendance, rating summary, analytics events.  
Phase 4: SEO growth, content expansion, social proof, overseas/weekend/evening workflow refinement.
