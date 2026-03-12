import { useId } from "react";
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
  variant = "default",
  onMenuClick,
  onAnalyticsClick,
  onLogoutClick,
}: NavBarProps) {
  const isAnalyticsVariant = variant === "analytics";
  const navBarClassName = joinNavBarClassName(
    styles.navBar,
    isAnalyticsVariant ? styles.analyticsPageNavBar : undefined,
    className,
  );
  const initials = user ? user.initials ?? getUserInitials(user.name) : "";
  const mobileMenuToggleId = useId();

  return (
    <>
      {user && (
        <input
          id={mobileMenuToggleId}
          type="checkbox"
          className={styles.mobileMenuToggle}
          aria-hidden="true"
        />
      )}

      <header className={navBarClassName}>
        <div className={styles.mobileContent}>
          <PingLogoIcon className={styles.mobileLogo} />

          {user && (
            <label
              htmlFor={mobileMenuToggleId}
              className={styles.iconOnlyButton}
              aria-label="Open menu"
              onClick={onMenuClick}
            >
              <MenuIcon className={styles.mobileMenuIcon} />
            </label>
          )}
        </div>

        <div className={styles.desktopContent}>
          <PingLogoIcon className={styles.desktopLogo} />

          {user && (
            <div className={styles.desktopActions}>
              <button
                type="button"
                className={joinNavBarClassName(
                  styles.desktopActionButton,
                  isAnalyticsVariant ? styles.analyticsActionButton : undefined,
                )}
                onClick={onAnalyticsClick}
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

              <div className={styles.userInfo}>
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.userText}>
                  <p className={styles.userName}>{user.name}</p>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                className={joinNavBarClassName(
                  styles.desktopActionButton,
                  styles.logoutActionButton,
                )}
                onClick={onLogoutClick}
              >
                <LogOutIcon className={styles.actionIcon} />
                <span className={styles.logoutText}>Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <aside className={styles.mobileSidebar} aria-label="Mobile menu">
          <div className={styles.mobileSidebarTop}>
            <div className={styles.mobileSidebarUserInfo}>
              <div className={styles.mobileSidebarAvatar}>{initials}</div>
              <div className={styles.mobileSidebarUserText}>
                <p className={styles.mobileSidebarUserName}>{user.name}</p>
                <p className={styles.mobileSidebarUserEmail}>{user.email}</p>
              </div>
            </div>

            <label
              htmlFor={mobileMenuToggleId}
              className={styles.sidebarCloseButton}
              aria-label="Close menu"
            >
              <CloseIcon className={styles.sidebarCloseIcon} />
            </label>
          </div>

          <div className={styles.mobileSidebarActions}>
            <button
              type="button"
              className={styles.mobileActionButton}
              onClick={onAnalyticsClick}
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

            <div className={styles.mobileSidebarDivider} aria-hidden="true" />

            <button
              type="button"
              className={joinNavBarClassName(
                styles.mobileActionButton,
                styles.mobileLogoutActionButton,
              )}
              onClick={onLogoutClick}
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
