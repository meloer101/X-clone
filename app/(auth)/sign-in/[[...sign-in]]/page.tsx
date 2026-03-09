import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-black border border-[#2f3336] shadow-xl",
            headerTitle: "text-white",
            headerSubtitle: "text-[#71767b]",
            socialButtonsBlockButton:
              "border-[#2f3336] text-white hover:bg-[#1d1f23]",
            dividerLine: "bg-[#2f3336]",
            dividerText: "text-[#71767b]",
            formFieldLabel: "text-[#71767b]",
            formFieldInput:
              "bg-black border-[#2f3336] text-white focus:border-[#1d9bf0]",
            formButtonPrimary:
              "bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full",
            footerActionLink: "text-[#1d9bf0]",
            identityPreviewText: "text-white",
            identityPreviewEditButton: "text-[#1d9bf0]",
          },
        }}
      />
    </div>
  );
}
