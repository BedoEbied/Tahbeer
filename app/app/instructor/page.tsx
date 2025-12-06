'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';

export default function InstructorDashboard() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Tahbeer Instructor</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user?.name ?? ''}</span>
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
          <h2 className="text-2xl font-bold mb-4">Instructor Dashboard</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/instructor/courses"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
                <p className="mt-2 text-sm text-gray-500">
                  View and manage your courses
                </p>
              </div>
            </Link>

            <Link
              href="/instructor/courses/new"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Create Course</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new course
                </p>
              </div>
            </Link>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Enrollments</h3>
                <p className="mt-2 text-sm text-gray-500">
                  View student enrollments in your courses
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
