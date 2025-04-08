const fs = require('fs').promises;
async function calculateWinrate(finalData, role,bans,k1,k2,k3,k4) {
    let heroData;
    try {
        const response = await fetch('./Hero_data.json');
        heroData = await response.json();
    } catch (error) {
        console.error("Помилка при зчитуванні файлу:", error);
        return null;
    }
    let { team, enemy } = finalData; // Витягуємо союзників і ворогів
    let allies = Object.keys(team); // Отримуємо список союзників
    let enemies = Object.keys(enemy); // Отримуємо список ворогів

    // Визначаємо сапорта серед союзників
    let support = null;
    for (let [hero, heroRole] of Object.entries(team)) {
        if (role === "1pos" && heroRole === "5pos") {
            support = hero;
            break;
        } else if (role === "3 pos" && heroRole === "4pos") {
            support = hero;
            break;
        } else if (role === "5pos" && heroRole === "1pos") {
            support = hero;
            break;
        } else if (role === "4pos" && heroRole === "3pos") {
            support = hero;
            break;
        }
    }
    let winrates = {}; // Об'єкт для збереження вінрейтів всіх героїв

    for (let heroName in heroData) {
        if (allies.includes(heroName) || enemies.includes(heroName)) continue; // Пропускаємо героїв, які вже в команді
        if (bans && bans.includes(heroName)) continue; // Пропускаємо забанених героїв
        let hero = heroData[heroName];

        if (!hero["role"].includes(role[0]) && role != "0pos") continue;

        if (Object.keys(finalData["team"]).length === 0) {

            if ((role === "1pos"|| role === "5pos") && hero["lines"]["safe line"] !== undefined) {
                winrates[heroName] = parseFloat(hero["lines"]["safe line"]["winrate"]);
                continue;
            }else if ((role === "3pos"|| role === "4pos") && hero["lines"]["hard line"] !== undefined) {
                winrates[heroName] = parseFloat(hero["lines"]["hard line"]["winrate"]);
                continue;
            }else if ((role === "2pos") && hero["lines"]["midlane"] !== undefined) {
                winrates[heroName] = parseFloat(hero["lines"]["midlane"]["winrate"]);
                continue;
            }else{
                winrates[heroName] = parseFloat(hero["winRate"]);
                continue;
            }
        }
        let WR_base = parseFloat(hero.winRate); // Базовий вінрейт
        let S_laning_synergy = (parseFloat(hero["laning_with"][support]) - 50) * k1|| 0; // Синергія з сапортом
        let S_team_synergy = 0;
        for (let ally of allies) {
            S_team_synergy += (parseFloat(hero["playing_with"][ally])-50)*k2 || 0; // Синергія з командою
        }
        let S_counters = 0;
        for (let enemy of enemies) {
            let heroVsEnemyWR = parseFloat(hero["counters"][enemy]); // Контр проти ворогів
            if (heroVsEnemyWR < 40) {
                S_counters+= (50 - heroVsEnemyWR) * (k3+0.5) * -1; // Жорсткий контр
            } else if (heroVsEnemyWR < 47) {
                S_counters+= (50 - heroVsEnemyWR) * k3 * -1; // Сильний контр
            } else if (heroVsEnemyWR < 50) {
                S_counters+= (50 - heroVsEnemyWR) * (k3-0.3) * -1; // Легкий контр
            } else if (heroVsEnemyWR > 60) {
                S_counters+= (heroVsEnemyWR - 50) * (k4+0.2); // Жорсткий контр проти ворога
            } else if (heroVsEnemyWR > 55) {
                S_counters+= (heroVsEnemyWR - 50) * k4; // Сильний контр проти ворога
            } else if (heroVsEnemyWR > 50) {
                S_counters+= (heroVsEnemyWR - 50) * (k4-0.2); // Легкий контр проти ворога
            }
        }

        // Підсумковий вінрейт
        let WR_adjusted = WR_base + S_laning_synergy + S_team_synergy + S_counters;
        winrates[heroName] = Number(Math.max(0, Math.min(WR_adjusted, 100)).toFixed(2)); // Обмежуємо 0-100%
    }
    let sortedwinrates = Object.entries(winrates)
    .map(([hero, winrate]) => [hero.toString(), winrate]) // Перетворюємо у число
    .sort((a, b) => b[1] - a[1]);
    return sortedwinrates;
}

