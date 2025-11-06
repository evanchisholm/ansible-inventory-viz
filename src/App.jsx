import React, { useEffect, useState } from "react";
import InventoryGraph from "./components/InventoryGraph.jsx";
import { yamlToGraph } from "./utils/yamlToGraph.js";
import hostsText from "./data/hosts.yml?raw";

export default function App() {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [error, setError] = useState(null);
  const [showVars, setShowVars] = useState(false);

  useEffect(() => {
    try {
      const g = yamlToGraph(hostsText, { showVars });
      setGraph(g);
    } catch (e) {
      setError(String(e));
    }
  }, [showVars]);

  if (error)
    return <pre style={{ color: "crimson", padding: 16 }}>{error}</pre>;

  return (
    <div style={{ height: "100vh" }}>
      <InventoryGraph
        graph={graph}
        showVars={showVars}
        onToggleVars={() => setShowVars(!showVars)}
      />
    </div>
  );
}
