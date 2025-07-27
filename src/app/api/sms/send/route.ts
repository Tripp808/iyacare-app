import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Twilio configuration from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, templateId, language, variables } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    if (!accountSid || !authToken || !messagingServiceSid) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Please use international format (+250xxxxxxxxx)' },
        { status: 400 }
      );
    }

    // Send SMS using Twilio Messaging Service
    const response = await client.messages.create({
      body: message,
      messagingServiceSid: messagingServiceSid,
      to: to
    });

    return NextResponse.json({
      success: true,
      messageId: response.sid,
      status: response.status,
      to: response.to,
      from: response.from
    });

  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    
    // Handle specific Twilio errors
    if (error.code) {
      let errorMessage = 'Failed to send SMS';
      
      switch (error.code) {
        case 21211:
          errorMessage = 'Invalid phone number';
          break;
        case 21614:
          errorMessage = 'Phone number is not a valid mobile number';
          break;
        case 21408:
          errorMessage = 'Permission to send SMS to this number denied';
          break;
        case 20003:
          errorMessage = 'Authentication error - check Twilio credentials';
          break;
        default:
          errorMessage = error.message || 'Failed to send SMS';
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
