const telegramApi = require('node-telegram-bot-api')
const {gameOptions,againOptions}=require('./options.js')
const puppeteer = require('puppeteer');
const token ='5334946977:AAEOJjMm3Up22H-rOkn9jnU-CGDBKJR-e-4';
const cheerio = require('cheerio')
const bot = new telegramApi(token,{polling:true})
const chats={}


const sendTiktoks= async (chatId,tiktok)=>{
    const browser= await puppeteer.launch({headless:true});
    const page=await browser.newPage();

    await page.goto('https://snaptik.app/en')  

    await page.setViewport({
    width:1920,
    height:1080
    })

   await page.waitForSelector('#url');
    //
   await page.type('#url',`${tiktok}`)
   await page.click('#submiturl')

   await page.waitForXPath('//*[@id="snaptik-video"]/article/div[2]/div/a[1]')
 
   var content = await page.content();
   await browser.close();
  
    const videos= async ()=>{
   const urlS={}
    const $ = cheerio.load(content)
    $('.abutton').each((i, elem)=>{
    if(i==1){
    const url=$(elem).attr('href')
    urlS['key']=url
    }
   })
   return urlS
}
   const res =await videos()
   console.log(res)
return  bot.sendVideo(chatId,`${res.key}`)
}


const balli=async (chatId)=>{
    const browser= await puppeteer.launch({headless:true});
    const page=await browser.newPage();
    try{
         await page.goto('https://abiturient.belstu.by/wp-content/uploads/2022/08/dp-ab2022-3.htm')  
    }
    catch(err){
        throw new err;

    }
    await page.waitForSelector('.xl18130059');
    await page.setViewport({width:3000,height:3000})
    var img= await page.screenshot()
    await browser.close();
    await bot.sendPhoto(chatId,img)
}

const startGame=async (chatId)=>{
    await bot.sendMessage(chatId,`отгадай число от 0 до 9`);
    const randomNumber=Math.floor(Math.random()*10)
    console.log(randomNumber)
    chats[chatId]=randomNumber;
    await bot.sendMessage(chatId,'отгадацй число',gameOptions)
}

const start =()=>{

    bot.setMyCommands([
    {command:'/start',description:'приветствие(не с сеней)'},
    {command:'/info',description:'какой у тебя ник '},
    {command:'/game',description:'игра '},
    {command:'/balls',description:'баллы платка '},
    {command:'/tiktoks',description:'тиктак'},])

    bot.on('message',async msg=>{
    const text=msg.text;
    const chatId=msg.chat.id;

    if(text==='/start'){
       await bot.sendSticker(chatId,'https://tlgrm.ru/_/stickers/e3a/876/e3a87689-707f-3495-b94a-8ee96e2538e5/1.webp')
       return bot.sendMessage(chatId,'сеня свинья а тебе привет');
    }
    if(text==='/info'){
        return bot.sendMessage(chatId,`тебя зовут ${msg.from.first_name}`);
    }
    if(text==='/game'){
        return startGame(chatId);
    }
    if(text==='/balls'){
        return balli(chatId);
    }
    if(text==='/tiktoks'){
        await bot.sendMessage(chatId,'отправь ссылку на тикток');
        bot.onText(/https\:\/\/[\w\-\.\/]+/, async tiktok=>{
            var tik = tiktok.text;
            return sendTiktoks(chatId,tik);
        })
        return;
    }
    
    return bot.sendMessage(chatId,`такой команды нет`);
    })
    bot.on('callback_query',async msg=>{
        const data=msg.data;
        const chatId=msg.message.chat.id;
        if(data=='/again'){
            return startGame(chatId);
        }
        if(data==chats[chatId]){
            return await bot.sendMessage(chatId,`ты отгадал ${chats[chatId]}`,againOptions);
        }
        else{
            return await bot.sendMessage(chatId,`ты не отгадал загаданное число было  ${chats[chatId]}`,againOptions);
        }
    }
    )
}
start();