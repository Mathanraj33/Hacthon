import type { ReactNode } from "react";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";

type QueryStateProps<T> = {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  onRetry?: (() => void) | undefined;
  loadingLabel?: string;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: (data: T) => ReactNode;
};

/**
 * Shared loading / error / empty handling so every module page behaves the
 * same way once real data sources are wired in.
 */
export function QueryState<T>({
  isLoading,
  isError,
  data,
  onRetry,
  loadingLabel = "Loading data",
  isEmpty,
  emptyTitle = "Nothing to show yet",
  emptyDescription = "Connect a data source to populate this module.",
  children,
}: QueryStateProps<T>) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoadingSpinner size="lg" label={loadingLabel} />
      </div>
    );
  }

  if (isError || data === undefined) {
    return onRetry ? <ErrorState onRetry={onRetry} /> : <ErrorState />;
  }

  if (isEmpty?.(data)) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children(data)}</>;
}
