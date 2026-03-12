import { useCallback, useEffect, useState } from "react";
import { categoryAPI, type CategorySubscriptionResponse } from "../../api/category.api";
import type { Category } from "../../types/post.type";
import { useToast } from "../../../../context/ToastContext/ToastContext";
import styles from "./CategoryNotificationSection.module.css";

interface CategoryNotificationSectionProps {
  categories: Category[];
  isAuthenticated: boolean;
}

export default function CategoryNotificationSection({
  categories,
  isAuthenticated,
}: CategoryNotificationSectionProps) {
  const { showToast } = useToast();
  const [mySubscriptions, setMySubscriptions] = useState<CategorySubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionCategoryId, setActionCategoryId] = useState<number | null>(null);

  const loadMySubscriptions = useCallback(async () => {
    if (!isAuthenticated) {
      setMySubscriptions([]);
      return;
    }
    try {
      const res = await categoryAPI.getMySubscriptions();
      setMySubscriptions(res.data ?? []);
    } catch {
      setMySubscriptions([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadMySubscriptions();
  }, [loadMySubscriptions]);

  const subscribedIds = new Set(mySubscriptions.map((s) => s.categoryId));

  const handleSubscribe = async (categoryId: number) => {
    setActionCategoryId(categoryId);
    try {
      await categoryAPI.subscribe(categoryId);
      await loadMySubscriptions();
      showToast({
        variant: "success",
        message: "Check your email to confirm the subscription. You'll get an email when new posts are added to this category.",
      });
    } catch {
      showToast({
        variant: "error",
        message: "Could not subscribe. Check that email is configured.",
      });
    } finally {
      setActionCategoryId(null);
    }
  };

  const handleUnsubscribe = async (categoryId: number) => {
    setActionCategoryId(categoryId);
    try {
      await categoryAPI.unsubscribe(categoryId);
      await loadMySubscriptions();
      showToast({ variant: "success", message: "Unsubscribed from category notifications." });
    } catch {
      showToast({ variant: "error", message: "Could not unsubscribe." });
    } finally {
      setActionCategoryId(null);
    }
  };

  if (!isAuthenticated || categories.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Category email notifications">
      <h3 className={styles.heading}>Email notifications</h3>
      <p className={styles.hint}>
        Subscribe to a category to receive an email when a new post is created in it.
      </p>
      <div className={styles.categoryList}>
        {categories.map((cat) => {
          const isSubscribed = subscribedIds.has(cat.id);
          const busy = actionCategoryId === cat.id;
          return (
            <div key={cat.id} className={styles.categoryRow}>
              <span className={styles.categoryName}>{cat.name}</span>
              {isSubscribed ? (
                <button
                  type="button"
                  className={styles.unsubscribeBtn}
                  onClick={() => handleUnsubscribe(cat.id)}
                  disabled={loading || busy}
                  aria-busy={busy}
                >
                  {busy ? "…" : "Unsubscribe"}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.subscribeBtn}
                  onClick={() => handleSubscribe(cat.id)}
                  disabled={loading || busy}
                  aria-busy={busy}
                >
                  {busy ? "…" : "Subscribe"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {mySubscriptions.length > 0 && (
        <p className={styles.subscribedSummary}>
          Subscribed to: {mySubscriptions.map((s) => s.categoryName).join(", ")}
        </p>
      )}
    </section>
  );
}
