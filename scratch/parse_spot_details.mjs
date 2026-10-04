import fs from "fs";

const raw = fs.readFileSync("datos_cliente_102201848.txt", "utf-8");
const lines = raw.split("\n");

console.log("Analyzing sections in datos_cliente_102201848.txt...");

// Buscar delimitadores de tablas o encabezados
const sections = [];
let currentSection = { name: "inicio", startLine: 0, headers: [] };

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith("Tabla:") || line.includes("id\tidreal") || line.includes("apellido\tnombre")) {
    sections.push({ lineIndex: i, text: line });
  }
}

console.log("Secciones encontradas:", sections);
