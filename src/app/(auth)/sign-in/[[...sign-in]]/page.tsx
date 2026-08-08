import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/config/clerk-appearance";

export default function SignInPage() {
  return <SignIn appearance={clerkAppearance} />;
}
