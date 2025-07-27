import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">IyàCare Terms of Service</CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            End-User License Agreement and Service Terms
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="space-y-8">
            
            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing, using, or registering for the IyàCare platform, you explicitly accept and agree to be bound 
                by these Terms of Service, our Privacy Policy, and all applicable laws and regulations. If you do not 
                agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
              <p>
                These terms apply to all users of the platform, including Community Health Workers (CHWs), healthcare 
                providers, patients, and administrators.
              </p>
            </section>

            {/* License Grant */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. License Grant and Restrictions</h2>
              
              <h3 className="text-xl font-medium mb-3">License Grant</h3>
              <p>
                IyàCare grants you a limited, non-exclusive, non-transferable, revocable license to use the platform 
                solely for maternal healthcare monitoring, risk assessment, and record-keeping purposes. This license 
                is personal to you and may not be assigned or transferred.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Restrictions</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Copy, modify, distribute, sell, or lease any part of the platform</li>
                <li>Reverse engineer or attempt to extract the source code</li>
                <li>Use the platform for any unlawful purpose or in violation of these terms</li>
                <li>Interfere with or disrupt the platform's operation or security</li>
                <li>Access or attempt to access accounts or data belonging to others</li>
                <li>Transmit viruses, malware, or other harmful code</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              
              <h3 className="text-xl font-medium mb-3">Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all 
                activities that occur under your account. You must notify us immediately of any unauthorized use.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Data Accuracy</h3>
              <p>
                You are responsible for ensuring the accuracy and completeness of all data you input into the platform, 
                including patient demographics, vital signs, and medical information. Inaccurate data may affect 
                AI-powered risk assessments and patient care.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Professional Compliance</h3>
              <p>
                Healthcare providers using this platform must comply with all applicable professional standards, 
                ethical guidelines, and regulatory requirements in their jurisdiction.
              </p>
            </section>

            {/* Medical Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Medical Disclaimer</h2>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                IMPORTANT: IyàCare is a technological tool designed to assist healthcare providers. It does NOT provide 
                medical advice, diagnosis, or treatment recommendations.
              </p>
              <ul>
                <li>All medical decisions must be made by qualified healthcare professionals</li>
                <li>The platform's AI predictions are assistive tools, not diagnostic instruments</li>
                <li>Always consult with appropriate medical professionals for patient care decisions</li>
                <li>In emergency situations, contact local emergency services immediately</li>
                <li>The platform should supplement, not replace, clinical judgment and standard care protocols</li>
              </ul>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Service Availability and Support</h2>
              
              <h3 className="text-xl font-medium mb-3">Platform Availability</h3>
              <p>
                While we strive to maintain high availability, we do not guarantee uninterrupted access to the platform. 
                Service may be temporarily unavailable due to maintenance, updates, or factors beyond our control.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Offline Functionality</h3>
              <p>
                The platform includes offline capabilities for data collection in low-connectivity environments. 
                However, full functionality requires periodic internet connectivity for data synchronization and 
                AI risk assessments.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Technical Support</h3>
              <p>
                Technical support is provided during business hours. For urgent technical issues affecting patient 
                care, contact our emergency support line.
              </p>
            </section>

            {/* Data and Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Handling and Privacy</h2>
              <p>
                Your use of this platform is also governed by our comprehensive Privacy Policy, which details how 
                we collect, use, store, and protect your data. Key points include:
              </p>
              <ul>
                <li>All health data is encrypted and stored securely</li>
                <li>Blockchain technology ensures data integrity and immutability</li>
                <li>Data sharing is limited to authorized healthcare providers involved in patient care</li>
                <li>You retain rights to access, correct, and request deletion of your data</li>
                <li>We comply with applicable data protection regulations</li>
              </ul>
              <p>
                <a href="/privacy" className="text-primary hover:underline font-medium">
                  Read our complete Privacy Policy →
                </a>
              </p>
            </section>

            {/* SMS Communications */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. SMS Communications</h2>
              <p>
                By providing a mobile phone number, you consent to receive SMS messages from IyàCare related to:
              </p>
              <ul>
                <li>Health status alerts and notifications</li>
                <li>Appointment reminders</li>
                <li>Critical health information</li>
                <li>Platform updates and maintenance notices</li>
              </ul>
              <p>
                You may opt out of SMS communications at any time by replying "STOP" to any message or contacting 
                our support team. Standard message and data rates may apply.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>
              <p>
                The IyàCare platform, including its software, algorithms, design, content, and trademarks, is owned 
                by IyàCare and protected by intellectual property laws. You are granted only the limited license 
                described in these terms.
              </p>
              <p>
                By using the platform, you grant us a license to use data you input for the purposes of operating, 
                maintaining, and improving the platform, always in accordance with our Privacy Policy.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="font-medium">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul>
                <li>IyàCare provides the platform "as is" without warranties of any kind</li>
                <li>We disclaim all warranties, express or implied, including merchantability and fitness for purpose</li>
                <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid by you for the service</li>
                <li>We are not responsible for third-party services or content</li>
              </ul>
              <p>
                Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p>
                Either party may terminate your access to the platform at any time. We may terminate or suspend 
                your account immediately if you violate these terms. Upon termination:
              </p>
              <ul>
                <li>Your right to use the platform ceases immediately</li>
                <li>We may delete your account and associated data (subject to legal retention requirements)</li>
                <li>Provisions regarding intellectual property, liability, and dispute resolution survive termination</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Dispute Resolution</h2>
              <p>
                These terms are governed by applicable healthcare and data protection laws. Any disputes will be 
                resolved through binding arbitration before resorting to litigation, except for claims that may 
                be brought in small claims court.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of material changes 
                via email or platform notification. Continued use of the platform after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p>
                For questions about these Terms of Service or to report violations:
              </p>
              <ul>
                <li><strong>General Support:</strong> support@iyacare.site</li>
                <li><strong>Legal Inquiries:</strong> legal@iyacare.site</li>
                <li><strong>Technical Issues:</strong> tech@iyacare.site</li>
                <li><strong>Website:</strong> <a href="https://www.iyacare.site" className="text-primary hover:underline">www.iyacare.site</a></li>
              </ul>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br/>
                  <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br/>
                  By using IyàCare, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </section>
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
}