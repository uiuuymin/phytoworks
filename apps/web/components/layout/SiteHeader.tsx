"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type KeyboardEvent, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";

import styles from "./SiteHeader.module.css";

const navigationItems = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
] as const;

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { totalQuantity, hasHydrated } = useCart();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeNavigation() {
    setIsNavigationOpen(false);
  }

  function handleHeaderKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || !isNavigationOpen) {
      return;
    }

    closeNavigation();
    menuButtonRef.current?.focus();
  }

  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#main-content">
        본문으로 건너뛰기
      </a>

      <div className={`container ${styles.inner}`}>
        <Link className={styles.brand} href="/" onClick={closeNavigation}>
          <span>PhytoWorks</span>
          <span className={styles.brandLabel}>Shop Demo</span>
        </Link>

        <nav
          id="primary-navigation"
          className={`${styles.navigation} ${
            isNavigationOpen ? styles.navigationOpen : ""
          }`}
          aria-label="주요 메뉴"
        >
          <ul className={styles.navigationList}>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  className={styles.navigationLink}
                  href={item.href}
                  aria-current={
                    isCurrentRoute(pathname, item.href) ? "page" : undefined
                  }
                  onClick={closeNavigation}
                  onKeyDown={handleHeaderKeyDown}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.utilities}>
          <nav className={styles.language} aria-label="Language selection">
            <span className={styles.languageActive}>KR</span>
            <span className={styles.divider} aria-hidden="true" />
            <span aria-disabled="true">EN</span>
          </nav>

          <span className={styles.utilityDivider} aria-hidden="true">
            |
          </span>

          <Link
            className={styles.searchLink}
            href="/search"
            aria-current={
              isCurrentRoute(pathname, "/search") ? "page" : undefined
            }
            onClick={closeNavigation}
            onKeyDown={handleHeaderKeyDown}
          >
            Search
          </Link>

          <span className={styles.utilityDivider} aria-hidden="true">
            |
          </span>

          <Link
            className={styles.cartLink}
            href="/cart"
            aria-label={
              hasHydrated && totalQuantity > 0
                ? `장바구니, 총 ${totalQuantity}개`
                : "장바구니"
            }
            aria-current={
              isCurrentRoute(pathname, "/cart") ? "page" : undefined
            }
            onClick={closeNavigation}
            onKeyDown={handleHeaderKeyDown}
          >
            <span>Cart</span>
            {hasHydrated && totalQuantity > 0 ? (
              <span className={styles.cartCount} aria-hidden="true">
                {totalQuantity}
              </span>
            ) : null}
          </Link>

          <span className={styles.utilityDivider} aria-hidden="true">
            |
          </span>

          <Link
            className={styles.loginLink}
            href="/login"
            aria-current={
              isCurrentRoute(pathname, "/login") ? "page" : undefined
            }
            onClick={closeNavigation}
            onKeyDown={handleHeaderKeyDown}
          >
            Login
          </Link>

          <Button
            ref={menuButtonRef}
            className={styles.menuButton}
            variant="secondary"
            aria-controls="primary-navigation"
            aria-expanded={isNavigationOpen}
            onClick={() => setIsNavigationOpen((isOpen) => !isOpen)}
            onKeyDown={handleHeaderKeyDown}
          >
            {isNavigationOpen ? "메뉴 닫기" : "메뉴"}
          </Button>
        </div>
      </div>
    </header>
  );
}
