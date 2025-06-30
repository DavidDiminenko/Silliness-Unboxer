
const lootTable = {
    // case % and items and all that
    "Exceedingly Rare": {
        chance: 0.26,
        items: [{ name: "gay", src: "case_one/gay.gif", alt: "gay" }],
    },
    Covert: {
        chance: 0.64,
        items: [
            { name: "shinyspheal", src: "case_one/shinyspheal.gif", alt: "shinyspheal" },
            { name: "hatsunedmiku", src: "case_one/hatsunedmiku.gif", alt: "hatsunedmiku" },
        ],
    },
    Classified: {
        chance: 3.2,
        items: [
            { name: "teto", src: "case_one/teto.gif", alt: "teto" },
            { name: "badapple", src: "case_one/badapple.gif", alt: "badapple" },
            { name: "shpealfriendshape", src: "case_one/shpealfriendshape.gif", alt: "shpealfriendshaped" },
        ],
    },
    Restricted: {
        chance: 15.98,
        items: [
            { name: "squish", src: "case_one/squish.gif", alt: "squish" },
            { name: "mcr", src: "case_one/mcr.gif", alt: "mcr" },
            { name: "greenday", src: "case_one/greenday.gif", alt: "greenday" },
            { name: "blackparade", src: "case_one/blackparade.gif", alt: "blackparade" },
            { name: "pikagirl", src: "case_one/pikagirl.gif", alt: "pikagirl" },
        ],
    },
    "Mil-Spec": {
        chance: 79.92,
        items: [
            { name: "212", src: "case_one/212.gif", alt: "212" },
            { name: "besilly", src: "case_one/besilly.gif", alt: "besilly" },
            { name: "bleed", src: "case_one/bleed.gif", alt: "bleed" },
            { name: "tetris", src: "case_one/tetris.gif", alt: "tetris" },
            { name: "getsilly", src: "case_one/getsilly.gif", alt: "getsilly" },
            { name: "kibty", src: "case_one/kibty.gif", alt: "kibty" },
            { name: "pvz", src: "case_one/pvz.gif", alt: "pvz" },
            { name: "microwave", src: "case_one/microwave.gif", alt: "microwave" },
        ],
    },
};

const rarityOrder = ["Exceedingly Rare", "Covert", "Classified", "Restricted", "Mil-Spec"];

const useCaseBtn = document.getElementById("use-case-btn");
let inventory = {};
let sillyCoins = 0;
let sillyCaseCount = 0;

function getRarityIndex(itemName) {
    for (let i = 0; i < rarityOrder.length; i++) {
        const tier = lootTable[rarityOrder[i]];
        if (tier.items.some((item) => item.name === itemName)) {
            return i;
        }
    }
    return rarityOrder.length; // fallback
}

// function to roll for rarity and pick an item
function getRandomItem() {
    let roll = Math.random() * 100;
    let cumulativeChance = 0;

    for (const rarity in lootTable) {
        cumulativeChance += lootTable[rarity].chance;
        if (roll <= cumulativeChance) {
            let itemPool = lootTable[rarity].items;
            return itemPool[Math.floor(Math.random() * itemPool.length)];
        }
    }
}

document.getElementById("silly-button").addEventListener("click", function (e) {
  sillyCoins++;
  document.getElementById("coin-counter").textContent = sillyCoins;

  const valueOfClick = 1; // maybe dynamic later for upgrades?
  showFloatingCoins(e.clientX, e.clientY, `+${valueOfClick}`);
});


function showFloatingCoins(x, y, text, color = "#00ff66") {
  const float = document.createElement("div");
  float.className = "coin-float";
  float.textContent = text;
  float.style.color = color;
  float.style.left = `${x + (Math.random() * 40 - 20)}px`;
  float.style.top = `${y + (Math.random() * 20 - 40)}px`;

  document.body.appendChild(float);
  setTimeout(() => float.remove(), 1000);
}
document.getElementById("deduct-button").addEventListener("click", function (event) {
    if (sillyCoins >= 3) {
        sillyCoins -= 3;
        showFloatingCoins(event.clientX, event.clientY, "-3", "#ff3333");
        sillyCaseCount++; // increase case count
        updateCaseDisplay();
    } else {
        alert("Not enough Silly Coins, silly! You need at least 3 silly coins !!");
    }
    document.getElementById("coin-counter").textContent = sillyCoins;
});

document.getElementById("use-case-btn").addEventListener("click", function () {
    if (sillyCaseCount > 0) {
        sillyCaseCount--; // decrease case count
        updateCaseDisplay();

        let unboxedItem = getRandomItem();

        if (inventory[unboxedItem.name]) {
            inventory[unboxedItem.name].count++;
        } else {
            inventory[unboxedItem.name] = {
                count: 1,
                src: unboxedItem.src,
                rarityIndex: getRarityIndex(unboxedItem.name),
            };
        }

        this.disabled = true;
        setTimeout(() => { this.disabled = false; }, 4300);

        const resultDiv = document.getElementById("unbox-result");
        resultDiv.innerHTML = `
            <p> You unboxed:</p>
            <img id="reveal-gif" src="spinnyspheal.gif" width="300" alt="Reveal">
            `;

        spinToReveal(unboxedItem);

        setTimeout(() => {
        renderInventory();
        }, 4290); 
    } else {
        alert("You don't have enough Silly Cases!");
    }
});

