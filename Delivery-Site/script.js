/* =========================================================
   DADOS DO SITE (EXEMPLO)
   ========================================================= */

const produtos = [
    { id: 1, nome: "Água Mineral 20L - Marca A", preco: 12.0 },
    { id: 2, nome: "Água Mineral 20L - Marca B", preco: 12.0 },
    { id: 3, nome: "Água Mineral 20L - Marca C", preco: 12.0 },
    { id: 4, nome: "Água Mineral 20L - Econômica", preco: 10.0 },
    { id: 5, nome: "Gás P13 - Marca A", preco: 135.0 },
    { id: 6, nome: "Gás P13 - Marca B", preco: 125.0 }
];

let carrinho = [];
let estadoLoja = "aberta";
let horarioSelecionado = "";
let ultimoTotal = 0;
let dadosPedido = "";

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // tema salvo
    const temaSalvo = localStorage.getItem("temaLoja");
    if (temaSalvo === "claro") {
        document.body.classList.add("claro");
    }

    renderProdutos();
    atualizarCarrinho();
    checarHorario();
    inicializarAgendamento();
    mostrarPopupCadastro();

    const selectPagamento = document.getElementById("pagamento");
    if (selectPagamento) {
        selectPagamento.addEventListener("change", handlePagamentoChange);
    }

    const inputData = document.getElementById("agendamentoData");
    if (inputData) {
        inputData.addEventListener("change", gerarHorariosParaData);
    }

    const btnSalvar = document.getElementById("btnSalvarCadastro");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", salvarCadastroCompleto);
    }

    const btnApagar = document.getElementById("btnApagarCadastro");
    if (btnApagar) {
        btnApagar.addEventListener("click", apagarCadastroCompleto);
    }

    // ajuste automático do campo troco
    const campoTroco = document.getElementById("troco");
    if (campoTroco) {
        campoTroco.addEventListener("blur", ajustarTrocoMinimo);
    }
});

/* =========================================================
   PRODUTOS
   ========================================================= */

function renderProdutos() {
    const div = document.getElementById("lista-produtos");
    if (!div) return;

    div.innerHTML = "";

    produtos.forEach((p) => {
        const card = document.createElement("div");
        card.className = "produto";

        card.innerHTML = `
      <h3>${p.nome}</h3>
      <p>Somente entrega</p>
      <p><strong>R$ ${p.preco.toFixed(2).replace(".", ",")}</strong></p>

      <div class="qtd-container">
        <button class="qtd-btn" onclick="alterarQtdProduto(${p.id}, -1)">−</button>
        <span id="qtd-${p.id}" class="qtd-valor">1</span>
        <button class="qtd-btn" onclick="alterarQtdProduto(${p.id}, 1)">+</button>
      </div>

      <button class="btn-add" onclick="adicionarComQtd(${p.id})">Adicionar</button>
    `;

        div.appendChild(card);
    });
}

function alterarQtdProduto(id, delta) {
    const span = document.getElementById(`qtd-${id}`);
    if (!span) return;

    let v = parseInt(span.textContent, 10);
    if (isNaN(v)) v = 1;

    v += delta;
    if (v < 1) v = 1;

    span.textContent = String(v);
}

function adicionarComQtd(id) {
    const span = document.getElementById(`qtd-${id}`);
    if (!span) return;

    const qtd = parseInt(span.textContent, 10) || 1;
    const prod = produtos.find((p) => p.id === id);
    if (!prod) return;

    addCarrinhoCustom(id, qtd);

    const msg = document.getElementById("mensagemAdicao");
    if (msg) {
        msg.textContent = `✓ Adicionado: ${prod.nome} (${qtd} un.)`;
        setTimeout(() => (msg.textContent = ""), 2000);
    }

    span.textContent = "1";
}

/* =========================================================
   CARRINHO
   ========================================================= */

function addCarrinhoCustom(id, qtd) {
    const prod = produtos.find((p) => p.id === id);
    if (!prod) return;

    const existe = carrinho.find((i) => i.id === id);

    if (existe) {
        existe.qtd += qtd;
    } else {
        carrinho.push({ ...prod, qtd });
    }

    atualizarCarrinho();
}

function mudarQtd(id, delta) {
    const item = carrinho.find((i) => i.id === id);
    if (!item) return;

    item.qtd += delta;
    if (item.qtd <= 0) {
        carrinho = carrinho.filter((i) => i.id !== id);
    }

    atualizarCarrinho();
}

