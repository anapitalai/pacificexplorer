import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DestinationForm from '@/components/DestinationForm';

export default async function NewDestinationPage() {
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-paradise-sand/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-png-black mb-2">Add New Destination</h1>
          <p className="text-gray-600">Create a new tourist destination in Papua New Guinea</p>
        </div>

        <DestinationForm isEdit={false} />
      </div>
    </div>
  );
}
