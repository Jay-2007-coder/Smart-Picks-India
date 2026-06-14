"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentHubUpgrade() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student-hub");
  }, [router]);

  return null;
}
