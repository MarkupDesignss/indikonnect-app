'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema';
import { useLoginMutation } from '@/lib/api/endpoints/authApi';
import { useAppDispatch } from '@/lib/store/hooks/useAppDispatch';
import { setCredentials } from '@/lib/store/features/auth/authSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [error, setError] = useState<string>('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const response = await login(data).unwrap();
      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        })
      );
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.data?.message || 'Login failed. Please try again.';
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
        <Input
          label="Email address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        Sign in
      </Button>
    </form>
  );
}