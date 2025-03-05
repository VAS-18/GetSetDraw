"use client";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const goToHome = () => {
    router.push('/Home');
  }

  return (
    <div>
      Landing Page
      <button className="bg-red-500" onClick={goToHome}>
        Go to Home Page
      </button>
    </div>
  );
}
