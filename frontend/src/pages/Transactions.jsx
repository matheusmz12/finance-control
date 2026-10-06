import "../styles/transactions.css";
import NavBar from "../components/NavBar";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { useCallback, useEffect, useRef, useState } from "react";

import api from "../services/api";
import {
  formatCurrency,
  formatDate,
  monthKey,
  monthLabel,
  todayISO,
  apiErrorMessage,
} from "../utils/format";

const EMPTY_FORM = { description: "", amount: "", type: "", categoryId: "", date: "" };

function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErro, setFormErro] = useState("");
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [openMenu, setOpenMenu] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Transação aguardando confirmação de exclusão
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, showToast] = useToast();

  const menuRef = useRef(null);

  //BUSCAR AS TRANSAÇÕES DO USUÁRIO
  const loadTransactions = useCallback(() => {
    return api
      .get("/transactions")
      .then((response) => {
        setTransactions(response.data);
        setErro("");
      })
      .catch(() => setErro("Não foi possível carregar suas transações."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get("/categories").then((response) => setCategories(response.data));
    loadTransactions();
  }, [loadTransactions]);

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      // Trocou o tipo: a categoria escolhida pode não servir mais
      if (field === "type") next.categoryId = "";
      return next;
    });
    setFormErro("");
  }

  function openCreateForm() {
    setEditingTransaction(null);
    setForm({ ...EMPTY_FORM, date: todayISO() });
    setFormErro("");
    setShowForm(true);
  }

  //funcao para editar uma transação
  function handleEditTransaction(transaction) {
    setEditingTransaction(transaction);
    setForm({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: String(transaction.categoryId),
      // o <input type="date"> precisa do formato AAAA-MM-DD
      date: String(transaction.date).slice(0, 10),
    });
    setFormErro("");
    setOpenMenu(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTransaction(null);
    setFormErro("");
  }

  async function handleSaveTransaction(e) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, form);
      } else {
        await api.post("/transactions", form);
      }

      await loadTransactions();
      showToast(editingTransaction ? "Transação atualizada" : "Transação criada");
      closeForm();
    } catch (error) {
      setFormErro(apiErrorMessage(error, "Não foi possível salvar a transação."));
    } finally {
      setSaving(false);
    }
  }

  // Excluir: primeiro abre a janela de confirmação...
  function askDelete(transaction) {
    setOpenMenu(null);
    setToDelete(transaction);
  }

  // ...e só exclui depois que a pessoa confirma
  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/transactions/${toDelete.id}`);
      await loadTransactions();
      showToast("Transação excluída");
      setToDelete(null);
    } catch (error) {
      showToast(apiErrorMessage(error, "Não foi possível excluir a transação."), true);
    } finally {
      setDeleting(false);
    }
  }

  const cancelDelete = useCallback(() => setToDelete(null), []);

  // Agrupa as transações por mês ("2026-10" -> [transações])
  const gruposTransacoes = transactions.reduce((grupos, transaction) => {
    const idMes = monthKey(transaction.date);
    (grupos[idMes] ||= []).push(transaction);
    return grupos;
  }, {});

  // Só as categorias do tipo escolhido (receita ou despesa)
  const categoriasDoTipo = categories.filter((category) => category.type === form.type);

  const toggleMenu = (transactionId) => {
    setOpenMenu(openMenu === transactionId ? null : transactionId);
  };

  // Fecha o menu de ações ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="transactions-container">
      <NavBar />

      <main className="transactions-content">
        <div className="transactions-header">
          <div className="titulo">
            <h1>Transações</h1>
            <p>Gerencie suas receitas e despesas</p>
          </div>

          <button className="add-transaction-button" onClick={openCreateForm}>
            + Nova transação
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <form className="transaction-form" onSubmit={handleSaveTransaction}>
              <h2>{editingTransaction ? "Editar transação" : "Nova transação"}</h2>

              {formErro && (
                <p className="form-error" role="alert">
                  {formErro}
                </p>
              )}

              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <input
                  type="text"
                  id="description"
                  value={form.description}
                  placeholder="Ex: Supermercado"
                  required
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Valor</label>
                <input
                  type="number"
                  id="amount"
                  value={form.amount}
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  required
                  onChange={(e) => updateField("amount", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Tipo</label>

                <select
                  id="type"
                  value={form.type}
                  required
                  onChange={(e) => updateField("type", e.target.value)}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="ENTRADA">Receita</option>
                  <option value="SAIDA">Despesa</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria</label>

                <select
                  id="category"
                  value={form.categoryId}
                  required
                  disabled={!form.type}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                >
                  <option value="">
                    {form.type ? "Selecione uma categoria" : "Escolha o tipo primeiro"}
                  </option>

                  {categoriasDoTipo.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Data</label>

                <input
                  type="date"
                  id="date"
                  value={form.date}
                  required
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>

              <div className="transaction-form-buttons">
                <button type="button" onClick={closeForm}>
                  Cancelar
                </button>

                <button type="submit" disabled={saving}>
                  {saving ? "Salvando…" : editingTransaction ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="transactions-list">
          {loading ? (
            <p>Carregando…</p>
          ) : erro ? (
            <p>{erro}</p>
          ) : transactions.length === 0 ? (
            <p>Nenhuma transação encontrada.</p>
          ) : (
            <ul>
              {Object.entries(gruposTransacoes)
                .sort(([idMesA], [idMesB]) => idMesB.localeCompare(idMesA))
                .map(([idMes, transacoesDoMes]) => {
                  // Calcula o resumo do mês (receita e despesa)
                  const resumo = transacoesDoMes.reduce(
                    (total, transaction) => {
                      const valor = Number(transaction.amount);

                      if (transaction.type === "ENTRADA") {
                        total.receitas += valor;
                      } else {
                        total.despesas += valor;
                      }

                      return total;
                    },
                    { receitas: 0, despesas: 0 },
                  );

                  return (
                    <li key={idMes}>
                      <div className="month-summary-values">
                        <h2>{monthLabel(idMes)}</h2>

                        <div className="month-summary">
                          <div className="month-summary-receitas">
                            <span>Receitas: {formatCurrency(resumo.receitas)}</span>
                          </div>
                          <div className="month-summary-despesas">
                            <span>Despesas: {formatCurrency(resumo.despesas)}</span>
                          </div>
                          <div className="month-summary-saldo">
                            <span>
                              Saldo: {formatCurrency(resumo.receitas - resumo.despesas)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="title-transactions">
                        <span>Descrição</span>
                        <span>Categoria</span>
                        <span>Data</span>
                        <span>Tipo</span>
                        <span>Valor</span>
                      </div>

                      <ul className="transactions-month-list">
                        {[...transacoesDoMes]
                          .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                          .map((transaction) => {
                            const entrada = transaction.type === "ENTRADA";

                            return (
                              <li key={transaction.id}>
                                <div className="transaction-row">
                                  <strong className="transaction-description">
                                    {transaction.description}
                                  </strong>

                                  <span className="transaction-category">
                                    {transaction.Category?.name}
                                  </span>

                                  <span className="transaction-date">
                                    {formatDate(transaction.date)}
                                  </span>

                                  <span
                                    className={`${entrada ? "entrada" : "saida"} transaction-type`}
                                  >
                                    {entrada ? "Receita" : "Despesa"}
                                  </span>

                                  <span
                                    className={`${entrada ? "valorEntrada" : "valorSaida"} transaction-value`}
                                  >
                                    {entrada ? "+" : "-"} {formatCurrency(transaction.amount)}
                                  </span>

                                  <button
                                    className="transaction-menu-button"
                                    aria-label="Ações da transação"
                                    onClick={() => toggleMenu(transaction.id)}
                                  >
                                    ⋮
                                  </button>

                                  {openMenu === transaction.id && (
                                    <div className="transaction-actions" ref={menuRef}>
                                      <button
                                        title="Editar"
                                        aria-label="Editar"
                                        onClick={() => handleEditTransaction(transaction)}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>

                                      <button
                                        title="Excluir"
                                        aria-label="Excluir"
                                        onClick={() => askDelete(transaction)}
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title="Excluir transação?"
        message={
          toDelete &&
          `"${toDelete.description}" de ${formatCurrency(toDelete.amount)} em ${formatDate(toDelete.date)} será excluída. Essa ação não pode ser desfeita.`
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}

export default Transactions;
