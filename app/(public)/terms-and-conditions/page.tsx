import type { Metadata } from 'next';
import Image from 'next/image';
import termImage from "@/public/icon/terms-of-use.webp";
import StandardPageStructuredData from '@/components/seo/StandardPageStructuredData';
import { buildPageMetadata, buildWebPageSchema } from '@/helper/seo/site';

export const metadata: Metadata = buildPageMetadata({
    title: 'Terms and Conditions',
    description:
        'Review the terms and conditions for using Samriddhi Real Estate services, website content, and inquiry flows.',
    path: '/terms-and-conditions',
    keywords: [
        'Samriddhi terms and conditions',
        'real estate website terms Nepal',
        'property service terms and conditions',
    ],
});

export default function TermsAndConditions() {
    return (
        <>
            <StandardPageStructuredData
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Terms and Conditions', path: '/terms-and-conditions' },
                ]}
                schemas={[
                    buildWebPageSchema({
                        title: 'Terms and Conditions',
                        description:
                            'Review the terms and conditions for using Samriddhi Real Estate services, website content, and inquiry flows.',
                        path: '/terms-and-conditions',
                    }),
                ]}
            />
            <div className=' px-4 sm:px-6 lg:px-8 w-full'>

            {/* Section Title with Image */}
            <section className="py-8 relative z-10 overflow-hidden">
                <div className="container mx-auto px-4 flex items-center">

                    <div className="w-full md:w-[calc(100%-400px)] md:pr-[100px]">
                        <h1 className="text-3xl md:text-4xl font-bold text-opsh-primary mb-2">
                            Terms and Conditions
                        </h1>
                        <p className="text-base md:text-lg text-gray-700">
                            Every human or organisation has three levels of openness: Public, Personal and Private. We do believe in your rights to privacy.
                        </p>
                    </div>


                    <div className="hidden md:block w-[300px]">
                        <Image
                            src={termImage}
                            alt="Terms and Conditions"
                        />
                    </div>
                </div>

                <div className="absolute -z-10 -top-[140px] -right-[100px] w-[400px] h-[400px] bg-[#d2e7f7] bg-opacity-50 rounded-full"></div>
            </section>


            {/* Terms Section */}
            <section className='container mx-auto px-4 '>
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Terms</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Your engagement with Samriddhi Real Estate&pos;s products, software, services, and websites collectively referred to as "Services" is contingent upon adherence to the terms of a legal agreement between you and Samriddhi Real Estate Pvt. Ltd. We urge you to carefully review the following terms and conditions ("Terms") that govern your use of our Services.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        By utilizing any of our services, you explicitly acknowledge that you have thoroughly read, comprehended, and agreed to be bound by these Terms. This agreement applies irrespective of the manner in which you subscribe to or use our services. If you choose not to accept these Terms, it is imperative that you refrain from subscribing to or using our services.
                    </p>
                </div>

                {/* User Agreement */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">User Agreement</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Your utilization of the Services provided through our website ("Site") is governed by these Terms of Use. By accessing "the site," you agree to abide by the terms and conditions outlined here. It is essential to note that if you do not accept these Terms, you are not permitted to use the Services.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Samriddhi Real Estate Pvt. Ltd. reserves the right to augment, modify, or update these Terms of Use at its sole discretion. It is your responsibility to periodically review these Terms of Use to ensure compliance. Your continued use of the Site after any modifications to the Terms of Use indicates your acceptance of the revised terms, and you hereby consent to be bound by any such changes or revisions.
                    </p>
                </div>

                {/* Services Provided */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Services Provided</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Samriddhi Real Estate Pvt. Ltd. provides comprehensive real estate services, including buying, selling, renting, and property management across Bhaktapur and surrounding areas in Nepal. We facilitate property transactions between buyers, sellers, landlords, and tenants in accordance with all applicable Nepali real estate and digital regulations.
                    </p>
                </div>

                {/* Accepting the Terms */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Accepting the Terms</h3>
                    <h5 className="text-[#3854A5] text-base font-semibold mb-2.5 font-['Inter']">You can accept the Terms by:</h5>
                    <div className="flex ml-5 mb-2.5">
                        <i className="fas fa-circle text-[8px] leading-[21px] mr-2.5 text-[#3854A5]"></i>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']">When using Samriddhi Real Estate&pos;s services, you will encounter a user interface that allows you to accept or agree to the Terms. This feature is made available to you for various services.</p>
                    </div>
                    <div className="flex ml-5 mb-2.5">
                        <i className="fas fa-circle text-[8px] leading-[21px] mr-2.5 text-[#3854A5]"></i>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']">By actively engaging with the Services, you acknowledge and consent that Samriddhi Real Estate will consider your utilization of the Services as an explicit acceptance of the Terms from that moment onward.</p>
                    </div>
                </div>

                {/* User Interaction */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">User Interaction</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Users do not need to create an account to access our website. However, by filling out any forms on our website, you consent to us using the information provided for marketing purposes. This includes contacting you via the information provided to share property updates, market insights, and relevant real estate opportunities.
                    </p>
                </div>

                {/* Data Handling */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Data Handling</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        We store user information securely on our servers and protected systems. Your privacy is our priority - we do not share your personal information with third parties without your explicit consent. All data handling practices comply with Nepal&pos;s data protection regulations.
                    </p>
                </div>

                {/* Compliance with Laws */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Compliance with Laws</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Our operations comply with all relevant Nepali laws, including but not limited to the Real Estate Act, Consumer Protection Act, and applicable digital regulations. We are committed to maintaining the highest standards of legal compliance and ethical business practices.
                    </p>
                </div>

                {/* Your Information and Security */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Your Information and Security</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        You expressly agree and comprehend that you bear the responsibility for safeguarding any personal information shared with us. While account creation is not required, any information you provide through forms should be accurate and current.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Therefore, you acknowledge and agree that you assume sole responsibility to Samriddhi Real Estate for all information provided under your inquiries.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        In the event that you detect any unauthorized use of your personal information, you commit to promptly notify Samriddhi Real Estate by contacting us at samriddhirealestate2026@gmail.com.
                    </p>
                </div>

                {/* Dispute Resolution */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Dispute Resolution</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        If you have any complaints or grievances, please contact us immediately. We are committed to resolving any issues promptly and fairly. You can reach us through our official contact channels or use the feedback section on our website to send us a message.
                    </p>
                </div>

                {/* Intellectual Property */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Intellectual Property</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        All content on this website, including property listings, images, logos, and descriptions, is the exclusive property of Samriddhi Real Estate Pvt. Ltd. Unauthorized use of our content for commercial or marketing purposes is strictly prohibited. You may share links to properties listed on our website for personal, non-commercial use. We reserve the right to enforce intellectual property claims as necessary.
                    </p>
                </div>

                {/* Cookies and Tracking Technology */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Cookies and Tracking Technology</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        Our website uses cookies and similar tracking technologies to enhance user experience and for marketing purposes. By using our website, you consent to the use of these technologies. You can manage your cookie preferences through your browser settings.
                    </p>
                </div>

                {/* Modifications to Terms */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Modifications to Terms</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        We reserve the right to modify these terms and policies at any time to reflect changes in our services or legal requirements. Users will be notified of significant changes via email or phone number provided. Continued use of our website after modifications constitutes acceptance of the updated terms.
                    </p>
                </div>

                {/* Privacy Policy */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Privacy Policy</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        The user hereby provides explicit consent, confirming comprehension and agreement after thoroughly reading Samriddhi Real Estate&pos;s Privacy Policy related to the website. Additionally, the user affirms that the terms and content outlined in said Privacy Policy are deemed acceptable.
                    </p>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                    <h3 className="text-opsh-primary text-2xl font-semibold mb-4 font-['Inter']">Contact Information</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 font-['Inter']">
                        For any questions or concerns about these terms and conditions, please contact us at:
                    </p>
                    <div className="mt-4">
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']"><strong>Office Address:</strong> Bhaktapur, Nepal</p>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']"><strong>Phone:</strong> 9841923202</p>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']"><strong>Email:</strong> samriddhirealestate2026@gmail.com</p>
                        <p className="text-gray-600 text-base leading-relaxed font-['Inter']"><strong>Business Hours:</strong> Sun-Fri: 9:00 AM - 6:00 PM</p>
                    </div>
                </div>
            </section>
            </div>
        </>
    );
}
