# Ansible Hosts Inventory Visualiser (React + Cytoscape.js)

Interactive visualisation of a **large, complex Ansible hosts (inventory) YAML**.
- Parses YAML directly in the browser
- Displays groups, hosts, and vars as a graph
- Multiple layouts with pan/zoom/fit
- Click a host to inspect its variables

## Quick Start
```bash
npm install
npm run dev
# open the printed localhost URL
```

## Files to explore
- `src/data/hosts.yml` — LARGE sample inventory (auto-generated)
- `src/utils/yamlToGraph.js` — YAML → nodes/edges parser
- `src/components/InventoryGraph.jsx` — Cytoscape graph component
- `src/App.jsx` — glue code

## Notes
- Groups = rounded rectangles
- Hosts = ellipses
- Vars = diamonds (you can disable per-host var expansion in `yamlToGraph` if the graph is too busy)
