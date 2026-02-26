"use client";

import Box from "@/app/_components/Box";
import { useAuth } from "@/app/_components/Providers";
import { reactClient } from "@/trpc/react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import LiquidEther from "../_components/header/LiquidEther";

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
    },
  });

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Please include an '@' in the email address.");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is Required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 Characters");
      isValid = false;
    } else {
      setPasswordError(null);
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
    <>
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-8 w-screen h-[90vh] overflow-x-hidden -z-10 backdrop-blur-xl mask-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_calc(100%-500px),transparent_100%)]">
        <div className="w-full h-full mask-[linear-gradient(to_right,transparent,rgba(0,0,0,0.5)_50px,rgba(0,0,0,0.5)_calc(100%-50px),transparent_100%)]">
          <LiquidEther />
        </div>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center p-4 lg:pt-16">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-12">
            <div className="flex flex-col items-center gap-6">
              <Image
                src="/targon-logo.svg"
                alt="Targon Logo"
                width={50}
                height={50}
                priority
              />
              <h1 className="text-[1.75rem] font-saira font-semibold text-mf-milk-500">
                Welcome Back
              </h1>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
              <div>
                <input
                  id="email"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter Email..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  disabled={signIn.isPending}
                  className={`w-full rounded border py-2 pl-3 pr-4 text-sm text-mf-milk-500 placeholder:opacity-80 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-mf-sally-500 ${
                    emailError
                      ? "border-mf-safety-500"
                      : "border-mf-border-600 bg-mf-night-400 mb-5"
                  }`}
                />
                {emailError && (
                  <p className="mt-1 text-xs font-medium text-mf-safety-500">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    id="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter Password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    disabled={signIn.isPending}
                    className={`w-full rounded border py-2 pl-3 pr-12 text-sm text-mf-milk-500 placeholder:opacity-80 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-mf-sally-500 ${
                      passwordError
                        ? "border-mf-safety-500"
                        : "border-mf-border-600 bg-mf-night-400 mb-5"
                    }`}
                  />
                  {password && (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setVisible((s) => !s)}
                      className="absolute right-3 top-2.5 opacity-50 hover:opacity-80"
                    >
                      {visible ? (
                        <RiEyeOffLine className="h-4 w-4" />
                      ) : (
                        <RiEyeLine className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {passwordError && (
                  <p className="mt-1 text-xs font-medium text-mf-safety-500">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Link
                  href="https://targon.com/sign-up"
                  className="flex flex-1 items-center justify-center rounded border border-mf-border-600 bg-mf-night-500 px-4 py-2 text-xs font-medium text-mf-milk-500 transition-colors hover:bg-mf-night-400"
                >
                  Sign Up
                </Link>
                <button
                  type="submit"
                  disabled={signIn.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-mf-milk-500 hover:bg-mf-milk-400 cursor-pointer px-4 py-2 text-xs font-medium text-mf-night-500 transition-colors hover:bg-mf-sally-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {signIn.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border border-mf-night-500 border-t-transparent" />
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <p className="opacity-70 text-xs text-center">Or Continue with</p>
              <div className="mt-4 flex w-full justify-center">
                <Link href={`/sign-in/google`} className="w-full">
                  <Box
                    value="Google"
                    icon={
                      <Image
                        src="/google-logo.svg"
                        alt="Google Logo"
                        width={23}
                        height={23}
                        className="h-4 w-4 text-mf-sally-500"
                      />
                    }
                  />
                </Link>
              </div>
            </div>

            <p className="mt-4 text-center">
              <Link
                href="https://targon.com/send-reset-password"
                className="text-xs underline opacity-70 hover:opacity-80"
              >
                Forgot Password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
