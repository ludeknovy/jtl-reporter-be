import * as XLSX from "xlsx"

export class ExcelService {


  static generateExcelBuffer(json: unknown[]): string {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json)
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ["data"] }
    return XLSX.write(workbook, { bookType: "xlsx", bookSST: false, type: "base64" })
  }
}
