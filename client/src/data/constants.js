export const LOCATIONS = [
  {
    id: "kalahandi",
    name: "Kalahandi, Maligaon (Gram Vikas)",
    city: "Maligaon",
    state: "Odisha",
    country: "IN"
  },
  {
    id: "keonjhar",
    name: "Keonjhar, RE-EMPOWERED pilot microgrid",
    city: "Keonjhar",
    state: "Odisha",
    country: "IN"
  },
  {
    id: "angul district",
    name: "Kudagaon, Mahanadi river island",
    city: "Kudagaon",
    state: "Odisha",
    country: "IN"
  },
  {
    id: "angul",
    name: "Chhotkei Village (Smart nanogrid)",
    city: "Chhotkei",
    state: "Odisha",
    country: "IN"
  }
];

export const WEATHER = {
  katni: { temp: 31, condition: "Sunny", humidity: 40 },
  indore: { temp: 28, condition: "Cloudy", humidity: 55 },
  jabalpur: { temp: 26, condition: "Rainy", humidity: 70 },
};

export function initialTimeseries() {
  return Array.from({ length: 24 }).map((_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    pv: Math.round(Math.max(0, Math.sin((i - 6) / 6) * 50 + Math.random() * 40)),
    load: Math.round(10 + Math.random() * 40),
  }));
}