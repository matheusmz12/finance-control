import "../styles/dashboard.css";
import NavBar from "../components/NavBar";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../services/api";
import { formatCurrency, formatDate, monthKey, currentMonthKey, monthLabel } from "../utils/format";

function Dashboard() {
  //Buscando as transações
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ignore = false;

    api
      .get("/transactions")
      .then((response) => {
        if (!ignore) setTransactions(response.data);
      })
      .catch(() => {
        if (!ignore) setErro("Não foi possível carregar suas transações.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  //transações do mês atual
  const mesAtual = currentMonthKey();

  const transacoesDoMes = transactions.filter(
    (transaction) => monthKey(transaction.date) === mesAtual,
  );

  //RECEITAS DO MÊS
  const totalReceitas = transacoesDoMes
    .filter((transaction) => transaction.type === "ENTRADA")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //DESPESAS DO MÊS
  const totalDespesas = transacoesDoMes
    .filter((transaction) => transaction.type === "SAIDA")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //SALDO DO MES
  const saldoDoMes = totalReceitas - totalDespesas;

  // A API já devolve da mais recente para a mais antiga
  const ultimasTransacoes = transactions.slice(0, 5);

  return (
    <div className="dashboard-container">
      <NavBar />

      <main className="dashboard-content">
        <h1>
          Olá, seja bem-vindo ao Finance<span> Control</span>
        </h1>

        <p className="dashboard-period">Resumo de {monthLabel(mesAtual)}</p>

        <div className="summary-cards">
          <div className="summary-card balance-card">
            <h2>Saldo do mês</h2>
            <p>{formatCurrency(saldoDoMes)}</p>
          </div>

          <div className="summary-card income-card">
            <h2>Receitas</h2>
            <p>{formatCurrency(totalReceitas)}</p>
          </div>

          <div className="summary-card expense-card">
            <h2>Despesas</h2>
            <p>{formatCurrency(totalDespesas)}</p>
          </div>
        </div>

        <div className="recent-transactions">
          <div className="section-header">
            <h2>Últimas transações</h2>

            <NavLink to={"/transactions"} className="view-all">
              Ver todas
            </NavLink>
          </div>

          <div className="transaction-dash-header">
            <span>Descrição</span>
            <span>Data</span>
            <span>Valor</span>
          </div>

          {loading && <p className="dashboard-empty">Carregando…</p>}
          {erro && <p className="dashboard-empty">{erro}</p>}
          {!loading && !erro && ultimasTransacoes.length === 0 && (
            <p className="dashboard-empty">
              Nenhuma transação ainda. <NavLink to="/transactions">Adicione a primeira</NavLink>.
            </p>
          )}

          {ultimasTransacoes.map((transaction) => {
            //adicionando classes nos valores
            const classeValor =
              transaction.type === "ENTRADA" ? "income" : "expense";

            const sinal = transaction.type === "ENTRADA" ? "+" : "-";

            return (
              <div className="transaction-item" key={transaction.id}>
                <div className="transaction-info">
                  <p>{transaction.description}</p>
                  <small>{transaction.Category?.name}</small>
                </div>

                <p className="date">{formatDate(transaction.date)}</p>

                <span className={`${classeValor} value`}>
                  {sinal} {formatCurrency(transaction.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
