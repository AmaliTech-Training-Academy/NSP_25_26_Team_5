import { useNavigate } from "react-router";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import PingLogoIcon from "../../../../assets/Icons/PingLogoIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import Button from "../../../../components/ui/Button/Button";
import styles from "./PostNotFound.module.css";

// Renders the empty state used when a post route does not resolve to a post.
export default function PostNotFound() {
  const navigate = useNavigate();
  const breadcrumbItems = [
    {
      id: "home",
      label: "Home",
      icon: <HouseIcon />,
      onClick: () => navigate("/"),
    },
    {
      id: "not-found",
      label: "Not Found Post",
    },
  ];

  return (
    <main className={styles.postNotFoundPage}>
      <section className={styles.content}>
        <Breadcrumbs className={styles.breadcrumbs} items={breadcrumbItems} />

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
                <h1 className={styles.title}>Post not found</h1>
                <p className={styles.subtitle}>
                  The post you&apos;re trying to reach does not exist or has been
                  removed.
                </p>
              </div>
            </header>

            <div className={styles.copySection}>
              <p className={styles.description}>
                Return to the home feed to keep exploring your community updates.
              </p>
            </div>

            <Button
              variant="primary"
              className={styles.actionButton}
              onClick={() => navigate("/")}
            >
              Go home
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}