function atualizarCarrinho() {
    const vazio = document.getElementById("carrinho-vazio");
    const itens = document.getElementById("carrinho-itens");
    const total = document.getElementById("carrinho-total");

    if (!vazio || !itens || !total) return;

    if (carrinho.length === 0) {
        vazio.style.display = "block";
        itens.innerHTML = "";
        total.textContent = "";
        return;
    }

    vazio.style.display = "none";

    let html = "";
    let soma = 0;

    carrinho.forEach((item) => {
        const subt = item.preco * item.qtd;
        soma += subt;

        html += `
      <div class="card carrinho-item">
        <strong>${item.nome}</strong>
        <div class="carrinho-controles">
          Quantidade:
          <button onclick="mudarQtd(${item.id}, -1)">−</button>
          ${item.qtd}
          <button onclick="mudarQtd(${item.id}, 1)">+</button>
        </div>
        <div>Subtotal: R$ ${subt.toFixed(2).replace(".", ",")}</div>
      </div>
    `;
    });

    itens.innerHTML = html;
    total.innerHTML = `<strong>Total: R$ ${soma.toFixed(2).replace(".", ",")}</strong>`;
}

/* =========================================================
   NAVEGAÇÃO & TEMA
   ========================================================= */

function mostrarSecao(id, botao) {
    document.querySelectorAll(".secao").forEach((s) => s.classList.remove("ativa"));
    const alvo = document.getElementById(id);
    if (alvo) alvo.classList.add("ativa");

    document.querySelectorAll("#menu .menu-btn").forEach((b) => b.classList.remove("ativo"));
    if (botao) botao.classList.add("ativo");
}

function toggleDarkMode() {
    const estaClaro = document.body.classList.toggle("claro");
    localStorage.setItem("temaLoja", estaClaro ? "claro" : "escuro");
}

/* =========================================================
   HORÁRIO DA LOJA
   ========================================================= */

function checarHorario() {
    const agora = new Date();
    const dia = agora.getDay(); // 0 = domingo
    const h = agora.getHours();
    const m = agora.getMinutes();
    const minDia = h * 60 + m;

    const status = document.getElementById("statusLoja");
    const textoAg = document.getElementById("textoAgendamento");

    if (!status || !textoAg) return;

    const inicio = 7 * 60 + 30;
    const fimSemana = 18 * 60 + 30;
    const fimDom = 12 * 60;
    const almIni = 12 * 60;
    const almFim = 14 * 60;

    const dentroSemana = dia !== 0 && minDia >= inicio && minDia < fimSemana;
    const dentroDom = dia === 0 && minDia >= inicio && minDia < fimDom;

    // intervalo de almoço
    if ((dentroSemana || dentroDom) && minDia >= almIni && minDia < almFim) {
        estadoLoja = "almoco";
        status.textContent = "⏳ Horário de almoço — apenas agendamento.";
        status.style.color = "#cc3333";
        textoAg.textContent = "Agendamento obrigatório:";
        return;
    }

    if (dia === 0) {
        if (dentroDom) {
            estadoLoja = "aberta";
            status.textContent = "🟢 Loja aberta! Entregas disponíveis (exemplo).";
            status.style.color = "#7CFC00";
            textoAg.textContent = "Agendamento (opcional):";
        } else {
            estadoLoja = "fechada";
            status.textContent = "🔴 Loja fechada — agendamento obrigatório.";
            status.style.color = "#ff5555";
            textoAg.textContent = "Agendamento obrigatório:";
        }
        return;
    }

    if (dentroSemana) {
        estadoLoja = "aberta";
        status.textContent = "🟢 Loja aberta! (exemplo)";
        status.style.color = "#7CFC00";
        textoAg.textContent = "Agendamento (opcional):";
    } else {
        estadoLoja = "fechada";
        status.textContent = "🔴 Loja fechada — agendamento obrigatório.";
        status.style.color = "#ff5555";
        textoAg.textContent = "Agendamento obrigatório:";
    }
}

/* =========================================================
   AGENDAMENTO
   ========================================================= */

