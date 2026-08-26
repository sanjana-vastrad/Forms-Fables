import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  fileExtension = '.xlsx';

  constructor() { }

  public exportExcel(jsonData: any[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);
  }

  exportExcel1(jsonData: any[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);
    const headers = Object.keys(jsonData[0]);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
    jsonData.forEach((data, rowIndex) => {
      const row: any = [];
      headers.forEach((header, colIndex) => {
        if (header === 'Attachment' && data[header] !== '-') {
          row[colIndex] = {
            f: `HYPERLINK("${data[header].replace('=HYPERLINK("', '').replace('", "Download")', '')}", "View Attachment")`,
          };
        } else {
          row[colIndex] = data[header];
        }
      });
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: { r: rowIndex + 1, c: 0 } });
    });

    // Create workbook and write buffer
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    // Save to file
    this.saveExcelFile(excelBuffer, fileName);
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: this.fileType });
    FileSaver.saveAs(data, fileName + this.fileExtension);
  }

  multipleTableExportAsExcel(jsonData1: any[], jsonData2: any[], jsonData3: any[], fileName: string): void {
    let wb: XLSX.WorkBook;
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData1);
    const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData2);
    const ws3: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData3);

    wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Billable');
    XLSX.utils.book_append_sheet(wb, ws2, 'Non Billable');
    XLSX.utils.book_append_sheet(wb, ws3, 'Total');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);
  }

  exportExcelWithCustomSheetName(jsonData: any[], fileName: string, sheetName: string = "", titleArry: any[] = []): void {
    let Heading1 = [[(titleArry.length > 0) ? titleArry[0] : 'Title1 goes here']];
    let Heading2 = [[(titleArry.length > 0) ? titleArry[1] : 'Title2 goes here']];

    var merge1 = { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } };
    var merge2 = { s: { r: 1, c: 0 }, e: { r: 2, c: 11 } };

    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(merge1);
    ws['!merges'].push(merge2);

    XLSX.utils.sheet_add_aoa(ws, Heading1, { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(ws, Heading2, { origin: 'A2' });

    var startfrom = 5;
    XLSX.utils.sheet_add_json(ws, jsonData, { origin: 'A' + startfrom });
    XLSX.utils.book_append_sheet(wb, ws, (sheetName.length > 0) ? sheetName : 'data');
    XLSX.writeFile(wb, fileName + this.fileExtension, { cellStyles: true });
  }

  exportExcelWithCustomSheetNameWithMultipleData(dataToexport: any[], fileName: string): void {
    let wb: XLSX.WorkBook = XLSX.utils.book_new();

    for (let i = 0; i < dataToexport.length; i++) {
      let Heading1 = [[(dataToexport[i]["title"].length > 0) ? dataToexport[i]["title"][0] : 'Title1 goes here']];
      let Heading2 = [[(dataToexport[i]["title"].length > 0) ? dataToexport[i]["title"][1] : 'Title2 goes here']];
      let Heading3 = [[(dataToexport[i]["title"].length > 0) ? dataToexport[i]["title"][2] : 'Title3 goes here']];

      var merge1 = { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } };
      var merge2 = { s: { r: 1, c: 0 }, e: { r: 2, c: 11 } };
      var merge3 = { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } };

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(merge1);
      ws['!merges'].push(merge2);
      ws['!merges'].push(merge3);

      XLSX.utils.sheet_add_aoa(ws, Heading1, { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(ws, Heading2, { origin: 'A2' });
      XLSX.utils.sheet_add_aoa(ws, Heading3, { origin: 'A4' });

      var startfrom = 6;
      XLSX.utils.sheet_add_json(ws, dataToexport[i]["data"], { origin: 'A' + startfrom });
      const sheetName = (dataToexport[i]["name"].length > 0) ? ((dataToexport[i]["name"].length > 29) ? (dataToexport[i]["name"].substring(0, 29)) : (dataToexport[i]["name"])) : 'data';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);
  }
}
