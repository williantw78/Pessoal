// =========================
// LOGIN
// =========================

const APP_PASSWORD = "1234";

function checkLogin(){

  const pass = document.getElementById("passwordInput").value;
  const error = document.getElementById("loginError");

  if(pass === APP_PASSWORD){

    document.getElementById("loginScreen").style.display = "none";
    localStorage.setItem("logged","true");

  } else {
    error.innerText = "Senha incorreta";
  }

}

window.addEventListener("load", ()=>{

  if(localStorage.getItem("logged")==="true"){
    document.getElementById("loginScreen").style.display="none";
  }

  initMonthsSelector();
  updateTotals();

});

// =========================
// MOEDA
// =========================

function parseValue(v){
  if(!v) return 0;
  return Number(v.replace(",",".").replace(/[^0-9.]/g,"")) || 0;
}

function formatValue(v){
  return v.toFixed(2).replace(".",",") + " €";
}

// =========================
// INPUT BEHAVIOR
// =========================

document.addEventListener("focusin",(e)=>{
  if(e.target.matches(".money-input,.income-input")){
    const value = parseValue(e.target.value);
    e.target.value = value ? value : "";
  }
});

document.addEventListener("focusout",(e)=>{
  if(e.target.matches(".money-input,.income-input")){
    e.target.value = formatValue(parseValue(e.target.value));
    updateTotals();
  }
});

document.addEventListener("keydown",(e)=>{
  if(e.key==="Enter" && e.target.matches(".money-input,.income-input")){
    e.preventDefault();
    e.target.blur();
  }
});

// =========================
// ADD SERVICE
// =========================

function addService(){

  const tbody =
    document.getElementById("servicesBody");

  const headers =
    document.querySelectorAll("#headerRow th");

  const monthCount = headers.length - 2; // remove serviço + responsável

  const row =
    document.createElement("tr");

  let html = `
    <td>
      <div class="cell-flex">
        <input type="text" placeholder="Serviço">
        <button class="delete-btn" onclick="removeRow(this)">X</button>
      </div>
    </td>

    <td>
      <select onchange="updateTotals()">
        <option>Willian</option>
        <option>Duda</option>
      </select>
    </td>
  `;

  // 🔥 AQUI ESTÁ A CORREÇÃO
  for(let i = 0; i < monthCount; i++){

    html += `
      <td>
        <input type="text" class="money-input" value="0">
      </td>
    `;

  }

  row.innerHTML = html;

  tbody.appendChild(row);

}

// =========================
// ADD INCOME
// =========================

function addIncome(){

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>
      <div class="cell-flex">
        <input type="text">
        <button class="delete-btn" onclick="removeRow(this)">X</button>
      </div>
    </td>

    <td>
      <select onchange="updateTotals()">
        <option>Willian</option>
        <option>Duda</option>
      </select>
    </td>

    <td>
      <input class="income-input" value="0">
    </td>
  `;

  document.getElementById("incomeBody").appendChild(row);

}

// =========================
// ADD MONTH
// =========================

function addMonth(){

  const name = prompt("Nome do mês");
  if(!name) return;

  // header
  document.getElementById("headerRow")
    .innerHTML += `<th>${name}</th>`;

  // rows
  document.querySelectorAll("#servicesBody tr")
    .forEach(r=>{
      r.innerHTML += `<td><input class="money-input" value="0"></td>`;
    });

  // selector
  const opt = document.createElement("option");
  opt.textContent = name;
  document.getElementById("monthSelector").appendChild(opt);

}

// =========================
// REMOVE
// =========================

function removeRow(btn){
  btn.closest("tr").remove();
  updateTotals();
}

// =========================
// TOTALS
// =========================

function updateTotals(){

  let pay = 0;
  let receive = 0;

  const selector =
    document.getElementById("monthSelector");

  const selectedIndex =
    selector.selectedIndex; // 👈 correto e seguro

  // =========================
  // DESPESAS (POR COLUNA DO MÊS)
  // =========================

  document.querySelectorAll("#servicesBody tr").forEach(row=>{

    const cells =
      row.querySelectorAll(".money-input");

    cells.forEach((input, index)=>{

      const value =
        parseValue(input.value);

      // IGNORA COLUNAS FIXAS (serviço e responsável)
      const monthIndex = index;

      if(monthIndex === selectedIndex){

        pay += value;

      }

    });

  });

  // =========================
  // RECEITAS (GERAL)
  // =========================

  document.querySelectorAll(".income-input").forEach(input=>{
    receive += parseValue(input.value);
  });

  // =========================
  // UI
  // =========================

  document.getElementById("totalToPay").innerText =
    formatValue(pay);

  document.getElementById("totalToReceive").innerText =
    formatValue(receive);

  const result = receive - pay;

  const el =
    document.getElementById("finalResult");

  el.innerText =
    formatValue(result);

  el.className =
    "main-total " + (result >= 0 ? "positive" : "negative");

}

// =========================
// MES SELECTOR INIT
// =========================

function initMonthsSelector(){

  const selector = document.getElementById("monthSelector");

  selector.innerHTML = "";

  document.querySelectorAll("#headerRow th").forEach((th,index)=>{

    if(index >= 2){

      const opt = document.createElement("option");
      opt.textContent = th.innerText;
      opt.value = index - 2;

      selector.appendChild(opt);

    }

  });

}