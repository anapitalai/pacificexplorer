import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DestinationForm from '@/components/DestinationForm';

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const { id } = await params;
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(id) },
  });

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-paradise-sand/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-png-black mb-2">Edit Destination</h1>
          <p className="text-gray-600">Update the details for {destination.name}</p>
        </div>

        <DestinationForm destination={destination} isEdit={true} />
      </div>
    </div>
  );
}
