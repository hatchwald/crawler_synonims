const puppeteer = require('puppeteer');
const jsonfile = require('jsonfile');
const file_json = 'result.json';

(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.goto('https://lektur.id/daftar-sinonim/');
  page.setDefaultTimeout(300000)
  var arr_temp = [];
  var arr1 = [];
  var arr2 = [];
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
    page.setDefaultTimeout(300000)
    const nav_els = await page.$$('.article-post .text-center span')
    const AbjWord = await page.evaluate( () => {
      let link_abjword = []
      let AbjWordEl = document.querySelectorAll('.article-post ul li')
      AbjWordEl.forEach( (abj_wordel) => {
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
    arr1.push(AbjWord)

    if( nav_els.length > 0){
     const temps = await page.evaluate( () => {
       let all_temps = document.querySelectorAll('.article-post .text-center span')
       let max_all = all_temps[ all_temps.length -1 ]
       const all_vals = max_all.querySelector('span a').text
      return all_vals
     })

     let regs = /[0-9]+(?!.*[0-9])/;
     var current_url = page.url();
     for (let index = 2; index <= temps; index++) {
      var next_url = current_url.replace(regs,index)
      await page.goto(next_url)
      const next_pages = await page.evaluate( () => {
        let temp_next = [];
        let el_next_page = document.querySelectorAll('.article-post ul li')
        el_next_page.forEach( (element) => {
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
       arr2.push(next_pages)
     }

    }
  }
  var final_arr = arr1.concat(arr2)
  var rest_arr = []
  for(var element of final_arr){
    for(var elements of element){
      //digging deeper for reach words
      await page.goto(elements.link)
      page.setDefaultTimeout(300000)
      var orig_word = elements.link.split('sinonim-').pop().replace(/[^\w\s]/gi, ' ')
      let all_synonim_json = {}
      const all_synonims = await page.evaluate( () => {
        let arr_temp_synonim = []
        let all_synonim_el = document.querySelectorAll('.article-post ol li')
        all_synonim_el.forEach( el => {
          try {
             arr_temp_synonim.push(el.querySelector('li a').text)
          } catch (error) {
            console.error(error)
          }
          
        });
        return arr_temp_synonim
      })
      all_synonim_json[orig_word] = all_synonims
      rest_arr.push(all_synonim_json)
    }
  }
 
  
  // console.dir(rest_arr)
  jsonfile.writeFile(file_json,rest_arr).then(res =>  {
    console.log('write complete')
  }).catch(error  =>  console.error(error))
  await browser.close();
})();