import "../styles/transactions.css";
import "../styles/categories.css";
import NavBar from "../components/NavBar";
import { useCallback, useEffect, useState } from "react";

import api from "../services/api";
import {
  formatCurrency,
  monthKey,
  monthLabel,
  currentMonthKey,
  apiErrorMessage,
} from "../utils/format";

// Avança ou volta um mês: ("2026-10", -1) -> "2026-09"
function shiftMonth(key, delta) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Lista de categorias de um tipo com o total gasto/recebido no mês e a porcentagem
function Breakdown({ title, type, rows, total }) {
  return (
    <section className={`category-panel ${type === "SAIDA" ? "is-expense" : "is-income"}`}>
      <div className="category-panel-header">
        <h2>{title}</h2>
        <strong>{formatCurrency(total)}</strong>
      </div>

      {rows.length === 0 ? (
        <p className="category-empty">Nenhum lançamento neste mês.</p>
      ) : (
        <ul className="category-breakdown">
          {rows.map((row) => {
            const percent = total > 0 ? Math.round((row.total / total) * 100) : 0;
            return (
              <li key={row.id}>
                <div className="category-breakdown-line">
                  <span>{row.name}</span>
                  <span>
                    {formatCurrency(row.total)} <small>{percent}%</small>
                  </span>
                </div>
                <div className="category-bar" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(currentMonthKey());

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("SAIDA");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [mensagem, setMensagem] = useState({ text: "", error: false });

  const loadCategories = useCallback(() => {
    return api.get("/categories").then((response) => setCategories(response.data));
  }, []);

  useEffect(() => {
    loadCategories();
    api.get("/transactions").then((response) => setTransactions(response.data));
  }, [loadCategories]);

  function showMessage(text, error = false) {
    setMensagem({ text, error });
  }

  // Totais por categoria no mês escolhido
  const doMes = transactions.filter((transaction) => monthKey(transaction.date) === month);

  function breakdown(type) {
    const totals = {};
    for (const transaction of doMes) {
      if (transaction.type !== type) continue;
      totals[transaction.categoryId] = (totals[transaction.categoryId] || 0) + Number(transaction.amount);
    }
    const rows = categories
      .filter((category) => totals[category.id])
      .map((category) => ({ id: category.id, name: category.name, total: totals[category.id] }))
      .sort((a, b) => b.total - a.total);
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    return { rows, total };
  }

  const despesas = breakdown("SAIDA");
  const receitas = breakdown("ENTRADA");

  const minhasCategorias = categories.filter((category) => !category.isDefault);
  const categoriasPadrao = categories.filter((category) => category.isDefault);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post("/categories", { name: newName, type: newType });
      setNewName("");
      await loadCategories();
      showMessage("Categoria criada.");
    } catch (error) {
      showMessage(apiErrorMessage(error, "Não foi possível criar a categoria."), true);
    }
  }

  async function handleRename(category) {
    try {
      await api.put(`/categories/${category.id}`, { name: editingName, type: category.type });
      setEditingId(null);
      await loadCategories();
      showMessage("Categoria atualizada.");
    } catch (error) {
      showMessage(apiErrorMessage(error, "Não foi possível renomear a categoria."), true);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category.id}`);
      await loadCategories();
      showMessage("Categoria excluída.");
    } catch (error) {
      showMessage(apiErrorMessage(error, "Não foi possível excluir a categoria."), true);
    }
  }

  return (
    <div className="transactions-container">
      <NavBar />

      <main className="transactions-content">
        <div className="transactions-header">
          <div className="titulo">
            <h1>Categorias</h1>
            <p>Para onde vai o seu dinheiro</p>
          </div>

          <div className="month-picker">
            <button type="button" aria-label="Mês anterior" onClick={() => setMonth(shiftMonth(month, -1))}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <span>{monthLabel(month)}</span>
            <button
              type="button"
              aria-label="Próximo mês"
              disabled={month >= currentMonthKey()}
              onClick={() => setMonth(shiftMonth(month, 1))}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="category-panels">
          <Breakdown title="Despesas por categoria" type="SAIDA" {...despesas} />
          <Breakdown title="Receitas por categoria" type="ENTRADA" {...receitas} />
        </div>

        <section className="category-panel category-manage">
          <div className="category-panel-header">
            <h2>Suas categorias</h2>
          </div>

          <form className="category-form" onSubmit={handleCreate}>
            <input
              type="text"
              value={newName}
              placeholder="Nome da nova categoria"
              aria-label="Nome da nova categoria"
              maxLength={40}
              required
              onChange={(e) => setNewName(e.target.value)}
            />
            <select value={newType} aria-label="Tipo" onChange={(e) => setNewType(e.target.value)}>
              <option value="SAIDA">Despesa</option>
              <option value="ENTRADA">Receita</option>
            </select>
            <button type="submit" className="add-transaction-button">
              + Criar
            </button>
          </form>

          {mensagem.text && (
            <p className={mensagem.error ? "form-error" : "form-success"} role="status">
              {mensagem.text}
            </p>
          )}

          {minhasCategorias.length === 0 ? (
            <p className="category-empty">Você ainda não criou categorias. As padrão aparecem abaixo.</p>
          ) : (
            <ul className="category-list">
              {minhasCategorias.map((category) => (
                <li key={category.id}>
                  <span className={`category-dot ${category.type === "SAIDA" ? "saida" : "entrada"}`} />

                  {editingId === category.id ? (
                    <input
                      className="category-rename"
                      value={editingName}
                      maxLength={40}
                      autoFocus
                      aria-label="Novo nome"
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(category);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="category-name">{category.name}</span>
                  )}

                  <span className="category-type">{category.type === "SAIDA" ? "Despesa" : "Receita"}</span>

                  <div className="category-actions">
                    {editingId === category.id ? (
                      <>
                        <button type="button" title="Salvar" aria-label="Salvar" onClick={() => handleRename(category)}>
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button type="button" title="Cancelar" aria-label="Cancelar" onClick={() => setEditingId(null)}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          title="Renomear"
                          aria-label="Renomear"
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button type="button" title="Excluir" aria-label="Excluir" onClick={() => handleDelete(category)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className="category-subtitle">Categorias padrão</h3>
          <div className="category-chips">
            {categoriasPadrao.map((category) => (
              <span key={category.id} className={`category-chip ${category.type === "SAIDA" ? "saida" : "entrada"}`}>
                {category.name}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Categories;
