import yaml from "js-yaml";

export function yamlToGraph(yamlText, options = {}) {
  const { showVars = false } = options;
  const doc = yaml.load(yamlText);
  const nodes = [];
  const links = [];
  const seen = new Set();

  function addNode(node) {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    nodes.push(node);
  }

  function traverse(obj, parentId, name) {
    const isGroup = !!(obj && (obj.children || obj.hosts || obj.vars));
    const id = name;

    addNode({
      id,
      label: name,
      type: isGroup ? "group" : "var",
      vars: obj?.vars,
    });
    if (parentId) links.push({ source: parentId, target: id });

    // Only show variable nodes if showVars is true
    if (showVars && obj?.vars) {
      Object.entries(obj.vars).forEach(([k, v]) => {
        const varId = `${id}::${k}`;
        addNode({ id: varId, label: `${k}: ${v}`, type: "var" });
        links.push({ source: id, target: varId });
      });
    }

    if (obj?.hosts) {
      Object.entries(obj.hosts).forEach(([host, vars]) => {
        const hostId = host;
        addNode({ id: hostId, label: host, type: "host", vars });
        links.push({ source: id, target: hostId });
        // Only show host variable nodes if showVars is true
        if (showVars && vars && typeof vars === "object") {
          Object.entries(vars).forEach(([k, v]) => {
            const hvId = `${hostId}::${k}`;
            addNode({ id: hvId, label: `${k}: ${v}`, type: "var" });
            links.push({ source: hostId, target: hvId });
          });
        }
      });
    }

    if (obj?.children) {
      Object.entries(obj.children).forEach(([childName, childObj]) => {
        traverse(childObj, id, childName);
      });
    }
  }

  if (!doc || !doc.all) {
    throw new Error('Inventory must have an "all" root key');
  }
  traverse(doc.all, null, "all");
  return { nodes, links };
}
