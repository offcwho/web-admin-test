'use client';
import { LoginScreen } from '@/adminkit';

export default function LoginPage() {
  return <LoginScreen role="admin" redirectTo="/" subtitle="AdminKit — демо (любой email/пароль)"
    defaultEmail="admin@demo.dev" defaultPassword="demo" />;
}
