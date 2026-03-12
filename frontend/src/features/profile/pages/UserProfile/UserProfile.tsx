import { getUserInitials } from "../../../../components/shared/NavBar/NavBar.utils";
import { useAuth } from "../../../../context/AuthContext/AuthContext";
import ProfileView from "../../components/ProfileView";
import { useProfileCategories } from "../../hooks/useProfileCategories/useProfileCategories";
import type { ProfileUserDetails } from "../../types/profile.types";
import { formatRoleLabel } from "../../utils/profile.utils";

export default function UserProfile() {
  const { user } = useAuth();
  const {
    categories,
    categoriesErrorMessage,
    isLoadingCategories,
    reloadCategories,
  } = useProfileCategories();
  const userDetails: ProfileUserDetails = {
    accountEmail: user?.email ?? "Not available",
    accountName: user?.name ?? "Not available",
    heroEmail: user?.email ?? "No email available",
    heroName: user?.name ?? "Resident",
    initials: getUserInitials(user?.name ?? ""),
    roleLabel: formatRoleLabel(user?.role),
  };

  return (
    <ProfileView
      categories={categories}
      categoriesErrorMessage={categoriesErrorMessage}
      isAuthenticated={Boolean(user)}
      isLoadingCategories={isLoadingCategories}
      onRetryCategories={() => {
        void reloadCategories();
      }}
      userDetails={userDetails}
    />
  );
}
