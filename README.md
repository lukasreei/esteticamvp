# MVP Estética – Sistema de Agendamentos

## Descrição
Sistema de gerenciamento para clínicas de estética, permitindo agendamento de sessões, controle de clientes, fluxo de caixa e relatórios. Desenvolvido como MVP (Minimum Viable Product) com interface web responsiva.

## Funcionalidades

### Dashboard
- Visualização de métricas diárias, semanais e mensais
- Receita total por período
- Número de clientes atendidos
- Número de cancelamentos
- Saldo atual

### Agenda
- Agendamento de sessões com cliente, procedimento, data, hora e duração
- Visualização em grade semanal ou lista
- Filtros por status (agendado, confirmado, cancelado, realizado) e data
- Confirmação e cancelamento de agendamentos

### Sessões
- Conclusão de sessões com registro de valor
- Histórico de atendimentos com filtros e ordenação
- Detalhes de cada sessão

### Clientes
- Cadastro de novos clientes com dados pessoais e anamnese
- Lista de clientes com filtros
- Edição de dados e anamnese
- Avaliação física

### Fluxo de Caixa
- Registro de receitas (automático via sessões concluídas)
- Registro manual de despesas por categoria
- Histórico de movimentações com filtros
- Resumo: entradas, saídas e saldo
- Exportação para PDF

### Relatórios
- Relatório mensal de atendimentos com gráfico
- Relatório mensal/semanal de novos clientes com gráfico
- Exportação consolidada para PDF

## Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Armazenamento**: LocalStorage (dados persistidos localmente)
- **Bibliotecas**:
  - jsPDF (exportação para PDF)
  - Font Awesome (ícones)
- **Design**: Interface responsiva com gradientes e cores customizáveis

## Estrutura de Arquivos
```
est/
├── index.html          # Página principal
├── novo-cliente.html   # Formulário de cadastro de cliente
├── client.html         # Detalhes do cliente (não implementado)
├── dashboard.js        # Lógica do dashboard
├── sessions.js         # Lógica das sessões
├── agenda.js           # Lógica da agenda
├── styles.css          # Estilos CSS
└── README.md           # Esta documentação
```

## Como Executar
1. Baixe ou clone o repositório
2. Abra o arquivo `index.html` em um navegador web moderno
3. O sistema funcionará inteiramente no navegador, sem necessidade de servidor

## Navegação
- Use o menu lateral para alternar entre seções
- Dados são salvos automaticamente no LocalStorage do navegador

## Funcionalidades Detalhadas

### Agendamento
- Selecione cliente existente ou cadastre novo
- Escolha procedimento, data, hora e duração
- Adicione observações opcionais
- Visualize agendamentos em grade semanal ou lista filtrada

### Controle Financeiro
- Receitas registradas automaticamente ao concluir sessões
- Despesas manuais por categoria (Materiais, Equipamentos, Aluguel, etc.)
- Filtros por tipo, categoria, data
- Exportação da tabela completa para PDF

### Relatórios
- Atendimentos mensais: lista de sessões com valores e gráfico de barras
- Clientes mensais: novos cadastros por mês com gráfico
- Clientes semanais: novos cadastros da semana com gráfico
- Exportação unificada de todos os relatórios

### Gestão de Clientes
- Cadastro completo com dados pessoais, alergias, anamnese
- Anamnese estruturada: queixa, histórico médico, medicamentos, hábitos
- Avaliação física com medidas corporais
- Lista com filtros e edição

## Personalização
- Paleta de cores customizável via variáveis CSS
- Interface responsiva para desktop e mobile
- Temas com gradientes e sombras

## Limitações
- Dados armazenados localmente (LocalStorage)
- Sem integração com banco de dados externo
- Sem autenticação de usuários
- Funcionalidades básicas para MVP

## Desenvolvimento Futuro
- Integração com banco de dados
- Sistema de usuários e permissões
- Notificações por email/SMS
- Relatórios mais avançados
- Integração com sistemas de pagamento
- Backup e sincronização de dados

## Suporte
Para dúvidas ou sugestões, entre em contato com o desenvolvedor.

---
Desenvolvido em 2025</content>
<parameter name="filePath">c:\Users\veget\OneDrive\Área de Trabalho\est\README.md