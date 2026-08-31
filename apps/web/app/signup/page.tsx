import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/SignupForm";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sign up | PhytoWorks Shop",
  description: "Create a PhytoWorks Shop account.",
};

export default function SignupPage() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <section className={styles.panel} aria-labelledby="signup-heading">
        <div className={styles.headingGroup}>
          <p className={styles.eyebrow}>Account</p>
          <h1 id="signup-heading">Sign up</h1>
          <p className={styles.description}>Create an account to continue.</p>
        </div>
        <SignupForm />
      </section>
      <p className={styles.loginPrompt}>
        <span>Already have an account?</span>
        <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
