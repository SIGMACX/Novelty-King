"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's a history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, go to homepage
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="back-button"
      aria-label="Go back"
    >
      <span className="back-button__icon">←</span>
      <span className="back-button__text">
        <span className="lang-en-inline">Back</span>
        <span className="lang-zh-inline"> / 返回</span>
      </span>
    </button>
  );
}
