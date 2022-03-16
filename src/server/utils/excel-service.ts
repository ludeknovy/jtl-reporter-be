import * as XLSX from "xlsx"

export class ExcelService {


  static generateExcelBuffer(json: unknown[]): string {
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json)
    const myworkbook: XLSX.WorkBook = { Sheets: { data: myworksheet }, SheetNames: ["data"] }
    return XLSX.write(myworkbook, { bookType: "xlsx", bookSST: false, type: "base64" })
  }

}
