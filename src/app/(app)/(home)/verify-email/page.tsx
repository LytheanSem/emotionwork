import { VerificationView } from "@/modules/auth/ui/views/verification-view";
import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    email?: string;
    username?: string;
    password?: string;
  }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const { email, username, password } = params;

  // Redirect if missing required parameters
  if (!email || !username || !password) {
    redirect("/sign-up");
  }

  return (
    <VerificationView email={email} username={username} password={password} />
  );
}
