

const lootTable = {
  "Exceedingly Rare": {
    chance: 0.26,
    items: [
      { name: "gay", src: "case_one/gay.gif", alt: "gay", value: 600 },
    ],
  },
  Covert: {
    chance: 0.64,
    items: [
      { name: "shinyspheal", src: "case_one/shinyspheal.gif", alt: "shinyspheal", value: 150 },
      { name: "hatsunedmiku", src: "case_one/hatsunedmiku.gif", alt: "hatsunedmiku", value: 150 },
    ],
  },
  Classified: {
    chance: 3.2,
    items: [
      { name: "teto", src: "case_one/teto.gif", alt: "teto", value: 45 },
      { name: "badapple", src: "case_one/badapple.gif", alt: "badapple", value: 45 },
      { name: "shpealfriendshape", src: "case_one/shpealfriendshape.gif", alt: "shpealfriendshaped", value: 45 },
    ],
  },
  Restricted: {
    chance: 15.98,
    items: [
      { name: "squish", src: "case_one/squish.gif", alt: "squish", value: 15 },
      { name: "mcr", src: "case_one/mcr.gif", alt: "mcr", value: 15 },
      { name: "greenday", src: "case_one/greenday.gif", alt: "greenday", value: 15 },
      { name: "blackparade", src: "case_one/blackparade.gif", alt: "blackparade", value: 15 },
      { name: "pikagirl", src: "case_one/pikagirl.gif", alt: "pikagirl", value: 15 },
    ],
  },
  "Mil-Spec": {
    chance: 79.92,
    items: [
      { name: "212", src: "case_one/212.gif", alt: "212", value: 6 },
      { name: "besilly", src: "case_one/besilly.gif", alt: "besilly", value: 6 },
      { name: "bleed", src: "case_one/bleed.gif", alt: "bleed", value: 6 },
      { name: "tetris", src: "case_one/tetris.gif", alt: "tetris", value: 6 },
      { name: "getsilly", src: "case_one/getsilly.gif", alt: "getsilly", value: 6 },
      { name: "kibty", src: "case_one/kibty.gif", alt: "kibty", value: 6 },
      { name: "pvz", src: "case_one/pvz.gif", alt: "pvz", value: 6 },
      { name: "microwave", src: "case_one/microwave.gif", alt: "microwave", value: 6 },
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

  // Generate a small random offset within ±12.5px
  const offsetX = (Math.random() - 0.5) * 25;
  const offsetY = (Math.random() - 0.5) * 25;

float.style.left = `${x + window.scrollX + offsetX}px`;
float.style.top = `${y + window.scrollY + offsetY}px`;

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

document.getElementById("inventory-container").addEventListener("click", function (e) {
  if (e.target.classList.contains("sell-btn")) {
    const itemName = e.target.getAttribute("data-name");

    if (inventory[itemName]) {
      const itemData = getItemDataByName(itemName);
      const value = itemData?.value || 0;


      sillyCoins += value;


      inventory[itemName].count--;
      if (inventory[itemName].count <= 0) {
        delete inventory[itemName];
      }


      showFloatingCoins(e.clientX, e.clientY, `+${value}`, "#00ff66");


      document.getElementById("coin-counter").textContent = sillyCoins;
      renderInventory();
    }
  }
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

function getItemDataByName(name) {
  for (const rarity in lootTable) {
    const item = lootTable[rarity].items.find(i => i.name === name);
    if (item) return item;
  }
  return null;
}

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
    <img src="${data.src}" alt="${name}" class="inventory-gif rarity-border ${lowerRarity}-border" data-name="${name}" style="width: 100px;">
    <span class="inventory-count">x${data.count}</span>
    <button class="sell-btn" title="Sells for ${getItemDataByName(name).value} coins" data-name="${name}">Sell</button>
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

   const isHidden = getComputedStyle(panel).display === "none";

if (isHidden) {
  renderLootPanel();
  panel.style.display = "flex";
  button.textContent = "Hide %";
} else {
  panel.style.display = "none";
  button.textContent = "Show %";
}
});

const modal = document.getElementById("gif-modal");
const modalImage = document.getElementById("modal-image");

document.addEventListener("click", function (e) {
  if (
    e.target &&
    (e.target.id === "reveal-gif" || e.target.classList.contains("inventory-gif"))
  ) {
    modalImage.src = e.target.src;
    modal.style.display = "flex";
  } else if (e.target && e.target.id === "gif-modal") {
    modal.style.display = "none";
  }

});





// add buffer to prevent being able to spam case before animation is finished           --fixed                                                    
// inv spoils pull                                                                      --fixed finally
// % somewhere                                                                          --added
// lock page so it stops bopping up and down depending on gif size lol                  --fixed
// make it more mobile friendly                                                         --fixed
// show % needs two clicks                                                              --fixed
// make better unboxing animation                                                       --semi fixed lol     
// stats page (will break current saves </3)
// save fixer that adds non given values as 0 (will probably break stuff too)
// being able to view gifs unboxed (expand them by clicking on yk)   
// numbers - +                                                                          -- added
// add money per min
// make money sticky on top right? idk yet
// sell duplicates, auto sell under x rarity, bulk sell (as in 1,10,all per button changable)

// later problems lol
// sell value                                                                           --added but to be adjusted
// tooltips for value                                                                   --added, doesnt work on mobile sadge
// upgrades
// ig very easy to edit saves but like I dont really care lol



// ---Upgrade Ideas--
// multi spin (probably not gonna add but idk)
// more cash per click 
// faster spin
// better odds? (maybe jsut new case tbh)
// auto spin 
// passive income (player hires ppl to spin (no actual cost for player) can upgrade what they can get, start of with max pink)
// 