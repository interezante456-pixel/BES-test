import * as XLSX from 'xlsx';

/**
 * Normaliza y busca valores en un objeto fila de Excel soportando diferentes nombres de columnas.
 */
export function getVal(row: any, ...keys: string[]): string {
  if (!row) return '';
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return String(row[k]).trim();
    const foundKey = rowKeys.find(
      (rk) => rk.trim().toLowerCase() === k.trim().toLowerCase()
    );
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return String(row[foundKey]).trim();
    }
  }
  return '';
}

/**
 * Lee un archivo Excel y retorna una promesa con las filas procesadas como JSON.
 */
export function readExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'array', raw: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exporta un arreglo de datos a un archivo Excel (.xlsx).
 */
export function exportToExcel(data: any[], sheetName: string, filenamePrefix: string): void {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`);
}
