const GITHUB_TOKEN = "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";

const GITHUB_USER = "williantw78";

const GITHUB_REPO = "Pessoal";

const GITHUB_FILE = "data.json";


// ===============================
// LOGIN
// ===============================

const APP_PASSWORD = "1234";

function checkLogin(){

  const pass =
    document.getElementById("passwordInput").value;

  const error =
    document.getElementById("loginError");

  if(pass === APP_PASSWORD){

    document.getElementById("loginScreen").style.display = "none";

    localStorage.setItem("logged", "true");

  }else{

    error.innerText = "Senha incorreta";

  }

}

window.addEventListener("load", async ()=>{

  if(localStorage.getItem("logged") === "true"){

    document.getElementById("loginScreen").style.display = "none";

  }
/*
  loadData();

  updateTotals();  */
  
  await loadFromGitHub();

});

// ===============================
// MOEDA
// ===============================

function formatCurrency(value){

  return value.toLocaleString("pt-PT", {
    minimumFractionDigits:2,
    maximumFractionDigits:2
  }) + " €";

}

function parseCurrency(value){

  if(!value) return 0;

  value = value
    .replace(/\s/g, "")
    .replace("€", "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(value) || 0;

}

// ===============================
// FORMATA AO SAIR
// ===============================

document.addEventListener("focusout", function(e){

  if(
    e.target.classList.contains("money-input") ||
    e.target.classList.contains("income-input")
  ){

    let value = parseCurrency(e.target.value);

    e.target.value = formatCurrency(value);

    updateTotals();

  }

});

// ===============================
// LIMPA AO CLICAR
// ===============================

document.addEventListener("focusin", function(e){

  if(
    e.target.classList.contains("money-input") ||
    e.target.classList.contains("income-input")
  ){

    let value = parseCurrency(e.target.value);

    if(value > 0){

      e.target.value =
        value.toFixed(2).replace(".", ",");

    }else{

      e.target.value = "";

    }

  }

});

// ===============================
// ENTER
// ===============================

document.addEventListener("keydown", function(e){

  if(
    e.target.classList.contains("money-input") ||
    e.target.classList.contains("income-input")
  ){

    if(e.key === "Enter"){

      e.preventDefault();

      let value =
        parseCurrency(e.target.value);

      e.target.value =
        formatCurrency(value);

      updateTotals();

      e.target.blur();

    }

  }

});

// ===============================
// ADD SERVICE
// ===============================

function addService(){

  const tbody =
    document.getElementById("servicesBody");

  const headers =
    document.querySelectorAll("#headerRow th");

  const row =
    document.createElement("tr");

  let html = `
    <td>

      <div class="cell-flex">

        <input
          type="text"
          placeholder="Serviço"
        >

        <button
          class="delete-btn"
          onclick="removeRow(this)"
        >
          X
        </button>

      </div>

    </td>

    <td>

      <select onchange="updateTotals()">
        <option>Willian</option>
        <option>Duda</option>
      </select>

    </td>
  `;

  for(let i=2;i<headers.length;i++){

    html += `
      <td>

        <input
          type="text"
          class="money-input"
          value="0"
        >

      </td>
    `;

  }

  row.innerHTML = html;

  tbody.appendChild(row);

  saveData();

}

// ===============================
// ADD MONTH
// ===============================

function addMonth(){

  const month =
    prompt("Nome do mês:");

  if(!month) return;

  const th =
    document.createElement("th");

  th.innerText = month;

  document
    .getElementById("headerRow")
    .appendChild(th);

  document
    .querySelectorAll("#servicesBody tr")
    .forEach(row=>{

      const td =
        document.createElement("td");

      td.innerHTML = `
        <input
          type="text"
          class="money-input"
          value="0"
        >
      `;

      row.appendChild(td);

    });

  const totalTd =
    document.createElement("td");

  totalTd.classList.add("month-total");

  totalTd.innerText = "0,00 €";

  document
    .getElementById("totalRow")
    .appendChild(totalTd);

  // selector

  const selector =
    document.getElementById("monthSelector");

  const option =
    document.createElement("option");

  option.textContent = month;

  selector.appendChild(option);

  saveData();

}

// ===============================
// ADD INCOME
// ===============================

function addIncome(){

  const tbody =
    document.getElementById("incomeBody");

  const row =
    document.createElement("tr");

  row.innerHTML = `
    <td>

      <div class="cell-flex">

        <input
          type="text"
          placeholder="Receita"
        >

        <button
          class="delete-btn"
          onclick="removeRow(this)"
        >
          X
        </button>

      </div>

    </td>

    <td>

      <select onchange="updateTotals()">
        <option>Willian</option>
        <option>Duda</option>
      </select>

    </td>

    <td>

      <input
        type="text"
        class="income-input"
        value="0"
      >

    </td>
  `;

  tbody.appendChild(row);

  saveData();

}

// ===============================
// REMOVE
// ===============================

function removeRow(btn){

  btn.closest("tr").remove();

  updateTotals();

  saveData();

}

// ===============================
// TOTALS
// ===============================

function updateTotals(){

  let totalPay = 0;
  let totalReceive = 0;

  let willian = 0;
  let duda = 0;

  const monthTotals = [];

  const selectedMonth =
    document.getElementById("monthSelector").selectedIndex;

  // DESPESAS

  document
    .querySelectorAll("#servicesBody tr")
    .forEach(row=>{

      const responsible =
        row.querySelector("select").value;

      const inputs =
        row.querySelectorAll(".money-input");

      inputs.forEach((input,index)=>{

        const value =
          parseCurrency(input.value);

        if(!monthTotals[index]){
          monthTotals[index] = 0;
        }

        monthTotals[index] += value;

        if(index === selectedMonth){

          totalPay += value;

          if(responsible === "Willian"){
            willian += value;
          }else{
            duda += value;
          }

        }

      });

    });

  // TOTAL LINHA

  document
    .querySelectorAll(".month-total")
    .forEach((cell,index)=>{

      cell.innerText =
        formatCurrency(monthTotals[index] || 0);

    });

  // RECEITAS

  document
    .querySelectorAll("#incomeBody tr")
    .forEach(row=>{

      const responsible =
        row.querySelector("select").value;

      const value =
        parseCurrency(
          row.querySelector(".income-input").value
        );

      totalReceive += value;

      if(responsible === "Willian"){
        willian += value;
      }else{
        duda += value;
      }

    });

  // RESULTADO

  const result =
    totalReceive - totalPay;

  // UI

  document.getElementById("totalToPay")
    .innerText = formatCurrency(totalPay);

  document.getElementById("totalToReceive")
    .innerText = formatCurrency(totalReceive);

  document.getElementById("willianTotal")
    .innerText = formatCurrency(willian);

  document.getElementById("dudaTotal")
    .innerText = formatCurrency(duda);

  const final =
    document.getElementById("finalResult");

  final.innerText =
    formatCurrency(result);

  if(result >= 0){

    final.classList.remove("result-negative");
    final.classList.add("result-positive");

  }else{

    final.classList.remove("result-positive");
    final.classList.add("result-negative");

  }

  saveData();

}

// ===============================
// SAVE DATA
// ===============================

function saveData(){

  const data = {
    services: [],
    incomes: [],
    months: []
  };

  // meses

  document
    .querySelectorAll("#headerRow th")
    .forEach((th,index)=>{

      if(index >= 2){

        data.months.push(th.innerText);

      }

    });

  // serviços

  document
    .querySelectorAll("#servicesBody tr")
    .forEach(row=>{

      data.services.push({

        name:
          row.querySelector("td:first-child input").value,

        responsible:
          row.querySelector("select").value,

        values:
          [...row.querySelectorAll(".money-input")]
            .map(i=>i.value)

      });

    });

  // receitas

  document
    .querySelectorAll("#incomeBody tr")
    .forEach(row=>{

      data.incomes.push({

        name:
          row.querySelector("td:first-child input").value,

        responsible:
          row.querySelector("select").value,

        value:
          row.querySelector(".income-input").value

      });

    });

  localStorage.setItem(
    "financeData",
    JSON.stringify(data)
  );
  
	saveToGitHub();

}

// ===============================
// LOAD DATA
// ===============================

function loadData(){

  const saved =
    localStorage.getItem("financeData");

  if(!saved) return;

  const data = JSON.parse(saved);

  // limpa

  document.getElementById("servicesBody").innerHTML = "";
  document.getElementById("incomeBody").innerHTML = "";

  // reset header

  const header =
    document.getElementById("headerRow");

  while(header.children.length > 2){

    header.removeChild(header.lastChild);

  }

  // reset selector

  document.getElementById("monthSelector").innerHTML = "";

  // reset total row

  const totalRow =
    document.getElementById("totalRow");

  while(totalRow.children.length > 1){

    totalRow.removeChild(totalRow.lastChild);

  }

  // meses

  data.months.forEach(month=>{

    const th =
      document.createElement("th");

    th.innerText = month;

    header.appendChild(th);

    const option =
      document.createElement("option");

    option.textContent = month;

    document
      .getElementById("monthSelector")
      .appendChild(option);

    const td =
      document.createElement("td");

    td.classList.add("month-total");

    td.innerText = "0,00 €";

    totalRow.appendChild(td);

  });

  // serviços

  data.services.forEach(service=>{

    const row =
      document.createElement("tr");

    let html = `
      <td>

        <div class="cell-flex">

          <input
            type="text"
            value="${service.name}"
          >

          <button
            class="delete-btn"
            onclick="removeRow(this)"
          >
            X
          </button>

        </div>

      </td>

      <td>

        <select onchange="updateTotals()">

          <option
            ${service.responsible==="Willian"?"selected":""}
          >
            Willian
          </option>

          <option
            ${service.responsible==="Duda"?"selected":""}
          >
            Duda
          </option>

        </select>

      </td>
    `;

    service.values.forEach(value=>{

      html += `
        <td>

          <input
            type="text"
            class="money-input"
            value="${value}"
          >

        </td>
      `;

    });

    row.innerHTML = html;

    document
      .getElementById("servicesBody")
      .appendChild(row);

  });

  // receitas

  data.incomes.forEach(income=>{

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>

        <div class="cell-flex">

          <input
            type="text"
            value="${income.name}"
          >

          <button
            class="delete-btn"
            onclick="removeRow(this)"
          >
            X
          </button>

        </div>

      </td>

      <td>

        <select onchange="updateTotals()">

          <option
            ${income.responsible==="Willian"?"selected":""}
          >
            Willian
          </option>

          <option
            ${income.responsible==="Duda"?"selected":""}
          >
            Duda
          </option>

        </select>

      </td>

      <td>

        <input
          type="text"
          class="income-input"
          value="${income.value}"
        >

      </td>
    `;

    document
      .getElementById("incomeBody")
      .appendChild(row);

  });

// ===============================
        headers:{
          Authorization:`token ${GITHUB_TOKEN}`,
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          message:"update finance data",

          content:content,

          sha:sha

        })
      }
    );

    console.log("GitHub save OK");

  }catch(err){

    console.error("GitHub save error", err);

  }

}

// ===============================
// GITHUB LOAD
// ===============================

async function loadFromGitHub(){

  try{

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {
        headers:{
          Authorization:`token ${GITHUB_TOKEN}`
        }
      }
    );

    const data = await response.json();

    if(!data.content) return;

    const decoded = decodeURIComponent(
      escape(atob(data.content))
    );

    localStorage.setItem(
      "financeData",
      decoded
    );

    loadData();

    updateTotals();

    console.log("GitHub load OK");

  }catch(err){

    console.error("GitHub load error", err);

  }

}
  


}