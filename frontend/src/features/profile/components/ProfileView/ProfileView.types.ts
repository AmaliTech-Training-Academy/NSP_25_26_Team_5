import type { Category } from "../../../post/types/post.type";
import type { ProfileUserDetails } from "../../types/profile.types";

export interface ProfileViewProps {
  categories: Category[];
  categoriesErrorMessage: string | null;
  isAuthenticated: boolean;
  isLoadingCategories: boolean;
  onRetryCategories: () => void;
  userDetails: ProfileUserDetails;
}
