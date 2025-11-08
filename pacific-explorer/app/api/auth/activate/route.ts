import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/error?error=InvalidToken', process.env.NEXTAUTH_URL!)
      );
    }

    // Find user with this activation token
    const user = await prisma.user.findUnique({
      where: { activationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/error?error=InvalidToken', process.env.NEXTAUTH_URL!)
      );
    }

    // Check if token has expired
    if (user.activationExpires && user.activationExpires < new Date()) {
      return NextResponse.redirect(
        new URL('/auth/error?error=TokenExpired', process.env.NEXTAUTH_URL!)
      );
    }

    // Activate user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        activationToken: null,
        activationExpires: null,
        emailVerified: new Date(),
      },
    });

    // Redirect to signin with success message
    return NextResponse.redirect(
      new URL('/auth/signin?activated=true', process.env.NEXTAUTH_URL!)
    );
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?error=ActivationFailed', process.env.NEXTAUTH_URL!)
    );
  }
}
