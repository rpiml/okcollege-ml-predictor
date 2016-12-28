import csv from 'csv';

export function parseCSV(csvData){
  return new Promise((resolve, reject) => {
    csv.parse(csvData, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}


export default parseCSV;
