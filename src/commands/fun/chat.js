const axios = require('axios')

module.exports = {
    name: "chat",
    alias: ['botchat'],
    desc: "Gives you random advices for your broken life.",
    category: "fun",
    react:"📛",
 async execute(client, arg, M) {

   await axios
        .get(
          `${encodeURI(`http://api.brainshop.ai/get?bid=174519&key=ZeACimjk1Kd86Uyw&uid=[uid]&msg=${arg}`)}`
        )
        .then((res) => {
          if (res.status !== 200)
            return M.reply(`🔍 Error: ${res.status}`);
          return M.reply(res.data.cnt);
        })
        .catch(() => {
          M.reply(`Yeah lets have a conversation...`);
        });
    } 
  };