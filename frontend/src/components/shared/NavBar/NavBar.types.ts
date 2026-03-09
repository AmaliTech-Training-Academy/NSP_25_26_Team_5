export interface NavBarUser {
  name: string;
  email: string;
  initials?: string;
}

export interface NavBarProps {
  className?: string;
  user?: NavBarUser;
  onMenuClick?: () => void;
  onAnalyticsClick?: () => void;
  onLogoutClick?: () => void;
}
