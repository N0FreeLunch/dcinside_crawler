const csv = require('csv-parser')
const fs = require('fs')
const results = [];
const filenName = "";

const row = (record, index) => {
  const bg_color = index%2==0 ? "#faf0f0" : "#f0f0fa";
  return `
  <tr style="background-color:${bg_color};">
    <td style="border-right:dotted 1px black; border-bottom:dotted 1px black;">${index+1}</td>
    <td style="border-right:dotted 1px black; border-bottom:dotted 1px black; padding:0.5%; font-size: 0.8em;">${record[2]}</td>
    <td style="border-right:dotted 1px black; border-bottom:dotted 1px black; padding:0.5%;">
      <a target="_blank" style="text-decoration:none; padding:1%;" href="${record[3]}">${record[1]}</a>
    </td >
    <td style="border-bottom:dotted 1px black; padding:0.5%; font-size: 0.6em;">추천 : ${record[4]}</td>
  </tr>`;
}

const makeTable = (fullArray) => {
  return fullArray.reduce((x,y,i) => {
    return x+row(y, i);
  },"");
}

const makeCSV = (writeString) => {
  fs.writeFile(fileName, writeString, function (err) {
    if (err) return console.log(err);
    console.log('tsv saved :',fileName);
  });
}


fs.createReadStream(filenName)
  .pipe(csv({ separator: '\t'}))
  .on('data', (data) => {
    const arrayRow = [];
    for(var e in data) {
      arrayRow.push(data[e]);
    }
    console.log(arrayRow);
    results.push(arrayRow);
  })
  .on('end', () => {
    const tbody = makeTable(results);
    const table = `<table style="border:solid 1px black; width:80%; margin: 0 auto; text-align:center;">${tbody}</table>`;
    makeCSV(table);
  });
