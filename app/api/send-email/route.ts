import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { marked } from "marked";

export async function POST(request: NextRequest) {
  try {
    const { summary, recipients } = await request.json();

    if (!summary || !recipients) {
      return NextResponse.json(
        { error: 'Summary and recipients are required' },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: 'Email configuration is missing' },
        { status: 500 }
      );
    }

    const htmlContent = await marked(summary);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const recipientList = recipients
      .split(',')
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);

    if (recipientList.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipients found' },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientList,
      subject: 'Meeting Summary - ' + new Date().toLocaleDateString(),
      html: htmlContent,
      text: summary,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      message: 'Email sent successfully',
      recipients: recipientList 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}