
// ===game setup % loot data===
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
      { name: "hatsunedmiku", src: "case_one/hatsunedmiku.gif", alt: "hatsunedmiku", value: 180 },
      { name: "shinyspheal", src: "case_one/shinyspheal.gif", alt: "shinyspheal", value: 120 },
    ],
  },
  Classified: {
    chance: 3.2,
    items: [
      { name: "teto", src: "case_one/teto.gif", alt: "teto", value: 70 },
      { name: "shpealfriendshape", src: "case_one/shpealfriendshape.gif", alt: "shpealfriendshaped", value: 45 },
      { name: "badapple", src: "case_one/badapple.gif", alt: "badapple", value: 25 },
    ],
  },
  Restricted: {
    chance: 15.98,
    items: [
      { name: "squish", src: "case_one/squish.gif", alt: "squish", value: 9 },
      { name: "blackparade", src: "case_one/blackparade.gif", alt: "blackparade", value: 7 },
      { name: "mcr", src: "case_one/mcr.gif", alt: "mcr", value: 6 },
      { name: "greenday", src: "case_one/greenday.gif", alt: "greenday", value: 5 },
      { name: "pikagirl", src: "case_one/pikagirl.gif", alt: "pikagirl", value: 4 },
    ],
  },
  "Mil-Spec": {
    chance: 79.92,
    items: [
      { name: "tetris", src: "case_one/tetris.gif", alt: "tetris", value: 3 },
      { name: "212", src: "case_one/212.gif", alt: "212", value: 2 },
      { name: "kibty", src: "case_one/kibty.gif", alt: "kibty", value: 2 },
      { name: "pvz", src: "case_one/pvz.gif", alt: "pvz", value: 2 },
      { name: "getsilly", src: "case_one/getsilly.gif", alt: "getsilly", value: 1 },
      { name: "besilly", src: "case_one/besilly.gif", alt: "besilly", value: 1 },
      { name: "bleed", src: "case_one/bleed.gif", alt: "bleed", value: 1 },
      { name: "microwave", src: "case_one/microwave.gif", alt: "microwave", value: 1 },
    ],
  },
};
const rarityOrder = ["Exceedingly Rare", "Covert", "Classified", "Restricted", "Mil-Spec"];
const gifPool = [...lootTable["Mil-Spec"].items, ...lootTable["Restricted"].items, ...lootTable["Classified"].items, ...lootTable["Covert"].items];

let inventory = {};
let sillyCoins = 0;
let lifetimeCoins = 0;
let sillyCaseCount = 0;
let casesOpenend = 0;
let bestUnbox = null;
let rarityStats = {
  "Exceedingly Rare": 0,
  "Covert": 0,
  "Classified": 0,
  "Restricted": 0,
  "Mil-Spec": 0
};
let cursorX = 0;
let cursorY = 0;

// mouse cursor control
document.addEventListener("mousemove", (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
});
// ===dom elements===
// Buttons
const useCaseBtn = document.getElementById("use-case-btn");
const deductBtn = document.getElementById("deduct-button");
const sillyBtn = document.getElementById("silly-button");
const statsBtn = document.getElementById("stats-btn");
const toggleLootBtn = document.getElementById("toggle-loot-panel");

//ui panels & cont
const coinCounter = document.getElementById("coin-counter");
const inventoryContainer = document.getElementById("inventory-container");
const statsPanel = document.getElementById("stats-panel");
const lootPanel = document.getElementById("loot-panel");
const resultDiv = document.getElementById("unbox-result");
const caseDisplay = document.getElementById("case-total");


// modal elems
const modal = document.getElementById("gif-modal");
const modalImage = document.getElementById("modal-image");

// save/load field
const saveStringInput = document.getElementById("save-string");

// ===util funcs===

// get  rarity index of an item
function getRarityIndex(itemName) {
  for (let i = 0; i < rarityOrder.length; i++) {
    const tier = lootTable[rarityOrder[i]];
    if (tier.items.some((item) => item.name === itemName)) {
      return i;
    }
  }
  return rarityOrder.length;
}

