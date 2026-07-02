import { useCallback, useEffect, useState } from "react";
import type { ProviderStatusPayload } from "../lib/api-types";

const initialProviderStatus: ProviderStatusPayload = {
  status: "unknown",
  provider: "sconosciuto",
  model: null
};

export function useProviderStatus() {
  const [providerStatus, setProviderStatus] =
    useState<ProviderStatusPayload>(initialProviderStatus);

  const refreshProviderStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error(`Health check fallito con HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as Partial<ProviderStatusPayload>;

      setProviderStatus({
        status: "ok",
        service: payload.service,
        provider: payload.provider ?? "sconosciuto",
        model: payload.model ?? null,
        llm: payload.llm ?? null,
        timestamp: payload.timestamp
      });
    } catch (error) {
      setProviderStatus({
        status: "offline",
        provider: "backend offline",
        model: null,
        llm: null,
        detail:
          error instanceof Error
            ? error.message
            : "Health check non raggiungibile."
      });
    }
  }, []);

  useEffect(() => {
    void refreshProviderStatus();
  }, [refreshProviderStatus]);

  return {
    providerStatus,
    refreshProviderStatus
  };
}
