'use client';

import { routes } from '@/constants/routes';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-background'>
      <h1 className='text-3xl font-bold mb-6'>
        Welcome to Opto Record
      </h1>
      <p className='mb-8'>
        Manage patient records securely and efficiently.
      </p>

      <div className='space-x-4'>
        <Link
          href={routes.LOGIN}
          className='btn-primary'
        >
          Login
        </Link>
        <Link
          href={routes.REGISTER}
          className='btn-success'
        >
          Register
        </Link>
      </div>
    </div>
  );
}
