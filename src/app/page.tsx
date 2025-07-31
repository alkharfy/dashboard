import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-headline font-bold text-center text-gray-800 dark:text-gray-200 mb-2">
          CV Assistant
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Welcome to the Internal CV Management System
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
