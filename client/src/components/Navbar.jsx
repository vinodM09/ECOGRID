import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiOutlineMenu, HiOutlineX, HiLocationMarker } from "react-icons/hi";
import AChat from "./aChat";

export default function Navbar({ locations, locationId, setLocationId }) {
  const auth = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Function to handle notification permission request
  const turnOnNotifications = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    if (Notification.permission === "granted") {
      alert("Notifications are already enabled.");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Notifications enabled!", {
            body: "You will now receive notifications from us.",
            icon: "/images/ecogrid_logo (1).png",
          });
        }
      });
    } else {
      alert("Notifications are blocked. Please enable them in your browser settings.");
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Brand Name */}
        <div className="text-2xl font-bold text-green-600 h-[3rem] flex items-center sm:h-auto">
          <Link to="/dashboard">
            <img src="/images/ecogrid_logo (1).png" alt="logo" className="w-[9rem] sm:w-[12rem]" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4 text-sm">
          <Link
            to="/dashboard"
            className={`hover:text-green-600 ${isActive("/dashboard") ? "text-green-600 font-semibold" : "text-gray-600"}`}
          >
            Dashboard
          </Link>
          <Link
            to="/monitoring"
            className={`hover:text-green-600 ${isActive("/monitoring") ? "text-green-600 font-semibold" : "text-gray-600"}`}
          >
            Monitoring
          </Link>
          <Link
            to="/faults"
            className={`hover:text-green-600 ${isActive("/faults") ? "text-green-600 font-semibold" : "text-gray-600"}`}
          >
            Fault
          </Link>
          <Link
            to="/about"
            className={`hover:text-green-600 ${isActive("/about") ? "text-green-600 font-semibold" : "text-gray-600"}`}
          >
            About
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Location selector */}
          <div className="hidden md:flex items-center gap-1 border rounded px-2 py-1 text-sm">
            <HiLocationMarker className="text-green-600" />
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="outline-none bg-transparent"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ask AI */}
          <AChat />

          {/* Notification Bell */}
          <button
            onClick={turnOnNotifications}
            aria-label="Enable Notifications"
            className="hidden md:flex items-center justify-center p-2 rounded hover:bg-green-100"
            title="Enable Notifications"
          >
            <img
              src="/images/bell-regular-full.svg"
              alt="notification-bell"
              className="w-6 h-6 text-green-600"
            />
          </button>

          {/* User Avatar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {auth.user.name[0]}
            </div>
            <div className="text-sm">{auth.user.name}</div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-2xl text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        // <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2 w-full max-w-full">
          <div className="flex items-center gap-2 border rounded px-2 py-1 text-sm mb-2">
            <HiLocationMarker className="text-green-600" />
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="outline-none bg-transparent w-full"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/dashboard"
            className={`block py-1 ${isActive("/dashboard") ? "text-green-600 font-semibold" : "text-gray-600"}`}
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/monitoring"
            className={`block py-1 ${isActive("/monitoring") ? "text-green-600 font-semibold" : "text-gray-600"}`}
            onClick={() => setIsOpen(false)}
          >
            Monitoring
          </Link>
          <Link
            to="/faults"
            className={`block py-1 ${isActive("/faults") ? "text-green-600 font-semibold" : "text-gray-600"}`}
            onClick={() => setIsOpen(false)}
          >
            Fault
          </Link>
          <Link
            to="/about"
            className={`block py-1 ${isActive("/about") ? "text-green-600 font-semibold" : "text-gray-600"}`}
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>

          {/* <button
            onClick={() => {
              openAIChat && openAIChat();
              setIsOpen(false);
            }}
            className="w-full text-left text-sm bg-green-50 text-green-600 px-3 py-1 rounded mt-2"
          >
            Ask AI
          </button> */}
          <AChat />

          <button
            onClick={() => {
              turnOnNotifications();
              setIsOpen(false);
            }}
            className="w-full text-left text-sm bg-green-50 text-green-600 px-3 py-1 rounded mt-2"
          >
            Enable Notifications
          </button>

          <div className="flex items-center gap-2 mt-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {auth.user.name[0]}
            </div>
            <div className="text-sm">{auth.user.name}</div>
          </div>
        </div>
      )}
    </header>
  );
}
