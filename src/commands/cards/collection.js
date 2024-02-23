const path = require('path');

module.exports = {
  name: "collection",
  aliases: ["collected" , "coll"],
  cool: 10,
  react: "✅",
  category: "card game",
  react: "🃏",
  description: "View your collection cards",
  async execute(client, arg, M) {
    try {
   const collection = (await client.DB.get(`${M.sender}_Collection`)) || [];
      if (collection.length === 0) {
        return M.reply("You currently don't have any cards in your collection")
      }

     const uniqueCards = collection.filter((card, index) => collection.indexOf(card) === index);
      let tag = M.sender.substring(3, 7);
      let tr = `\n*🏷️ Tag:* #${tag}\n\n *🔖 Total claimed Cards in Collection:* ${uniqueCards.length}↯\n\n`;
      for (let i = 0; i < uniqueCards.length; i++) {
        let card = uniqueCards[i].split("-");
       const filePath = path.join(__dirname,'./card.json');
        const data = require(filePath);
        const newArray = data.filter(function (I) {
          return I.tier == card[1];
        });
        const index = newArray.findIndex((cardData) => cardData.title == card[0]);
        const obj = newArray[index];
        tr += `*💮 Name:* ${card[0]}\n💠 Tier: ${obj.tier}\n\n`;
      }
      if (arg) {
        const index = parseInt(arg) - 1;
        if (isNaN(index) || index < 0 || index >= collection.length) {
          return M.reply(`Invalid card index. Your deck has ${collection.length} cards.`);
        }
        const card = collection[index].split('-');
         const filePath = path.join(__dirname,'./card.json');
        const data = require(filePath);
        const cardsInTier = data.filter((cardData) => cardData.tier === card[1]);
        const cardData = cardsInTier.find((cardData) => cardData.title === card[0]);
        const cardUrl = cardData.url;
        let tex = `🃏 Total Deck Cards: ${collection.length}\n\n🏮 Username: ${(await client.contact.getContact(M.sender, client)).username}`
        tex += `\n*#${index + 1}*\n🃏 *Name:* ${card[0]}\n`.concat(`🪄 *Tier:* ${card[1]} \n`);
        await client.sendMessage(M.from, {image: {url: cardUrl}, caption: tex}, {quoted: M});
      } else {
        const images = [];
        let cardText = "";
        const cardSet = new Set();
        for (let i = 0; i < collection.length; i++) {
          const card = collection[i].split('-');
           const filePath = path.join(__dirname,'./card.json');
          const data = require(filePath);
          const cardsInTier = data.filter((cardData) => cardData.tier === card[1]);
          const cardData = cardsInTier.find((cardData) => cardData.title === card[0]);
          let cardUrl = cardData.url;
          if (!cardSet.has(cardData.title)) {
            cardSet.add(cardData.title);
            images.push(cardUrl);
          }
          cardText += `🔰Card ${i+1}:\n\n🌟Tier: ${card[1]}\n\n💎Name ${card[0]}\n`;
        }
        await client.sendMessage(M.from, tr);
        }
      }),
    };
