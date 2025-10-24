import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";

const TelemetryContext = createContext(null);

export function TelemetryProvider({ deviceId, children }) {
  const [telemetry, setTelemetry] = useState({});
  const wsRef = useRef(null);

  const username = import.meta.env.VITE_THINGBOARD_USER_EMAIL;
  const password = import.meta.env.VITE_THINGBOARD_USER_PASSWORD;
  const TB_HOST = import.meta.env.VITE_TB_HOST;
  const WS_URL = import.meta.env.VITE_WS_URL;

  useEffect(() => {
    let ws;

    async function connect() {
      try {
        const resp = await axios.post(`${TB_HOST}/api/auth/login`, {
          username,
          password,
        });
        const jwtToken = resp.data.token;

        ws = new WebSocket(`${WS_URL}?token=${jwtToken}`);
        wsRef.current = ws;

        ws.onopen = () => {
          const msg = {
            tsSubCmds: [
              {
                entityType: "DEVICE",
                entityId: deviceId,
                scope: "LATEST_TELEMETRY",
                cmdId: 1,
              },
            ],
            historyCmds: [],
            attrSubCmds: [],
          };
          ws.send(JSON.stringify(msg));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.data) {
              const latest = {};
              for (const key in data.data) {
                const arr = data.data[key];
                if (Array.isArray(arr) && arr.length > 0) {
                  const lastEntry = arr[arr.length - 1];
                  latest[key] = {
                    ts: lastEntry[0],
                    value: lastEntry[1],
                  };
                }
              }
              setTelemetry((prev) => ({ ...prev, ...latest }));
            }
          } catch (err) {
            console.error("Error parsing telemetry", err);
          }
        };
      } catch (err) {
        console.error("Failed to connect:", err);
      }
    }

    connect();
    return () => {
      if (ws) ws.close();
    };
  }, [deviceId]);

  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
}

export const useTelemetry = () => useContext(TelemetryContext);