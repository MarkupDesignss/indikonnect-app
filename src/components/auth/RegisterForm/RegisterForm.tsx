'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth.schema';
import { useRegisterMutation } from '@/lib/api/endpoints/authApi';
import { useAppDispatch } from '@/lib/store/hooks/useAppDispatch';
import { setCredentials } from '@/lib/store/features/auth/authSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const [error, setError] = useState<string>('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      const response = await register(userData).unwrap();
      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        })
      );
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            {...registerField('firstName')}
            error={errors.firstName?.message}
            placeholder="John"
          />
          <Input
            label="Last Name"
            type="text"
            {...registerField('lastName')}
            error={errors.lastName?.message}
            placeholder="Doe"
          />
        </div>

        <Input
          label="Email address"
          type="email"
          {...registerField('email')}
          error={errors.email?.message}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          {...registerField('password')}
          error={errors.password?.message}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          {...registerField('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        Create Account
      </Button>
    </form>
  );
}