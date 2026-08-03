'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join IndiKonnect and start connecting
        </p>
      </div>
      <RegisterForm />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}