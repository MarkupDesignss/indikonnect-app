// src/hooks/useTokenCheck.ts
'use client';

import { useEffect, useState } from 'react';
import { TokenManager } from '@/lib/redux/api/baseApi';

export const useTokenCheck = () => {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    setHasToken(!!(token && refreshToken));
  }, []);

  return hasToken;
};