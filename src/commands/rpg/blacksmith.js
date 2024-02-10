const blacksmith = {
    createsword: {
        iron: {
            id: 3,
            material: {
                wood: 5,
                iron: 7,
                string: 4
           
        },
        gold: {
            id: 4,
            material: {
                wood: 5,
                string: 4,
                gold: 7
           
        },
        diamond: {
            id: 6,
            material: {
                wood: 5,
                string: 4,
                diamond: 7
           
        },
        emerald: {
            id: 7,
            material: {
                wood: 5,
                string: 4,
                emerald: 7
          
        }
    },
    createarmor: {
        iron: {
            id: 3,
            material: {
                wood: 5,
                iron: 7,
                string: 4
          
        },
        gold: {
            id: 4,
            material: {
                wood: 5,
                string: 4,
                gold: 7
        
        },
        diamond: {
            id: 6,
            material: {
                wood: 5,
                string: 4,
                diamond: 7
            
        },
        emerald: {
            id: 7,
            material: {
                wood: 5,
                string: 4,
                emerald: 7
        
        }
    },
    createpickaxe: {
        iron: {
            id: 3,
            material: {
                wood: 5,
                iron: 7,
                string: 4
        
        },
        gold: {
            id: 4,
            material: {
                wood: 5,
                string: 4,
                gold: 7
        
        },
        diamond: {
            id: 6,
            material: {
                wood: 5,
                string: 4,
                diamond: 7
            
        },
        emerald: {
            id: 7,
            material: {
                wood: 5,
                string: 4,
                emerald: 7
    
        }
    },
    createfishingrod: {
        normal: {
            id: true,
            material: {
                wood: 5,
                string: 15
            }
        }

module.exports = {
    name: 'blacksmith',
    aliases: [...createlist],
    category: 'rpg',
    exp: 8,
    react: "✅",
    description: 'Blacksmith where weapons are made',
    async execute(client, arg, M) {
 const rpg = (await client.DB.get('rpg')) || []
   if (!rpg.includes(M.from)) return M.reply(` *🟥 rpg is not enabled in current group ask mods to activate* `)
    const createlist = ['createsword', 'createpickaxe', 'createarmor', 'createfishingrod']
      const command = M.body.split(' ')[0].toLowerCase().slice(client.prefix.length).trim()
        if (command === 'blacksmith') {
            const objKeys = Object.keys(blacksmith)
            let text = '======🥢 BLACKSMITH🥢======\n\n'
            for (const v of objKeys) {
                const list = Object.fromEntries(Object.entries(blacksmith[v]))
                const __list = Object.keys(list)
                const typeEmoji = ['⚔️', '🛡️', '⛏️', '🎣']
                let items = ''
                for (const abc of __list) {
                    let material = ''
                    for (let __c in blacksmith[v][abc].material) {
                        material += blacksmith[v][abc].material[__c] + __c + ' '
                    }
                    items += `\n\n⛄ *Type*: ${client.utils.capitalize(
                        abc
                    )}\n⚖️ *Required*: ${material}\n💵 *Price*: ${blacksmith[v][abc] * 5
                        }\n*>>Example*: ${client.prefix}${v} ${abc}\n\n`
                }
                text += `${typeEmoji[objKeys.indexOf(v)]} *${client.utils.capitalize(v, true)}* ${items}`
            }
            return M.reply(text)
        }
        const type =
            command == 'createsword'
                ? 'sword'
                : command == 'createarmor'
                    ? 'armor'
                    : command == 'createpickaxe'
                        ? 'pickaxe'
                        : 'fishingrod'
        if (await client.rpg.get(`${M.sender}[${type}]`))
            return M.reply(`👴🏽⛏️ : I see you still have ${type}, come when your ${type} is destroyed`)
        M.reply(
            `👴🏽⛏️ : Looks like I managed to make your ${arg.trim()} ${type} }`
        )
        const metalType = Object.keys(blacksmith[command])
        if (!metalType.includes(arg.trim())) return M.reply('Please give a valid type!')
        for (const [key, value] of Object.entries(blacksmith[command][arg.trim()].material)) {
            const item = await client.rpg.get(`${M.sender}[${key}]`) || 0
            await client.cradit.get(`${M.sender}.wallet`) || 0 
             if ((arg - blacksmith[command][[arg.trim()]] * 5) < 0) return M.reply('You dont have that much in your wallet')
            if ((item - value) < 0) return M.reply(`You are short of ${key}\n`)
            await client.rpg.sub(`${M.sender}[${key}]`, value)
            await client.rpg.set(`${M.sender}[${type}].type`, arg.trim())
            await client.rpg.set(`${M.sender}[${type}]`, blacksmith[command][arg.trim()]
        }
    }
}
