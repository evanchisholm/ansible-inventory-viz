import React, { useEffect, useState } from "react";
import InventoryGraph from "./components/InventoryGraph.jsx";
import { yamlToGraph } from "./utils/yamlToGraph.js";

export default function App() {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [error, setError] = useState(null);
  const [showVars, setShowVars] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadYaml() {
      try {
        setLoading(true);
        const response = await fetch("./hosts.yml");
        if (!response.ok) {
          throw new Error(`Failed to load hosts.yml: ${response.status}`);
        }
        const hostsText = await response.text();
        const g = yamlToGraph(hostsText, { showVars });
        setGraph(g);
        setError(null);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    loadYaml();
  }, [showVars]);

  if (loading) return <div style={{ padding: 16 }}>Loading inventory...</div>;

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
