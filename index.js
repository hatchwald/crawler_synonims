const puppeteer = require('puppeteer');
const jsonfile = require('jsonfile');
const file_json = 'result.json';

(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.goto('https://lektur.id/daftar-sinonim/');
  var arr_temp = [];
  const synonimData = await page.evaluate(() => {
  	let links = []
    let linksEl = document.querySelectorAll('.article-post ul li')
    linksEl.forEach((linkelem) => {
      let linkjson = {}
      try {
        linkjson.attribute = linkelem.querySelector('a').text
        linkjson.link = linkelem.querySelector('a').getAttribute('href')

      } catch (exception) {
        console.log('some error was happen')
        console.log(exception)
      }
      links.push(linkjson)
    });
    return links
  })

  //deeper loop
  for (var abj_syn of synonimData) {
    await page.goto(abj_syn.link)
    const AbjWord = await page.evaluate(() => {
      let link_abjword = []
      let AbjWordEl = document.querySelectorAll('.article-post ul li')
      AbjWordEl.forEach(async abj_wordel => {
        let abjword_json = {}
        try {
          abjword_json.attribute = abj_wordel.querySelector('a').text
          abjword_json.link = abj_wordel.querySelector('a').getAttribute('href')
        } catch (error) {
          console.log('some error happen')
          console.log(error)
        }
        link_abjword.push(abjword_json)
        
      // get page number
    let nav_page = document.querySelectorAll('.article-post .text-center span')
    if(nav_page.length > 0){
      let last_arrs = nav_page[nav_page.length - 1] 
      let last_page = last_arrs.querySelector('span a').text
      let current_url = window.location.href 
      let regs = /[0-9]+(?!.*[0-9])/;
      for (let index = 2; index <= last_page; index++) {
        var next_url = current_url.replace(regs,index)
        await page.goto(next_url)
        //doing something 
        const next_page =  await page.evaluate(() => {
          let el_next_page = document.querySelectorAll('.article-post ul li')
          el_next_page.forEach(element => {
            let next_page_json = {}
            try {
              next_page_json.attribute = element.querySelector('a').text
              next_page_json.link = element.querySelector('a').getAttribute('href')
            } catch (error) {
              console.error(error)
            }
            link_abjword.push(next_page_json)
          });
        })
      }
    }
      });
      return link_abjword
    })
    
    arr_temp.push(AbjWord)
    // console.dir(arr_temp)
  }
  var json_val = JSON.stringify(arr_temp);
  jsonfile.writeFile(file_json,json_val).then(res =>  {
    console.log('write complete')
  }).catch(error  =>  console.error(error))
  await browser.close();
})();