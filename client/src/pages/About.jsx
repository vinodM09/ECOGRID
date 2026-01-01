import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Locations } from "../data/constants";

export default function About({ openAIChat }) {
  const [locationId, setLocationId] = useState(Locations[0].id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        locations={Locations}
        locationId={locationId}
        setLocationId={setLocationId}
        openAIChat={openAIChat}
      />

      {/* Page content */}
      <div className="p-6 space-y-6 mx-auto">
        <h1 className="text-2xl font-bold text-green-600">About ECOGRID</h1>
        <p className="text-gray-600">
          Ecogrid is a renewable energy monitoring and fault detection platform.
          It helps operators track production, detect issues early, and optimize
          grid efficiency.
        </p>

        <div className="bg-white rounded-xl shadow p-4 space-y-2">
          <h2 className="font-semibold text-lg">Features</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Real-time solar and grid monitoring</li>
            <li>Battery status & cycle tracking</li>
            <li>Fault logging & severity alerts</li>
            <li>CO₂ reduction & revenue analytics</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-2">
          <h2 className="font-semibold text-lg">Team</h2>
          <p className="text-gray-600">
            Developed by the EcoTech team, passionate about renewable energy and
            smart monitoring systems.
          </p>
        </div>
      </div>
    </div>
  );
}