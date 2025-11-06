import React, { useEffect, useMemo, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

cytoscape.use(dagre);

const stylesheet = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "text-valign": "center",
      "text-halign": "center",
      "text-wrap": "wrap",
      "text-max-width": 160,
      "font-size": 10,
      "border-width": 2,
      "border-color": "#2F4EA2",
      color: "#fff",
      padding: "6px",
    },
  },
  {
    selector: 'node[type="group"]',
    style: { shape: "round-rectangle", "background-color": "#4C7BD9" },
  },
  {
    selector: 'node[type="host"]',
    style: {
      shape: "ellipse",
      "background-color": "#4CD98F",
      "border-color": "#2FA26A",
    },
  },
  {
    selector: 'node[type="var"]',
    style: {
      shape: "diamond",
      "background-color": "#D9B84C",
      "border-color": "#A2852F",
      color: "#000",
    },
  },
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      width: 1.8,
      "line-color": "#B7C1D6",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#B7C1D6",
    },
  },
  {
    selector: "node:selected",
    style: { "border-width": 4, "border-color": "#222" },
  },
];

const layouts = {
  dagre: {
    name: "dagre",
    rankDir: "LR",
    nodeSep: 40,
    edgeSep: 16,
    rankSep: 100,
    fit: true,
    padding: 16,
  },
  breadthfirst: {
    name: "breadthfirst",
    directed: true,
    spacingFactor: 1.2,
    fit: true,
    padding: 16,
  },
  concentric: {
    name: "concentric",
    minNodeSpacing: 20,
    fit: true,
    padding: 16,
  },
  cose: { name: "cose", padding: 16 },
};

export default function InventoryGraph({ graph, showVars, onToggleVars }) {
  const elements = useMemo(
    () => [
      ...graph.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          vars: JSON.stringify(n.vars || {}, null, 2),
        },
      })),
      ...graph.links.map((e) => ({
        data: { source: e.source, target: e.target },
      })),
    ],
    [graph]
  );

  const [layout, setLayout] = useState("dagre");
  const [selected, setSelected] = useState(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.on("select", "node", (evt) => setSelected(evt.target.data()));
    cyRef.current.on("unselect", "node", () => setSelected(null));
  }, []);

  useEffect(() => {
    if (cyRef.current) cyRef.current.layout(layouts[layout]).run();
  }, [layout, elements]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "48px 1fr 180px",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <b>Layout:</b>
        {Object.keys(layouts).map((name) => (
          <button
            key={name}
            onClick={() => setLayout(name)}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              background: layout === name ? "#efefef" : "#fff",
              borderRadius: 6,
            }}
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => cyRef.current && cyRef.current.fit()}
          style={{
            marginLeft: "auto",
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          Fit
        </button>
        <button
          onClick={onToggleVars}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            background: showVars ? "#efefef" : "#fff",
            borderRadius: 6,
          }}
        >
          {showVars ? "Hide Variables" : "Show Variables"}
        </button>
      </div>

      <CytoscapeComponent
        elements={elements}
        layout={layouts[layout]}
        stylesheet={stylesheet}
        cy={(cy) => {
          cyRef.current = cy;
        }}
        style={{ width: "100%", height: "100%", background: "#fff" }}
        minZoom={0.2}
        maxZoom={3}
        wheelSensitivity={0.2}
      />

      <div
        style={{
          borderTop: "1px solid #e5e5e5",
          padding: "8px 12px",
          overflow: "auto",
          background: "#fafafa",
        }}
      >
        <b>Selection:</b>
        {selected ? (
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {selected.vars || "(group/var)"}
          </pre>
        ) : (
          <div style={{ color: "#666" }}>Click a host to see its variables</div>
        )}
      </div>
    </div>
  );
}
