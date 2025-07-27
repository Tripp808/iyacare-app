import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">IyàCare End-User License, Copyright, and Privacy Policy Agreement</CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Comprehensive policy for maternal healthcare platform operations
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction to the Agreement</h2>
              
              <h3 className="text-xl font-medium mb-3">Purpose and Scope</h3>
              <p>
                This agreement governs the use of the IyàCare platform, including its web application, mobile interfaces, 
                IoT devices, and any related services. This policy is designed to ensure the safe, ethical, and effective 
                operation of our maternal healthcare platform in resource-constrained settings.
              </p>
              <p>
                IyàCare is a multi-faceted system involving hardware (IoT), software (frontend/backend), and distributed 
                ledger technology (blockchain). This comprehensive framework ensures all components and interactions fall 
                under the same legal and ethical standards.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Acceptance of Terms</h3>
              <p>
                By accessing, using, or registering for the IyàCare platform, you explicitly accept and agree to be bound 
                by these terms. This acceptance establishes legal enforceability and ensures that Community Health Workers 
                (CHWs) and patients acknowledge the terms before engaging with sensitive health data collection and sharing.
              </p>
            </section>

            {/* EULA & Platform Use */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. End-User License Agreement (EULA) & Platform Use</h2>
              
              <h3 className="text-xl font-medium mb-3">License Grant</h3>
              <p>
                IyàCare grants you a limited, non-exclusive, non-transferable, revocable license to use the platform for 
                its intended purpose: maternal healthcare monitoring, risk assessment, and record-keeping. For Community 
                Health Workers, this license covers professional duties within the scope of healthcare work.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Restrictions on Use</h3>
              <p>You are prohibited from:</p>
              <ul>
                <li>Unauthorized copying, modification, reverse engineering, or distribution of the platform</li>
                <li>Commercial exploitation outside of authorized healthcare activities</li>
                <li>Using the platform for illegal activities or transmitting harmful content</li>
                <li>Interfering with platform operation or attempting to exploit vulnerabilities</li>
                <li>Tampering with blockchain data integrity or security measures</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">User Responsibilities</h3>
              <p>As a user, you are responsible for:</p>
              <ul>
                <li>Maintaining confidentiality of login credentials</li>
                <li>Ensuring accuracy of data input (patient demographics, vital signs)</li>
                <li>Proper handling and care of provided IoT devices</li>
                <li>Compliance with applicable laws and ethical guidelines for patient care</li>
                <li>Following data privacy protocols and patient consent procedures</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Offline Functionality</h3>
              <p>
                While the platform supports offline data collection, you must ensure devices are periodically connected 
                to the internet for data synchronization. Data processed offline may not immediately reflect the latest 
                risk assessments or be fully recorded on the blockchain until synchronization occurs.
              </p>
              
              <h3 className="text-xl font-medium mb-3">SMS Alerts</h3>
              <p>
                By providing a mobile number, patients consent to receive SMS alerts related to health status, appointments, 
                or critical health information from IyàCare. Users may opt out at any time by replying "STOP" to any message 
                or contacting our support team.
              </p>
            </section>

            {/* Copyright & IP */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Copyright and Intellectual Property</h2>
              
              <h3 className="text-xl font-medium mb-3">Platform Ownership</h3>
              <p>
                IyàCare retains all rights, title, and interest in the platform, including software, design, predictive 
                models, AI algorithms, blockchain implementation, and underlying technology. This protects our significant 
                investment in developing the integrated AI-IoT-blockchain solution.
              </p>
              
              <h3 className="text-xl font-medium mb-3">User-Generated Content</h3>
              <p>
                Users grant IyàCare a license to use data they input for operating, maintaining, improving, and analyzing 
                the platform. This data is processed in anonymized or aggregated form where possible, always in compliance 
                with this Privacy Policy. This license is essential for risk assessment, blockchain storage, and predictive 
                model refinement.
              </p>
            </section>

            {/* Privacy Policy - Core Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Privacy Policy - Data Handling</h2>
              
              <h3 className="text-xl font-medium mb-3">Data Collection</h3>
              <p><strong>Types of Data Collected:</strong></p>
              <ul>
                <li><strong>Demographic Data:</strong> Patient age, location, pseudonymized unique ID</li>
                <li><strong>Vital Signs Data:</strong> Blood pressure, temperature, heart rate (IoT devices or manual entry)</li>
                <li><strong>Health Records Data:</strong> Pregnancy history, medical conditions, medications, care notes</li>
                <li><strong>Predictive Outcomes:</strong> AI-generated risk scores and assessments</li>
                <li><strong>Usage Data:</strong> Platform interaction patterns, feature access, timestamps</li>
              </ul>
              
              <p><strong>Methods of Collection:</strong></p>
              <ul>
                <li>Manual input by Community Health Workers</li>
                <li>Automated collection from connected IoT devices</li>
                <li>System-generated data from predictive models</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Data Usage and Processing</h3>
              <p><strong>Primary Purpose:</strong></p>
              <ul>
                <li>Providing maternal healthcare services and continuous monitoring</li>
                <li>Predictive risk assessment and early intervention</li>
                <li>Facilitating care coordination between healthcare providers</li>
                <li>Maintaining secure, immutable health records</li>
              </ul>
              
              <p><strong>Secondary Purpose:</strong></p>
              <ul>
                <li>Platform improvement and optimization</li>
                <li>Public health research (anonymized/aggregated data only)</li>
                <li>Population health reporting and analytics</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Data Sharing</h3>
              <p><strong>Authorized Sharing:</strong></p>
              <ul>
                <li><strong>Healthcare Providers:</strong> Authorized doctors, nurses, and CHWs directly involved in patient care</li>
                <li><strong>Service Providers:</strong> Essential third-party services (Firebase, SMS gateway, cloud hosting) under strict data processing agreements</li>
                <li><strong>Blockchain Network:</strong> Critical, non-personally identifiable health events recorded on Ethereum for immutability</li>
                <li><strong>Legal Requirements:</strong> Disclosure when required by law or to protect rights and safety</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Consent Requirements</h3>
              <p><strong>Explicit and Informed Consent:</strong></p>
              <ul>
                <li>Explicit consent required for collection, processing, and sharing of sensitive health data</li>
                <li>Consent must be freely given, specific, informed, and unambiguous</li>
                <li>Right to withdraw consent at any time with clear instructions</li>
                <li>Separate consent processes for clinical trials or research participation</li>
              </ul>
              
              <p><strong>Accessible Consent:</strong></p>
              <ul>
                <li>Consent forms provided in clear, simple language</li>
                <li>Formats suitable for low-literacy populations</li>
                <li>Local language translations available</li>
                <li>Verbal explanations and visual aids when needed</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Data Retention</h3>
              <ul>
                <li>Health records retained for duration of care plus legally mandated period</li>
                <li>Usage data retained for shorter analytical periods</li>
                <li>Blockchain data is immutable by design</li>
                <li>Associated off-chain data follows standard retention policies</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Data Security</h3>
              <p>We implement comprehensive security measures:</p>
              <ul>
                <li>End-to-end encryption for data in transit and at rest</li>
                <li>Multi-factor authentication and access controls</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure coding practices and vulnerability management</li>
                <li>Firebase and Ethereum blockchain security features</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">User Rights</h3>
              <p>You have the following rights regarding your data:</p>
              <ul>
                <li><strong>Right to Access:</strong> Request copies of your personal and health data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of personal data (noting blockchain immutability limitations)</li>
                <li><strong>Right to Data Portability:</strong> Receive data in structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
              </ul>
            </section>

            {/* Limitations & Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Limitations of Liability & Disclaimers</h2>
              
              <h3 className="text-xl font-medium mb-3">No Medical Advice</h3>
              <p>
                IyàCare is a technological tool for monitoring and risk assessment. It does not provide medical advice, 
                diagnosis, or treatment. Users must consult qualified healthcare professionals for all medical decisions. 
                The platform supports but does not replace human medical expertise.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Accuracy of Information</h3>
              <p>
                We disclaim responsibility for inaccuracies arising from user-entered data, IoT sensor limitations, 
                or external factors affecting data transmission. This acknowledges real-world challenges of data 
                collection in low-resource settings.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Service Availability</h3>
              <p>
                While we strive for high availability and include offline functionality, we cannot guarantee 
                uninterrupted or error-free service due to factors beyond our control, including internet outages 
                and hardware failures.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Third-Party Services</h3>
              <p>
                IyàCare integrates with third-party services (mobile networks, Firebase, etc.). We are not responsible 
                for the privacy practices or content of these external services.
              </p>
            </section>

            {/* Legal Framework */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Governing Law & Dispute Resolution</h2>
              <p>
                This agreement is governed by applicable healthcare and data protection laws. Disputes will be resolved 
                through arbitration before litigation, providing a clear framework for addressing disagreements.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Changes to the Agreement</h2>
              <p>
                IyàCare reserves the right to modify this agreement. We will notify users of significant changes, 
                and continued use after notification constitutes acceptance of new terms. This ensures the policy 
                remains current with platform evolution and legal requirements.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p>
                For questions about this policy, to exercise your rights, or report concerns:
              </p>
              <ul>
                <li><strong>Email:</strong> privacy@iyacare.site</li>
                <li><strong>Data Protection Officer:</strong> dpo@iyacare.site</li>
                <li><strong>Support:</strong> support@iyacare.site</li>
                <li><strong>Website:</strong> <a href="https://www.iyacare.site" className="text-primary hover:underline">www.iyacare.site</a></li>
              </ul>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br/>
                  <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br/>
                  This comprehensive policy demonstrates our commitment to ethical healthcare technology deployment 
                  and user privacy protection in maternal healthcare settings.
                </p>
              </div>
            </section>
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
}