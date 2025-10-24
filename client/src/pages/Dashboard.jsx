import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Navbar from "../components/Navbar";
import AIInput from "../components/AIInput";
import TelemetryDashboard from "./TelemeteryDashboard";
import { LOCATIONS, initialTimeseries } from "../data/constants";
import axios from "axios";
import { useTelemetry } from "../context/TelemetryContext";

export default function Dashboard() {
  const [series, setSeries] = useState(initialTimeseries());
  const [isAIOpen, setAIOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { from: "ai", text: "Hi — ask me about power, faults, battery, or optimization." },
  ]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768); // md breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // live telemetry from TelemetryDashboard
  // const [latestTelemetry, setLatestTelemetry] = useState({});
  const handleTelemetryUpdate = useCallback((newTelemetry) => {
    setLatestTelemetry(newTelemetry);
  }, []);

  const latestTelemetry = useTelemetry();

  // cumulative totals for the day
  const [cumulativePower, setCumulativePower] = useState(0);
  const [cumulativeLoad, setCumulativeLoad] = useState(0);

  // accumulate telemetry into series
  useEffect(() => {
    if (latestTelemetry && latestTelemetry.power && latestTelemetry.voltage) {
      const powerVal = parseFloat(latestTelemetry.power.value || 0);
      const loadVal = parseFloat(latestTelemetry.current?.value || 0);

      // accumulate instead of replacing
      setCumulativePower((prev) => prev + powerVal);
      setCumulativeLoad((prev) => prev + loadVal);

      const newPoint = {
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        // pv: cumulativePower + powerVal, // cumulative PV
        // load: cumulativeLoad + loadVal, // cumulative Load
        pv: powerVal,
        load: loadVal
      };

      const MAX_POINTS_DESKTOP = 50;
      const MAX_POINTS_MOBILE = 10;
      
      setSeries((prev) => {
        const updated = [...prev, newPoint];
        return updated.slice(-(isMobile ? MAX_POINTS_MOBILE : MAX_POINTS_DESKTOP));
      });
    }
  }, [latestTelemetry]);

  const TB_DEVICE_UUID = import.meta.env.VITE_THINGSBOARD_DEVICE_UUID;
  const username = import.meta.env.TB_CLOUD_EMAIL;
  const password = import.meta.env.TB_CLOUD_PASS;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  // weather
  const [locationId, setLocationId] = useState(LOCATIONS[0].id);
  const [weather, setWeather] = useState({
    condition: "",
    temp: "",
    humidity: "",
    icon: "",
  });

  async function fetchWeather(lat, lon) {
    try {
      const res = await axios.get(
        `${SERVER_URL}/api/v1/weather?lat=${lat}&lon=${lon}&part=current`
      );
      return res.data;
    } catch (err) {
      console.error("Weather fetch error:", err);
    }
  }

  useEffect(() => {
    const loc = LOCATIONS.find((l) => l.id === locationId);
    if (!loc) return;

    fetchWeather(loc.lat, loc.lon).then((data) => {
      if (data) {
        setWeather({
          condition: data.current.condition.text,
          temp: data.current.temp_c,
          humidity: data.current.humidity,
          icon: data.current.condition.icon,
        });
      }
    });
  }, [locationId]);

  // battery
  const [battery, setBattery] = useState({
    capacityKWh: 5,
    soc: 72,
    status: "Normal",
    cycles: 342,
  });

  // panel
  const [panel, setPanel] = useState({
    count: 320,
    avgAgeYears: 3.2,
    efficiency: 18.4,
    condition: "Good",
  });

  // to format a number till 3 decimal places
  const formatNumber = (num) => {
    if (!num) return "0.000";
    return parseFloat(num).toFixed(3);
  };

  const [date, setDate] = useState(new Date());
  const generatedToday = series.reduce((s, d) => s + d.pv, 0);
  const usedToday = series.reduce((s, d) => s + d.load, 0);

  // ai chat
  function openAI() {
    setAIOpen(true);
  }

  function sendAIQuestion(q) {
    setAiMessages((m) => [...m, { from: "user", text: q }]);
    setTimeout(() => {
      setAiMessages((m) => [
        ...m,
        {
          from: "ai",
          text: `Answer: for ${q}, generated=${generatedToday}kWh, used=${usedToday}kWh, battery SOC=${battery.soc}%`,
        },
      ]);
    }, 800);
  }

  const socColor =
    battery.soc >= 60
      ? "text-green-600"
      : battery.soc >= 30
      ? "text-yellow-500"
      : "text-red-500";

  const dayEnergy = series
    .filter((d) => parseInt(d.time) < 18 && parseInt(d.time) >= 6)
    .reduce((s, d) => s + d.pv, 0);

  const nightEnergy = generatedToday - dayEnergy;
  const co2Reduction = (generatedToday * 0.7).toFixed(1);
  const revenueDay = (generatedToday * 5).toFixed(0);
  const revenueWeek = (generatedToday * 5 * 7).toFixed(0);

  function formatDate(d) {
    return d.toDateString();
  }

  function prevDay() {
    setDate(new Date(date.getTime() - 86400000));
  }

  function nextDay() {
    setDate(new Date(date.getTime() + 86400000));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        locations={LOCATIONS}
        locationId={locationId}
        setLocationId={setLocationId}
        openAIChat={openAI}
      />

      <main className="w-full px-3 md:px-6 py-4 space-y-6">
        {/* Weather */}
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-6">
          <div className="text-4xl">
            <img
              src={weather.icon ? `https:${weather.icon}` : "/images/weather-icon-png-16.png"}
              alt="condition_icon"
              className="max-w-12"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500">
              Weather — {LOCATIONS.find((l) => l.id === locationId).name}
            </div>
            <div className="text-lg font-semibold">
              {weather.condition}, {weather.temp}°C
            </div>
            <div className="text-sm text-gray-600">Humidity: {weather.humidity}%</div>
          </div>
        </div>

        {/* ThingsBoard Telemetry */}
        <TelemetryDashboard
          deviceId={TB_DEVICE_UUID}
          onTelemetryUpdate={handleTelemetryUpdate}
        />

        {/* Power Chart and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 bg-white p-4 rounded-xl shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-500">
            Live monitoring — {LOCATIONS.find((l) => l.id === locationId).name}
          </div>
          <div className="text-xl font-bold">Realtime Power (PV vs Load)</div>
        </div>
      </div>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
  dataKey="time"
  interval={isMobile ? Math.floor(series.length / 5) : Math.floor(series.length / 12)}
  tickFormatter={(value) => {
    // keep only HH:MM
    const parts = value.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : value;
  }}
/>
            <YAxis label={{ value: "Energy (Wh)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Area type="monotone" dataKey="pv" stroke="#22C55E" fill="url(#pvGrad)" isAnimationActive={false}/>
            <Area type="monotone" dataKey="load" stroke="#3B82F6" fill="url(#loadGrad)" isAnimationActive={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

          {/* Summary */}
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">Summary</div>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Generated today (W)</div>
                  <div className="text-2xl font-bold text-green-600">
  {formatNumber(generatedToday)}
</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Used today (W)</div>
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(usedToday)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-sm">SOC</div>
                  <div className={`font-bold ${socColor}`}>{battery.soc}%</div>
                </div>
                <div className="flex-1 text-sm text-gray-600">
                  Battery: {battery.capacityKWh} kWh · Cycles: {battery.cycles} · Status:{" "}
                  {battery.status}
                </div>
              </div>
              <div className="text-xs text-gray-400">Day / Night Consumption split</div>
              <div className="flex gap-2">
                <div className="flex-1 bg-orange-50 p-2 rounded">
                  Day: <strong>{formatNumber(dayEnergy)}</strong> Wh
                </div>
                <div className="flex-1 bg-blue-50 p-2 rounded">
                  Night: <strong>{formatNumber(nightEnergy)}</strong> Wh
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2 bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevDay} className="px-2 py-1 bg-gray-100 rounded">
                ←
              </button>
              <div className="font-semibold">{formatDate(date)}</div>
              <button onClick={nextDay} className="px-2 py-1 bg-gray-100 rounded">
                →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 rounded">
                <div className="text-xs text-gray-500">Total Production</div>
                <div className="text-lg font-bold text-green-600">{formatNumber(generatedToday)} kWh</div>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-xs text-gray-500">CO₂ Reduction</div>
                <div className="text-lg font-bold text-blue-600">{co2Reduction} kg</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <div className="text-xs text-gray-500">Net Revenue (Day)</div>
                <div className="text-lg font-bold text-yellow-600">₹{revenueDay}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <div className="text-xs text-gray-500">Net Revenue (Week)</div>
                <div className="text-lg font-bold text-purple-600">₹{revenueWeek}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                Grid Stable
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Low Faults
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                Optimal Efficiency
              </span>
            </div>
          </div>

          {/* Battery & Panel */}
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-lg font-semibold mb-2">Battery & Panel specs</div>
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                Capacity: <strong>{battery.capacityKWh} kWh</strong>
              </div>
              <div>
                State of Charge: <strong className={socColor}>{battery.soc}%</strong>
              </div>
              <div>
                Cycles: <strong>{battery.cycles}</strong>
              </div>
              <hr />
              <div>
                Panels: <strong>{panel.count}</strong>
              </div>
              <div>
                Avg age: <strong>{panel.avgAgeYears} yrs</strong>
              </div>
              <div>
                Efficiency: <strong>{panel.efficiency}%</strong>
              </div>
              <div>
                Condition: <strong>{panel.condition}</strong>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-1">Generated vs Used</div>
              <div className="h-44 md:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Generated", value: generatedToday },
                        { name: "Used", value: usedToday },
                      ]}
                      dataKey="value"
                      outerRadius={window.innerWidth < 768 ? 40 : 60}
                      label
                    >
                      <Cell fill="#22C55E" />
                      <Cell fill="#3B82F6" />
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat */}
      {isAIOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAIOpen(false)} />
          <div className="relative z-50 w-full md:w-2/5 bg-white rounded-t-xl md:rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Ask AI</div>
              <button onClick={() => setAIOpen(false)} className="text-sm text-gray-500">
                Close
              </button>
            </div>
            <div className="h-64 overflow-auto p-2 space-y-2 bg-gray-50 rounded">
              {aiMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    m.from === "ai"
                      ? "bg-white text-gray-800"
                      : "bg-green-50 text-green-700 self-end"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <AIInput onSend={sendAIQuestion} />
          </div>
        </div>
      )}
    </div>
  );
}