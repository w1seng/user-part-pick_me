window.addEventListener('load', function () {


  // Отримуємо textarea для виводу повідомлень
  var textarea = document.getElementById('textareaMessage');
  var draft = document.getElementById('error-log');
  var banlist = document.getElementById('bans');
  var prevdraf = null;
  // Функція для запису повідомлень у textarea
  function logMessage(message) {
    if (textarea) {
      textarea.value += message + "\n"; // Додаємо новий рядок у textarea
      textarea.scrollTop = textarea.scrollHeight; // Прокручуємо вниз
    }
  }

  // Список подій Dota 2, які ми хочемо відстежувати через Overwolf API
  var requestedFeatures = [
    'match_state_changed',
    'roster',
    'me'
  ];

  //Оголошення змінних
  var onErrorListener, onInfoUpdates2Listener, onNewEventsListener;
  let matchst, bansid, players, userTeam, team,steamid,userrole;

  //Функція для перетворення ролі з числа на назву
  function convertRole(role) {
    const roleMap = {
      1: "1pos",
      2: "3pos",
      4: "2pos",
      8: "4pos",
      16: "5pos"
    };
    return roleMap[role] || "0pos";
  }

  //функція для перетворення забанених героїв з id на назву
  function convertBansToHeroNames(bansId) {
    const heroNames = {
      "1": "Anti-Mage",
      "2": "Axe",
      "3": "Bane",
      "4": "Bloodseeker",
      "5": "Crystal Maiden",
      "6": "Drow Ranger",
      "7": "Earthshaker",
      "8": "Juggernaut",
      "9": "Mirana",
      "10": "Morphling",
      "11": "Shadow Fiend",
      "12": "Phantom Lancer",
      "13": "Puck",
      "14": "Pudge",
      "15": "Razor",
      "16": "Sand King",
      "17": "Storm Spirit",
      "18": "Sven",
      "19": "Tiny",
      "20": "Vengeful Spirit",
      "21": "Windranger",
      "22": "Zeus",
      "23": "Kunkka",
      "25": "Lina",
      "26": "Lion",
      "27": "Shadow Shaman",
      "28": "Slardar",
      "29": "Tidehunter",
      "30": "Witch Doctor",
      "31": "Lich",
      "32": "Riki",
      "33": "Enigma",
      "34": "Tinker",
      "35": "Sniper",
      "36": "Necrophos",
      "37": "Warlock",
      "38": "Beastmaster",
      "39": "Queen of Pain",
      "40": "Venomancer",
      "41": "Faceless Void",
      "42": "Wraith King",
      "43": "Death Prophet",
      "44": "Phantom Assassin",
      "45": "Pugna",
      "46": "Templar Assassin",
      "47": "Viper",
      "48": "Luna",
      "49": "Dragon Knight",
      "50": "Dazzle",
      "51": "Clockwerk",
      "52": "Leshrac",
      "53": "Nature's Prophet",
      "54": "Lifestealer",
      "55": "Dark Seer",
      "56": "Clinkz",
      "57": "Omniknight",
      "58": "Enchantress",
      "59": "Huskar",
      "60": "Night Stalker",
      "61": "Broodmother",
      "62": "Bounty Hunter",
      "63": "Weaver",
      "64": "Jakiro",
      "65": "Batrider",
      "66": "Chen",
      "67": "Spectre",
      "68": "Ancient Apparition",
      "69": "Doom",
      "70": "Ursa",
      "71": "Spirit Breaker",
      "72": "Gyrocopter",
      "73": "Alchemist",
      "74": "Invoker",
      "75": "Silencer",
      "76": "Outworld Devourer",
      "77": "Lycan",
      "78": "Brewmaster",
      "79": "Shadow Demon",
      "80": "Lone Druid",
      "81": "Chaos Knight",
      "82": "Meepo",
      "83": "Treant Protector",
      "84": "Ogre Magi",
      "85": "Undying",
      "86": "Rubick",
      "87": "Disruptor",
      "88": "Nyx Assassin",
      "89": "Naga Siren",
      "90": "Keeper of the Light",
      "91": "Io",
      "92": "Visage",
      "93": "Slark",
      "94": "Medusa",
      "95": "Troll Warlord",
      "96": "Centaur Warrunner",
      "97": "Magnus",
      "98": "Timbersaw",
      "99": "Bristleback",
      "100": "Tusk",
      "101": "Skywrath Mage",
      "102": "Abaddon",
      "103": "Elder Titan",
      "104": "Legion Commander",
      "105": "Techies",
      "106": "Ember Spirit",
      "107": "Earth Spirit",
      "108": "Underlord",
      "109": "Terrorblade",
      "110": "Phoenix",
      "111": "Oracle",
      "112": "Winter Wyvern",
      "113": "Arc Warden",
      "114": "Monkey King",
      "119": "Dark Willow",
      "120": "Pangolier",
      "121": "Grimstroke",
      "123": "Hoodwink",
      "126": "Void Spirit",
      "128": "Snapfire",
      "129": "Mars",
      "131": "Ringmaster",
      "135": "Dawnbreaker",
      "136": "Marci",
      "137": "Primal Beast",
      "138": "Muerta",
      "145": "Kez"
    };

    return bansId.map(id => heroNames[id] || `Unknown Hero (${id})`);
  }

  //функція для перетворення назви героя на нормальний вигляд
  function convertHeroNames(heroName) {
    const heroMap = {
      "abyssal_underlord": "Underlord",
      "antimage": "Anti-Mage",
      "axe": "Axe",
      "bane": "Bane",
      "bloodseeker": "Bloodseeker",
      "crystal_maiden": "Crystal Maiden",
      "drow_ranger": "Drow Ranger",
      "earthshaker": "Earthshaker",
      "juggernaut": "Juggernaut",
      "mirana": "Mirana",
      "morphling": "Morphling",
      "nevermore": "Shadow Fiend",
      "phantom_lancer": "Phantom Lancer",
      "puck": "Puck",
      "pudge": "Pudge",
      "razor": "Razor",
      "sand_king": "Sand King",
      "storm_spirit": "Storm Spirit",
      "sven": "Sven",
      "tiny": "Tiny",
      "vengefulspirit": "Vengeful Spirit",
      "windrunner": "Windranger",
      "zeus": "Zeus",
      "kunkka": "Kunkka",
      "lina": "Lina",
      "lion": "Lion",
      "shadow_shaman": "Shadow Shaman",
      "slardar": "Slardar",
      "tidehunter": "Tidehunter",
      "witch_doctor": "Witch Doctor",
      "lich": "Lich",
      "riki": "Riki",
      "enigma": "Enigma",
      "tinker": "Tinker",
      "sniper": "Sniper",
      "necrolyte": "Necrophos",
      "warlock": "Warlock",
      "beastmaster": "Beastmaster",
      "queenofpain": "Queen of Pain",
      "venomancer": "Venomancer",
      "faceless_void": "Faceless Void",
      "skeleton_king": "Wraith King",
      "death_prophet": "Death Prophet",
      "phantom_assassin": "Phantom Assassin",
      "pugna": "Pugna",
      "templar_assassin": "Templar Assassin",
      "viper": "Viper",
      "luna": "Luna",
      "dragon_knight": "Dragon Knight",
      "dazzle": "Dazzle",
      "rattletrap": "Clockwerk",
      "leshrac": "Leshrac",
      "furion": "Nature's Prophet",
      "life_stealer": "Lifestealer",
      "dark_seer": "Dark Seer",
      "clinkz": "Clinkz",
      "omniknight": "Omniknight",
      "enchantress": "Enchantress",
      "huskar": "Huskar",
      "night_stalker": "Night Stalker",
      "broodmother": "Broodmother",
      "bounty_hunter": "Bounty Hunter",
      "weaver": "Weaver",
      "jakiro": "Jakiro",
      "batrider": "Batrider",
      "chen": "Chen",
      "spectre": "Spectre",
      "doom_bringer": "Doom",
      "ancient_apparition": "Ancient Apparition",
      "ursa": "Ursa",
      "spirit_breaker": "Spirit Breaker",
      "gyrocopter": "Gyrocopter",
      "alchemist": "Alchemist",
      "invoker": "Invoker",
      "silencer": "Silencer",
      "obsidian_destroyer": "Outworld Destroyer",
      "lycan": "Lycan",
      "brewmaster": "Brewmaster",
      "shadow_demon": "Shadow Demon",
      "lone_druid": "Lone Druid",
      "chaos_knight": "Chaos Knight",
      "meepo": "Meepo",
      "treant": "Treant Protector",
      "ogre_magi": "Ogre Magi",
      "undying": "Undying",
      "rubick": "Rubick",
      "disruptor": "Disruptor",
      "nyx_assassin": "Nyx Assassin",
      "naga_siren": "Naga Siren",
      "keeper_of_the_light": "Keeper of the Light",
      "wisp": "Io",
      "visage": "Visage",
      "slark": "Slark",
      "medusa": "Medusa",
      "troll_warlord": "Troll Warlord",
      "centaur": "Centaur Warrunner",
      "magnataur": "Magnus",
      "shredder": "Timbersaw",
      "bristleback": "Bristleback",
      "tusk": "Tusk",
      "skywrath_mage": "Skywrath Mage",
      "abaddon": "Abaddon",
      "elder_titan": "Elder Titan",
      "legion_commander": "Legion Commander",
      "ember_spirit": "Ember Spirit",
      "earth_spirit": "Earth Spirit",
      "terrorblade": "Terrorblade",
      "phoenix": "Phoenix",
      "oracle": "Oracle",
      "techies": "Techies",
      "winter_wyvern": "Winter Wyvern",
      "arc_warden": "Arc Warden",
      "monkey_king": "Monkey King",
      "pangolier": "Pangolier",
      "dark_willow": "Dark Willow",
      "grimstroke": "Grimstroke",
      "hoodwink": "Hoodwink",
      "void_spirit": "Void Spirit",
      "snapfire": "Snapfire",
      "mars": "Mars",
      "dawnbreaker": "Dawnbreaker",
      "marci": "Marci",
      "primal_beast": "Primal Beast",
      "muerta": "Muerta",
      "ringmaster": "Ringmaster",
      "kez": "Kez"
    };
  
    return heroMap[heroName.toLowerCase()] || `Unknown (${heroName})`;
  }

  //Функція для реєстрації подій
  function registerEvents() {
    onErrorListener = function (info) {
      logMessage("Error: " + JSON.stringify(info));
    }

    onInfoUpdates2Listener = function (info) {
      logMessage("--------------------");
      logMessage(JSON.stringify(info));
      try {
        if (info["feature"] === 'match_state_changed') {
          matchst = info["info"]["game"]["match_state"];
        }
        else if (info["feature"] === 'roster' && info["info"]["roster"]["bans"] !== undefined) {
          bansid = info["info"]["roster"]["bans"] && typeof info["info"]["roster"]["bans"] === "string" ? JSON.parse(info["info"]["roster"]["bans"]) : info["info"]["roster"]["bans"];
        }
        else if (matchst === 'DOTA_GAMERULES_STATE_HERO_SELECTION' && info["feature"] === 'roster') {
          players = info["info"]["roster"]["players"] && typeof info["info"]["roster"]["players"] === "string" ? JSON.parse(info["info"]["roster"]["players"]) : info["info"]["roster"]["players"];
        }
        else if (info["feature"] === 'me' && info["info"]["me"]["team"] !== undefined && info["info"]["me"]["team"] !== null) {
          team = info["info"]["me"]["team"];
        }
        else if (info["feature"] === 'me' && info["info"]["me"]["steam_id"] !== undefined && info["info"]["me"]["steam_id"] !== null) {
          steamid = info["info"]["me"]["steam_id"];
        }
        else if (matchst === "DOTA_GAMERULES_STATE_POST_GAME") {
          document.querySelectorAll('.slott img, .slote img').forEach(element => {
            element.remove(); 
        });

          draft.value = JSON.stringify({
            "team": {
            },
            "enemy": {
            }
          });
          errorLog.dispatchEvent(new Event('input'));
        }
        bans = Array.isArray(bansid) ? bansid.map(item => item.heroId) : [];
        bans = convertBansToHeroNames(bans);
        logMessage("--------------------");
        logMessage(bans);
        banlist.value = String(bans);
        banlist.dispatchEvent(new Event('input'));

        userTeam = team === "radiant" ? 2 : 3;

        teamMates = {};
        enemies = {};
        logMessage("--------------------");
        logMessage("Players: " + JSON.stringify(players, null, 2));
        players.forEach(player => {
          if (player.steam_id === steamid) {
            userrole = convertRole(player.role);
          }
          if (player.pickConfirmed) {
            let roleName = convertRole(player.role);

            if (player.team === userTeam) {
              teamMates[convertHeroNames(player.hero)] = roleName;
            } else {
              enemies[convertHeroNames(player.hero)] = roleName;
            }
          }
        });

        finalData = {
          team: teamMates,
          enemy: enemies
        };
        logMessage("--------------------");
        if (JSON.stringify(prevdraf) !== JSON.stringify(finalData)) {
        logMessage(JSON.stringify(finalData, null, 2));
        draft.value = JSON.stringify(finalData, null, 2);
        errorLog.dispatchEvent(new Event('input'));
        prevdraf = finalData;
        }
      } catch (error) {
        logMessage("--------------------");
        logMessage(error);
      }
    }

    onNewEventsListener = function (info) {

    }

    overwolf.games.events.onError.addListener(onErrorListener);
    overwolf.games.events.onInfoUpdates2.addListener(onInfoUpdates2Listener);
    overwolf.games.events.onNewEvents.addListener(onNewEventsListener);
  }
 
  //Функція для відміни реєстрації подій
  function unregisterEvents() {
    overwolf.games.events.onError.removeListener(onErrorListener);
    overwolf.games.events.onInfoUpdates2.removeListener(onInfoUpdates2Listener);
    overwolf.games.events.onNewEvents.removeListener(onNewEventsListener);
  }

  //Функція для перевірки чи запущена гра
  function gameLaunched(gameInfoResult) {
    if (!gameInfoResult || !gameInfoResult.gameInfo) {
      return false;
    }

    if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
      return false;
    }

    if (!gameInfoResult.gameInfo.isRunning) {
      return false;
    }

    if (Math.floor(gameInfoResult.gameInfo.id / 10) != 7314) {
      return false;
    }

    logMessage("Dota 2 Launched");
    return true;
  }

  //Функція для перевірки чи гра запущена
  function gameRunning(gameInfo) {
    if (!gameInfo || !gameInfo.isRunning) {
      return false;
    }

    if (Math.floor(gameInfo.id / 10) != 7314) {
      return false;
    }
    logMessage("Dota 2 running");
    return true;
  }

  //Функція для встановлення необхідних функцій
  function setFeatures() {
    overwolf.games.events.setRequiredFeatures(requestedFeatures, function (info) {
      if (info.status == "error") {
        logMessage("Could not set required features: " + info.reason);
        logMessage("Trying in 1 seconds");
        window.setTimeout(setFeatures, 1000);
        return;
      }

      console.log("Set required features:");
      console.log(JSON.stringify(info));
    });
  }

  //Функція для відслідковування подій
  overwolf.games.onGameInfoUpdated.addListener(function (res) {
    if (gameLaunched(res)) {
      unregisterEvents();
      registerEvents();
      setTimeout(setFeatures, 100);
    }
  });

  //Функція для перевірки чи гра запущена
  overwolf.games.getRunningGameInfo(function (res) {
    if (gameRunning(res)) {
      registerEvents();
      setTimeout(setFeatures, 100);
    }
  });

});
