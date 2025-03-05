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
