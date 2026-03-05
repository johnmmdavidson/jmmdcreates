import styles from "./Footer.module.css";

interface FooterProps {
  contactEmail: string;
  artistName: string;
}

export function Footer({ contactEmail, artistName }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <a href={`mailto:${contactEmail}`} className={styles.email}>
          {contactEmail}
        </a>
        <p className={styles.copyright}>
          &copy; {year} {artistName}
        </p>
      </div>
    </footer>
  );
}