function formatarLocalDate(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function inicializarAgendamento() {
    const inputData = document.getElementById("agendamentoData");
    if (!inputData) return;

    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    const hojeStr = formatarLocalDate(hoje);
    const amanhaStr = formatarLocalDate(amanha);

    inputData.min = hojeStr;
    inputData.max = amanhaStr;

    if (estadoLoja === "fechada") {
        inputData.value = amanhaStr;
        inputData.min = amanhaStr;
    } else {
        inputData.value = hojeStr;
    }

    gerarHorariosParaData();
}

function gerarHorariosParaData() {
    const inputData = document.getElementById("agendamentoData");
    const selectHora = document.getElementById("agendamentoHora");
    if (!inputData || !selectHora || !inputData.value) return;

    const data = new Date(inputData.value);
    const dia = data.getDay();

    let horarios = [];

    if (dia === 0) {
        // domingo
        horarios = gerarSlots(7, 30, 12, 0);
    } else {
        horarios = gerarSlots(7, 30, 18, 30);
    }

    selectHora.innerHTML = `<option value="">Selecione um horário</option>`;
    horarios.forEach((h) => {
        const opt = document.createElement("option");
        opt.value = h;
        opt.textContent = h;
        selectHora.appendChild(opt);
    });

    selectHora.addEventListener("change", () => {
        horarioSelecionado = selectHora.value;
    });
}

function gerarSlots(hIni, mIni, hFim, mFim) {
    const slots = [];
    let h = hIni;
    let m = mIni;

    while (h < hFim || (h === hFim && m <= mFim)) {
        const total = h * 60 + m;

        // pula intervalo de almoço 12:00–14:00
        if (total < 12 * 60 || total >= 14 * 60) {
            const hs = String(h).padStart(2, "0");
            const ms = String(m).padStart(2, "0");
            slots.push(`${hs}:${ms}`);
        }

        m += 30;
        if (m >= 60) {
            m = 0;
            h++;
        }
    }

    return slots;
}

/* =========================================================
   PAGAMENTO / TROCO
   ========================================================= */

function handlePagamentoChange() {
    const pag = document.getElementById("pagamento").value;
    const trocoC = document.getElementById("troco-container");
    if (!trocoC) return;

    if (pag === "Dinheiro") {
        trocoC.style.display = "block";
    } else {
        trocoC.style.display = "none";
    }
}

function ajustarTrocoMinimo() {
    const campoTroco = document.getElementById("troco");
    if (!campoTroco) return;

    let total = 0;
    carrinho.forEach((item) => (total += item.preco * item.qtd));

    let val = campoTroco.value.replace(",", ".");
    val = parseFloat(val);

    if (isNaN(val) || campoTroco.value.trim() === "") return;

    if (val < total) {
        campoTroco.value = total.toFixed(2).replace(".", ",");
    }
}

/* =========================================================
   PIX – MODAL
   ========================================================= */

function abrirPixModal(total) {
    const valorSpan = document.getElementById("pixValor");
    const modal = document.getElementById("pixModal");
    if (!valorSpan || !modal) return;

    valorSpan.textContent = "R$ " + total.toFixed(2).replace(".", ",");
    modal.style.display = "flex";
}

function fecharPixModal() {
    const modal = document.getElementById("pixModal");
    if (modal) modal.style.display = "none";
}

function copiarChavePix() {
    const chave = document.getElementById("pixChave")?.textContent || "00000000000";
    navigator.clipboard.writeText(chave);
    alert("Chave PIX copiada (exemplo)!");
}

function continuarPixWhats() {
    fecharPixModal();
    enviarParaWhats();
}

/* =========================================================
   FINALIZAR PEDIDO
   ========================================================= */

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const nome = document.getElementById("nomeCliente").value.trim();
    const telefone = document.getElementById("telefoneCliente").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const referencia = document.getElementById("referencia").value.trim();
    const pagamento = document.getElementById("pagamento").value;
    const troco = document.getElementById("troco").value.trim();
    const data = document.getElementById("agendamentoData").value;
    const hora = document.getElementById("agendamentoHora").value;

    if (!nome) {
        alert("Informe seu nome para concluir o pedido.");
        return;
    }

    if (!telefone) {
        alert("Informe seu telefone.");
        return;
    }

    if (!bairro || !rua || !numero) {
        alert("Preencha o endereço completo!");
        return;
    }

    if (!pagamento) {
        alert("Escolha a forma de pagamento!");
        return;
    }

    let total = 0;
    carrinho.forEach((item) => (total += item.preco * item.qtd));

    if (pagamento === "Dinheiro") {
        let val = parseFloat(troco.replace(",", "."));
        if (isNaN(val)) {
            alert("Informe o valor do troco!");
            return;
        }
        if (val < total) {
            alert("O valor do troco deve ser igual ou maior ao total da compra.");
            return;
        }
    }

    if (estadoLoja === "fechada" || estadoLoja === "almoco") {
        if (!data || !hora) {
            alert("Para este horário, o agendamento é obrigatório.");
            return;
        }
    }

    // descrição dos itens
    let textoProdutos = "";
    carrinho.forEach((item) => {
        const s = item.preco * item.qtd;
        textoProdutos += `• ${item.nome} x${item.qtd} = R$ ${s
            .toFixed(2)
            .replace(".", ",")}%0A`;
    });

    let dataF = "";
    if (data) {
        const [y, m, d] = data.split("-");
        dataF = `${d}/${m}/${y}`;
    }

    let msg = `*PEDIDO - Delivery Bairro (exemplo)*%0A%0A`;
    msg += `*Cliente:* ${nome}%0A`;
    if (telefone) {
        msg += `*Telefone:* ${telefone}%0A%0A`;
    }

    msg += `*Produtos:*%0A${textoProdutos}%0A`;
    msg += `*Total:* R$ ${total.toFixed(2).replace(".", ",")}%0A%0A`;

    msg += `*Endereço:*%0A${rua}, nº ${numero}%0A${bairro}%0A`;
    if (referencia) msg += `Ref.: ${referencia}%0A`;

    msg += `%0A*Pagamento:* ${pagamento}%0A`;

    if (pagamento === "Dinheiro") {
        msg += `Troco para: R$ ${troco}%0A`;
    }

    if (pagamento === "PIX") {
        msg += `%0A*Chave PIX (exemplo):* 00000000000%0A`;
    }

    if (pagamento === "PIX QRCode") {
        msg += `Pagamento feito na maquininha (simulação).%0A`;
    }

    if (dataF && hora) {
        msg += `%0A*Agendado para:* ${dataF} às ${hora}%0A`;
    }

    if (estadoLoja === "fechada") {
        msg += `%0A_(Loja fechada — entrega apenas no horário agendado.)_`;
    } else if (estadoLoja === "almoco") {
        msg += `%0A_(Horário de almoço — entrega após o horário agendado.)_`;
    }

    dadosPedido = msg;
    ultimoTotal = total;

    if (pagamento === "PIX") {
        abrirPixModal(total);
    } else {
        enviarParaWhats();
    }
}

