"use client";

import { useEffect, useCallback, useRef } from "react";

type SSEHandler = (data: unknown) => void;

export function useSSE(onMessage: SSEHandler) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connectSSE = useCallback(() => {
    const es = new EventSource("/api/notifications/sse");

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessageRef.current(parsed);
      } catch {
        // Ignore non-JSON messages (e.g. pings)
      }
    };

    es.onerror = () => {
      es.close();
      // Reconnect after 5 seconds
      setTimeout(connectSSE, 5000);
    };

    return es;
  }, []);

  useEffect(() => {
    const es = connectSSE();
    return () => es.close();
  }, [connectSSE]);
}
