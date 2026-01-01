export const Locations = [
  {
    id: "kalahandi",
    name: "Maligaon (Gram Vikas), Kalahandi",
    city: "Kalahandi",
    state: "Odisha",
    country: "IN"
  },
  {
    id: "keonjhar",
    name: "RE-EMPOWERED pilot microgrid, Keonjhar",
    city: "Keonjhar",
    state: "Odisha",
    country: "IN"
  },
  {
    id: "angul district",
    name: "Mahanadi river island, Kudagaon",
    city: "Angul",
    state: "Odisha",
    country: "IN"
  },
  {
    id: "angul",
    name: "Chhotkei Village (Smart nanogrid)",
    city: "Angul",
    state: "Odisha",
    country: "IN"
  }
];

export function initialTimeseries() {
  return Array.from({ length: 24 }).map((_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    pv: Math.round(Math.max(0, Math.sin((i - 6) / 6) * 50 + Math.random() * 40)),
    load: Math.round(10 + Math.random() * 40),
  }));
}