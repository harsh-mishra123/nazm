"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { claimUsername } from "@/lib/users/actions";
import { usernameSchema } from "@/lib/users/validations";
import { Loader2, Check, X } from "lucide-react";

export function UsernameForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // Debounced availability check
  const checkAvailability = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (value: string) => {
        clearTimeout(timer);
        setAvailability("idle");

        const parsed = usernameSchema.safeParse(value);
        if (!parsed.success) return;

        setAvailability("checking");
        timer = setTimeout(async () => {
          try {
            const res = await fetch(
              `/api/users/check-username?username=${encodeURIComponent(value)}`
            );
            const data = await res.json();
            setAvailability(data.available ? "available" : "taken");
          } catch {
            setAvailability("idle");
          }
        }, 400);
      };
    })(),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    setError(null);
    setSuccess(false);
    checkAvailability(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await claimUsername(username);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 1000);
      } else {
        setError(result.error ?? "Something went wrong");
        setAvailability("idle");
      }
    });
  };

  const isValid = usernameSchema.safeParse(username).success;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={handleChange}
            placeholder="your_username"
            maxLength={30}
            disabled={isPending || success}
            autoFocus
            className="w-full rounded-xl bg-muted/30 border border-border/50 pl-8 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors disabled:opacity-50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {availability === "checking" && (
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            )}
            {availability === "available" && (
              <Check size={16} className="text-green-500" />
            )}
            {availability === "taken" && (
              <X size={16} className="text-red-500" />
            )}
          </div>
        </div>

        {availability === "taken" && (
          <p className="text-xs text-red-500">
            This username is already taken
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-500">
            Username claimed. Redirecting...
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid || isPending || success || availability === "taken"}
        className="w-full liquid-glass rounded-xl px-6 py-3 text-sm text-foreground transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Claiming...
          </>
        ) : success ? (
          <>
            <Check size={14} />
            Done
          </>
        ) : (
          "Claim Username"
        )}
      </button>
    </form>
  );
}
