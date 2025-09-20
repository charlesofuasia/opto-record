'use client';

import { routes } from '@/constants/routes';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <h1 className='text-3xl font-bold mb-6 text-gray-600'>
        Welcome to Opto Record
      </h1>
      <p className='mb-8 text-gray-600'>
        Manage patient records securely and efficiently.
      </p>

      <div className='space-x-4'>
        <Link
          href={routes.LOGIN}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer'
        >
          Login
        </Link>
        <Link
          href={routes.REGISTER}
          className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer'
        >
          Register
        </Link>
      </div>
    </div>
  );
}
