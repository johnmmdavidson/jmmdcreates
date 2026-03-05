import Link from "next/link";
import styles from "./Header.module.css";

interface HeaderProps {
  artistName: string;
}

export function Header({ artistName }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.name}>
          {artistName}
        </Link>
        <nav className={styles.nav}>
          <Link href="/bio" className={styles.navLink}>
            Bio
          </Link>
        </nav>
      </div>
    </header>
  );
}
