import { useCallback, useEffect, useState } from "react";
import { categoryAPI } from "../../../post/api/category.api";
import type { Category } from "../../../post/types/post.type";
import type { UseProfileCategoriesResult } from "./useProfileCategories.types";

export function useProfileCategories(): UseProfileCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesErrorMessage, setCategoriesErrorMessage] = useState<string | null>(
    null,
  );

  const reloadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    setCategoriesErrorMessage(null);

    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data ?? []);
    } catch {
      setCategories([]);
      setCategoriesErrorMessage(
        "Unable to load notification categories right now. Please try again.",
      );
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    void reloadCategories();
  }, [reloadCategories]);

  return {
    categories,
    categoriesErrorMessage,
    isLoadingCategories,
    reloadCategories,
  };
}
