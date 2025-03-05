import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/logo-black.png';

/**
 * Downloads a CSV file generated from the provided columns and report data.
 * @param {string[]} columns - An array of column headers for the CSV.
 * @param {string[][]} report - A 2D array representing the rows of the report.
 */
export const downloadCSV = (columns: string[], report: string[][]) => {
  const csv =
    columns!.map((column) => column).join(',') +
    '\n' +
    report!
      .map((row) =>
        row
          .map((val) =>
            typeof val === 'string' ? val.replace(/,/g, ';') : val
          )
          .join(',')
      )
      .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'report.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Downloads a PDF file generated from the provided report name, columns, and report data.
 * @param {string} reportName - The name of the report to be used as the title in the PDF.
 * @param {string[]} columns - An array of column headers for the PDF table.
 * @param {string[][]} report - A 2D array representing the rows of the report.
 */
export const downloadPDF = (
  reportName: string,
  columns: string[],
  report: string[][]
) => {
  const doc = new jsPDF();
  doc.setFontSize(24);
  console.log(reportName);
  const imgWidth = 50;
  const imgHeight = 20;
  const imgX = doc.internal.pageSize.getWidth() - imgWidth - 10;
  const imgY = 10;
  doc.addImage(logo, 'PNG', imgX, imgY, imgWidth, imgHeight);
  doc.text(reportName, 10, 20);
  autoTable(doc, {
    startY: 30,
    head: [columns],
    body: report
  });
  doc.save('report.pdf');
};
