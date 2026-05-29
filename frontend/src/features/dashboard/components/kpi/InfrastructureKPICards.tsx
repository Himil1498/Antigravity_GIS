import React from "react";
import { useInfrastructureStats } from '../../hooks/useInfrastructureStats';
import { getInfraTypeCards, getTotalCard } from '../../utils/cardDataHelpers';
import KPICard from './KPICard';
import TotalCard from './TotalCard';
import CustomerBreakdownCard from './CustomerBreakdownCard';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

interface InfrastructureKPICardsProps {
  userDataOnly?: boolean;
}

const InfrastructureKPICards: React.FC<InfrastructureKPICardsProps> = ({
  userDataOnly = true,
}) => {
  const { stats, loading, error, refetch } = useInfrastructureStats(userDataOnly);

  if (loading && !stats) {
    return <LoadingState />;
  }

  if (error || !stats) {
    return <ErrorState error={error || "Unknown error"} onRetry={refetch} />;
  }

  const infraTypeCards = getInfraTypeCards(stats);
  const totalCard = getTotalCard(stats);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <div className="h-6 w-1 bg-cyan-600 dark:bg-cyan-500 rounded-full"></div>
              Infrastructure Overview{" "}
              {userDataOnly && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  (Your Data)
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 ml-4">
              {userDataOnly
                ? "Real-time monitoring of your infrastructure assets"
                : "Real-time monitoring of all infrastructure assets across all users"}
            </p>
          </div>
        </section>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {infraTypeCards.map((card, index) =>
          card.title === "Customers" ? (
            <CustomerBreakdownCard key={index} card={card} stats={stats} />
          ) : (
            <KPICard key={index} card={card} />
          )
        )}
      </div>

      <div className="flex justify-center mt-8">
        <div className="w-full max-w-2xl">
          <TotalCard card={totalCard} stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default InfrastructureKPICards;