function getItemDataByName(name) {
  for (const rarity in lootTable) {
    const item = lootTable[rarity].items.find(i => i.name === name);
    if (item) return item;
  }
  return null;
}

// rand roll for rarity and select item
function getRandomItem() {
  let roll = Math.random() * 100;
  let cumulativeChance = 0;
  for (const rarity in lootTable) {
    cumulativeChance += lootTable[rarity].chance;
    if (roll <= cumulativeChance) {
      const itemPool = lootTable[rarity].items;
      return itemPool[Math.floor(Math.random() * itemPool.length)];
    }
  }
}

// ===coins animation===

function showFloatingCoins(text, color = "#00ff66") {
  const float = document.createElement("div");
  float.className = "coin-float";
  float.textContent = text;
  float.style.color = color;

  const offsetX = (Math.random() - 0.5) * 30;
  const offsetY = (Math.random() - 0.5) * 30;
  float.style.left = `${cursorX + window.scrollX + offsetX}px`;
  float.style.top = `${cursorY + window.scrollY + offsetY}px`;

  document.body.appendChild(float);
  setTimeout(() => float.remove(), 1000);
}

function earnCoins(amount, silentFloat = false, color = "#00ff66") {
  sillyCoins += amount;
  lifetimeCoins += amount;
  coinCounter.textContent = sillyCoins;

  if (!silentFloat) {
    showFloatingCoins(`+${amount}`, color);
  }
}

function spinToReveal(finalGif) {
  const display = document.getElementById("reveal-gif");

  const totalCycles = 10;
  const initialDelay = 150;
  const delayGrowth = 50;

  function cycle(index) {
    if (index >= totalCycles) {
      // Final item reveal
      display.src = finalGif.src;
      display.alt = finalGif.alt;

      const rarity = Object.keys(lootTable).find(r =>
        lootTable[r].items.some(i => i.name === finalGif.name)
      );

      const lowerRarity = rarity.toLowerCase().replace(/\s/g, "");
      display.className = `rarity-border ${lowerRarity}-border`;

      return;
    }

    const randomGif = gifPool[Math.floor(Math.random() * gifPool.length)];
    display.src = randomGif.src;
    display.alt = randomGif.alt;

    const delay = initialDelay + index * delayGrowth;
    setTimeout(() => cycle(index + 1), delay);
  }

  cycle(0);
}



// ===gameplay event listeners===

// clicker
sillyBtn.addEventListener("click", function () {
  sillyCoins++;
  lifetimeCoins++;
  coinCounter.textContent = sillyCoins;
  showFloatingCoins("+1");
});

// buy case
deductBtn.addEventListener("click", function () {
  if (sillyCoins >= 3) {
    sillyCoins -= 3;
    sillyCaseCount++;
    updateCaseDisplay();
    showFloatingCoins("-3", "#ff3333"); 
    coinCounter.textContent = sillyCoins;
  } else {
    alert("Not enough Silly Coins!");
  }
});

// use case 
useCaseBtn.addEventListener("click", function () {
  if (sillyCaseCount <= 0) {
    alert("You don't have any Silly Cases!");
    return;
  }

  sillyCaseCount--;
  casesOpenend++;
  updateCaseDisplay();

  const unboxedItem = getRandomItem();
  const itemValue = getItemDataByName(unboxedItem.name)?.value || 0;
  const rarity = Object.keys(lootTable).find(r =>
    lootTable[r].items.some(i => i.name === unboxedItem.name)
  );

  rarityStats[rarity]++;
  if (!bestUnbox || itemValue > bestUnbox.value) {
    bestUnbox = { name: unboxedItem.name, value: itemValue, rarity };
  }

  if (inventory[unboxedItem.name]) {
    inventory[unboxedItem.name].count++;
  } else {
    inventory[unboxedItem.name] = {
      count: 1,
      src: unboxedItem.src,
      rarityIndex: getRarityIndex(unboxedItem.name),
    };
  }

  resultDiv.innerHTML = `<p>You unboxed:</p><img id="reveal-gif" src="spinnyspheal.gif" width="300" alt="Reveal">`;
  spinToReveal(unboxedItem);

  setTimeout(renderInventory, 4300);
  
});

