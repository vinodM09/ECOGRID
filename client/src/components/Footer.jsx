import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-3 text-center text-sm">
      © {new Date().getFullYear()} ECOGRID — All rights reserved
    </footer>
  );
}