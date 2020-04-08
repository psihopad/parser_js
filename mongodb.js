let webdriver = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let chromedriver = require('chromedriver');

By = webdriver.By;
Keys = webdriver.Key;

const MongoClient = require("mongodb").MongoClient;

// создаем объект MongoClient и передаем ему строку подключения
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true,useNewUrlParser: true });
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
var driver = new webdriver.Builder()
                 .withCapabilities(webdriver.Capabilities.chrome())
                 .build();
async function parser_music() {
    await driver.get('https://www.shazam.com');
    await driver.manage().window().maximize();
    var chart = await driver.findElement(By.xpath('/html/body/div[3]/header/child::div/child::div[2]/child::div/child::div/child::div[2]/child::nav/child::ul/child::li[3]/child::a')).getAttribute('href');
    await driver.get(chart);
    mongoClient.connect(function(err, client){
      
        const db = client.db("datadb");
        const collection = db.collection("docs"); 
        var docs = [];
    driver.sleep(20000).then(async function() {    
                                                        
        for (let i = 1; i < 51; i++) {
            try{
            var name = await driver.findElement(By.xpath('/html/body/div[3]/div/main/child::div/child::div[2]/child::div[1]/child::ul/child::li[' + i + ']/child::article/child::div/child::div[2]/child::div[1]/child::a')).getText();
            }
            catch(e){
                console.log('Помилка');
            }
            try{
            var link = await driver.findElement(By.xpath('/html/body/div[3]/div/main/child::div/child::div[2]/child::div[1]/child::ul/child::li[' + i + ']/child::article/child::div/child::div[2]/child::div[1]/child::a')).getAttribute('href');
            }
            catch(e){
                console.log('Помилка');
            }
            try{
            var foto = await driver.findElement(By.xpath('/html/body/div[3]/div/main/child::div/child::div[2]/child::div[1]/child::ul/child::li[' + i + ']/child::article/child::div/child::a')).getAttribute('style');
            var foto_link = foto.split('(')[1].replace(')','').replace('"','').replace('"','');
            }
            catch(e){
                console.log('Помилка');
            }
            try{
                var artist = await driver.findElement(By.xpath('/html/body/div[3]/div/main/child::div/child::div[2]/child::div[1]/child::ul/child::li[' + i + ']/child::article/child::div/child::div[2]/child::div[2]/child::a')).getText();
            }
            catch(e){
                var artist = await driver.findElement(By.xpath('/html/body/div[3]/div/main/child::div/child::div[2]/child::div[1]/child::ul/child::li[' + i + ']/child::article/child::div/child::div[2]/child::div[2]')).getText();
            }
            
            console.log(`[${i}] Назва пісні: ${name}\nСпівак: ${artist}\nСилка на пісню: ${link}\nСилка на фото: ${foto_link}`)  
                                                                                                    
        
        
        var doc = {id:i,artists:artist,name: name, link:link, foto:foto_link};
        
        collection.insertOne(doc)
            
            
    }
    client.close();
});
});}

parser_music();