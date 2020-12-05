const mongoose = require('mongoose');
const VkBot = require('node-vk-bot-api');
const Markup = require('node-vk-bot-api/lib/markup');
const api = require('node-vk-bot-api/lib/api');
const User = require('./data/user');
const {wordsRussian,wordsUkrainian,questionsRus,questionsUa} = require('./words');



require('dotenv').config();

const bot = new VkBot({
    token: process.env.token,
    group_id: process.env.group_id
});
console.log(`Бот запущен!`);

mongoose.connect(process.env.databaseURL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => {
    console.log('[✅DataBase] Connected!')
});
bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error(err);
    }
});
bot.command('Начать', (ctx) => {
    User.findOne({ id: ctx.message.user_id }, async (err, user) => {
        if (err) console.log(err);
        if (!user) {
            await new User({
                id: ctx.message.user_id,
                language: "ru",
            }).save().catch(err => console.error(err));
        }
        api('groups.getMembers', {
            group_id: process.env.group_id,
            fields: ['online'],
            filter: 'managers',
            access_token: process.env.token
        }).then(data => {
            const activeAdmins = [];
            const nonActiveAdmins = [];
            data.response.items.forEach(i => {
                if (i.online == 1) {
                    activeAdmins.push(`${i.first_name} ${i.last_name} - https://vk.com/id${i.id}`)
                } else {
                    nonActiveAdmins.push(`${i.first_name} ${i.last_name} - https://vk.com/id${i.id}`)
                }
            })
            ctx.reply(`Администраторы группы онлайн:\n${activeAdmins.join("\n")}\nАдминистраторы группы оффлайн:\n${nonActiveAdmins.join("\n")}`)
        })
        const answers = [];
        for (keys in wordsRussian) {
            answers.push(keys)
        }
        return ctx.reply(`Доступные команды:\n/language - выбор языка ru/ua\n/links - полезные ссылки\n /bug - отправить баг разработчику
            \nБыстрые ответы на слова:\n ${answers.join("\n")}
        `)
    })
});
bot.command('/bug', (ctx) => {
    let messageArray = ctx.message.body.split(" ")
    let args = messageArray.slice(1)
    User.findOne({ id: ctx.message.user_id }, async (err, user) => {
        if (err) console.error(err);
        if (!user) {
            await new User({
                id: ctx.message.user_id,
                language: "ru",
            }).save().catch(err => console.error(err));
        }
        if (user.language === 'ua') {
            if (!args[0]) {
                return ctx.reply('[ПОМИЛКА] Вірний синтаксис /bug [Ваша проблема/помилка]')
            }
            await bot.sendMessage(198872768, `[БАГ] Отправил: https://vk.com/id${ctx.message.user_id}. Содержание: ${args.slice(0).join(" ")}`)
            await ctx.reply('Відправленно успішно!')
        } else {
            if (!args[0]) {
                return ctx.reply('[ОШАБКА] Синтаксис /bug [Ваша пробема/ошибка]')
            }
            await bot.sendMessage(198872768, `[БАГ] Отправил: https://vk.com/id${ctx.message.user_id}. Содержание: ${args.slice(0).join(" ")}`)
            await ctx.reply('Отправленно успешно!')
        }
    })
})
bot.command('/language', (ctx) => {
    let messageArray = ctx.message.body.split(" ")
    let args = messageArray.slice(1)
    User.findOne({ id: ctx.message.user_id }, async (err, user) => {
        if (err) console.error(err);
        if (!user) {
            await new User({
                id: ctx.message.user_id,
                language: "ru",
            }).save().catch(err => console.error(err));
        }
        if (user.language === 'ua') {
            if (!args[0]) {
                return ctx.reply("Помилка. Ви не вказали мову. Приклад: /language ru")
            }
            if (args[0].toLowerCase() != 'ua' && args[0].toLowerCase() != 'ru') {
                return ctx.reply("Помилка. Мову вказано не вірно! Приклад: /language ru")
            }
            if (user.language == args[0]) {
                return ctx.reply(`У вас вже застосована Українська Мова!`)
            }
            user.language = args[0].toLowerCase();
            user.save();
            return ctx.reply(`Успіх! Ви змінили мову на Російську!`)
        } else {
            if (!args[0]) {
                return ctx.reply("Ошибка. Вы не указали язык.Пример: /language ru/ua")
            }
            if (args[0].toLowerCase() != 'ua' && args[0].toLowerCase() != 'ru') {
                return ctx.reply("Ошибка. Язык указан не верно! Приклад: /language ru")
            }
            if (user.language == args[0]) {
                return ctx.reply(`У вас уже указан Русский Язык!`)
            }
            user.language = args[0].toLowerCase();
            user.save();
            return ctx.reply(`Успех! Вы изменили язык на Украинский!`)
        }
    })
});
bot.command('/links', (ctx) => {
    User.findOne({ id: ctx.message.user_id }, async (err, user) => {
        if (err) console.log(err);
        if (!user) {
            await new User({
                id: ctx.message.user_id,
                language: "ru",
            }).save().catch(err => console.error(err));
        }
        if (user.language === 'ua') {
            return ctx.reply("Подивися униз 👇", null, Markup
                .keyboard([
                    Markup.button({
                        action: {
                            type: 'open_link',
                            link: 'http://forum.rodina-rp.com',
                            label: 'Зайти до форуму',
                            payload: JSON.stringify({
                                url: 'http://forum.rodina-rp.com',
                            }),
                        },
                    }),
                    Markup.button({
                        action: {
                            type: 'open_link',
                            link: 'https://rodina-rp.com',
                            label: 'Зайти до сайту',
                            payload: JSON.stringify({
                                url: 'https://rodina-rp.com',
                            }),
                        },
                    }),
                ]).oneTime(),
            )
        } else {
            return ctx.reply("Посмотри вниз 👇", null, Markup
                .keyboard([
                    Markup.button({
                        action: {
                            type: 'open_link',
                            link: 'http://forum.rodina-rp.com',
                            label: 'Перейти на форум',
                            payload: JSON.stringify({
                                url: 'http://forum.rodina-rp.com',
                            }),
                        },
                    }),
                    Markup.button({
                        action: {
                            type: 'open_link',
                            link: 'https://rodina-rp.com',
                            label: 'Перейти на сайт',
                            payload: JSON.stringify({
                                url: 'https://rodina-rp.com',
                            }),
                        },
                    }),
                ]).oneTime(),
            )
        }
    })
})

bot.event('message_new', (ctx) => {

    User.findOne({ id: ctx.message.user_id }, async (err, user) => {
        if (err) console.err(err);
        if (!user) {
            return new User({
                id: ctx.message.user_id,
                language: "ru",
            }).save().catch(err => console.error(err));
        }
        if (user.language === 'ua') {
            for (key in wordsUkrainian) {
                if (ctx.message.body.toLowerCase().includes(key.toLowerCase())) {
                    return ctx.reply(wordsUkrainian[key])
                }
            }
            for (key in questionsUa) {
                if (ctx.message.body.toLowerCase().includes(key.toLowerCase())) {
                    return ctx.reply(questionsUa[key])
                }
            }
        } else {
            for (key in wordsRussian) {
                if (ctx.message.body.toLowerCase().includes(key.toLowerCase())) {
                    return ctx.reply(wordsRussian[key])
                }
            }
            for (key in questionsRus) {
                if (ctx.message.body.toLowerCase().includes(key.toLowerCase())) {
                    return ctx.reply(questionsRus[key])
                }
            }
        }
    })
});

bot.startPolling((err) => {
    if (err) {
        console.error(err);
    }
});