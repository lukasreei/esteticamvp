// Sessions module: render upcoming sessions and history, conclude session
window.SessionsModule = {
  render() {
    const ul = document.getElementById('listaSessoes');
    if (!ul) return;
    ul.innerHTML = '';
    (window.agenda || []).filter(a => a.status !== 'cancelado' && a.status !== 'realizado').forEach(a => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      const clienteObj = (window.clientes || []).find(c => c.id === a.clientId);
      strong.innerText = clienteObj ? clienteObj.nome : a.clientId;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(` – Agendado ${a.data} ${a.hora}${a.duracao ? ' ('+a.duracao+' min)' : ''}`));
      li.dataset.data = a.data;
      li.dataset.hora = a.hora;
      li.dataset.clientId = a.clientId;
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.innerHTML = '<i class="fas fa-check"></i> Concluir';
      btn.onclick = function () { window.SessionsModule.conclude(btn); };
      li.appendChild(btn);
      ul.appendChild(li);
    });
    this.renderHistory('', '', '', '', true);
  },

  renderHistory(filtroBusca = '', filtroMes = '', filtroData = '', sortBy = '', sortAsc = true) {
    const tbody = document.getElementById('corpoHistorico');
    if (!tbody) return;
    
    let items = (window.atendimentosConcluidos || []).slice().reverse();
    
    // Aplicar filtros
    if (filtroBusca) {
      const busca = filtroBusca.toLowerCase();
      items = items.filter(a => 
        (a.clienteNome || '').toLowerCase().includes(busca) ||
        (a.procedimento || '').toLowerCase().includes(busca)
      );
    }
    
    if (filtroMes) {
      items = items.filter(a => a.mes === filtroMes);
    }
    
    if (filtroData) {
      items = items.filter(a => a.data === filtroData);
    }
    
    // Aplicar ordenação
    if (sortBy) {
      items.sort((a, b) => {
        let valA, valB;
        switch (sortBy) {
          case 'data':
            valA = new Date(`${a.data}T${a.hora || '00:00'}`);
            valB = new Date(`${b.data}T${b.hora || '00:00'}`);
            break;
          case 'cliente':
            valA = (a.clienteNome || '').toLowerCase();
            valB = (b.clienteNome || '').toLowerCase();
            break;
          case 'procedimento':
            valA = (a.procedimento || '').toLowerCase();
            valB = (b.procedimento || '').toLowerCase();
            break;
          case 'valor':
            valA = a.valor;
            valB = b.valor;
            break;
          default:
            return 0;
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }
    
    tbody.innerHTML = '';
    
    if (items.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" style="text-align:center;color:#9ca3af;padding:40px;">Nenhum atendimento encontrado</td>';
      tbody.appendChild(tr);
      return;
    }
    
    items.forEach(a => {
      const tr = document.createElement('tr');
      
      // Data/Hora
      const dataHora = a.data && a.hora ? 
        `${this.formatarData(a.data)} ${a.hora}` : 
        (a.dataConclusao ? new Date(a.dataConclusao).toLocaleString('pt-BR') : 'Data não informada');
      
      // Cliente
      const clienteNome = a.clienteNome || ((window.clientes || []).find(c=>c.id===a.clienteId)||{}).nome || a.clienteId || '—';
      
      // Procedimento
      const procedimento = a.procedimento || 'Não especificado';
      
      // Valor
      const valor = `R$ ${a.valor.toFixed(2)}`;
      
      // Ações
      const acoes = `<button class="btn secondary small" onclick="window.SessionsModule.verDetalhes('${a.clienteId}', '${a.data || ''}', '${a.hora || ''}')"><i class="fas fa-eye"></i> Ver</button>`;
      
      tr.innerHTML = `
        <td>${dataHora}</td>
        <td><strong>${clienteNome}</strong></td>
        <td>${procedimento}</td>
        <td class="valor">${valor}</td>
        <td>${acoes}</td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Adicionar linha de total
    if (items.length > 0) {
      const total = items.reduce((sum, a) => sum + a.valor, 0);
      const trTotal = document.createElement('tr');
      trTotal.style.fontWeight = 'bold';
      trTotal.style.backgroundColor = '#f9fafb';
      trTotal.innerHTML = `
        <td colspan="3" style="text-align:right;padding:8px;">Total:</td>
        <td class="valor" style="padding:8px;">R$ ${total.toFixed(2)}</td>
        <td></td>
      `;
      tbody.appendChild(trTotal);
    }
  },
  conclude(btn) {
    const valor = prompt('Informe o valor da sessão:');
    if (!valor || isNaN(valor)) return;
    const li = btn.parentElement;
    const clientId = li.dataset.clientId || li.dataset.cliente || '';
    const clienteObj = (window.clientes || []).find(c => c.id === clientId);
    const cliente = clienteObj ? clienteObj.nome : clientId;
    const dataAttr = li.dataset.data || '';
    const horaAttr = li.dataset.hora || '';
    const v = parseFloat(valor);
    window.totalDia = (window.totalDia || 0) + v;
    window.totalSemana = (window.totalSemana || 0) + v;
    window.totalMes = (window.totalMes || 0) + v;
    const diaEl = document.getElementById('dia');
    const semEl = document.getElementById('semana');
    const mesEl = document.getElementById('mes');
    if (diaEl) diaEl.innerText = (window.totalDia||0).toFixed(2);
    if (semEl) semEl.innerText = (window.totalSemana||0).toFixed(2);
    if (mesEl) mesEl.innerText = (window.totalMes||0).toFixed(2);
    const data = new Date();
    const idx = (window.agenda || []).findIndex(a => a.clientId === clientId && a.data === dataAttr && a.hora === horaAttr);
    const agendamento = idx !== -1 ? window.agenda[idx] : null;
    (window.atendimentosConcluidos || []).push({
      clienteId: clientId,
      clienteNome: cliente,
      procedimento: agendamento ? agendamento.procedimento : 'Não especificado',
      valor: v,
      mes: String(data.getMonth() + 1).padStart(2, '0'),
      data: dataAttr,
      hora: horaAttr,
      dataConclusao: new Date().toISOString()
    });
    if (idx !== -1) {
      window.agenda[idx].status = 'realizado';
      try { localStorage.setItem('est_agenda', JSON.stringify(window.agenda)); } catch(e){}
    }
    if (window.Dashboard && typeof window.Dashboard.recomputeTotals === 'function') window.Dashboard.recomputeTotals();
    if (window.AgendaModule && typeof window.AgendaModule.render === 'function') window.AgendaModule.render();
    if (window.SessionsModule && typeof window.SessionsModule.renderHistory === 'function') window.SessionsModule.renderHistory('', '', '', '', true);
    if (window.filtrarRelatorio) window.filtrarRelatorio();
  },
  
  formatarData(dataStr) {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  },
  
  verDetalhes(clienteId, data, hora) {
    const atendimento = (window.atendimentosConcluidos || []).find(a => 
      a.clienteId === clienteId && a.data === data && a.hora === hora
    );
    
    if (!atendimento) {
      alert('Atendimento não encontrado');
      return;
    }
    
    if (typeof abrirModalSessao === 'function') {
      abrirModalSessao(atendimento);
    } else {
      // Fallback para alert se a função não estiver disponível
      const cliente = (window.clientes || []).find(c => c.id === clienteId);
      const detalhes = `
Cliente: ${atendimento.clienteNome}
Procedimento: ${atendimento.procedimento}
Data/Hora: ${atendimento.data} ${atendimento.hora}
Valor: R$ ${atendimento.valor.toFixed(2)}
Data de Conclusão: ${new Date(atendimento.dataConclusao).toLocaleString('pt-BR')}
      `.trim();
      alert(detalhes);
    }
  }
};
