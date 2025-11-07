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
      color: "#1a3a7a",
      padding: "6px",
    },
  },
  {
    selector: 'node[type="group"]',
    style: {
      shape: "round-rectangle",
      width: "80px",
      height: "10px",
      "background-color": "#4C7BD9",
    },
  },
  {
    selector: 'node[type="host"]',
    style: {
      shape: "round-rectangle",
      width: "80px",
      height: "10px",
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
  {
    selector: 'node[warning="true"]',
    style: {
      "background-color": "#FF8C42",
      "border-color": "#D96704",
    },
  },
  {
    selector: 'node[warning="true"]:selected',
    style: {
      "border-color": "#222",
    },
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
      ...graph.nodes.map((n) => {
        const vars = n.vars || {};
        const hasWarning =
          vars.warning === true ||
          vars.warning === "true" ||
          String(vars.warning).toLowerCase() === "true";
        return {
          data: {
            id: n.id,
            label: n.label,
            type: n.type,
            vars: JSON.stringify(vars, null, 2),
            warning: hasWarning ? "true" : "false",
          },
        };
      }),
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
    cyRef.current.on("select", "node", (evt) => {
      const node = evt.target;
      const data = node.data();
      const children = node.outgoers("node");
      const childCount = children.length;
      const childNames = children.map((child) => child.data().label).sort();
      const parents = node.incomers("node");
      const parentName = parents.length > 0 ? parents[0].data().label : null;
      setSelected({ ...data, childCount, childNames, parentName });
    });
    cyRef.current.on("unselect", "node", () => setSelected(null));
  }, []);

  useEffect(() => {
    if (cyRef.current) cyRef.current.layout(layouts[layout]).run();
  }, [layout, elements]);

  const selectNodeByLabel = (label) => {
    if (!cyRef.current) return;
    // Unselect all nodes first
    cyRef.current.nodes().unselect();
    // Find and select the node with the matching label
    const node = cyRef.current.nodes().filter((n) => n.data().label === label);
    if (node.length > 0) {
      node.select();
      // Center the node in view
      cyRef.current.animate({
        fit: {
          eles: node,
          padding: 100,
        },
        duration: 500,
      });
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "48px 1fr",
        gridTemplateColumns: "250px 1fr",
        height: "100%",
      }}
    >
      <div
        style={{
          gridColumn: "1 / -1",
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

      <div
        style={{
          borderRight: "1px solid #e5e5e5",
          padding: "8px 12px",
          overflow: "auto",
          background: "#fafafa",
        }}
      >
        <b>Selection:</b>
        {selected ? (
          <div>
            {selected.type === "group" ? (
              <div style={{ marginTop: "8px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Group:</strong> {selected.label}
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <strong>Children:</strong> {selected.childCount}
                </div>
                {selected.childNames && selected.childNames.length > 0 && (
                  <div>
                    <strong>Child nodes:</strong>
                    <ul
                      style={{
                        fontSize: "13px",
                        marginTop: "8px",
                        paddingLeft: "0",
                        listStyle: "none",
                      }}
                    >
                      {selected.childNames.map((name, idx) => (
                        <li
                          key={idx}
                          onClick={() => selectNodeByLabel(name)}
                          style={{
                            cursor: "pointer",
                            color: "#4C7BD9",
                            textDecoration: "none",
                            marginBottom: "6px",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#e8f0ff";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : selected.type === "host" ? (
              <div style={{ marginTop: "8px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Host:</strong> {selected.label}
                </div>
                {(() => {
                  try {
                    const vars = JSON.parse(selected.vars);
                    const hasWarning =
                      vars.warning === true || vars.warning === "true";
                    return (
                      <div style={{ fontSize: "12px" }}>
                        {Object.entries(vars).map(([key, value]) => {
                          const isWarning =
                            key === "warning" &&
                            (value === true || value === "true");
                          const isWarningNote = key === "note" && hasWarning;
                          return (
                            <div
                              key={key}
                              style={{
                                marginBottom: "6px",
                                ...((isWarning || isWarningNote) && {
                                  padding: "8px",
                                  backgroundColor: "#FFF3E0",
                                  border: "2px solid #FF8C42",
                                  borderRadius: "4px",
                                  color: "#D96704",
                                  fontWeight: "bold",
                                }),
                              }}
                            >
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          );
                        })}
                      </div>
                    );
                  } catch {
                    return (
                      <div style={{ fontSize: "12px" }}>{selected.vars}</div>
                    );
                  }
                })()}
                {selected.parentName && (
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "12px",
                      paddingTop: "8px",
                      borderTop: "1px solid #ddd",
                    }}
                  >
                    <strong>Parent: </strong>
                    <span
                      onClick={() => selectNodeByLabel(selected.parentName)}
                      style={{
                        cursor: "pointer",
                        color: "#4C7BD9",
                        textDecoration: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e8f0ff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      {selected.parentName}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginTop: "8px" }}>(variable node)</div>
            )}
          </div>
        ) : (
          <div style={{ color: "#666", marginTop: "8px" }}>
            Click a node to see details
          </div>
        )}
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
    </div>
  );
}
