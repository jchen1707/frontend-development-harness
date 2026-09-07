import { createRoot } from "react-dom/client";
import { greeting } from "./domain.js";

const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <main>
      <h1>{greeting("world")}</h1>
    </main>,
  );
