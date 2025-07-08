import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            IyaCare collects information necessary to provide maternal healthcare services, including:
          </p>
          <ul>
            <li>Patient demographic information</li>
            <li>Medical history and vital signs</li>
            <li>Healthcare provider communications</li>
            <li>Usage analytics (anonymized)</li>
          </ul>
          
          <h2>2. How We Use Your Information</h2>
          <p>
            We use collected information to:
          </p>
          <ul>
            <li>Provide healthcare services and monitoring</li>
            <li>Generate AI-powered risk assessments</li>
            <li>Facilitate communication between patients and providers</li>
            <li>Improve our services and user experience</li>
          </ul>
          
          <h2>3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h2>4. Data Sharing</h2>
          <p>
            We do not sell or rent your personal information to third parties. Data is only shared with authorized healthcare providers involved in your care.
          </p>
          
          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. Contact us at privacy@iyacare.com for any privacy-related requests.
          </p>
          
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@iyacare.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 