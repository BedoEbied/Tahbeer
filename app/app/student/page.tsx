'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Tahbeer Student</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {user?.name ?? ''}
              </span>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/student/courses"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Browse Courses</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Explore available courses
                </p>
              </div>
            </Link>

            <Link
              href="/student/my-courses"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
                <p className="mt-2 text-sm text-gray-500">
                  View your enrolled courses
                </p>
              </div>
            </Link>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage your profile settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
