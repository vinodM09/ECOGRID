import React from "react";
import { useTelemetry } from "../context/TelemetryContext";

function TelemetryDashboard() {
  const telemetry = useTelemetry();

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="text-sm text-gray-500">Live Telemetry</div>

      {Object.keys(telemetry).length === 0 ? (
        <p className="text-gray-400 text-sm mt-3">No data yet</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(telemetry).map(([key, { ts, value }]) => {
            let unit = "";
            if (key.toLowerCase().includes("current")) unit = " A";
            else if (key.toLowerCase().includes("voltage")) unit = " V";
            else if (key.toLowerCase().includes("power")) unit = " W";

            return (
              <div
                key={key}
                className="bg-gray-50 p-3 rounded-lg flex flex-col justify-between"
              >
                <div className="text-sm text-gray-500">{key}</div>
                <div className="text-xl font-bold text-green-600">
                  {value} {unit}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(ts).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TelemetryDashboard;