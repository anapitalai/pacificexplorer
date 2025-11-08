'use client';

import { useState } from 'react';
import Link from 'next/link';
import HotelsManagement from './HotelsManagement';
import CommissionsManagement from './subscription/CommissionsManagement';

interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
}

interface Destination {
  id: number;
  name: string;
  province: string;
  category: string;
  featured: boolean;
  createdAt: Date;
}

interface AdminDashboardProps {
  users: User[];
  destinations: Destination[];
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalDestinations: number;
    featuredDestinations: number;
  };
}

export default function AdminDashboard({ users: initialUsers, destinations: initialDestinations, stats: initialStats }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'destinations' | 'hotels' | 'commissions'>('overview');
  const [users, setUsers] = useState(initialUsers);
  const [destinations, setDestinations] = useState(initialDestinations);
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingDestination, setEditingDestination] = useState<number | null>(null);
  // intentionally reference to avoid lint 'assigned but never used' in some tabs
  void setEditingDestination;
  // Mark these intentionally unused in certain tabs to satisfy linters
  void isLoading;
  void editingDestination;

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
        return;
      }

      // Update local state
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      setStats({
        ...stats,
        totalUsers: stats.totalUsers - 1,
        activeUsers: stats.activeUsers - (users.find(u => u.id === userId)?.isActive ? 1 : 0),
      });
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to update user role');
        return;
      }

      const updatedUser = await response.json();
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: updatedUser.role } : u));
      alert(`User promoted to ${newRole} successfully`);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to update user status');
        return;
      }

      const updatedUser = await response.json();
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: updatedUser.isActive } : u));
      setStats({
        ...stats,
        activeUsers: stats.activeUsers + (updatedUser.isActive ? 1 : -1),
      });
      alert(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDestination = async (destinationId: number) => {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete destination');
        return;
      }

      // Update local state
      const updatedDestinations = destinations.filter(d => d.id !== destinationId);
      setDestinations(updatedDestinations);
      setStats({
        ...stats,
        totalDestinations: stats.totalDestinations - 1,
        featuredDestinations: stats.featuredDestinations - (destinations.find(d => d.id === destinationId)?.featured ? 1 : 0),
      });
      alert('Destination deleted successfully');
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Failed to delete destination');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeatured = async (destinationId: number, currentFeatured: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to update destination');
        return;
      }

      const updatedDestination = await response.json();
      
      // Update local state
      setDestinations(destinations.map(d => d.id === destinationId ? { ...d, featured: updatedDestination.featured } : d));
      setStats({
        ...stats,
        featuredDestinations: stats.featuredDestinations + (updatedDestination.featured ? 1 : -1),
      });
      alert(`Destination ${updatedDestination.featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating destination:', error);
      alert('Failed to update destination');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-png-red to-png-red/80 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-white/90">System management and overview</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-png-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-png-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Users ({stats.totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'destinations'
                ? 'bg-png-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Destinations ({stats.totalDestinations})
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'hotels'
                ? 'bg-png-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hotels
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'commissions'
                ? 'bg-png-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Commissions
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-ocean-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Users</span>
              <svg className="w-8 h-8 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-png-black">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.activeUsers} active</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-paradise-green">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Active Users</span>
              <svg className="w-8 h-8 text-paradise-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-png-black">{stats.activeUsers}</p>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% activation rate
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-png-red">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Destinations</span>
              <svg className="w-8 h-8 text-png-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-png-black">{stats.totalDestinations}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.featuredDestinations} featured</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-png-yellow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">System Status</span>
              <svg className="w-8 h-8 text-paradise-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-paradise-green">Healthy</p>
            <p className="text-sm text-gray-500 mt-1">All systems operational</p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-png-black">User Management</h2>
            <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.username}</div>
                      {user.name && <div className="text-sm text-gray-500">{user.name}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-png-red focus:border-transparent"
                        >
                          <option value="TOURIST">TOURIST</option>
                          <option value="HOTEL_OWNER">HOTEL_OWNER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          user.role === 'ADMIN' 
                            ? 'bg-png-red text-white' 
                            : user.role === 'HOTEL_OWNER'
                            ? 'bg-png-yellow text-png-black'
                            : 'bg-ocean-100 text-ocean-800'
                        }`}
                        onClick={() => setEditingUser(user.id)}
                        title="Click to edit role"
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                          user.isActive 
                            ? 'bg-paradise-green/20 text-paradise-green hover:bg-paradise-green/30' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleUpdateUserRole(user.id, 'ADMIN')}
                          className="text-ocean-600 hover:text-ocean-900 font-semibold"
                          title="Promote to Admin"
                        >
                          Promote
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-png-red hover:text-png-red/80 font-semibold"
                        title="Delete user"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Destinations Tab */}
      {activeTab === 'destinations' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-png-black">Destination Management</h2>
              <p className="text-gray-600 mt-1">Manage tourism destinations and listings</p>
            </div>
            <Link
              href="/admin/destinations/new"
              className="px-6 py-3 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
            >
              Add New Destination
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Province
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {destinations.map((destination) => (
                  <tr key={destination.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{destination.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {destination.province}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-ocean-100 text-ocean-800">
                        {destination.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(destination.id, destination.featured)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        title={destination.featured ? 'Click to unfeature' : 'Click to feature'}
                      >
                        {destination.featured ? (
                          <svg className="w-6 h-6 text-png-yellow fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400 hover:text-png-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(destination.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <Link
                        href={`/destinations/${destination.id}`}
                        className="text-ocean-600 hover:text-ocean-900 font-semibold"
                        title="View destination"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/destinations/${destination.id}/edit`}
                        className="text-ocean-600 hover:text-ocean-900 font-semibold"
                        title="Edit destination"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleFeatured(destination.id, destination.featured)}
                        className="text-png-yellow hover:text-png-yellow/80 font-semibold"
                        title={destination.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {destination.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => handleDeleteDestination(destination.id)}
                        className="text-png-red hover:text-png-red/80 font-semibold"
                        title="Delete destination permanently"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hotels Tab */}
      {activeTab === 'hotels' && (
        <HotelsManagement />
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <CommissionsManagement />
      )}
    </div>
  );
}
