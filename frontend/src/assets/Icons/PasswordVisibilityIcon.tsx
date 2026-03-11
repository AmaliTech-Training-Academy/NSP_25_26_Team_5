import EyeOffIcon from "./EyeIcon/EyeOffIcon";
import EyeOnIcon from "./EyeIcon/EyeOnIcon";
import type { PasswordVisibilityIconProps } from "./PasswordVisibilityIcon.types";

// Renders a reusable button that toggles password visibility state.
export default function PasswordVisibilityIcon({
  className,
  showPassword,
  onToggle,
}: PasswordVisibilityIconProps) {
  
  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOnIcon /> : <EyeOffIcon />}
    </button>
  );
}
