"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

import styles from "./SignupForm.module.css";

export function SignupForm() {
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
        <label htmlFor="signup-name">Name</label>
        <input id="signup-name" name="name" type="text" required />
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" name="email" type="email" required />
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" name="password" type="password" required />
      </div>

      <Button type="submit">Sign up</Button>

      {submitted ? (
        <p className={styles.status} role="status">
          Account creation is not connected yet.
        </p>
      ) : null}
    </form>
  );
}
