import { useEffect, useState } from "react";
import { newScenes } from './data/scenes_examples';

function analyzeScenes(scenes) {
  const sceneKeys = Object.keys(scenes);
  const referencedScenes = new Set();
  const report = [];

  // Collecte des scènes et choix
  for (const [sceneId, scene] of Object.entries(scenes)) {
    const choices = (scene.choices || []).map(choice => {
      referencedScenes.add(choice.next);
      return {
        text: choice.text,
        next: choice.next,
        valid: sceneKeys.includes(choice.next)
      };
    });

    report.push({
      id: sceneId,
      title: scene.metadata?.title || "Sans titre",
      text: (scene.content?.text || "").substring(0, 80) + "...",
      choices,
      isStart: sceneId === "introduction",
      isTerminal: choices.length === 0
    });
  }

  // Marque les orphelines
  report.forEach(scene => {
    scene.isOrphan = !scene.isStart && !referencedScenes.has(scene.id);
  });

  return report;
}

export default function App2() {
  const [mermaidText, setMermaidText] = useState("");

  useEffect(() => {
    const report = analyzeScenes(newScenes);

    let m = "graph TD\n";

    // Création des noeuds
    report.forEach(scene => {
      let label = scene.title.replace(/"/g, '\\"'); // échapper les guillemets
      m += `  ${scene.id}["${label}"]\n`;
    });

    // Création des liens
    report.forEach(scene => {
      scene.choices.forEach(choice => {
        let text = choice.text.replace(/"/g, '\\"');
        m += `  ${scene.id} -->|${text}| ${choice.next}\n`;
      });
    });

    // Styles
    m += "\n";
    m += "  classDef startNode fill:#ff9,stroke:#f90,stroke-width:2px;\n";
    m += "  classDef orphan fill:#fdd,stroke:#f00,stroke-width:2px;\n";
    m += "  classDef terminal fill:#dfd,stroke:#0a0,stroke-width:2px;\n";

    report.forEach(scene => {
      if (scene.isStart) m += `  class ${scene.id} startNode;\n`;
      if (scene.isOrphan) m += `  class ${scene.id} orphan;\n`;
      if (scene.isTerminal) m += `  class ${scene.id} terminal;\n`;
    });

    setMermaidText(m);
  }, []);

  return (
    <div>
      <h1>Diagramme des scènes (Mermaid)</h1>
      <pre>{mermaidText}</pre>
      <p>Copie ce texte dans <a href="https://mermaid.live/">Mermaid Live Editor</a> pour visualiser le graphe.</p>
    </div>
  );
}
