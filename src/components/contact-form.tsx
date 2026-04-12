"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { type FormEvent, useRef, useState } from "react";
import { handleSendEmail } from "@/service/contact";
import contactFormStyles from "./contact-form.module.css";

function getField(name: string, form: FormData): string {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type ContactFormProps = {
  description?: string;
  title?: string;
};

export default function ContactForm({
  description = "Stuur een bericht. We reageren zo snel mogelijk.",
  title = "Contact",
}: ContactFormProps) {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [responseKind, setResponseKind] = useState<"success" | "error" | null>(null);
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResponseMessage(null);
    setResponseKind(null);

    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = getField("name", fd);
    const email = getField("email", fd);
    const message = getField("message", fd);
    const website = getField("website", fd);

    if (!name || !email || !message) {
      setResponseKind("error");
      setResponseMessage("Vul alle velden in.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setResponseKind("error");
      setResponseMessage("Vul een geldig e-mailadres in.");
      return;
    }
    if (!turnstileSiteKey) {
      setResponseKind("error");
      setResponseMessage("Human verification is nog niet geconfigureerd.");
      return;
    }
    if (!turnstileToken) {
      setResponseKind("error");
      setResponseMessage("Bevestig eerst dat je geen bot bent.");
      return;
    }

    setPending(true);
    let attemptedSubmission = false;
    try {
      attemptedSubmission = true;
      const response = await handleSendEmail({
        name,
        email,
        message,
        turnstileToken,
        website,
      });

      if (response.error) {
        setResponseKind("error");
        setResponseMessage(response.error);
        return;
      }
      if (response.message) {
        setResponseKind("success");
        setResponseMessage(response.message);
        form.reset();
        setTurnstileToken("");
        return;
      }

      setResponseKind("error");
      setResponseMessage("Onbekend antwoord van de server.");
    } catch {
      setResponseKind("error");
      setResponseMessage("Netwerkfout. Probeer het later opnieuw.");
    } finally {
      if (attemptedSubmission) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
      }
      setPending(false);
    }
  }

  return (
    <div className={contactFormStyles.container}>
      <header className={contactFormStyles.header}>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <form onSubmit={onSubmit} noValidate>
        <div className={contactFormStyles.honeypotField} aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className={contactFormStyles.formField}>
          <label htmlFor="contact-name">Naam</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className={contactFormStyles.formField}>
          <label htmlFor="contact-email">E-mail</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className={contactFormStyles.formField}>
          <label htmlFor="contact-message">Bericht</label>
          <textarea id="contact-message" name="message" rows={5} required />
        </div>

        <div className={contactFormStyles.turnstileWrapper}>
          {turnstileSiteKey ? (
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              onSuccess={(token) => {
                setTurnstileToken(token);
              }}
              onExpire={() => {
                setTurnstileToken("");
              }}
              onError={() => {
                setTurnstileToken("");
              }}
              options={{
                action: "contact_submit",
                size: "flexible",
              }}
            />
          ) : (
            <p className={contactFormStyles.turnstileNotice}>
              Stel `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in om het formulier te activeren.
            </p>
          )}
        </div>

        <button
          type="submit"
          className={contactFormStyles.submitButton}
          disabled={pending || !turnstileSiteKey}
        >
          {pending ? "Bezig…" : "Verstuur"}
        </button>

        {responseMessage != null ? (
          <p
            className={
              responseKind === "error"
                ? contactFormStyles.alertError
                : contactFormStyles.alertSuccess
            }
            role={responseKind === "error" ? "alert" : "status"}
          >
            {responseMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
