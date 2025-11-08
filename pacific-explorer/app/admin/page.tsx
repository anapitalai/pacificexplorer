import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import BirdOfParadise from "@/components/BirdOfParadise";
import AdminCommissionDashboard from "@/components/admin/AdminCommissionDashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <BirdOfParadise className="w-12 h-12" />
              <span className="text-2xl font-bold text-png-black">
                Pacific <span className="text-png-red">Explorer</span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/admin" className="text-png-red font-semibold">
                Admin Dashboard
              </Link>
              <Link href="/admin/destinations" className="text-gray-600 hover:text-png-red transition-colors">
                Destinations
              </Link>
              <Link href="/api/auth/signout" className="px-4 py-2 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage commissions, bookings, and platform operations</p>
        </div>

        {/* Commission Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Commission Management</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Process Payouts
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Export Data
              </button>
            </div>
          </div>

          <AdminCommissionDashboard />
        </div>
      </main>
    </div>
  );
}
