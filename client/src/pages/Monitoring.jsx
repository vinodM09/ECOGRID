import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { Locations } from "../data/constants";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useTelemetry } from "../context/TelemetryContext";

export default function Monitoring({ openAIChat }) {
  const [series, setSeries] = useState([]);
  const [locationId, setLocationId] = useState(Locations[0].id);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const telemetry = useTelemetry();

  // Track peak, min, off cycles from telemetry
  const [timeline, setTimeline] = useState([]);
  const peakRef = useRef(0);
  const minRef = useRef(Infinity);
  const lastCurrentRef = useRef(0);

  // Track screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate dummy time-series data (24h with 30min step)
  useEffect(() => {
    const data = [];
    for (let h = 0; h < 24; h += 0.5) {
      data.push({
        time: `${String(Math.floor(h)).padStart(2, "0")}:${
          h % 1 === 0 ? "00" : "30"
        }`,
        solar: Math.max(
          0,
          Math.sin((h / 24) * Math.PI * 2) * 500 + Math.random() * 50
        ),
        consumption: 400 + Math.random() * 100,
        battery: 200 + Math.random() * 50,
        netGrid: Math.random() * 50 - 20,
      });
    }
    setSeries(data);
  }, []);

  // Show last 3 hours (6 points) on mobile, full 24h on larger screens
  const chartData = isMobile ? series.slice(-6) : series;
  const xTickCount = isMobile ? 3 : 12;

  // Update Event Timeline based on telemetry.current
  useEffect(() => {
    if (!telemetry?.current) return;
    const current = Number(telemetry.current.value || 0);
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // System turned ON from 0 → positive
    if (lastCurrentRef.current === 0 && current > 0) {
      setTimeline((prev) => [
        ...prev,
        `${now} – Solar started generation`,
      ]);
      minRef.current = current; // reset min when system starts
      peakRef.current = current; // reset peak
    }

    // Peak update
    if (current > peakRef.current) {
      peakRef.current = current;
      setTimeline((prev) => [...prev, `${now} – Peak current reached (${current} A)`]);
    }

    // Lowest update (but not 0)
    if (current > 0 && current < minRef.current) {
      minRef.current = current;
      setTimeline((prev) => [...prev, `${now} – Lowest current recorded (${current} A)`]);
    }

    // System OFF (current drops back to 0)
    if (lastCurrentRef.current > 0 && current === 0) {
      setTimeline((prev) => [...prev, `${now} – System turned off`]);
    }

    lastCurrentRef.current = current;
  }, [telemetry]);

  // Timeline update logic

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        locations={Locations}
        locationId={locationId}
        setLocationId={setLocationId}
        openAIChat={openAIChat}
      />

      <div className="p-4 md:p-6 space-y-6 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Monitoring</h1>
          <div className="text-sm text-gray-500">
            {new Date().toDateString()}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">Today’s Generation</div>
            <div className="text-2xl font-bold text-green-600">12.4 kWh</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">Today’s Consumption</div>
            <div className="text-2xl font-bold text-blue-600">10.8 kWh</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">CO₂ Reduction</div>
            <div className="text-2xl font-bold text-emerald-600">5.2 kg</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">Net Revenue</div>
            <div className="text-2xl font-bold text-purple-600">₹ 648</div>
          </div>
        </div>

        {/* Power Flow Graph */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-lg font-semibold mb-2">
            Power Flow ({isMobile ? "Last 3h" : "24h"})
          </div>
          <div className="h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="time"
                  tickCount={xTickCount}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis
                  label={{
                    value: "Power (W)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="solar"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="battery"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="netGrid"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

                {/* Event Timeline (Dynamic) */}
                <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-lg font-semibold mb-2">Event Timeline</div>
          {timeline.length === 0 ? (
            <p className="text-gray-400 text-sm">No events detected yet</p>
          ) : (
            <ul className="space-y-2 text-sm text-gray-600">
              {timeline.map((event, i) => (
                <li key={i}>{event}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Battery Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-lg font-semibold mb-2">Battery Status</div>
            <p className="text-gray-600 text-sm">
              State of Charge:{" "}
              <span className="font-bold text-green-600">78%</span>
            </p>
            <p className="text-gray-600 text-sm">Charging Rate: 1.2 kW/h</p>
            <p className="text-gray-600 text-sm">Backup Time Left: ~4.5 hrs</p>
            <p className="text-gray-600 text-sm">Health: 92%</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-lg font-semibold mb-2">Solar Panel Health</div>
            <p className="text-gray-600 text-sm">Avg Efficiency: 87%</p>
            <p className="text-gray-600 text-sm">Total Panels: 124</p>
            <p className="text-gray-600 text-sm">Panels Needing Service: 3</p>
            <p className="text-gray-600 text-sm">Panel Age: ~3.2 yrs</p>
          </div>
        </div>

        {/* Grid Conditions */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-lg font-semibold mb-2">Grid Conditions</div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
              Stable Voltage
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
              Low Faults
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
              Normal Load
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
              AI Monitoring Active
            </span>
          </div>
        </div>


      </div>
    </div>
  );
}