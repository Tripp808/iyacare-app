# IyàCare SMS Integration with Twilio

## Overview

The IyàCare application now includes comprehensive SMS functionality powered by Twilio, designed specifically for maternal and prenatal healthcare communication. This integration enables automated alerts for high-risk patients, appointment reminders, medication notifications, and bulk health tips.

## Features

### 🚨 Automated High-Risk Patient Monitoring
- **Real-time Risk Assessment**: Automatically evaluates patients based on age, medical history, and vital signs
- **Intelligent Alerts**: Sends immediate SMS alerts for high-risk and critical patients
- **Provider Notifications**: Alerts healthcare providers when patients require immediate attention
- **Risk Scoring**: Uses a comprehensive scoring system to categorize patient risk levels

### 📱 Patient Communication
- **Individual Messages**: Send personalized SMS messages to patients
- **Bulk Messaging**: Send health tips and announcements to multiple patients
- **Template Management**: Create and manage reusable message templates
- **Campaign Management**: Run targeted SMS campaigns based on patient criteria

### 🔄 Automated Messaging
- **Appointment Reminders**: Automatic reminders for upcoming appointments
- **Medication Alerts**: Timely reminders for medication schedules
- **Health Tips**: Regular wellness tips and educational content
- **Emergency Alerts**: Critical notifications for urgent situations

### 📊 Analytics & Reporting
- **Message Statistics**: Track sent, delivered, and failed messages
- **Cost Analysis**: Monitor SMS costs and usage patterns
- **Patient Engagement**: Analyze response rates and interaction metrics
- **Campaign Performance**: Measure the effectiveness of bulk campaigns

## Setup Instructions

### 1. Twilio Account Setup

