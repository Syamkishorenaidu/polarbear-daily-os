import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedIfEmpty } from "./lib/seedData";

// Seed demo data before first render so hooks pick it up
seedIfEmpty();

createRoot(document.getElementById("root")!).render(<App />);
