import React from "react";
import { Skeleton } from "@mui/material";
import { useTelemetry } from "../context/TelemetryContext";

function TelemetryDashboard() {
  const telemetry = useTelemetry();

  const isLoading = Object.keys(telemetry).length === 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="text-sm text-gray-500">Live Telemetry</div>

      {isLoading ? (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-50 p-3 rounded-lg flex flex-col justify-between"
            >
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="50%" height={12} />
            </div>
          ))}
        </div>
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