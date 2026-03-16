"use client";

import { useState, useRef } from "react";
import styles from "./EmailSignup.module.css";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface EmailSignupProps {
  contactEmail?: string;
}

export function EmailSignup({ contactEmail }: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "already" | "invalid" | "error"
  >("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setStatus("invalid");
      inputRef.current?.focus();
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.already ? "already" : "success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.wrap}>
        <p className={styles.message} role="status" aria-live="polite">
          You might hear from me.
        </p>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className={styles.wrap}>
        <p className={styles.message} role="status" aria-live="polite">
          You're already on the list.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <label htmlFor="email-signup" className={styles.headline}>
          I might send emails sometimes.
        </label>

        <div className={styles.row}>
          <input
            ref={inputRef}
            id="email-signup"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "invalid" || status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            className={styles.input}
            disabled={status === "submitting"}
            autoComplete="email"
            aria-describedby={
              status === "invalid" || status === "error"
                ? "signup-feedback"
                : undefined
            }
          />
          <button
            type="submit"
            className={styles.button}
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "..." : "Subscribe"}
          </button>
        </div>

        <p className={styles.privacy}>It won't be spam. I promise.</p>

        {status === "invalid" && (
          <p
            id="signup-feedback"
            className={styles.feedback}
            role="alert"
            aria-live="polite"
          >
            That doesn't look like an email address.
          </p>
        )}

        {status === "error" && (
          <p
            id="signup-feedback"
            className={styles.feedback}
            role="alert"
            aria-live="polite"
          >
            Something went wrong. Try again
            {contactEmail && (
              <>
                , or just email me at{" "}
                <a href={`mailto:${contactEmail}`} className={styles.fallback}>
                  {contactEmail}
                </a>
              </>
            )}
            .
          </p>
        )}

      </form>
    </div>
  );
}
