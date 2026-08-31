"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

import styles from "./LoginForm.module.css";

export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className={styles.field}>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" required />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">Password</label>
        <input id="login-password" name="password" type="password" required />
      </div>

      <Button type="submit">Log in</Button>

      {submitted ? (
        <p className={styles.status} role="status">
          Authentication is not connected yet.
        </p>
      ) : null}
    </form>
  );
}
