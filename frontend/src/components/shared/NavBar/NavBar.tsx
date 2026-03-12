import { useEffect, useId, useState } from "react";
import styles from "./NavBar.module.css";
import type { NavBarProps } from "./NavBar.types";
import { getUserInitials, joinNavBarClassName } from "./NavBar.utils";
import PingLogoIcon from "../../../assets/Icons/PingLogoIcon";
import MenuIcon from "../../../assets/Icons/MenuIcon";
import ChartColumnIcon from "../../../assets/Icons/ChartColumnIcon";
import LogOutIcon from "../../../assets/Icons/LogOutIcon";
import CloseIcon from "../../../assets/Icons/CloseIcon";

export default function NavBar({
  className,
  user,
  showAnalytics = false,
  variant = "default",
  onMenuClick,
  onAnalyticsClick,
  onProfileClick,
  onLogoutClick,
}: NavBarProps) {
  const isAnalyticsVariant = variant === "analytics";
  const isProfileVariant = variant === "profile";
  const navBarClassName = joinNavBarClassName(
    styles.navBar,
    isAnalyticsVariant ? styles.analyticsPageNavBar : undefined,
    className,
  );
  const initials = user ? user.initials ?? getUserInitials(user.name) : "";
  const mobileMenuId = useId();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsMobileMenuOpen(false);
    }
  }, [user]);

  function handleOpenMobileMenu() {
    onMenuClick?.();
    setIsMobileMenuOpen(true);
  }

  function handleCloseMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function handleAnalyticsAction() {
    setIsMobileMenuOpen(false);
    onAnalyticsClick?.();
  }

  function handleProfileAction() {
    setIsMobileMenuOpen(false);
    onProfileClick?.();
  }

  function handleLogoutAction() {
    setIsMobileMenuOpen(false);
    onLogoutClick?.();
  }

  return (
    <>
      <header className={navBarClassName}>
        <div className={styles.mobileContent}>
          <PingLogoIcon className={styles.mobileLogo} />

          {user && (
            <button
              type="button"
              className={styles.iconOnlyButton}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileMenuId}
              onClick={handleOpenMobileMenu}
            >
              <MenuIcon className={styles.mobileMenuIcon} />
            </button>
          )}
        </div>

        <div className={styles.desktopContent}>
          <PingLogoIcon className={styles.desktopLogo} />

          {user && (
            <div className={styles.desktopActions}>
              {showAnalytics && (
                <button
                  type="button"
                  className={joinNavBarClassName(
                    styles.desktopActionButton,
                    isAnalyticsVariant ? styles.analyticsActionButton : undefined,
                  )}
                  onClick={handleAnalyticsAction}
                  disabled={isAnalyticsVariant}
                  aria-current={isAnalyticsVariant ? "page" : undefined}
                >
                  <ChartColumnIcon
                    className={joinNavBarClassName(
                      styles.actionIcon,
                      isAnalyticsVariant
                        ? styles.analyticsPageAnalyticsIcon
                        : styles.analyticsIcon,
                    )}
                  />
                  <span
                    className={joinNavBarClassName(
                      styles.analyticsText,
                      isAnalyticsVariant
                        ? styles.analyticsPageAnalyticsText
                        : undefined,
                    )}
                  >
                    Analytics
                  </span>
                </button>
              )}

              <button
                type="button"
                className={joinNavBarClassName(
                  styles.userInfoButton,
                  isProfileVariant ? styles.activeUserInfoButton : undefined,
                )}
                onClick={handleProfileAction}
                disabled={isProfileVariant}
                aria-current={isProfileVariant ? "page" : undefined}
              >
                <span
                  className={joinNavBarClassName(
                    styles.avatar,
                    isProfileVariant ? styles.activeAvatar : undefined,
                  )}
                >
                  {initials}
                </span>
                <span className={styles.userText}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </span>
              </button>

              <button
                type="button"
                className={joinNavBarClassName(
                  styles.desktopActionButton,
                  styles.logoutActionButton,
                )}
                onClick={handleLogoutAction}
              >
                <LogOutIcon className={styles.actionIcon} />
                <span className={styles.logoutText}>Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <aside
          id={mobileMenuId}
          className={joinNavBarClassName(
            styles.mobileSidebar,
            isMobileMenuOpen ? styles.mobileSidebarOpen : undefined,
          )}
          aria-label="Mobile menu"
        >
          <div className={styles.mobileSidebarTop}>
            <button
              type="button"
              className={joinNavBarClassName(
                styles.mobileSidebarProfileButton,
                isProfileVariant ? styles.activeUserInfoButton : undefined,
              )}
              onClick={handleProfileAction}
              disabled={isProfileVariant}
              aria-current={isProfileVariant ? "page" : undefined}
            >
              <span
                className={joinNavBarClassName(
                  styles.mobileSidebarAvatar,
                  isProfileVariant ? styles.activeAvatar : undefined,
                )}
              >
                {initials}
              </span>
              <span className={styles.mobileSidebarUserText}>
                <span className={styles.mobileSidebarUserName}>{user.name}</span>
                <span className={styles.mobileSidebarUserEmail}>{user.email}</span>
              </span>
            </button>

            <button
              type="button"
              className={styles.sidebarCloseButton}
              aria-label="Close menu"
              onClick={handleCloseMobileMenu}
            >
              <CloseIcon className={styles.sidebarCloseIcon} />
            </button>
          </div>

          <div className={styles.mobileSidebarActions}>
            {showAnalytics && (
              <button
                type="button"
                className={styles.mobileActionButton}
                onClick={handleAnalyticsAction}
                disabled={isAnalyticsVariant}
                aria-current={isAnalyticsVariant ? "page" : undefined}
              >
                <ChartColumnIcon
                  className={joinNavBarClassName(
                    styles.actionIcon,
                    styles.analyticsIcon,
                  )}
                />
                <span className={styles.analyticsText}>Analytics</span>
              </button>
            )}

            {showAnalytics && (
              <div className={styles.mobileSidebarDivider} aria-hidden="true" />
            )}

            <button
              type="button"
              className={joinNavBarClassName(
                styles.mobileActionButton,
                styles.mobileLogoutActionButton,
              )}
              onClick={handleLogoutAction}
            >
              <LogOutIcon className={styles.actionIcon} />
              <span className={styles.logoutText}>Log out</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
