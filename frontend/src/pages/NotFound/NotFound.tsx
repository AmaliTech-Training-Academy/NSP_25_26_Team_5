import { useNavigate } from "react-router";
import PingLogoIcon from "../../assets/Icons/PingLogoIcon";
import Button from "../../components/ui/Button/Button";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className={styles.notFoundLayout}>
      <section className={styles.notFoundCard}>
        <div className={styles.notFoundCardContent}>
          <header className={styles.headerSection}>
            <div className={styles.statusPill}>404</div>

            <div className={styles.logo} aria-label="Ping">
              <PingLogoIcon
                className={styles.logoSvg}
                role="img"
                aria-label="Ping"
              />
            </div>

            <div className={styles.titleGroup}>
              <h1 className={styles.title}>Page not found</h1>
              <p className={styles.subtitle}>
                The page you&apos;re trying to reach does not exist or has been moved.
              </p>
            </div>
          </header>

          <div className={styles.copySection}>
            <p className={styles.description}>
              Return to the login page to continue into the community board.
            </p>
          </div>

          <Button
            variant="primary"
            className={styles.loginButton}
            onClick={() => navigate("/login")}
          >
            Go to login
          </Button>
        </div>
      </section>
    </main>
  );
}