function renderInventory() {
  const container = document.getElementById("inventory-container");
  container.innerHTML = "";

  const sorted = Object.entries(inventory).sort((a, b) => {
    return a[1].rarityIndex - b[1].rarityIndex;
  });

  sorted.forEach(([name, data]) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "inventory-item";

    // Get rarity class
    const rarityName = rarityOrder[data.rarityIndex];
    const lowerRarity = rarityName.toLowerCase().replace(/\s/g, "");

    itemDiv.innerHTML = `
  <div class="inventory-side">
    <img src="${data.src}" alt="${name}" class="rarity-border ${lowerRarity}-border" style="width: 100px;">
    <span class="inventory-count">x${data.count}</span>
  </div>
`;
    container.appendChild(itemDiv);
  });
}
const gifPool = [...lootTable["Mil-Spec"].items, ...lootTable["Restricted"].items, ...lootTable["Classified"].items, ...lootTable["Covert"].items];

function spinToReveal(finalGif) {
    const display = document.getElementById("reveal-gif");

    let totalCycles = 10; 
    let initialDelay = 150; 
    let delayGrowth = 50; 

    function cycle(index) {
        if (index >= totalCycles) {
            display.src = finalGif.src;
            display.alt = finalGif.alt;

             let rarity = Object.keys(lootTable).find(r =>
             lootTable[r].items.some(i => i.name === finalGif.name)
       );
const lowerRarity = rarity.toLowerCase().replace(/\s/g, "");
display.className = `rarity-border ${lowerRarity}-border`;


    return;
        }

        const randomGif = gifPool[Math.floor(Math.random() * gifPool.length)];
        display.src = randomGif.src;
        display.alt = randomGif.alt;

        setTimeout(() => cycle(index + 1), initialDelay + index * delayGrowth);
    }

    cycle(0);
}

function updateCaseDisplay() {
    document.getElementById("case-total").textContent = sillyCaseCount; // Update total count
}

let keyBuffer = [];

document.addEventListener("keydown", function (e) {
    keyBuffer.push(e.key.toLowerCase());

    if (keyBuffer.length > 5) keyBuffer.shift();

    if (keyBuffer.join("") === "silly") {
        sillyCaseCount += 100;
        updateCaseDisplay();
        alert("How did you know !?");
    }
});

function saveProgress() {
    const gameData = {
        sillyCoins,
        sillyCaseCount,
        inventory,
    };

    const json = JSON.stringify(gameData);
    const base64 = btoa(json);
    document.getElementById("save-string").value = base64;
}

function loadProgress() {
    try {
        const base64 = document.getElementById("save-string").value.trim();
        const json = atob(base64);
        const gameData = JSON.parse(json);

        sillyCoins = gameData.sillyCoins || 0;
        sillyCaseCount = gameData.sillyCaseCount || 0;
        inventory = gameData.inventory || {};

        document.getElementById("coin-counter").textContent = sillyCoins;
        updateCaseDisplay();
        renderInventory();

        alert("Progress loaded");
    } catch (err) {
        alert("Invalid save string");
    }
}

function renderLootPanel() {
    const panel = document.getElementById("loot-panel");
    panel.innerHTML = "";

    rarityOrder.forEach(rarity => {
        const { chance, items } = lootTable[rarity];
        const individualChance = chance / items.length;

        items.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.style.padding = "10px";
            itemDiv.style.textAlign = "center";
            itemDiv.style.width = "120px";
            itemDiv.style.backgroundColor = "black";
            itemDiv.innerHTML = `
  <div class="loot-item">
    <img src="${item.src}" alt="${item.name}" width="100">
    <small>${individualChance.toFixed(2)}%</small>
  </div>
        `;
            panel.appendChild(itemDiv);
        });
    });
}

document.getElementById("toggle-loot-panel").addEventListener("click", () => {
    const panel = document.getElementById("loot-panel");
    const button = document.getElementById("toggle-loot-panel");

    if (panel.style.display === "none") {
        renderLootPanel();
        panel.style.display = "flex";
        button.textContent = "Hide %";
    } else {
        panel.style.display = "none";
        button.textContent = "Show %";
    }
});



// add buffer to prevent being able to spam case before animation is finished           --fixed                                                    
// inv spoils pull                                                                      --fixed finally
// % somewhere                                                                          --added
// lock page so it stops bopping up and down depending on gif size lol                  --fixed
// make it more mobile friendly                                                         --fixed
// show % needs two clicks
// ig very easy to edit saves but like I dont really care lol
// make better unboxing animation                                                       --semi fixed lol     
// stats page
// being able to view gifs unboxed (expand them)   
// numbers - +                                                                          -- added
// sell value
// upgrades