const http = require('http');
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');
const cliProgress = require('cli-progress');
const fs = require('fs');

const galleryName = "";

const blackListID = ['];
const blackListIP = ['117.111','101.96','218.51'];


let dataMap = new Map();
const domain = "gall.dcinside.com";

const b1 = new cliProgress.SingleBar({
    clearOnComplete: false,
    hideCursor: true
});

const getData = (pageNum = 1, minLike=20) => {
  let response = "";
  http.get({
    hostname: domain,
    port: 80,
    path: `/board/lists/?id=${galleryName}&page=${pageNum}`,
    agent: false  // Create a new agent just for this one request
  }, (res) => {
    // Do stuff with response
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      if(chunk) {
        response += chunk;
      }
    });
    res.on('end', () => {
      const dom = htmlparser2.parseDOM(response);
      $ = cheerio.load(dom);
      const list = $('.ub-content.us-post');
      $('.ub-content.us-post').each((i, e) => {
        const item = $(e);
        const ip = item.find('.gall_writer.ub-writer > .ip').text();
        const id = item.find('.gall_writer.ub-writer > .nickname em').text();

        const isBlackList = (blackListIP.find(e => {
          return ip.indexOf(e) >= 0;
        }) || blackListID.find(e => {
          return id.indexOf(e) >= 0;
        }));

        if(Number(item.find('.gall_recommend').text()) >= minLike && !isBlackList){
          const key = item.find('.gall_num').text();
          const json = {
            title : item.find('.gall_tit.ub-word > a').first().text().replace(/[\r\t\n]/g,"").replace(/\[\d\]\s*$/g,""),
            like : item.find('.gall_recommend').text(),
            url : "https://" + domain + item.find('.gall_tit.ub-word > a').attr('href').replace(/&_rk=\w+/,"").replace(/&page=\d+/,""),
            date : item.find('.gall_date').attr('title'),
          }
          dataMap.set(key, json);
        }
      });
    })
  });
}

const convertArray = () => {
  const tempArray = [];
  dataMap.forEach((value, key, map) => {
    tempArray.push([key, value.title, value.date, value.url, value.like]);
  });
  return tempArray;
}

const csvString= (dataArrays) => {
  return dataArrays.reduce((x,y) => {
    return x + "\n" + y.join('\t');
  },"");
}

const makeCSV = (writeString) => {
  const fileName = new Date().toLocaleString().replace(/\s+/g,"_") + ".tsv";
  fs.writeFile(fileName, writeString, function (err) {
    if (err) return console.log(err);
    console.log('tsv saved :',fileName);
  });
}

const main = (like, endPage) => {
  const start = (like, endPage) => {
    setTimeout(() =>{
      getData(endPage, like);
      endPage--;
      b1.increment();
      if(endPage > 0){
        start(like, endPage);
      }else{
        let sleepTime = 3000;
        if(endPage%30 == 0){
          sleepTime = 20000;
        }
        setTimeout(() => {
          const arrayData = convertArray(dataMap);
          const csvData = csvString(arrayData);
          console.log(csvData);
          makeCSV(csvData);
          b1.stop();
        },sleepTime);
      }
    },2000);
  }
  b1.start(endPage, 0, {
      speed: "N/A"
  });
  start(like, endPage);
}

// main(20,10);
main(20,1200);
