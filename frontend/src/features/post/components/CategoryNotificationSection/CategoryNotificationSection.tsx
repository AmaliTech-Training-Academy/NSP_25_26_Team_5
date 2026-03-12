import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/ui/Button/Button";
import { useToast } from "../../../../context/ToastContext/ToastContext";
import { categoryAPI, type CategorySubscriptionResponse } from "../../api/category.api";
import type { Category } from "../../types/post.type";
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
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string | null>(
    null,
  );
  const [actionCategoryId, setActionCategoryId] = useState<number | null>(null);

  const loadMySubscriptions = useCallback(async (showLoadingState = true) => {
    if (!isAuthenticated) {
      setMySubscriptions([]);
      setSubscriptionsErrorMessage(null);
      setIsLoadingSubscriptions(false);
      return;
    }

    if (showLoadingState) {
      setIsLoadingSubscriptions(true);
      setSubscriptionsErrorMessage(null);
    }

    try {
      const response = await categoryAPI.getMySubscriptions();
      setMySubscriptions(response.data ?? []);
    } catch {
      if (showLoadingState) {
        setSubscriptionsErrorMessage(
          "Unable to load your notification preferences right now. Please try again.",
        );
      }
    } finally {
      if (showLoadingState) {
        setIsLoadingSubscriptions(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadMySubscriptions();
  }, [loadMySubscriptions]);

  const subscriptionsByCategoryId = new Map(
    mySubscriptions.map((subscription) => [
      subscription.categoryId,
      subscription,
    ]),
  );
  const confirmedSubscriptions = mySubscriptions.filter(
    (subscription) => subscription.confirmed,
  );
  const pendingSubscriptions = mySubscriptions.filter(
    (subscription) => !subscription.confirmed,
  );

  const handleSubscribe = async (categoryId: number) => {
    setActionCategoryId(categoryId);

    try {
      await categoryAPI.subscribe(categoryId);
      await loadMySubscriptions(false);
      showToast({
        variant: "success",
        message:
          "Check your email to confirm the subscription. You'll get an email when new posts are added to this category.",
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
      await loadMySubscriptions(false);
      showToast({
        variant: "success",
        message: "Unsubscribed from category notifications.",
      });
    } catch {
      showToast({ variant: "error", message: "Could not unsubscribe." });
    } finally {
      setActionCategoryId(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="Category email notifications">
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h2 className={styles.heading}>Email notifications</h2>
          <p className={styles.hint}>
            Subscribe to categories to receive an email whenever a new post is
            published.
          </p>
        </div>

        <div className={styles.summaryPills} aria-label="Subscription summary">
          <span className={styles.summaryPill}>
            {confirmedSubscriptions.length} active
          </span>
          {pendingSubscriptions.length > 0 && (
            <span className={styles.pendingPill}>
              {pendingSubscriptions.length} pending
            </span>
          )}
        </div>
      </div>

      {isLoadingSubscriptions && (
        <p className={styles.statusMessage} role="status" aria-live="polite">
          Loading your subscriptions...
        </p>
      )}

      {!isLoadingSubscriptions && subscriptionsErrorMessage && (
        <div className={styles.feedbackBlock}>
          <p className={styles.errorMessage} role="alert">
            {subscriptionsErrorMessage}
          </p>
          <Button
            variant="secondary"
            className={styles.retryButton}
            onClick={() => {
              void loadMySubscriptions();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoadingSubscriptions &&
        !subscriptionsErrorMessage &&
        categories.length === 0 && (
          <p className={styles.emptyMessage}>
            No categories are available for email notifications yet.
          </p>
        )}

      {!isLoadingSubscriptions &&
        !subscriptionsErrorMessage &&
        categories.length > 0 && (
          <div className={styles.categoryList}>
            {categories.map((category) => {
              const subscription = subscriptionsByCategoryId.get(category.id);
              const isSubscribed = Boolean(subscription);
              const isPendingConfirmation = Boolean(
                subscription && !subscription.confirmed,
              );
              const isBusy = actionCategoryId === category.id;

              return (
                <div key={category.id} className={styles.categoryRow}>
                  <div className={styles.categoryContent}>
                    <div className={styles.categoryText}>
                      <span className={styles.categoryName}>{category.name}</span>
                      {category.description && (
                        <span className={styles.categoryDescription}>
                          {category.description}
                        </span>
                      )}
                    </div>

                    {isSubscribed && (
                      <span
                        className={
                          isPendingConfirmation
                            ? styles.pendingStatusBadge
                            : styles.subscribedStatusBadge
                        }
                      >
                        {isPendingConfirmation
                          ? "Pending email confirmation"
                          : "Subscribed"}
                      </span>
                    )}
                  </div>

                  <Button
                    variant={isSubscribed ? "secondary" : "primary"}
                    className={styles.actionButton}
                    onClick={() =>
                      isSubscribed
                        ? handleUnsubscribe(category.id)
                        : handleSubscribe(category.id)
                    }
                    disabled={isBusy}
                    aria-busy={isBusy}
                  >
                    {isBusy
                      ? "Updating..."
                      : isSubscribed
                        ? "Unsubscribe"
                        : "Subscribe"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

      {!isLoadingSubscriptions &&
        !subscriptionsErrorMessage &&
        mySubscriptions.length > 0 && (
          <p className={styles.subscribedSummary}>
            {confirmedSubscriptions.length > 0 && (
              <>
                Receiving updates for{" "}
                {confirmedSubscriptions
                  .map((subscription) => subscription.categoryName)
                  .join(", ")}
              </>
            )}
            {pendingSubscriptions.length > 0 && (
              <>
                {confirmedSubscriptions.length > 0 ? ". " : ""}
                Pending confirmation:{" "}
                {pendingSubscriptions
                  .map((subscription) => subscription.categoryName)
                  .join(", ")}
              </>
            )}
            .
          </p>
        )}
    </section>
  );
}