1. **Create a Twilio Account**
   - Visit [twilio.com](https://twilio.com) and sign up
   - Verify your email and phone number
   - Complete account verification

2. **Get Your Credentials**
   - Navigate to the Twilio Console Dashboard
   - Find your **Account SID** and **Auth Token**
   - Keep these credentials secure - they're like passwords

3. **Purchase a Phone Number**
   - Go to "Phone Numbers" > "Manage" > "Buy a number"
   - Choose a number that supports SMS
   - Complete the purchase process

### 2. Application Configuration

1. **Environment Variables** (Optional - for server-side configuration)
   ```bash
   # Add to your .env.local file
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

2. **In-App Configuration**
   - Navigate to the SMS page in IyàCare
   - Click the "Configure" button
   - Enter your Twilio credentials:
     - Account SID
     - Auth Token
     - Phone Number (with country code)
   - Test the connection to verify setup

### 3. Testing the Integration

1. **Connection Test**
   - Use the "Test Connection" button in the configuration
   - This sends a test SMS to your Twilio number
   - Verify you receive the test message

2. **High-Risk Monitoring Test**
   - Use the "Monitor High-Risk Patients" button
   - This simulates patient vital sign monitoring
   - Check that alerts are sent to patients with risk factors

## Risk Assessment Criteria

The automated system evaluates patients based on:

### Age Factors
- **Advanced Maternal Age** (>35 years): +2 risk points
- **Young Maternal Age** (<18 years): +3 risk points

### Medical History
- **Hypertension**: +3 risk points
- **Diabetes**: +3 risk points
- **Previous Pregnancy Complications**: +4 risk points

### Vital Signs (when available)
- **High Blood Pressure** (>140/90): +4 risk points
- **Abnormal Heart Rate** (<60 or >100 bpm): +2 risk points
- **High Blood Sugar** (>140 mg/dL): +3 risk points

### Risk Levels
- **Low Risk**: 0-2 points
- **Medium Risk**: 3-4 points
- **High Risk**: 5-7 points
- **Critical Risk**: 8+ points

## Message Templates

The system includes pre-built templates for common scenarios:

### High-Risk Alerts
```
🚨 HEALTH ALERT: [Patient Name], your recent health indicators show elevated risk factors: [Risk Factors]. Please contact your healthcare provider immediately or visit the nearest clinic.
```

### Appointment Reminders
```
📅 REMINDER: Hi [Patient Name], you have an appointment at [Clinic Name] on [Date]. Please arrive 15 minutes early. Reply CONFIRM to acknowledge.
```

### Medication Reminders
```
💊 MEDICATION REMINDER: [Patient Name], it's time to take your [Medication] ([Dosage]). Consistent medication helps ensure a healthy pregnancy.
```

### Health Tips
```
💡 HEALTH TIP: [Patient Name], [Health Tip]. Your health and your baby's development are our priority. Stay healthy! - IyàCare Team
```

## Usage Examples

### 1. Monitoring High-Risk Patients

```typescript
// Automated monitoring trigger
await automatedMessagingService.monitorPatientVitals(patientId, {
  systolicBP: 160,
  diastolicBP: 100,
  heartRate: 95,
  bloodSugar: 150
});
```

### 2. Sending Custom Messages

```typescript
// Send individual message
await twilioService.sendSMS({
  to: '+2348123456789',
  body: 'Your appointment has been confirmed for tomorrow at 2 PM.'
});
```

### 3. Bulk Health Tips

```typescript
// Send health tips to all patients
const patients = await PatientService.getAllPatients();
for (const patient of patients) {
  await automatedMessagingService.sendHealthTip(
    patient.id, 
    'Stay hydrated and take your prenatal vitamins daily.'
  );
}
```

## Security & Privacy

### Data Protection
- **Encrypted Communications**: All SMS communications are encrypted in transit
- **Secure Credential Storage**: Twilio credentials are securely stored and never exposed
- **Access Control**: Only authorized personnel can access SMS functions
- **Audit Logging**: All SMS activities are logged for compliance

### HIPAA Compliance
- **Business Associate Agreement**: Ensure you have a BAA with Twilio for healthcare use
- **Patient Consent**: Obtain explicit consent before sending SMS communications
- **Opt-out Mechanisms**: Always include unsubscribe options in messages
- **Data Retention**: Follow healthcare data retention policies

### Privacy Considerations
- **Minimal Data**: Only necessary information is included in messages
- **No Sensitive Data**: Avoid sending detailed medical information via SMS
- **Identity Verification**: Verify patient identity before sensitive communications
- **Secure Channels**: Use SMS for notifications, not detailed medical discussions

## Troubleshooting

### Common Issues

1. **"Twilio not configured" error**
   - Check that all credentials are correctly entered
   - Verify your Twilio account is active and funded
   - Ensure the phone number format includes country code

2. **Messages not sending**
   - Verify recipient phone numbers are valid and formatted correctly
   - Check your Twilio account balance
   - Ensure the recipient hasn't opted out of SMS

3. **Test connection fails**
   - Double-check your Account SID and Auth Token
   - Verify your Twilio phone number is SMS-enabled
   - Check for any account restrictions or suspensions

### Contact Support

For technical support:
- Check the Twilio Console for error logs
- Review the application console for error messages
- Contact your development team for configuration assistance

## Cost Management

### SMS Pricing
- **Domestic SMS**: Varies by country (typically $0.0075-$0.01 per message)
- **International SMS**: Higher rates apply for international messaging
- **Message Segments**: Long messages are charged per 160-character segment

### Cost Optimization Tips
1. **Use Templates**: Standardized templates reduce message length
2. **Batch Processing**: Send messages efficiently to reduce API calls
3. **Monitor Usage**: Regular review of SMS analytics and costs
4. **Smart Scheduling**: Time messages appropriately to avoid redundancy

## Integration Benefits

### For Healthcare Providers
- **Improved Patient Outcomes**: Early intervention through automated alerts
- **Reduced Manual Work**: Automated appointment and medication reminders
- **Better Communication**: Direct, immediate patient contact
- **Compliance Support**: Documented communication trails

### For Patients
- **Timely Alerts**: Immediate notification of health concerns
- **Convenient Reminders**: SMS reminders for appointments and medications
- **Educational Content**: Regular health tips and guidance
- **Emergency Support**: Quick access to healthcare guidance

### For Healthcare Systems
- **Scalable Communication**: Handle large patient populations efficiently
- **Cost-Effective**: Reduce phone call volumes and administrative overhead
- **Data-Driven**: Analytics to improve communication strategies
- **Integration Ready**: Seamless integration with existing healthcare workflows

## Next Steps

1. **Complete Twilio Setup**: Follow the setup instructions above
2. **Test All Features**: Verify each component works correctly
3. **Train Staff**: Ensure healthcare providers understand the system
4. **Monitor Performance**: Regularly review analytics and adjust strategies
5. **Expand Usage**: Gradually increase automation based on success metrics

For additional support or custom integrations, consult the development team or refer to the Twilio documentation. 