import fs from "fs";

const content = fs.readFileSync("datos_cliente_102201848.txt", "utf-8");
const lines = content.split("\n").filter((l) => l.trim().length > 0);

console.log("Total filas en el archivo:", lines.length);

const headerLine = lines[1];
const headers = headerLine.split("\t");
console.log("Total columnas:", headers.length);

const dataRows = lines.slice(2);
const contractsMap = new Map();

for (const row of dataRows) {
  const cols = row.split("\t");
  if (cols.length < 10) continue;
  
  const id = cols[0];
  const fecha = cols[2];
  const detalle = cols[3];
  const debe = cols[4];
  const vence = cols[6];
  const contratoId = cols[9];
  const abonado = cols[8];
  const idRecibo = cols[17];
  
  if (!contractsMap.has(contratoId)) {
    contractsMap.set(contratoId, []);
  }
  
  contractsMap.get(contratoId).push({
    id,
    fecha,
    detalle,
    debe,
    vence,
    abonado,
    idRecibo,
  });
}

console.log(`\n=== CONTRATOS ENCONTRADOS (${contractsMap.size} contratos distintos) ===`);
for (const [contratoId, cuotas] of contractsMap.entries()) {
  console.log(`- Contrato #${contratoId}: ${cuotas.length} períodos/movimientos registrados. Primer período: "${cuotas[0].detalle}" ($ ${cuotas[0].debe}, vence: ${cuotas[0].vence})`);
}