let keyBuffer = [];

document.addEventListener("keydown", function (e) {
  keyBuffer.push(e.key.toLowerCase());
  if (keyBuffer.length > 5) keyBuffer.shift();

  if (keyBuffer.join("") === "silly") {
    sillyCaseCount += 100;
    updateCaseDisplay();
    alert("How did you know!?");
  }
});

function renderInventory() {
  inventoryContainer.innerHTML = "";

  const sorted = Object.entries(inventory).sort((a, b) => {
    return b[1].value - a[1].value; // Sort by descending value
  });

  sorted.forEach(([name, data]) => {
    const rarityName = rarityOrder[data.rarityIndex];
    const lowerRarity = rarityName.toLowerCase().replace(/\s/g, "");
    const itemDiv = document.createElement("div");
    itemDiv.className = "inventory-item";
    itemDiv.innerHTML = `
      <div class="inventory-side">
        <img src="${data.src}" alt="${name}" class="inventory-gif rarity-border ${lowerRarity}-border" data-name="${name}" style="width: 100px;">
        <span class="inventory-count">x${data.count}</span>
        <button class="sell-btn" title="Sells for ${getItemDataByName(name).value} Silly Coins" data-name="${name}">Sell</button>
      </div>
    `;
    inventoryContainer.prepend(itemDiv);
  });
}

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

function renderLootPanel() {
  lootPanel.innerHTML = "";

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
      lootPanel.appendChild(itemDiv);
    });
  });
}
function updateCaseDisplay() {
  caseDisplay.textContent = sillyCaseCount;
}

// ===stats panel===

function renderStatsPanel() {
  statsPanel.innerHTML = `
    <p>Total Coins Earned: ${lifetimeCoins}</p>
    <p>Total Cases Opened: ${casesOpenend}</p>
    <p>Best Unbox: ${
      bestUnbox ? `${bestUnbox.name} (${bestUnbox.value} coins, ${bestUnbox.rarity})` : "None yet"
    }</p>
    <h4>Unbox Stats:</h4>
    <ul>
      ${Object.entries(rarityStats).map(([rarity, count]) => {
        const percent = casesOpenend > 0 ? ((count / casesOpenend) * 100).toFixed(1) : "0.0";
        return `<li>${rarity}: ${count} (${percent}%)</li>`;
      }).join("")}
    </ul>
  `;
}

statsBtn.addEventListener("click", () => {
  const isVisible = statsPanel.style.display === "block";
  statsPanel.style.display = isVisible ? "none" : "block";
  if (!isVisible) renderStatsPanel();
});
// ===% panel===

toggleLootBtn.addEventListener("click", () => {
  const isHidden = getComputedStyle(lootPanel).display === "none";

  if (isHidden) {
    renderLootPanel();
    lootPanel.style.display = "flex";
    toggleLootBtn.textContent = "Hide %";
  } else {
    lootPanel.style.display = "none";
    toggleLootBtn.textContent = "Show %";
  }
});

// ===selling funcs===

// click to sell
inventoryContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("sell-btn")) {
    const itemName = e.target.getAttribute("data-name");
    const itemData = getItemDataByName(itemName);

    if (inventory[itemName] && itemData) {
      const value = itemData.value || 0;
      const item = inventory[itemName];
      const amountToSell = bulkAmount === -1 ? item.count : Math.min(item.count, bulkAmount);

      if (amountToSell <= 0) return; 

      item.count -= amountToSell;
      if (item.count <= 0) delete inventory[itemName];

      earnCoins(value * amountToSell); 
      renderInventory();
      renderStatsPanel();
    }
  }
});

// sell dupes
function sellDuplicates() {
  let totalEarned = 0;

  for (const [name, item] of Object.entries(inventory)) {
    if (item.count > 1) {
      const extra = item.count - 1;
      const value = getItemDataByName(name).value || 0;
      totalEarned += extra * value;
      item.count = 1;
    }
  }

  earnCoins(totalEarned, true); // silentFloat enabled
  showFloatingCoins(`+${totalEarned}`, "#00ff66"); // summary float
  renderInventory();
  renderStatsPanel();
  coinCounter.textContent = sillyCoins;
}


