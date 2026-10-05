"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareTomorrowButton({
  href,
  label = "Share with driver on WhatsApp",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Button asChild variant="ocean" size="lg" className="w-full">
      <a href={href} target="_blank" rel="noreferrer">
        <MessageCircle />
        {label}
      </a>
    </Button>
  );
}
