// Agenda module: add/remove/render with enhanced features
window.AgendaModule = {
  expediente: { inicio: '08:00', fim: '18:00' }, // Horário de expediente
  semanaAtual: new Date(), // Semana atual sendo visualizada
  statusFiltro: '',
  dataFiltro: '',

  add() {
    const clienteId = document.getElementById('agendaCliente').value;
    const procedimento = document.getElementById('agendaProcedimento').value;
    const data = document.getElementById('agendaData').value;
    const hora = document.getElementById('agendaHora').value;
    const duracao = parseInt(document.getElementById('agendaDuracao').value) || 60;
    const observacoes = document.getElementById('agendaObservacoes').value.trim();

    if (!clienteId || !procedimento || !data || !hora) {
      alert('Preencha cliente, procedimento, data e hora!');
      return;
    }

    // Validar horário de expediente
    if (!this.validarHorarioExpediente(hora)) {
      alert(`Horário fora do expediente (${this.expediente.inicio} - ${this.expediente.fim})!`);
      return;
    }

    // Verificar conflitos de horário
    if (this.verificarConflito(data, hora, duracao, null)) {
      alert('Já existe um agendamento neste horário!');
      return;
    }

    const agendamento = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
      clientId: clienteId,
      procedimento,
      data,
      hora,
      duracao,
      observacoes,
      status: 'agendado', // agendado, confirmado, cancelado, realizado
      criadoEm: new Date().toISOString()
    };

    (window.agenda || []).push(agendamento);
    this.limparFormulario();
    try { localStorage.setItem('est_agenda', JSON.stringify(window.agenda)); } catch(e){}
    this.render();
  },

  limparFormulario() {
    document.getElementById('agendaCliente').value = '';
    document.getElementById('agendaProcedimento').value = '';
    document.getElementById('agendaData').value = '';
    document.getElementById('agendaHora').value = '';
    document.getElementById('agendaDuracao').value = '';
    document.getElementById('agendaObservacoes').value = '';
  },

  validarHorarioExpediente(hora) {
    const [horaAgendamento] = hora.split(':').map(Number);
    const [horaInicio] = this.expediente.inicio.split(':').map(Number);
    const [horaFim] = this.expediente.fim.split(':').map(Number);
    return horaAgendamento >= horaInicio && horaAgendamento < horaFim;
  },

  verificarConflito(data, horaInicio, duracaoMin, excluirId) {
    const inicio = this.parseTime(horaInicio);
    const fim = new Date(inicio.getTime() + duracaoMin * 60000);

    return (window.agenda || []).some(a => {
      if (a.id === excluirId || a.data !== data || a.status === 'cancelado') return false;

      const aInicio = this.parseTime(a.hora);
      const aFim = new Date(aInicio.getTime() + (a.duracao || 60) * 60000);

      return (inicio < aFim && fim > aInicio);
    });
  },

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  },

  atualizarStatus(id, novoStatus) {
    const agendamento = (window.agenda || []).find(a => a.id === id);
    if (!agendamento) return;

    agendamento.status = novoStatus;
    try { localStorage.setItem('est_agenda', JSON.stringify(window.agenda)); } catch(e){}
    this.render();
  },

  remove(id) {
    const index = (window.agenda || []).findIndex(a => a.id === id);
    if (index === -1) return;

    const a = window.agenda[index];
    const clienteObj = (window.clientes || []).find(c => c.id === a.clientId);
    const nome = clienteObj ? clienteObj.nome : a.clientId;

    if (!confirm(`Remover agendamento de ${nome} em ${a.data} ${a.hora}?`)) return;

    window.agenda.splice(index, 1);
    try { localStorage.setItem('est_agenda', JSON.stringify(window.agenda)); } catch(e){}
    this.render();
  },

  filtrar(statusFiltro, dataFiltro) {
    this.statusFiltro = statusFiltro;
    this.dataFiltro = dataFiltro;
    this.render();
  },

  mudarSemana(direcao) {
    this.semanaAtual.setDate(this.semanaAtual.getDate() + (direcao * 7));
    this.render();
  },

  render() {
    this.renderGrade();
    if (window.SessionsModule && typeof window.SessionsModule.render === 'function') window.SessionsModule.render();
  },

  renderGrade() {
    const tbody = document.getElementById('corpoAgenda');
    if (!tbody) return;

    // Atualizar cabeçalho da semana
    this.atualizarCabecalhoSemana();

    tbody.innerHTML = '';

    // Horários do expediente (8:00 às 18:00, intervalos de 30 min)
    const horarios = [];
    for (let hora = 8; hora < 18; hora++) {
      for (let min = 0; min < 60; min += 30) {
        horarios.push(`${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }

    // Para cada horário, criar uma linha
    horarios.forEach(horario => {
      const tr = document.createElement('tr');
      
      // Célula do horário
      const tdHorario = document.createElement('td');
      tdHorario.className = 'horario-celula';
      tdHorario.innerHTML = `<strong>${horario}</strong>`;
      tr.appendChild(tdHorario);

      // Para cada dia da semana (0=Domingo, 6=Sábado)
      for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
        const td = document.createElement('td');
        td.className = 'dia-celula';
        
        // Calcular a data para este dia da semana
        const data = this.getDataDiaSemana(diaSemana);
        const dataStr = data.toISOString().slice(0, 10);
        
        // Encontrar agendamentos para este horário e data
        const agendamentos = (window.agenda || []).filter(a => {
          if (a.data !== dataStr || a.status === 'cancelado' || a.status === 'realizado') return false;
          
          // Verificar se o agendamento cai neste slot de 30 minutos
          const horaAgendamento = a.hora;
          const duracao = a.duracao || 60;
          
          // Calcular se o horário do agendamento intersecta com este slot
          const slotInicio = this.parseTime(horario);
          const slotFim = new Date(slotInicio.getTime() + 30 * 60000);
          const agendamentoInicio = this.parseTime(horaAgendamento);
          const agendamentoFim = new Date(agendamentoInicio.getTime() + duracao * 60000);
          
          return (agendamentoInicio < slotFim && agendamentoFim > slotInicio);
        });

        if (agendamentos.length > 0) {
          // Há agendamento(s) neste horário
          const agendamento = agendamentos[0]; // Pega o primeiro se houver múltiplos
          const clienteObj = (window.clientes || []).find(c => c.id === agendamento.clientId);
          const nome = clienteObj ? clienteObj.nome : agendamento.clientId;
          
          td.className = `dia-celula ocupado status-${agendamento.status}`;
          td.innerHTML = `
            <div class="agendamento-slot">
              <div class="cliente-nome">${nome}</div>
              <div class="procedimento">${agendamento.procedimento}</div>
              <div class="hora">${agendamento.hora} (${agendamento.duracao}min)</div>
            </div>
          `;
          
          // Adicionar menu de ações ao clicar
          td.onclick = (e) => {
            e.stopPropagation();
            this.mostrarMenuAgendamento(agendamento, td);
          };
        } else {
          // Slot vazio - permitir agendamento rápido
          td.className = 'dia-celula vazio';
          td.onclick = () => {
            this.agendamentoRapido(dataStr, horario);
          };
        }
        
        tr.appendChild(td);
      }
      
      tbody.appendChild(tr);
    });
  },

  getDataDiaSemana(diaSemana) {
    const data = new Date(this.semanaAtual);
    const diaAtual = data.getDay(); // 0 = Domingo
    const diferenca = diaSemana - diaAtual;
    data.setDate(data.getDate() + diferenca);
    return data;
  },

  atualizarCabecalhoSemana() {
    const header = document.getElementById('semanaAtual');
    if (!header) return;
    
    const inicioSemana = this.getDataDiaSemana(0);
    const fimSemana = this.getDataDiaSemana(6);
    
    const formato = { day: '2-digit', month: '2-digit' };
    const inicioStr = inicioSemana.toLocaleDateString('pt-BR', formato);
    const fimStr = fimSemana.toLocaleDateString('pt-BR', formato);
    
    header.textContent = `${inicioStr} - ${fimStr}`;
    
    // Atualizar cabeçalhos dos dias
    for (let i = 0; i < 7; i++) {
      const th = document.getElementById(`dia${i}`);
      if (th) {
        const data = this.getDataDiaSemana(i);
        const diaStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        th.textContent = `${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]} ${diaStr}`;
      }
    }
  },

  agendamentoRapido(data, horario) {
    // Preencher o formulário com a data e horário selecionados
    document.getElementById('agendaData').value = data;
    document.getElementById('agendaHora').value = horario;
    
    // Scroll para o formulário
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    
    // Focar no select de cliente
    document.getElementById('agendaCliente').focus();
  },

  mostrarMenuAgendamento(agendamento, elemento) {
    // Remover menus existentes
    document.querySelectorAll('.menu-agendamento').forEach(menu => menu.remove());
    
    const menu = document.createElement('div');
    menu.className = 'menu-agendamento';
    menu.innerHTML = `
      <div class="menu-item" onclick="window.AgendaModule.atualizarStatus('${agendamento.id}', 'confirmado')">
        <i class="fas fa-check"></i> Confirmar
      </div>
      <div class="menu-item" onclick="window.AgendaModule.atualizarStatus('${agendamento.id}', 'cancelado')">
        <i class="fas fa-times"></i> Cancelar
      </div>
      <div class="menu-item" onclick="window.AgendaModule.remove('${agendamento.id}')">
        <i class="fas fa-trash"></i> Remover
      </div>
    `;
    
    // Posicionar o menu
    const rect = elemento.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.zIndex = '1000';
    
    document.body.appendChild(menu);
    
    // Fechar menu ao clicar fora
    setTimeout(() => {
      document.addEventListener('click', function fecharMenu() {
        menu.remove();
        document.removeEventListener('click', fecharMenu);
      });
    }, 100);
  },

  getStatusIcon(status) {
    const icons = {
      agendado: 'fas fa-clock',
      confirmado: 'fas fa-check-circle',
      cancelado: 'fas fa-times-circle',
      realizado: 'fas fa-check-double'
    };
    return `<i class="${icons[status] || 'fas fa-question'}"></i>`;
  },

  getStatusText(status) {
    const textos = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      realizado: 'Realizado'
    };
    return textos[status] || 'Desconhecido';
  },

  formatarData(dataStr) {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  }
};
