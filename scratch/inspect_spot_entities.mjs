import fs from "fs";

const raw = fs.readFileSync("datos_cliente_102201848.txt", "utf-8");
const lines = raw.split("\n");

function getSection(startHeader, endHeader) {
  const startIndex = lines.findIndex((l) => l.trim().startsWith(startHeader));
  if (startIndex === -1) return [];
  let endIndex = lines.length;
  if (endHeader) {
    const foundEnd = lines.findIndex((l, idx) => idx > startIndex && l.trim().startsWith(endHeader));
    if (foundEnd !== -1) endIndex = foundEnd;
  }
  return lines.slice(startIndex, endIndex);
}

console.log("\n=== PROPIETARIOS ===");
const propLines = getSection("Tabla: web_propietarios", "Tabla: web_propiedades");
const propHeaders = propLines[1]?.split("\t") || [];
for (let i = 2; i < propLines.length; i++) {
  const cols = propLines[i].split("\t");
  if (cols.length > 5) {
    console.log(`- Dueño: ${cols[3]} ${cols[4]} | DNI/CUIT: ${cols[9]} / ${cols[12]} | CBU: ${cols[40]} | Dir: ${cols[6]}`);
  }
}

console.log("\n=== PROPIEDADES ===");
const inmueblesLines = getSection("Tabla: web_propiedades", "Tabla: web_movimientos");
const inmueblesHeaders = inmueblesLines[1]?.split("\t") || [];
console.log("Columnas inmuebles:", inmueblesHeaders.slice(0, 15));
for (let i = 2; i < inmueblesLines.length; i++) {
  const cols = inmueblesLines[i].split("\t");
  if (cols.length > 5) {
    console.log(`- Inmueble: ${cols[3]} ${cols[4]} | Localidad: ${cols[5] || cols[6]}`);
  }
}

console.log("\n=== INQUILINOS ===");
const inqLines = getSection("Tabla: web_inquilinos", "Tabla: web_garantes");
for (let i = 2; i < inqLines.length; i++) {
  const cols = inqLines[i].split("\t");
  if (cols.length > 5) {
    console.log(`- Inquilino: ${cols[4]} ${cols[5]} | DNI: ${cols[12]} | Cel: ${cols[19]}`);
  }
}
