"use client";

import type { FormEvent, ReactNode } from "react";

export function TrackedAdvisoryForm({
  action,
  children,
}: {
  action: string;
  children: ReactNode;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "strategy_call_book",
      booking_source: "advisory-briefing-form",
    });
    // Allow the native form submission to proceed (don't preventDefault).
  }

  return (
    <form method="post" action={action} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
