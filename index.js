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
    const nav_els = await page.$$('.article-post .text-center span')
    const AbjWord = await page.evaluate( () => {
      let link_abjword = []
      let AbjWordEl = document.querySelectorAll('.article-post ul li')
      AbjWordEl.forEach( abj_wordel => {
        let abjword_json = {}
        try {
          abjword_json.attribute = abj_wordel.querySelector('a').text
          abjword_json.link = abj_wordel.querySelector('a').getAttribute('href')
        } catch (error) {
          console.log('some error happen')
          console.log(error)
        }
        link_abjword.push(abjword_json)
      });
      return link_abjword
    })
    
    if( nav_els.length > 0){
     const temps = await page.evaluate( () => {
       let all_temps = document.querySelectorAll('.article-post .text-center span')
       let max_all = all_temps[ all_temps.length -1 ]
       const all_vals = max_all.querySelector('span a').text
      return all_vals
     })

     let regs = /[0-9]+(?!.*[0-9])/;
     var current_url = page.url();
     for (let index = 2; index <= 3; index++) {
      var next_url = current_url.replace(regs,index)
      await page.goto(next_url)
      const next_pages = await page.evaluate( () => {
        let temp_next = [];
        let el_next_page = document.querySelectorAll('.article-post ul li')
        el_next_page.forEach(element => {
          let next_page_json = {}
          try {
            next_page_json.attribute = element.querySelector('a').text
            next_page_json.link = element.querySelector('a').getAttribute('href')
          } catch (error) {
            console.error(error)
          }
          temp_next.push(next_page_json)
        });
        return temp_next
      })
      //  arr_temp.push(next_pages)
      //  console.log(next_pages)
      arr_temp.push(AbjWord.concat(next_pages))
     }

    }
    // arr_temp.push(AbjWord)
    // console.dir(arr_temp)
  }
  console.dir(arr_temp)
  // var json_val = JSON.stringify(arr_temp);
  // jsonfile.writeFile(file_json,json_val).then(res =>  {
  //   console.log('write complete')
  // }).catch(error  =>  console.error(error))
  await browser.close();
})();