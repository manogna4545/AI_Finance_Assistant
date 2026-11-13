import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_AI_CHAT,
  MONTHLY_TREND_DATA,
  PREDICTION_FORECAST_DATA
} from '../data/initialData';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  // Authentication & Connection State
  const [token, setToken] = useState(() => localStorage.getItem('ai_finance_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ai_finance_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Financial Datasets
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [chatMessages, setChatMessages] = useState(INITIAL_AI_CHAT);
  const [monthlyTrends, setMonthlyTrends] = useState(MONTHLY_TREND_DATA);
  const [predictionData, setPredictionData] = useState(PREDICTION_FORECAST_DATA);

  // Summary Metrics
  const [dashboardStats, setDashboardStats] = useState({
    total_balance: 3699.61,
    total_income: 5700.0,
    total_expenses: 2000.39,
    savings_rate: 65,
    budget_progress: 53
  });

  // Fetch all live user data from backend
  const refreshData = useCallback(async (authTokenOverride) => {
    const activeToken = authTokenOverride || token || localStorage.getItem('ai_finance_token');
    if (!activeToken) return;
    setLoading(true);
    setError(null);

    try {
      const [dashRes, txRes, budgetRes, predRes, chatRes] = await Promise.allSettled([
        api.analytics.getDashboard(),
        api.transactions.getAll(),
        api.budgets.getAll(),
        api.predictions.getPredictions(),
        api.ai.getHistory()
      ]);

      // Check for 401 Unauthorized across responses
      const isUnauthorized = [dashRes, txRes, budgetRes, predRes, chatRes].some(
        r => r.status === 'rejected' && r.reason?.status === 401
      );
      if (isUnauthorized) {
        console.warn('API returned 401 Unauthorized during refresh. Session expired.');
        localStorage.removeItem('ai_finance_token');
        localStorage.removeItem('ai_finance_user');
        setToken(null);
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
        setIsBackendConnected(false);
        return;
      }

      // Handle Dashboard
      if (dashRes.status === 'fulfilled' && dashRes.value) {
        const d = dashRes.value;
        setDashboardStats({
          total_balance: d.total_balance ?? 0,
          total_income: d.total_income ?? 0,
          total_expenses: d.total_expenses ?? 0,
          savings_rate: d.savings_rate ?? 0,
          budget_progress: d.budget_progress ?? 0
        });
        if (d.monthly_trends && d.monthly_trends.length > 0) {
          setMonthlyTrends(d.monthly_trends);
        }
        if (d.user) {
          setUser(d.user);
          localStorage.setItem('ai_finance_user', JSON.stringify(d.user));
        }
      }

      // Handle Transactions with normalization of type / transaction_type
      if (txRes.status === 'fulfilled' && txRes.value?.transactions) {
        const normalizedTx = txRes.value.transactions.map(t => ({
          ...t,
          type: t.type || t.transaction_type || 'expense',
          transaction_type: t.transaction_type || t.type || 'expense'
        }));
        setTransactions(normalizedTx);
      } else if (txRes.status === 'rejected') {
        console.error('Failed to load transactions from API:', txRes.reason);
        setError(txRes.reason?.message || 'Could not load transactions from the server.');
      }

      // Handle Budgets with normalization of limit / monthly_limit
      if (budgetRes.status === 'fulfilled' && budgetRes.value?.budgets) {
        const normalizedBudgets = budgetRes.value.budgets.map(b => ({
          ...b,
          limit: b.limit ?? b.monthly_limit ?? 0,
          monthly_limit: b.monthly_limit ?? b.limit ?? 0
        }));
        setBudgets(normalizedBudgets);
      }

      // Handle Predictions
      if (predRes.status === 'fulfilled' && predRes.value?.forecast) {
        setPredictionData(predRes.value.forecast);
      }

      // Handle Chat
      if (chatRes.status === 'fulfilled' && chatRes.value?.messages) {
        setChatMessages(chatRes.value.messages);
      }

      // A successful health check and transactions load confirms API Live
      const transactionsLoaded = txRes.status === 'fulfilled' && Boolean(txRes.value?.transactions);
      setIsBackendConnected(transactionsLoaded);
      if (transactionsLoaded) setError(null);
    } catch (err) {
      console.warn('Backend sync note:', err.message);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial authentication verification and data sync on load
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ai_finance_token');
      if (savedToken) {
        setToken(savedToken);
        setIsAuthenticated(true);
        try {
          await api.checkHealth();
          if (!isMounted) return;
          setIsBackendConnected(true);

          // Verify token validity with backend /api/auth/me
          try {
            const meRes = await api.auth.getProfile();
            if (meRes?.user && isMounted) {
              setUser(meRes.user);
              localStorage.setItem('ai_finance_user', JSON.stringify(meRes.user));
              await refreshData(savedToken);
            }
          } catch (profileErr) {
            console.warn('Token validation response:', profileErr?.message);
            if (profileErr?.status === 401) {
              console.warn('Stored JWT is expired or invalid. Resetting authentication session.');
              localStorage.removeItem('ai_finance_token');
              localStorage.removeItem('ai_finance_user');
              if (isMounted) {
                setToken(null);
                setIsAuthenticated(false);
                setUser(INITIAL_USER);
              }
            } else {
              await refreshData(savedToken);
            }
          }
        } catch {
          if (isMounted) setIsBackendConnected(false);
        }
      } else {
        // Test backend availability silently
        api.checkHealth()
          .then(() => { if (isMounted) setIsBackendConnected(true); })
          .catch(() => { if (isMounted) setIsBackendConnected(false); });
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, [refreshData]);

  // Authentication Actions
  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('ai_finance_token', newToken);
    localStorage.setItem('ai_finance_user', JSON.stringify(newUser));
    setIsBackendConnected(true);
    refreshData(newToken);
  };

  const login = async (identifier, password) => {
    const res = await api.auth.login(identifier, password);
    handleAuthSuccess(res.token, res.user);
    return res;
  };

  const demoLogin = async () => {
    const res = await api.auth.demoLogin();
    handleAuthSuccess(res.token, res.user);
    return res;
  };

  const register = async (payload) => {
    const res = await api.auth.register(payload);
    handleAuthSuccess(res.token, res.user);
    return res;
  };

  const logout = async () => {
    try {
      const activeToken = token || localStorage.getItem('ai_finance_token');
      if (activeToken) await api.auth.logout();
    } catch {
      // offline logout
    }
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ai_finance_token');
    localStorage.removeItem('ai_finance_user');
    setUser(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setChatMessages(INITIAL_AI_CHAT);
  };

  const updateUser = async (updates) => {
    try {
      const activeToken = token || localStorage.getItem('ai_finance_token');
      if (activeToken) {
        const res = await api.auth.updateProfile(updates);
        setUser(res.user);
        localStorage.setItem('ai_finance_user', JSON.stringify(res.user));
      } else {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('ai_finance_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // Transaction Actions
  const addTransaction = async (newTx) => {
    const activeToken = token || localStorage.getItem('ai_finance_token');
    const parsedAmount = parseFloat(newTx.amount);
    const txType = newTx.type || newTx.transaction_type || 'expense';

    const payload = {
      ...newTx,
      amount: parsedAmount,
      type: txType,
      transaction_type: txType
    };

    if (activeToken) {
      try {
        const res = await api.transactions.create(payload);
        if (!res?.transaction) {
          throw new Error('The server did not confirm that the transaction was saved.');
        }
        const created = {
          ...res.transaction,
          type: res.transaction.type || res.transaction.transaction_type || txType,
          transaction_type: res.transaction.transaction_type || res.transaction.type || txType
        };
        setTransactions(prev => [created, ...prev.filter(t => t.id !== created.id)]);
        setIsBackendConnected(true);
        setError(null);
        await refreshData(activeToken);
        return created;
      } catch (err) {
        console.error('API transaction add failed:', err);
        setError(err.message || 'Could not save the transaction to the server.');
        throw err;
      }
    }

    // Local fallback
    const created = {
      ...payload,
      id: `tx-${Date.now()}`,
      status: 'Completed'
    };
    setTransactions(prev => [created, ...prev]);
    return created;
  };

  const updateTransaction = async (id, updatedData) => {
    const activeToken = token || localStorage.getItem('ai_finance_token');
    const payload = {
      ...updatedData,
      type: updatedData.type || updatedData.transaction_type,
      transaction_type: updatedData.transaction_type || updatedData.type
    };

    if (activeToken && typeof id === 'number') {
      try {
        await api.transactions.update(id, payload);
        await refreshData(activeToken);
        return;
      } catch (err) {
        console.error('API update failed:', err);
        setError(err.message || 'Could not update the transaction on the server.');
        throw err;
      }
    }

    if (activeToken) throw new Error('This saved transaction cannot be updated offline.');
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...payload, amount: parseFloat(payload.amount) } : t)));
  };

  const deleteTransaction = async (id) => {
    const activeToken = token || localStorage.getItem('ai_finance_token');
    if (activeToken && typeof id === 'number') {
      try {
        await api.transactions.delete(id);
        await refreshData(activeToken);
        return;
      } catch (err) {
        console.error('API delete failed:', err);
        setError(err.message || 'Could not delete the transaction on the server.');
        throw err;
      }
    }

    if (activeToken) throw new Error('This saved transaction cannot be deleted offline.');
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Budget Actions
  const addBudget = async (newBudget) => {
    const activeToken = token || localStorage.getItem('ai_finance_token');
    const limitVal = parseFloat(newBudget.limit || newBudget.monthly_limit);
    const payload = {
      ...newBudget,
      limit: limitVal,
      monthly_limit: limitVal
    };

    if (activeToken) {
      try {
        const res = await api.budgets.createOrUpdate(payload);
        if (res.budget) {
          const created = {
            ...res.budget,
            limit: res.budget.limit ?? res.budget.monthly_limit,
            monthly_limit: res.budget.monthly_limit ?? res.budget.limit
          };
          setBudgets(prev => [...prev.filter(b => b.id !== created.id), created]);
        }
        await refreshData(activeToken);
        return;
      } catch (err) {
        console.warn('API budget add error:', err);
      }
    }

    // Local fallback
    const created = {
      ...payload,
      id: `b-${Date.now()}`,
      spent: 0,
      color: newBudget.color || '#10b981'
    };
    setBudgets(prev => [...prev, created]);
  };

  const updateBudget = async (id, newLimit) => {
    const activeToken = token || localStorage.getItem('ai_finance_token');
    if (activeToken && typeof id === 'number') {
      try {
        await api.budgets.update(id, { limit: newLimit });
        await refreshData(activeToken);
        return;
      } catch (err) {
        console.warn('API budget update error:', err);
      }
    }

    setBudgets(prev => prev.map(b => (b.id === id ? { ...b, limit: parseFloat(newLimit), monthly_limit: parseFloat(newLimit) } : b)));
  };

  // AI Assistant Chat Actions
  const sendAIMessage = async (text) => {
    const activeToken = token || localStorage.getItem('ai_finance_token');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistic user bubble
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      time: timeStr,
      message: text
    };
    setChatMessages(prev => [...prev, userMsg]);

    if (activeToken) {
      try {
        const res = await api.ai.chat(text);
        if (res.assistant_message) {
          const botMsg = {
            id: res.assistant_message.id || Date.now() + 1,
            sender: 'assistant',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: res.assistant_message.message
          };
          setChatMessages(prev => [...prev, botMsg]);
          return;
        }
      } catch (err) {
        console.warn('AI API error, falling back to local reasoning:', err);
      }
    }

    // Local rule-based fallback
    setTimeout(() => {
      let reply = `I evaluated your recorded ledger. Your current cash balance is ${user.currency || '$'}${dashboardStats.total_balance.toLocaleString()} with a ${dashboardStats.savings_rate}% savings margin.`;
      const lower = text.toLowerCase();
      if (lower.includes('budget') || lower.includes('dining')) {
        reply = `Your active category thresholds show dining out at higher velocity. Preserving home meals for 3 days will save approximately ${user.currency || '$'}85.`;
      } else if (lower.includes('predict') || lower.includes('forecast')) {
        reply = `Our ML regression projection estimates your upcoming month spending at ${user.currency || '$'}2,890.00 with 88% confidence.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: reply
        }
      ]);
    }, 400);
  };

  const clearChat = async () => {
    const activeToken = token || localStorage.getItem('ai_finance_token');
    if (activeToken) {
      try {
        await api.ai.clearHistory();
        await refreshData(activeToken);
        return;
      } catch (err) {
        console.warn('Failed to clear chat via API:', err);
      }
    }

    setChatMessages([
      {
        id: 1,
        sender: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: "Chat history cleared. I'm ready to answer any questions regarding your finances, budgets, or forecast insights!"
      }
    ]);
  };

  // Calculations for UI consumption
  const totalIncome = dashboardStats.total_income;
  const totalExpenses = dashboardStats.total_expenses;
  const totalBalance = dashboardStats.total_balance;
  const savingsRate = dashboardStats.savings_rate;
  const budgetProgress = dashboardStats.budget_progress;

  // Category breakdown for charts
  const categoryExpenses = transactions
    .filter(t => t.type === 'expense' || t.transaction_type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const categoryExpenseList = Object.keys(categoryExpenses).map(cat => ({
    name: cat,
    value: categoryExpenses[cat]
  }));

  const resetDemoData = () => {
    localStorage.removeItem('ai_finance_token');
    localStorage.removeItem('ai_finance_user');
    setToken(null);
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setChatMessages(INITIAL_AI_CHAT);
  };

  return (
    <FinanceContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isBackendConnected,
        loading,
        error,
        login,
        demoLogin,
        register,
        logout,
        updateUser,
        refreshData,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        budgets,
        addBudget,
        updateBudget,
        chatMessages,
        sendAIMessage,
        clearChat,
        totalIncome,
        totalExpenses,
        totalBalance,
        savingsRate,
        categoryExpenseList,
        budgetProgress,
        monthlyTrends,
        predictionData,
        resetDemoData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
