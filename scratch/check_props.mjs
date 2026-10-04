import fs from "fs";

const raw = fs.readFileSync("datos_cliente_102201848.txt", "utf-8");
const lines = raw.split("\n");

const startIndex = lines.findIndex((l) => l.trim().startsWith("Tabla: web_propiedades"));
const endIndex = lines.findIndex((l, idx) => idx > startIndex && l.trim().startsWith("Tabla: web_movimientos"));
const propRows = lines.slice(startIndex, endIndex);

console.log("Headers:");
const headers = propRows[1].split("\t");
headers.forEach((h, i) => console.log(`${i}: ${h}`));

console.log("\nPrimeras 5 propiedades:");
for (let i = 2; i < Math.min(propRows.length, 10); i++) {
  const cols = propRows[i].split("\t");
  console.log(`ID: ${cols[0]} | Carpeta: ${cols[5]} | Dir: ${cols[6]} | Loc: ${cols[7]} | Amb: ${cols[11]}`);
}
