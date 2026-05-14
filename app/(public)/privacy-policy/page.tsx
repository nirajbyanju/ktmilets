import type { Metadata } from 'next';
import Image from 'next/image';
import termImage from "@/public/icon/privacy-policy.webp";
import StandardPageStructuredData from '@/components/seo/StandardPageStructuredData';
import { buildPageMetadata, buildWebPageSchema } from '@/helper/seo/site';

export const metadata: Metadata = buildPageMetadata({
    title: 'Privacy Policy',
    description:
        'Read the KTM Test Preparation Centre privacy policy covering inquiries, cookies, website usage data, and visitor rights.',
    path: '/privacy-policy',
    keywords: [
        'KTM Test Prep privacy policy',
        'IELTS class privacy policy Nepal',
        'PTE class privacy policy Nepal',
    ],
});

export default function PrivacyPolicyPage() {
    return (
        <>
            <StandardPageStructuredData
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Privacy Policy', path: '/privacy-policy' },
                ]}
                schemas={[
                    buildWebPageSchema({
                        title: 'Privacy Policy',
                        description:
                            'Read the KTM Test Preparation Centre privacy policy covering inquiries, cookies, website usage data, and visitor rights.',
                        path: '/privacy-policy',
                    }),
                ]}
            />
            <div className=" px-4 sm:px-6 lg:px-8 w-full">
            {/* Section Title with Image */}
            <section className="py-8 relative z-10 overflow-hidden">
                <div className="container mx-auto px-4 flex items-center">

                    <div className="w-full md:w-[calc(100%-400px)] md:pr-[100px]">
                        <h1 className="text-3xl md:text-4xl font-bold text-opsh-primary mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-base md:text-lg text-gray-700">
                            Every human or organisation has three levels of openness: Public, Personal and Private. We do believe in your rights to privacy.
                        </p>
                    </div>


                    <div className="hidden md:block w-[300px]">
                        <Image
                            src={termImage}
                            alt="Privacy Policy"
                        />
                    </div>
                </div>


                <div className="absolute -z-10 -top-[140px] -right-[100px] w-[400px] h-[400px] bg-[#d2e7f7] bg-opacity-50 rounded-full"></div>
            </section>

            {/* Terms Section */}
            <section className='container mx-auto px-4'>
                {/* Page Title */}
                <div className="mb-8">
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        At KTM Educational Consultancy Pvt. Ltd., accessible from <strong>https://ktmtestprep.ktmeducational.edu.np</strong> (if applicable), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains the types of information that is collected and recorded by KTM Educational Consultancy Pvt. Ltd. and how we use it.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                    </p>
                </div>

                {/* Scope and Consent */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Scope and Consent</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they share and/or collect with KTM Educational Consultancy Pvt. Ltd. This policy is not applicable to any information collected offline or via channels other than this website.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                    </p>
                </div>

                {/* Information We Collect */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Information We Collect</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        If you contact us directly (via phone, email, or our website forms), we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide regarding your course needs (e.g., course type, target score, preferred batch time, current location, or payment verification details).
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Unlike services requiring a formal account, we primarily collect information through inquiry forms. We may ask for your contact information, including items such as name, email address, and telephone number to facilitate your class registration, exam booking, mock-test purchase, or support requests.
                    </p>
                </div>

                {/* How We Use Your Information */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">How We Use Your Information</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        We use the information we collect in various ways, including to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 text-base leading-relaxed mb-4 font-['Inter'] space-y-1">
                        <li>Provide, operate, and maintain our website.</li>
                        <li>Improve, personalize, and expand our website.</li>
                        <li>Understand and analyze how you use our website to better serve you.</li>
                        <li>Communicate with you, including for customer service, to provide class updates, exam booking information, mock-test support, payment verification follow-up, and relevant education service updates.</li>
                        <li>Send you emails regarding registration, invoices, class schedules, support requests, and responses to your inquiries.</li>
                        <li>Find and prevent fraud.</li>
                    </ul>
                </div>

                {/* Log Files and Cookies */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Log Files and Cookies</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        KTM Educational Consultancy Pvt. Ltd. follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Like any other website, we use "cookies" to store information including visitors' preferences and the pages on the website that the visitor accessed or visited. This information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                    </p>
                </div>

                {/* Third Party Policies */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Third Party Privacy Policies</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        KTM Educational Consultancy Pvt. Ltd.'s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        You can choose to disable cookies through your individual browser options.
                    </p>
                </div>

                {/* CCPA and GDPR Rights */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Your Privacy Rights (CCPA, GDPR)</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Depending on your location (e.g., California or EU residents), you have specific rights regarding your personal data. These may include the right to access, correct, delete, or restrict the use of your personal information. We also ensure that we do not sell your personal data.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        If you make a request regarding your data, we have one month to respond to you. If you would like to exercise any of these rights, please contact us using the information below.
                    </p>
                </div>

                {/* Children's Information */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Children's Information</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        KTM Educational Consultancy Pvt. Ltd. does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately, and we will do our best efforts to promptly remove such information from our records.
                    </p>
                </div>

                {/* Data Handling and Security */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Data Handling and Security</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        We store user information securely on our servers and protected systems. Your privacy is our priority - we do not share, sell, or rent your personal information to third parties for their marketing purposes without your explicit consent. All data handling practices comply with Nepal's applicable data protection regulations and international standards where relevant.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        In the event that you detect any unauthorized use of your personal information, you commit to promptly notify KTM Educational Consultancy Pvt. Ltd. by contacting us.
                    </p>
                </div>

                {/* Changes to Policy */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Changes to This Privacy Policy</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.
                    </p>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Contact Us</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        If you have any questions or suggestions about our Privacy Policy, or if you would like to exercise your data rights, do not hesitate to contact us:
                    </p>
                    <div className="mt-4 bg-gray-50 p-6 rounded-lg">
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter'] mb-2">
                            <strong className="font-semibold">KTM Educational Consultancy Pvt. Ltd.</strong>
                        </p>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']">
                            <strong>Office Address:</strong> Bhaktapur, Nepal
                        </p>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']">
                            <strong>Phone:</strong> 9841923202
                        </p>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']">
                            <strong>Email:</strong> ktmtestprep@ktmeducational.edu.np
                        </p>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']">
                            <strong>Business Hours:</strong> Sunday - Friday: 9:00 AM - 6:00 PM
                        </p>
                    </div>
                </div>
            </section>
            </div>
        </>
    );
}
