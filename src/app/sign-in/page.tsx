"use client";

import { useAuth } from "@/app/_components/Providers";
import { reactClient } from "@/trpc/react";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLockLine,
  RiUserLine,
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function SignInPage() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { refetch } = useAuth();

  const signIn = reactClient.account.signIn.useMutation({
    onSuccess: async () => {
      await refetch();
      window.location.href = "/dashboard";
    },
    onError: (e) => {
      if (e.message === "Email not verified") {
        setEmailError("Please verify your email before signing in.");
        return;
      }
      setPasswordError(e.message);
      toast.error(e.message);
    },
  });

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Please include an '@' in the email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signIn.isPending) return;
    if (!validateForm()) return;

    signIn.mutate({ email, password });
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-mf-border-600 bg-mf-night-400/50 p-8">
          <div className="flex flex-col items-center gap-6">
            <Image
              src="/targon-logo.svg"
              alt="Targon Logo"
              width={60}
              height={60}
              priority
            />
            <div className="inline-flex items-center gap-2 rounded-full border border-mf-border-600 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-mf-sally-500" />
              <span className="text-xs uppercase tracking-wider text-mf-milk-600">
                Welcome Back
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-mf-milk-500">Sign In</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium uppercase tracking-wider text-mf-milk-600"
              >
                Email Address
              </label>
              <div className="relative">
                <RiUserLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mf-milk-600" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  disabled={signIn.isPending}
                  className={`w-full rounded border py-2.5 pl-10 pr-4 text-sm text-mf-milk-500 placeholder:text-mf-milk-700 focus:outline-none focus:ring-2 focus:ring-mf-sally-500 ${
                    emailError
                      ? "border-red-500"
                      : "border-mf-border-600 bg-mf-night-500"
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-400">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium uppercase tracking-wider text-mf-milk-600"
              >
                Password
              </label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mf-milk-600" />
                <input
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  disabled={signIn.isPending}
                  className={`w-full rounded border py-2.5 pl-10 pr-12 text-sm text-mf-milk-500 placeholder:text-mf-milk-700 focus:outline-none focus:ring-2 focus:ring-mf-sally-500 ${
                    passwordError
                      ? "border-red-500"
                      : "border-mf-border-600 bg-mf-night-500"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setVisible((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mf-milk-600 hover:text-mf-milk-500"
                >
                  {visible ? (
                    <RiEyeOffLine className="h-5 w-5" />
                  ) : (
                    <RiEyeLine className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-400">{passwordError}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Link
                href="https://targon.com/sign-up"
                className="flex flex-1 items-center justify-center rounded border border-mf-border-600 bg-mf-night-500 px-4 py-2.5 text-sm font-medium text-mf-milk-500 transition-colors hover:bg-mf-night-400"
              >
                Sign Up
              </Link>
              <button
                type="submit"
                disabled={signIn.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded border border-mf-sally-500 bg-mf-sally-500 px-4 py-2.5 text-sm font-medium text-mf-night-500 transition-colors hover:bg-mf-sally-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signIn.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-mf-night-500 border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center">
            <Link
              href="https://targon.com/send-reset-password"
              className="text-sm text-mf-sally-500 underline hover:text-mf-sally-400"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
