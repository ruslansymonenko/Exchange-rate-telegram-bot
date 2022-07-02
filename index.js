const { 
    Telegraf,
    Markup
} = require('telegraf');
require('dotenv').config();
const text = require('./const');
const axios = require('axios');
const cc = require('currency-codes');

let currencyDB;

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => {
    ctx.reply(`Привет ${ctx.message.from.first_name ? ctx.message.from.first_name : 'человек'}, хочешь узнать актуальный курс валют?`);
    ctx.replyWithHTML('<i>Решай</i>', Markup.inlineKeyboard(
        [
            [Markup.button.callback('Да', 'btn_confirm'), Markup.button.callback('Нет', 'btn_reject')]
        ]
    ))
});

bot.help((ctx) => ctx.reply(text.commands));


bot.action('btn_confirm', async (ctx) => {
    try {
        await ctx.answerCbQuery();
        currencyDB = await axios.get('https://api.monobank.ua/bank/currency');
        ctx.replyWithHTML('Выбери валютную пару', Markup.inlineKeyboard(
            [
                [Markup.button.callback('UAH/USD', 'btn_UAHUSD'), Markup.button.callback('UAH/EUR', 'btn_UAHEUR')],
                [Markup.button.callback('UAH/GBP', 'btn_UAHGBP'), Markup.button.callback('UAH/PLN', 'btn_UAHPLN')]
            ]
        ))
    } catch(e) {
        console.log(e);
    }
})

bot.action('btn_reject', async (ctx) => {
    await ctx.reply('Тогда заходи в другой раз.');
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


bot.action('btn_UAHUSD', (ctx) => {
    let currencyInfo = getExchangeRate(currencyDB, 'USD');
    ctx.reply(`Актуальный курс по паре UAH/USD: 
    Покупка: ${currencyInfo.rateBuy} 
    Продажа: ${currencyInfo.rateSell}`);
});
bot.action('btn_UAHEUR',  (ctx) => {
    let currencyInfo = getExchangeRate(currencyDB, 'EUR');
    ctx.reply(`Актуальный курс по паре UAH/EUR: 
    Покупка: ${currencyInfo.rateBuy} 
    Продажа: ${currencyInfo.rateSell}`);
});
bot.action('btn_UAHGBP',  (ctx) => {
    let currencyInfo = getExchangeRate(currencyDB, 'GBP');
    ctx.reply(`Актуальный курс по паре UAH/GBP: 
    Покупка/Продажа: ${currencyInfo.rateCross * 1}`);
});
bot.action('btn_UAHPLN',  (ctx) => {
    let currencyInfo = getExchangeRate(currencyDB, 'PLN');
    ctx.reply(`Актуальный курс по паре UAH/PLN: 
    Покупка/Продажа: ${currencyInfo.rateCross * 1}`);
});


function getExchangeRate (exchangeDB, currencyCodA) {
    let currencyToFind = cc.code(currencyCodA).number;
    let currenciesArr = exchangeDB.data;

    for (let i = 0; i < currenciesArr.length; i++) {
        let currencyToCheck = currenciesArr[i];
        for (let key in currencyToCheck) {
            if (currencyToCheck[key] == currencyToFind) {
                console.log(currencyToCheck);
                return currencyToCheck
            }
        }
    }
}