function setColorFromSecScore(percentage, color1, color2, color3) {
  function parseColor(colorStr) {
    const color = colorStr.startsWith("#") ? colorStr.substring(1) : colorStr;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return { r, g, b };
  }

  const lerp = (start, end, amt) => Math.round(start + (end - start) * amt);

  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  const c3 = parseColor(color3);

  let r, g, b;
  if (percentage <= 50) {
    const t = percentage / 50;
    r = lerp(c1.r, c2.r, t);
    g = lerp(c1.g, c2.g, t);
    b = lerp(c1.b, c2.b, t);
  } else {
    const t = (percentage - 50) / 50;
    r = lerp(c2.r, c3.r, t);
    g = lerp(c2.g, c3.g, t);
    b = lerp(c2.b, c3.b, t);
  }

  const toHex = v => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function numToRating(num) {
  const ratings = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC"];
  for (let i = 90; i >= 20; i -= 10) {
    if (num >= i) {
      return ratings[(90 - i) / 10];
    }
  }
  return "C";
}

function renderCard(activeData) {
  if (!activeData) return;

  const scoreColor = setColorFromSecScore(activeData.score, "#FF6384", "#FFCE56", "#4BC0C0");

  const html = `
    <div style="display: flex; align-items: center;">
      <div class="card">
        <div class="logoContainer">
          <img src="${activeData.logoURL}" class="logo" alt="logo of protocol" />
          <div class="details">
            <h2 class="title">${activeData.name}</h2>
            <div class="audits">
              <span>Audits: </span>
              <span class="dataContainer">${activeData.auditAmount}</span>
              <span class="dataContainer">${activeData.category}</span>
            </div>
          </div>
        </div>
        <div class="rating">
          <span class="grade" style="background: ${scoreColor};">
            ${numToRating(activeData.score)}
          </span>
          <span class="score" style="color: ${scoreColor};">
            ${activeData.score}
          </span>
        </div>
        <p>Certified by SCAS, <a href="https://scauditstudio.com" target="_blank">scauditstudio.com</a></p>
      </div>
    </div>
  `;

  const wrapper = document.getElementById("card-wrapper");
  if (wrapper) {
    wrapper.innerHTML = html;
  } else {
    console.warn("Card wrapper div not found.");
  }
}

async function fetchCardData() {
  try {
    const res = await fetch("https://api.scauditstudio.com/report/preview/published/all");
    const data = await res.json();

    if (!data || !data.length) {
      throw new Error("No card data found.");
    }

    const cardData = {
      rid: data[0].rid,
      name: data[0].name,
      auditAmount: data[0].auditAmount,
      score: data[0].score,
      category: data[0].category,
      logoURL: data[0].logoURL
    };

    renderCard(cardData);
  } catch (err) {
    console.error("Failed to load card data:", err);
  }
}

window.addEventListener("DOMContentLoaded", fetchCardData);
