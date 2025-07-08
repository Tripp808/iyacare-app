import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using IyaCare, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use IyaCare for personal, non-commercial transitory viewing only.
          </p>
          
          <h2>3. Medical Disclaimer</h2>
          <p>
            IyaCare is designed to assist healthcare providers but should not replace professional medical judgment.
            All medical decisions should be made by qualified healthcare professionals.
          </p>
          
          <h2>4. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
          </p>
          
          <h2>5. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at support@iyacare.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 