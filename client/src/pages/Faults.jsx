import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Locations } from "../data/constants";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useTelemetry } from "../context/TelemetryContext";

const faultColors = ["#EF4444", "#F59E0B", "#3B82F6", "#22C55E"];

/* Error Messages */
const ERROR_CODES = {
  voltage: {
    over: "Overvoltage (too high)",
    under: "Undervoltage (too low)",
  },
};

/* Fix Suggestions */
const FIX_SUGGESTIONS = {
  Overvoltage: "Check voltage stability of the grid.",
  Undervoltage: "Verify supply or battery charge.",
};

export default function Faults({ openAIChat }) {
  const [selectedFault, setSelectedFault] = useState(null);
  const [locationId, setLocationId] = useState(Locations[0].id);
  const telemetry = useTelemetry();
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    if (!telemetry || Object.keys(telemetry).length === 0) return;

    const newFaults = [];

    if (telemetry.voltage) {
      const { value } = telemetry.voltage;
      const numVal = Number(value);

      if (numVal === 0) {
        newFaults.push({
          code: "V-0",
          type: "Grid Outage (0V reading)",
          category: "Voltage",
          location:
            LOCATIONS.find((l) => l.id === locationId)?.name || "Unknown",
          severity: "Critical",
          status: "Active",
          time: new Date().toLocaleString(),
          assigned: "Auto-System",
        });
      } else if (numVal < 4 && numVal > 0) {
        newFaults.push({
          code: "V-1",
          type: "Undervoltage (too low)",
          category: "Voltage",
          location:
            LOCATIONS.find((l) => l.id === locationId)?.name || "Unknown",
          severity: "Major",
          status: "Active",
          time: new Date().toLocaleString(),
          assigned: "Auto-System",
        });
      } else if (numVal > 7.5) {
        newFaults.push({
          code: "V-2",
          type: "Overvoltage (too high)",
          category: "Voltage",
          location:
            LOCATIONS.find((l) => l.id === locationId)?.name || "Unknown",
          severity: "Major",
          status: "Active",
          time: new Date().toLocaleString(),
          assigned: "Auto-System",
        });
      }
    }

    setFaults((prev) => {
      const updated = [...prev];

      // Mark resolved if condition no longer present
      updated.forEach((f) => {
        const stillActive = newFaults.find((nf) => nf.code === f.code);
        if (!stillActive && f.status === "Active") {
          f.status = "Resolved";
          f.time = new Date().toLocaleString();
        }
      });

      // Add new faults not already logged
      newFaults.forEach((nf) => {
        if (!updated.find((f) => f.code === nf.code && f.status === "Active")) {
          const newFault = { id: updated.length + 1, ...nf };

          // Browser Notification
          if (
            "Notification" in window &&
            Notification.permission === "granted" &&
            newFault.type === "Disconnected (0V reading)"
          ) {
            new Notification("Fault Detected", {
              body: `${newFault.type} at ${newFault.location}`,
            });
          }

          updated.push(newFault);
        }
      });

      return [...updated];
    });
  }, [telemetry, locationId]);

  /* Fault Summary Data */
  const summary = {
    active: faults.filter((f) => f.status === "Active").length,
    critical: faults.filter(
      (f) => f.severity === "Critical" && f.status === "Active"
    ).length,
    resolvedToday: faults.filter((f) => f.status === "Resolved").length,
    avgResolution: "—",
  };

  const pieData = [
    {
      name: "Critical",
      value: faults.filter((f) => f.severity === "Critical").length,
    },
    {
      name: "Major",
      value: faults.filter((f) => f.severity === "Major").length,
    },
    {
      name: "Minor",
      value: faults.filter((f) => f.severity === "Minor").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        locations={Locations}
        locationId={locationId}
        setLocationId={setLocationId}
        openAIChat={openAIChat}
      />

      <div className="p-6 space-y-6 mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Faults & Issues</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 rounded shadow">
            <div className="text-xs text-gray-500">Active Faults</div>
            <div className="text-xl font-bold text-red-600">
              {summary.active}
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded shadow">
            <div className="text-xs text-gray-500">Critical Faults</div>
            <div className="text-xl font-bold text-orange-600">
              {summary.critical}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded shadow">
            <div className="text-xs text-gray-500">Resolved</div>
            <div className="text-xl font-bold text-green-600">
              {summary.resolvedToday}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded shadow">
            <div className="text-xs text-gray-500">Avg. Resolution Time</div>
            <div className="text-xl font-bold text-blue-600">
              {summary.avgResolution}
            </div>
          </div>
        </div>

        {/* Faults Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-sm min-w-[800px] hidden md:table">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-2 py-2 text-left">ID</th>
                <th className="px-2 py-2 text-left">Code</th>
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-left">Category</th>
                <th className="px-2 py-2 text-left">Location</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-2 py-2 text-left">Time</th>
                <th className="px-2 py-2 text-left">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {faults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No faults exist
                  </td>
                </tr>
              ) : (
                faults.map((f, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedFault(f)}
                  >
                    <td className="px-2 py-2">{f.id}</td>
                    <td className="px-2 py-2 font-mono">{f.code}</td>
                    <td className="px-2 py-2">{f.type}</td>
                    <td className="px-2 py-2">{f.category}</td>
                    <td className="px-2 py-2">{f.location || "Unknown"}</td>
                    <td className="px-2 py-2">{f.status}</td>
                    <td className="px-2 py-2">{f.time}</td>
                    <td className="px-2 py-2">{f.assigned}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y">
            {faults.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No faults exist
              </div>
            ) : (
              faults.map((f, i) => (
                <div
                  key={i}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedFault(f)}
                >
                  <div className="font-bold text-gray-800 mb-2">
                    {f.type} ({f.code})
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 text-sm text-gray-700">
                    <div>
                      <strong>ID:</strong> {f.id}
                    </div>
                    <div>
                      <strong>Category:</strong> {f.category}
                    </div>
                    <div>
                      <strong>Location:</strong> {f.location || "Unknown"}
                    </div>
                    <div>
                      <strong>Status:</strong> {f.status}
                    </div>
                    <div>
                      <strong>Time:</strong> {f.time}
                    </div>
                    <div>
                      <strong>Assigned:</strong> {f.assigned}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500 mb-2">Faults by Severity</div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={faultColors[index % faultColors.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500 mb-2">Faults Timeline</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={faults.map((f, i) => ({ day: `#${i + 1}`, faults: 1 }))}
              >
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="faults" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fault Detail Drawer */}
        {selectedFault && (
          <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
            <div className="w-full md:w-1/3 bg-white p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Fault Details</h2>
                <button
                  onClick={() => setSelectedFault(null)}
                  className="text-gray-500"
                >
                  ✖
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>ID:</strong> {selectedFault.id}
                </div>
                <div>
                  <strong>Code:</strong> {selectedFault.code}
                </div>
                <div>
                  <strong>Type:</strong> {selectedFault.type}
                </div>
                <div>
                  <strong>Category:</strong> {selectedFault.category}
                </div>
                <div>
                  <strong>Location:</strong> {selectedFault.location}
                </div>
                <div>
                  <strong>Severity:</strong> {selectedFault.severity}
                </div>
                <div>
                  <strong>Status:</strong> {selectedFault.status}
                </div>
                <div>
                  <strong>Time:</strong> {selectedFault.time}
                </div>
                <div>
                  <strong>Assigned:</strong> {selectedFault.assigned}
                </div>
                <hr />
                <div className="text-gray-600">⚡ Suggested Fix:</div>
                <div className="bg-green-50 p-2 rounded">
                  {FIX_SUGGESTIONS[
                    Object.keys(FIX_SUGGESTIONS).find((k) =>
                      selectedFault.type.includes(k)
                    )
                  ] || "Run diagnostics on affected system."}
                </div>
                {selectedFault.status === "Active" && (
                  <button
                    className="mt-4 w-full bg-green-600 text-white px-3 py-2 rounded"
                    onClick={() => {
                      setFaults((prev) =>
                        prev.map((f) =>
                          f.id === selectedFault.id
                            ? { ...f, status: "Resolved" }
                            : f
                        )
                      );
                      setSelectedFault(null);
                    }}
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}