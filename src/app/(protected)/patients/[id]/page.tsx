import { Calendar, Dot, Edit, Plus } from 'lucide-react';
import React from 'react';

export default function PatientsPage() {
  return (
    <section>
      <div className='card flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl mb-2'>John Doe</h1>
          <div className='flex items-center gap-4 text-md text-text-secondary'>
            <span>Age: 45</span>
            <Dot className='inline h-4 w-4 mr-1' />
            <span>Patient ID: #PT-2025-001</span>
          </div>
        </div>

        <div className='flex gap-4 items-center'>
          <button className='btn-secondary'>
            <Edit className='inline h-4 w-4 mr-1' />
            Edit Info
          </button>
          <button className='btn-secondary'>
            <Plus className='inline h-4 w-4 mr-1' />
            Add Record
          </button>
          <button className='btn-secondary'>
            <Calendar className='inline h-4 w-4 mr-1' />
            Schedule Appointment
          </button>
        </div>
      </div>

      <div className='card'>
        <ul className='flex gap-8 text-text-secondary border-b pb-2 mb-4'>
          <li>Profile</li>
          <li>List</li>
          <li>Appointments</li>
        </ul>
        <div id='profile'>
          <form className='flex gap-8 w-full'>
            <div className='flex flex-col gap-4 w-full'>
              <h2 className='mb-4'>Personal Information</h2>
              <label>
                <span className='text-sm'>Full Name</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='John Doe'
                />
              </label>
              <label>
                <span className='text-sm'>Date of Birth</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='01/01/1978'
                />
              </label>
              <label>
                <span className='text-sm'>Gender</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='Male'
                />
              </label>
              <label>
                <span className='text-sm'>Phone Number</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='(123) 456-7890'
                />
              </label>
              <label>
                <span className='text-sm'>Email Address</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='john.doe@example.com'
                />
              </label>
              <label>
                <span className='text-sm'>Address</span>
                <textarea
                  className='input'
                  disabled
                  defaultValue='123 Main St, Anytown, USA'
                />
              </label>
            </div>
            <div className='flex flex-col gap-4 w-full'>
              <h2 className='mb-4'>Medical Information</h2>
              <label>
                <span className='text-sm'>Blood Type</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='O+'
                />
              </label>
              <label>
                <span className='text-sm'>Allergies</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='Penicillin, Peanuts'
                />
              </label>
              <label>
                <span className='text-sm'>Emergency Contact</span>
                <textarea
                  className='input'
                  defaultValue='Jane Doe (Spouse) - (987) 654-3210'
                />
              </label>
              <label>
                <span className='text-sm'>Insurance Provider</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='Acme Health Insurance'
                />
              </label>
              <label>
                <span className='text-sm'>Policy Number</span>
                <input
                  className='input'
                  type='text'
                  disabled
                  defaultValue='BCBS-123456789'
                />
              </label>
              <label>
                <span className='text-sm'>Primary Physician</span>
                <input className='input' disabled defaultValue='Dr. Smith' />
              </label>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
