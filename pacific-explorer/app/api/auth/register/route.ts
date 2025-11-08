import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate activation token
    const activationToken = randomBytes(32).toString('hex');
    const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isActive: false,
        activationToken,
        activationExpires,
      },
    });

  // Use the created user in a harmless log to satisfy lint rules
  console.log('Registered user id:', user.id);

    // Send activation email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const activationUrl = `${process.env.NEXTAUTH_URL}/api/auth/activate?token=${activationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Activate Your Pacific Explorer Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Pacific Explorer!</h2>
          <p>Thank you for registering. Please click the link below to activate your account:</p>
          <p style="margin: 30px 0;">
            <a href="${activationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Activate Account
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${activationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'Registration successful! Please check your email to activate your account.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
