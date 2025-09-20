import React from 'react';
import { Edit, Eye, Trash, Plus } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/constants/routes';

export default function PatientsPage() {
  return (
    <section>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h1 className='text-3xl mb-2'>Patients Page</h1>
          <p className='mb-6 text-md'>Manage patients and view information</p>
        </div>
        <div>
          <button className='btn-primary'>
            <Plus className='inline h-4 w-4 mr-1' /> Add Patient
          </button>
        </div>
      </div>
      <div className='card mb-6'>
        <input
          type='text'
          placeholder='Search patients...'
          className='border p-2 rounded w-full'
        />
      </div>
      <table className='min-w-full overflow-hidden card'>
        <thead className='bg-accent'>
          <tr>
            <th className='bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider'>
              Patient Name
            </th>
            <th className='bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider'>
              Patient ID
            </th>
            <th className='bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider'>
              Age
            </th>
            <th className='bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider'>
              Last Visit
            </th>
            <th className='bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider'>
              Status
            </th>
            <th className='bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          <tr className='transition-colors'>
            <td className='px-6 py-4 text-sm'>John Doe</td>
            <td className='px-6 py-4 text-sm'>PT-2025-001</td>
            <td className='px-6 py-4 text-sm'>34</td>
            <td className='px-6 py-4 text-sm'>Jan 15, 2025</td>
            <td className='px-6 py-4 text-sm'>
              <span>Active</span>
            </td>
            <td className='px-6 py-4 text-sm'>
              <Link
                href={routes.PATIENTS_DETAILS.replace(':id', '1')}
                className='px-3 py-1 text-white rounded-lg text-xs'
              >
                <Eye className='inline h-4 w-4 mr-1 cursor-pointer' />
              </Link>
              <button className='px-3 py-1 text-white rounded-lg text-xs'>
                <Edit className='inline h-4 w-4 mr-1 cursor-pointer' />
              </button>
              <button className='px-3 py-1 text-white rounded-lg text-xs'>
                <Trash className='inline h-4 w-4 mr-1 cursor-pointer' />
              </button>
            </td>
          </tr>
          <tr className='transition-colors'>
            <td className='px-6 py-4 text-sm'>Jane Smith</td>
            <td className='px-6 py-4 text-sm'>PT-2025-002</td>
            <td className='px-6 py-4 text-sm'>29</td>
            <td className='px-6 py-4 text-sm'>Jan 15, 2025</td>
            <td className='px-6 py-4 text-sm'>
              <span>Active</span>
            </td>
            <td className='px-6 py-4 text-sm'>
              <Link
                href={routes.PATIENTS_DETAILS.replace(':id', '2')}
                className='px-3 py-1 text-white rounded-lg text-xs'
              >
                <Eye className='inline h-4 w-4 mr-1 cursor-pointer' />
              </Link>
              <button className='px-3 py-1 text-white rounded-lg text-xs'>
                <Edit className='inline h-4 w-4 mr-1 cursor-pointer' />
              </button>
              <button className='px-3 py-1 text-white rounded-lg text-xs'>
                <Trash className='inline h-4 w-4 mr-1 cursor-pointer' />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
