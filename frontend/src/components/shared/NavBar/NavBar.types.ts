export interface NavBarUser {
  name: string;
  email: string;
  initials?: string;
}

export interface NavBarProps {
  className?: string;
  user?: NavBarUser;
  showAnalytics?: boolean;
  variant?: "default" | "analytics";
  onMenuClick?: () => void;
  onAnalyticsClick?: () => void;
  onLogoutClick?: () => void;
}
