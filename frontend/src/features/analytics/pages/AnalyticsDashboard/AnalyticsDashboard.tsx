import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import MessageCircleMoreIcon from "../../../../assets/Icons/MessageCircleMoreIcon";
import TrendingUpIcon from "../../../../assets/Icons/TrendingUpIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import { analyticsAPI } from "../../api/analytics.api";
import AnalyticsBarChart from "../../components/AnalyticsBarChart/AnalyticsBarChart";
import type {
  AnalyticsContributorRow,
  AnalyticsDashboardData,
} from "../../types/analytics.types";
import {
  buildContributorRows,
  createEmptyAnalyticsDashboard,
  findContributorSearchValue,
  getAnalyticsErrorMessage,
  normalizeAnalyticsDashboard,
} from "../../utils/analytics.utils";
import styles from "./AnalyticsDashboard.module.css";

const REFRESH_INTERVAL_MS = 30_000;

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const hasLoadedDashboardRef = useRef(false);
  const [dashboard, setDashboard] = useState<AnalyticsDashboardData>(
    createEmptyAnalyticsDashboard(),
  );
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardErrorMessage, setDashboardErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isUnmounted = false;

    async function loadDashboard(showLoadingState: boolean) {
      if (showLoadingState) {
        setIsLoadingDashboard(true);
      }

      try {
        const response = await analyticsAPI.getDashboard();

        if (isUnmounted) {
          return;
        }

        setDashboard(normalizeAnalyticsDashboard(response));
        setDashboardErrorMessage(null);
        hasLoadedDashboardRef.current = true;
      } catch (error) {
        if (isUnmounted || hasLoadedDashboardRef.current) {
          return;
        }

        setDashboardErrorMessage(getAnalyticsErrorMessage(error));
      } finally {
        if (!isUnmounted && showLoadingState) {
          setIsLoadingDashboard(false);
        }
      }
    }

    void loadDashboard(true);

    const intervalId = window.setInterval(() => {
      void loadDashboard(false);
    }, REFRESH_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadDashboard(false);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isUnmounted = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const breadcrumbItems = [
    {
      id: "home",
      label: "Home",
      icon: <HouseIcon />,
      onClick: () => navigate("/"),
    },
    {
      id: "analytics",
      label: "Analytics",
    },
  ];

  const contributorRows = useMemo<AnalyticsContributorRow[]>(
    () => buildContributorRows(dashboard.topContributors),
    [dashboard.topContributors],
  );
  const isPostsEmpty = dashboard.totalPosts === 0;
  const isCommentsEmpty = dashboard.totalComments === 0;
  const isCategoryChartEmpty = dashboard.postsPerCategory.every(
    (bucket) => bucket.totalPosts === 0,
  );
  const isDayChartEmpty = dashboard.postsPerDayOfWeek.every(
    (bucket) => bucket.totalPosts === 0,
  );

  function handleContributorClick(row: AnalyticsContributorRow) {
    if (row.isPlaceholder) {
      return;
    }

    const params = new URLSearchParams({
      author: findContributorSearchValue(row),
      authorName: row.contributorName,
    });

    navigate(`/?${params.toString()}`);
  }

  return (
    <main className={styles.analyticsPage}>
      <section className={styles.content}>
        <h1 className={styles.screenReaderOnly}>Analytics Dashboard</h1>

        <Breadcrumbs className={styles.breadcrumbs} items={breadcrumbItems} />

        {isLoadingDashboard && (
          <p className={styles.statusMessage} role="status" aria-live="polite">
            Loading dashboard...
          </p>
        )}

        {!isLoadingDashboard && dashboardErrorMessage && (
          <p className={styles.errorMessage} role="alert">
            {dashboardErrorMessage}
          </p>
        )}

        {!dashboardErrorMessage && (
          <>
            <section className={styles.statsGrid} aria-label="Summary statistics">
              <article className={styles.statCard}>
                <div className={styles.statCardTop}>
                  <p className={styles.statLabel}>Total Posts</p>
                  <span className={styles.statIconWrapper} aria-hidden="true">
                    <TrendingUpIcon className={styles.statIcon} />
                  </span>
                </div>
                <p className={styles.statValue}>{dashboard.totalPosts}</p>
                {isPostsEmpty && (
                  <p className={styles.emptyHint}>
                    No posts yet. Residents can start the first conversation.
                  </p>
                )}
              </article>

              <article className={styles.statCard}>
                <div className={styles.statCardTop}>
                  <p className={styles.statLabel}>Total Comments</p>
                  <span className={styles.statIconWrapper} aria-hidden="true">
                    <MessageCircleMoreIcon className={styles.statIcon} />
                  </span>
                </div>
                <p className={styles.statValue}>
                  {dashboard.totalComments ?? "--"}
                </p>
                {isCommentsEmpty && (
                  <p className={styles.emptyHint}>
                    No comments yet. Residents can reply to keep discussions moving.
                  </p>
                )}
              </article>
            </section>

            <section className={styles.visualGrid} aria-label="Analytics charts">
              <article className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Posts by Category</h2>
                <AnalyticsBarChart
                  labels={dashboard.postsPerCategory.map((bucket) => bucket.categoryName)}
                  values={dashboard.postsPerCategory.map((bucket) => bucket.totalPosts)}
                  ariaLabel="Posts by category bar chart"
                />
                {isCategoryChartEmpty && (
                  <p className={styles.emptyHint}>
                    Nothing here yet. Start posting to populate the category chart.
                  </p>
                )}
              </article>

              <article className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Posts Day of Week</h2>
                <AnalyticsBarChart
                  labels={dashboard.postsPerDayOfWeek.map((bucket) => bucket.dayOfWeek)}
                  values={dashboard.postsPerDayOfWeek.map((bucket) => bucket.totalPosts)}
                  ariaLabel="Posts by day of week bar chart"
                />
                {isDayChartEmpty && (
                  <p className={styles.emptyHint}>
                    No posting pattern yet. New posts will fill the weekly chart.
                  </p>
                )}
              </article>
            </section>

            <section className={styles.contributorsSection}>
              <h2 className={styles.tableTitle}>Top 10 Contributors</h2>

              <div className={styles.tableCard}>
                <div className={styles.tableOverflow}>
                  <table className={styles.table}>
                    <colgroup>
                      <col className={styles.rankColumn} />
                      <col />
                      <col className={styles.postsColumn} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Name</th>
                        <th scope="col">Posts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributorRows.length === 0 ? (
                        <tr>
                          <td className={styles.emptyTableCell} colSpan={3}>
                            No contributors yet. Residents can start posting to appear here.
                          </td>
                        </tr>
                      ) : (
                        contributorRows.map((row) => (
                          <tr key={`${row.rank}-${row.contributorName}`}>
                            <td>{row.rank}</td>
                            <td>
                              {row.isPlaceholder ? (
                                <span className={styles.placeholderContributor}>
                                  {row.contributorName}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.contributorLink}
                                  onClick={() => handleContributorClick(row)}
                                >
                                  {row.contributorName}
                                </button>
                              )}
                            </td>
                            <td>{row.totalPosts}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
