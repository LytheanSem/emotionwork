"use client";

import { VerificationView } from "@/modules/auth/ui/views/verification-view";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    const email = searchParams.get("email");

    if (!email) {
      router.push("/sign-up");
      return;
    }

    // Get registration data from session storage
    const storedData = sessionStorage.getItem("pendingRegistration");

    if (!storedData) {
      router.push("/sign-up");
      return;
    }

    try {
      const data = JSON.parse(storedData);

      // Verify the email matches what's in storage
      if (data.email !== email) {
        router.push("/sign-up");
        return;
      }

      setRegistrationData(data);
    } catch (error) {
      console.error("Error parsing registration data:", error);
      router.push("/sign-up");
    }
  }, [searchParams, router]);

  if (!registrationData) {
    return <div>Loading...</div>;
  }

  return (
    <VerificationView
      email={registrationData.email}
      username={registrationData.username}
      password={registrationData.password}
    />
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
