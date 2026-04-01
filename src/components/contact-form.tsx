"use client";

import { type FormEvent, useState } from "react";
import { handleSendEmail } from "@/service/contact";
import contactFormStyles from "./contact-form.module.css";

function getField(name: string, form: FormData): string {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [responseKind, setResponseKind] = useState<"success" | "error" | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResponseMessage(null);
    setResponseKind(null);

    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = getField("name", fd);
    const email = getField("email", fd);
    const message = getField("message", fd);

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

    setPending(true);
    try {
      const response = await handleSendEmail({ name, email, message });

      if (response.error) {
        setResponseKind("error");
        setResponseMessage(response.error);
        return;
      }
      if (response.message) {
        setResponseKind("success");
        setResponseMessage(response.message);
        form.reset();
        return;
      }

      setResponseKind("error");
      setResponseMessage("Onbekend antwoord van de server.");
    } catch {
      setResponseKind("error");
      setResponseMessage("Netwerkfout. Probeer het later opnieuw.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={contactFormStyles.container}>
      <header className={contactFormStyles.header}>
        <h1>Contact</h1>
        <p>Stuur een bericht. We reageren zo snel mogelijk.</p>
      </header>

      <form onSubmit={onSubmit} noValidate>
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

        <button type="submit" className={contactFormStyles.submitButton} disabled={pending}>
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
