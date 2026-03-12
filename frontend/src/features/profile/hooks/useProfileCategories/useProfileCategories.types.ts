import type { Category } from "../../../post/types/post.type";

export interface UseProfileCategoriesResult {
  categories: Category[];
  categoriesErrorMessage: string | null;
  isLoadingCategories: boolean;
  reloadCategories: () => Promise<void>;
}
