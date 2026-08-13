import React from "react";
import Link from "next/link";
import styles from "./AuthFormShell.module.css";

interface AuthFormShellProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

/**
 * Shared wrapper for Login + Signup pages.
 * Renders the RFC brand, card container, title, and footer switch link.
 */
export function AuthFormShell({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthFormShellProps) {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.brand} aria-label="REVIVE FIGHT CLUB — Home">
          REVIVE FIGHT CLUB
        </Link>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {children}

        <p className={styles.footer}>
          {footerText}{" "}
          <Link href={footerLinkHref} className={styles.footerLink}>
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
