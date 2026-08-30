import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import type { ButtonVariant } from "./Button";
import styles from "./Button.module.css";

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
};

export function LinkButton({
  className,
  variant = "primary",
  ...props
}: LinkButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return <Link className={classes} {...props} />;
}
