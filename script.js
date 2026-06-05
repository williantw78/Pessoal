// ATENÇÃO: Cole aqui os dados do seu painel do Supabase obtidos no Passo 3
const SUPABASE_URL = "https://yiozdpsbraalesdthzft.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3pkcHNicmFhbGVzZHRoemZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NjUxNjIsImV4cCI6MjA5NjI0MTE2Mn0.t16Pt543HwfeaMggDxKXZt-EvNcYUN3HcsflHLG_vKA
";
//-----
//-----

// CONFIGURAÇÃO: Insere os dados exatos do teu painel do Supabase
//const SUPABASE_URL = "SUA_URL_DO_SUPABASE_AQUI"; 
//const SUPABASE_KEY = "SUA_CHAVE_ANON_PUBLIC_AQUI"; 

let appDados = {
    responsaveis: [],
    meses: [], 
    pagar: [],  
    receber: [] 
};

// Salva as informações na nuvem limpando os registos antigos (Fetch nativo)
async function salvarNaNuvem() {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/financeiro?id=neq.0`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        let resposta = await fetch(`${SUPABASE_URL}/rest/v1/financeiro`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ dados_json: appDados })
        });
        if (!resposta.ok) throw new Error("Erro ao salvar");
        alert("Dados guardados com sucesso na nuvem!");
    } catch (err) {
        console.error(err);
        alert("Erro ao guardar dados na nuvem. Verifica a tua tabela ou chaves.");
    }
}

// Carrega os dados mais recentes diretamente da nuvem
async function carregarDaNuvem() {
    try {
        let resposta = await fetch(`${SUPABASE_URL}/rest/v1/financeiro?select=dados_json&order=created_at.desc&limit=1`, {
            method: 'GET',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (!resposta.ok) throw new Error("Erro ao carregar");
        let dados = await resposta.json();
        if (dados && dados.length > 0) {
            appDados = dados[0].dados_json;
            renderizarTudo();
        } else {
            console.log("Nenhum dado prévio encontrado na nuvem.");
        }
    } catch (err) {
        console.error(err);
    }
}

function limparAoFocar(input) {
    let valorAtual = input.value.replace(/\./g, '').replace(',', '.').trim();
    let num = parseFloat(valorAtual);
    if (isNaN(num) || num === 0) {
        input.value = ''; 
    } else {
        input.value = valorAtual; 
    }
}

function formatarMoedaAoDigitar(input) {
    let valorStr = input.value.replace(/\./g, '').replace(',', '.').trim();
    if (valorStr === "") {
        input.value = "0,00";
        return 0;
    }
    let valorNum = parseFloat(valorStr);
    if (isNaN(valorNum)) valorNum = 0;
    input.value = valorNum.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return valorNum;
}

function renderizarTudo() {
    renderizarResponsaveis();
    renderizarTabela('pagar');
    renderizarTabela('receber');
    atualizarSelectMeses();
    atualizarResumo();
}

function adicionarResponsavel() {
    const input = document.getElementById('novoResponsavel');
    const nome = input.value.trim();
    if (nome && !appDados.responsaveis.includes(nome)) {
        appDados.responsaveis.push(nome);
        input.value = '';
        renderizarTudo();
    }
}

function removerResponsavel(nome) {
    appDados.responsaveis = appDados.responsaveis.filter(r => r !== nome);
    renderizarTudo();
}

function renderizarResponsaveis() {
    const container = document.getElementById('listaResponsaveis');
    if (!container) return;
    container.innerHTML = '';
    appDados.responsaveis.forEach(r => {
        container.innerHTML += `<div class="tag">${r}<span onclick="removerResponsavel('${r}')">&times;</span></div>`;
    });
}

function promptMes() {
    const mes = prompt("Introduza o mês e ano (Ex: Junho 2026):");
    if (mes && !appDados.meses.includes(mes)) {
        appDados.meses.push(mes);
        renderizarTudo();
    }
}

function promptRemoverMes() {
    if (appDados.meses.length === 0) return;
    const mes = prompt(`Escreva o mês a eliminar (${appDados.meses.join(', ')}):`);
    if (appDados.meses.includes(mes)) {
        appDados.meses = appDados.meses.filter(m => m !== mes);
        renderizarTudo();
    }
}

function atualizarSelectMeses() {
    const select = document.getElementById('selectMesFiltro');
    if (!select) return;
    const valorSelecionado = select.value;
    select.innerHTML = '';
    appDados.meses.forEach(m => {
        select.innerHTML += `<option value="${m}">${m}</option>`;
    });
    if (appDados.meses.includes(valorSelecionado)) {
        select.value = valorSelecionado;
    } else if (appDados.meses.length > 0) {
        select.value = appDados.meses[appDados.meses.length - 1];
    }
}
function adicionarLinha(tipo) {
    const nomeItem = prompt(tipo === 'pagar' ? "Nome do Serviço:" : "Nome do Rendimento:");
    if (!nomeItem) return;
    const novoItem = {
        id: Date.now() + Math.random(),
        nome: nomeItem,
        responsavel: "",
        valores: {}
    };
    appDados[tipo].push(novoItem);
    renderizarTabela(tipo);
    atualizarResumo();
}

function eliminarLinha(tipo, id) {
    appDados[tipo] = appDados[tipo].filter(item => item.id !== id);
    renderizarTabela(tipo);
    atualizarResumo();
}

function renderizarTabela(tipo) {
    const headerTr = document.getElementById(`header${tipo === 'pagar' ? 'Pagar' : 'Receber'}`);
    const body = document.getElementById(`body${tipo === 'pagar' ? 'Pagar' : 'Receber'}`);
    const footerTr = document.getElementById(`footer${tipo === 'pagar' ? 'Pagar' : 'Receber'}`);
    if (!headerTr || !body || !footerTr) return;

    headerTr.innerHTML = tipo === 'pagar' ? '<th>Serviços</th><th>Responsável</th><th>Ações</th>' : '<th>Fontes de Rendimento</th><th>Responsável</th><th>Ações</th>';
    appDados.meses.forEach(mes => {
        const th = document.createElement('th');
        th.innerText = mes;
        headerTr.insertBefore(th, headerTr.lastElementChild);
    });

    body.innerHTML = '';
    appDados[tipo].forEach(item => {
        let tr = document.createElement('tr');
        tr.innerHTML += `<td><input type="text" value="${item.nome}" onchange="atualizarNomeLinha('${tipo}', ${item.id}, this.value)"></td>`;
        
        let selectHtml = `<td><select onchange="atualizarResponsavelLinha('${tipo}', ${item.id}, this.value)"><option value="">Sem resp.</option>`;
        appDados.responsaveis.forEach(resp => {
            selectHtml += `<option value="${resp}" ${item.responsavel === resp ? 'selected' : ''}>${resp}</option>`;
        });
        selectHtml += `</select></td>`;
        tr.innerHTML += selectHtml;

        appDados.meses.forEach(mes => {
            let val = item.valores[mes] !== undefined ? item.valores[mes] : 0;
            let valFormatado = val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            tr.innerHTML += `<td><input type="text" inputmode="decimal" pattern="[0-9.,]*" class="input-cell" value="${valFormatado}" onfocus="limparAoFocar(this)" onblur="atualizarValorLinha('${tipo}', ${item.id}, '${mes}', this)"></td>`;
        });

        tr.innerHTML += `<td><button class="btn-delete-row" onclick="eliminarLinha('${tipo}', ${item.id})">X</button></td>`;
        body.appendChild(tr);
    });

    footerTr.innerHTML = '<td colspan="2">Total</td><td>-</td>';
    appDados.meses.forEach(mes => {
        let totalMes = 0;
        appDados[tipo].forEach(item => { totalMes += item.valores[mes] || 0; });
        let td = document.createElement('td');
        td.innerText = totalMes.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
        footerTr.insertBefore(td, footerTr.lastElementChild);
    });
}

function atualizarNomeLinha(tipo, id, valor) {
    let item = appDados[tipo].find(i => i.id === id);
    if (item) item.nome = valor;
}

function atualizarResponsavelLinha(tipo, id, valor) {
    let item = appDados[tipo].find(i => i.id === id);
    if (item) item.responsavel = valor;
    atualizarResumo();
}

function atualizarValorLinha(tipo, id, mes, input) {
    let valorNum = formatarMoedaAoDigitar(input);
    let item = appDados[tipo].find(i => i.id === id);
    if (item) item.valores[mes] = valorNum;
    renderizarTabela(tipo);
    atualizarResumo();
}

function atualizarResumo() {
    const selectFiltro = document.getElementById('selectMesFiltro');
    if (!selectFiltro) return;
    const mesSelecionado = selectFiltro.value;
    let totalPagar = 0, totalReceber = 0, detalhePessoas = {};

    appDados.responsaveis.forEach(r => { detalhePessoas[r] = { pagar: 0, receber: 0 }; });
    detalhePessoas["Sem Responsável"] = { pagar: 0, receber: 0 };

    if (mesSelecionado) {
        appDados.pagar.forEach(item => {
            let v = item.valores[mesSelecionado] || 0; totalPagar += v;
            let resp = item.responsavel || "Sem Responsável";
            if (!detalhePessoas[resp]) detalhePessoas[resp] = { pagar: 0, receber: 0 };
            detalhePessoas[resp].pagar += v;
        });
        appDados.receber.forEach(item => {
            let v = item.valores[mesSelecionado] || 0; totalReceber += v;
            let resp = item.responsavel || "Sem Responsável";
            if (!detalhePessoas[resp]) detalhePessoas[resp] = { pagar: 0, receber: 0 };
            detalhePessoas[resp].receber += v;
        });
    }

    const rPagar = document.getElementById('resumoPagar');
    const rReceber = document.getElementById('resumoReceber');
    const rSaldo = document.getElementById('resumoSaldo');
    const cardSaldo = document.getElementById('cardSaldo');

    if(rPagar) rPagar.innerText = totalPagar.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + " €";
    if(rReceber) rReceber.innerText = totalReceber.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + " €";
    
    let saldo = totalReceber - totalPagar;
    if(rSaldo) rSaldo.innerText = saldo.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + " €";
    if(cardSaldo) cardSaldo.className = saldo >= 0 ? "dash-card positive" : "dash-card negative";

    const containerDetalhe = document.getElementById('detalhePorPessoa');
    if (!containerDetalhe) return;
    containerDetalhe.innerHTML = '';
    Object.keys(detalhePessoas).forEach(pessoa => {
        let pPagar = detalhePessoas[pessoa].pagar, pReceber = detalhePessoas[pessoa].receber, pSaldo = pReceber - pPagar;
        if (pPagar > 0 || pReceber > 0) {
            containerDetalhe.innerHTML += `<div class="person-breakdown"><strong>${pessoa}</strong><br>A Receber: ${pReceber.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} € | A Pagar: ${pPagar.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} € | <span style="color: ${pSaldo >= 0 ? 'green' : 'red'}; font-weight:bold">Saldo: ${pSaldo.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</span></div>`;
        }
    });
}

function salvarDados() {
    const blob = new Blob([JSON.stringify(appDados, null, 2)], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = "dados_financeiros.txt"; link.click();
}

// Inicializa a interface e tenta puxar os dados da nuvem automaticamente
renderizarTudo();
carregarDaNuvem();
