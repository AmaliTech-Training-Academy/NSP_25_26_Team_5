import { useNavigate } from "react-router";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import MailIcon from "../../../../assets/Icons/MailIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import Button from "../../../../components/ui/Button/Button";
import CategoryNotificationSection from "../../../post/components/CategoryNotificationSection";
import type { ProfileViewProps } from "./ProfileView.types";
import styles from "./ProfileView.module.css";

export default function ProfileView({
  categories,
  categoriesErrorMessage,
  isAuthenticated,
  isLoadingCategories,
  onRetryCategories,
  userDetails,
}: ProfileViewProps) {
  const navigate = useNavigate();
  const breadcrumbItems = [
    {
      id: "home",
      label: "Home",
      icon: <HouseIcon />,
      onClick: () => navigate("/"),
    },
    {
      id: "profile",
      label: "User Profile",
      icon: <MailIcon />,
    },
  ];

  return (
    <main className={styles.profilePage}>
      <section className={styles.content}>
        <h1 className={styles.screenReaderOnly}>User Profile</h1>

        <Breadcrumbs className={styles.breadcrumbs} items={breadcrumbItems} />

        <section className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>User Profile</p>
            <h2 className={styles.heroTitle}>
              Manage your email notification subscriptions
            </h2>
            <p className={styles.heroDescription}>
              Choose which community categories should send updates to your inbox
              and review the account information tied to those emails.
            </p>
          </div>

          <div className={styles.heroIdentity}>
            <div className={styles.heroAvatar} aria-hidden="true">
              {userDetails.initials}
            </div>
            <div className={styles.heroUserText}>
              <p className={styles.heroUserName}>{userDetails.heroName}</p>
              <p className={styles.heroUserEmail}>{userDetails.heroEmail}</p>
            </div>
          </div>
        </section>

        <section className={styles.profileGrid} aria-label="Profile details">
          <article className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon} aria-hidden="true">
                <MailIcon />
              </div>
              <div className={styles.cardHeaderCopy}>
                <h2 className={styles.cardTitle}>Account details</h2>
                <p className={styles.cardDescription}>
                  Subscription confirmations and notification emails are sent to
                  this account.
                </p>
              </div>
            </div>

            <dl className={styles.detailList}>
              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>Full name</dt>
                <dd className={styles.detailValue}>{userDetails.accountName}</dd>
              </div>

              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>Email address</dt>
                <dd className={styles.detailValue}>{userDetails.accountEmail}</dd>
              </div>

              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>Access level</dt>
                <dd className={styles.detailValue}>{userDetails.roleLabel}</dd>
              </div>
            </dl>
          </article>

          <article className={styles.notificationCard}>
            {isLoadingCategories && (
              <p className={styles.statusMessage} role="status" aria-live="polite">
                Loading notification categories...
              </p>
            )}

            {!isLoadingCategories && categoriesErrorMessage && (
              <div className={styles.feedbackBlock}>
                <p className={styles.errorMessage} role="alert">
                  {categoriesErrorMessage}
                </p>
                <Button
                  variant="secondary"
                  className={styles.retryButton}
                  onClick={onRetryCategories}
                >
                  Retry
                </Button>
              </div>
            )}

            {!isLoadingCategories && !categoriesErrorMessage && (
              <CategoryNotificationSection
                categories={categories}
                isAuthenticated={isAuthenticated}
              />
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
