import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Login | PhytoWorks Shop",
  description: "PhytoWorks Shop 로그인",
};

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <section className={styles.panel} aria-labelledby="login-heading">
        <div className={styles.headingGroup}>
          <p className={styles.eyebrow}>Account</p>
          <h1 id="login-heading">Login</h1>
          <p className={styles.description}>Sign in to continue.</p>
        </div>
        <LoginForm />
      </section>
      <p className={styles.signupPrompt}>
        <span>New to PhytoWorks?</span>
        <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
