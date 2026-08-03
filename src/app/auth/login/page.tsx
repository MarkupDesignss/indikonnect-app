'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your IndiKonnect account
        </p>
      </div>
      <LoginForm />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign up
          </Link>
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500 transition-colors mt-2 block"
        >
          Forgot your password?
        </Link>
      </div>
    </>
  );
}