//sell under rarity
function sellUnderRarity(rarityName) {
  const threshold = rarityOrder.indexOf(rarityName);
  let totalEarned = 0;

  console.log(`Selected rarity: ${rarityName}, threshold index: ${threshold}`);

  for (const [name, item] of Object.entries(inventory)) {
    if (item.rarityIndex > threshold) {
      const value = getItemDataByName(name).value || 0;
      totalEarned += item.count * value;
      delete inventory[name];
    }
  }

  earnCoins(totalEarned, true); // silent payout
  showFloatingCoins(`+${totalEarned}`, "#00ff66"); // summary float
  renderInventory();
  renderStatsPanel();
  coinCounter.textContent = sillyCoins;
}
// bulk sell
let bulkAmount = 1; 

function setBulkAmount(amount) {
  bulkAmount = amount === "all" ? -1 : parseInt(amount);
}

// ===save/load===

function saveProgress() {
  const gameData = {
    sillyCoins,
    sillyCaseCount,
    inventory,
    lifetimeCoins,
    casesOpenend,
    bestUnbox,
    rarityStats
  };

  const base64 = btoa(JSON.stringify(gameData));
  saveStringInput.value = base64;
  alert("Progress saved! copy code to save it");
}

function loadProgress() {
  try {
    const base64 = saveStringInput.value.trim();
    const gameData = JSON.parse(atob(base64));

    sillyCoins = gameData.sillyCoins || 0;
    sillyCaseCount = gameData.sillyCaseCount || 0;
    inventory = gameData.inventory || {};
    lifetimeCoins = gameData.lifetimeCoins || 0;
    casesOpenend = gameData.casesOpenend || 0;
    bestUnbox = gameData.bestUnbox || null;
    rarityStats = gameData.rarityStats || {
      "Exceedingly Rare": 0,
      "Covert": 0,
      "Classified": 0,
      "Restricted": 0,
      "Mil-Spec": 0
    };

    coinCounter.textContent = sillyCoins;
    updateCaseDisplay();
    renderInventory();
    renderStatsPanel();

    alert("Progress loaded!");
  } catch (err) {
    alert("Invalid save string");
  }
}

// add save system                                                                      --added
// add buffer to prevent being able to spam case before animation is finished           --fixed                                                    
// inv spoils pull                                                                      --fixed finally
// % somewhere                                                                          --added
// lock page so it stops bopping up and down depending on gif size lol                  --fixed
// make it more mobile friendly                                                         --fixed
// show % needs two clicks                                                              --fixed, same problem with stats button now wtf
// make better unboxing animation                                                       --semi fixed lol still looks scuffed but im bad at this :( 
// stats page (will break current saves </3)                                            --added, need to add save integration                                   
// being able to view gifs unboxed (expand them by clicking on yk)                      --added but cant add button to close might needed for mobile support
// numbers - +                                                                          --added
// make money sticky                                                                    --added             

// fully rewrote the structure to make it easier to understand and to work with, this was cancer

// ---------later problems(seems like too much work rn)---------
// sell value                                                                           --added but to be adjusted
// tooltips for value                                                                   --added, doesnt work on mobile sadge
// sell duplicates,auto sell under x rarity,bulk sell(as in 1,10,all change with btn)   --added
// upgrades
// ig very easy to edit saves but like I dont really care lol
// add money per min
// inv filter options
// sounds?
// add modifiers (blur, colourchange,etc) that gives times X of value
// rare cold coin cookie clicker ahh gold cookie
// pity system? genshin impact ahh idea 
// ------------mobile stuff------------
// vibrate on rare pulls (with toggle somwhere ig options menu)
// allow button to be hold for like 8cps 


// ---Upgrade Ideas--
// multi spin (probably not gonna add but idk)
// more cash per click 
// faster spin
// better odds? (maybe jsut new case tbh)
// passive income (player hires ppl to spin (no actual cost for player) can upgrade what they can get, start of with max pink)
//unlock case queue for afking also with this auto spin 
// crit hits, and then also  damage upgrades and crit % upgrades
// upgradeable chance to double the drop, up to like 10%?
