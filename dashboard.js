// Dashboard module: recompute totals from atendimentosConcluidos
window.Dashboard = {
  recomputeTotals() {
    window.totalDia = 0; window.totalSemana = 0; window.totalMes = 0;
    let atendidosHoje = 0;
    let canceladosHoje = 0;
    
    const hoje = new Date();
    const hojeStr = hoje.toISOString().slice(0,10);
    const seteDias = new Date(hoje); seteDias.setDate(hoje.getDate() - 7);
    
    (window.atendimentosConcluidos || []).forEach(a => {
      const v = Number(a.valor) || 0;
      if (a.data === hojeStr) {
        window.totalDia += v;
        atendidosHoje++;
      }
      if (a.data) {
        const d = new Date(a.data);
        if (d >= seteDias && d <= hoje) window.totalSemana += v;
        if (String(d.getMonth() + 1).padStart(2,'0') === String(hoje.getMonth() + 1).padStart(2,'0')) window.totalMes += v;
      }
    });

    // Contar agendamentos cancelados hoje
    (window.agenda || []).forEach(a => {
      if (a.data === hojeStr && a.status === 'cancelado') {
        canceladosHoje++;
      }
    });

    // Calcular saldo (receitas - despesas)
    const totalReceitas = (window.atendimentosConcluidos || []).reduce((sum, a) => sum + (Number(a.valor) || 0), 0);
    const totalDespesas = (window.despesas || []).reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
    const saldo = totalReceitas - totalDespesas;

    const diaEl = document.getElementById('dia');
    const semEl = document.getElementById('semana');
    const mesEl = document.getElementById('mes');
    const saldoEl = document.getElementById('saldoDashboard');
    const atendidosEl = document.getElementById('atendidosHoje');
    const canceladosEl = document.getElementById('canceladosHoje');
    
    if (diaEl) diaEl.innerText = (window.totalDia||0).toFixed(2);
    if (semEl) semEl.innerText = (window.totalSemana||0).toFixed(2);
    if (mesEl) mesEl.innerText = (window.totalMes||0).toFixed(2);
    if (saldoEl) {
      saldoEl.innerText = saldo.toFixed(2);
      saldoEl.className = saldo >= 0 ? 'positivo' : 'negativo';
    }
    if (atendidosEl) atendidosEl.innerText = atendidosHoje;
    if (canceladosEl) canceladosEl.innerText = canceladosHoje;
  }
};
