import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import HireCarPaymentForm from "./HireCarPaymentForm";

interface HireCarPaymentPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    payment_intent?: string;
    hireCarBookingId?: string;
  }>;
}

export default async function HireCarPaymentPage({
  params,
  searchParams,
}: HireCarPaymentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const hireCarId = parseInt(resolvedParams.id);
  const paymentIntentId = resolvedSearchParams.payment_intent;
  const hireCarBookingId = resolvedSearchParams.hireCarBookingId;

  if (isNaN(hireCarId)) {
    redirect("/hirecars");
  }

  if (!paymentIntentId) {
    redirect(`/hirecars/${hireCarId}`);
  }

  // Fetch hire car details
  const hireCarResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/hirecars/${hireCarId}`, {
    cache: 'no-store',
  });

  if (!hireCarResponse.ok) {
    redirect("/hirecars");
  }

  const hireCarData = await hireCarResponse.json();
  const hireCar = hireCarData.hireCar;

  if (!hireCar) {
    redirect("/hirecars");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Car Rental
          </h1>
          <p className="text-gray-600">
            Secure payment for {hireCar.name}
          </p>
        </div>

        <HireCarPaymentForm
          hireCar={hireCar}
          paymentIntentId={paymentIntentId}
          hireCarBookingId={hireCarBookingId}
        />
      </div>
    </div>
  );
}
