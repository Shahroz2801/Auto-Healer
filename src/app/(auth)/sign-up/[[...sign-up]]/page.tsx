import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/config/clerk-appearance";

export default function SignUpPage() {
  return <SignUp appearance={clerkAppearance} />;
}