/* =========================================================
   WHATSAPP
   ========================================================= */

function enviarParaWhats() {
    const numeroWhats = "5511999990000"; // número fictício
    const url = `https://wa.me/${numeroWhats}?text=${dadosPedido}`;
    window.open(url, "_blank");
}

/* =========================================================
   POPUP DE CADASTRO
   ========================================================= */

function mostrarPopupCadastro() {
    const salvo = localStorage.getItem("cadastroLoja");
    const popup = document.getElementById("popupCadastro");
    if (!popup) return;

    if (!salvo) {
        popup.classList.add("mostrar");
    } else {
        preencherEnderecoComCadastro();
    }
}

function salvarCadastroCompleto() {
    const dados = {
        nome: document.getElementById("cadNome").value.trim(),
        telefone: document.getElementById("cadTelefone").value.trim(),
        bairro: document.getElementById("cadBairro").value,
        rua: document.getElementById("cadRua").value.trim(),
        numero: document.getElementById("cadNumero").value.trim(),
        referencia: document.getElementById("cadReferencia").value.trim()
    };

    if (!dados.nome || !dados.telefone || !dados.bairro || !dados.rua || !dados.numero) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    localStorage.setItem("cadastroLoja", JSON.stringify(dados));

    const popup = document.getElementById("popupCadastro");
    if (popup) popup.classList.remove("mostrar");

    preencherEnderecoComCadastro();
    alert("Cadastro salvo no navegador (exemplo).");
}

function apagarCadastroCompleto() {
    localStorage.removeItem("cadastroLoja");
    alert("Cadastro removido do navegador.");

    const popup = document.getElementById("popupCadastro");
    if (popup) popup.classList.add("mostrar");
}

function preencherEnderecoComCadastro() {
    const dadosStr = localStorage.getItem("cadastroLoja");
    if (!dadosStr) return;

    const dados = JSON.parse(dadosStr);

    if (dados.nome) document.getElementById("nomeCliente").value = dados.nome;
    if (dados.telefone)
        document.getElementById("telefoneCliente").value = dados.telefone;
    if (dados.bairro) document.getElementById("bairro").value = dados.bairro;
    if (dados.rua) document.getElementById("rua").value = dados.rua;
    if (dados.numero) document.getElementById("numero").value = dados.numero;
    if (dados.referencia)
        document.getElementById("referencia").value = dados.referencia;
}
