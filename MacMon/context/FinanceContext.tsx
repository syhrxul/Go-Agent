import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- TIPE DATA ---
export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string; // Menyambung ke Nama Budget
  date: string; // ISO String
};

export type Budget = {
  id: string;
  name: string; // Misal: "Makan", "Transport"
  limit: number; // Batas Anggaran
  color: string; // Warna untuk UI
};

type FinanceContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  balance: number;
  savings: number; 
  todayExpense: number;
  
  // Actions Transaction
  addTransaction: (title: string, amount: number, type: 'income' | 'expense', category?: string) => void;
  editTransaction: (id: string, title: string, amount: number, category?: string) => void;
  deleteTransaction: (id: string) => void;
  
  // Actions Budget
  addBudget: (name: string, limit: number, color: string) => void;
  editBudget: (id: string, name: string, limit: number) => void;
  deleteBudget: (id: string) => void;

  // Actions Lainnya
  moveToSavings: () => void; 
  resetFinanceData: () => void;
};

// --- INITIAL CONTEXT ---
const FinanceContext = createContext<FinanceContextType>({
  transactions: [],
  budgets: [],
  balance: 0,
  savings: 0,
  todayExpense: 0,
  addTransaction: () => {},
  editTransaction: () => {},
  deleteTransaction: () => {},
  addBudget: () => {},
  editBudget: () => {},
  deleteBudget: () => {},
  moveToSavings: () => {},
  resetFinanceData: () => {},
});

export const useFinance = () => useContext(FinanceContext);

// --- PROVIDER COMPONENT ---
export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  // State Utama
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // State Turunan (Dihitung Ulang / Load)
  const [balance, setBalance] = useState(0);
  const [savings, setSavings] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);

  // 1. LOAD DATA DARI DEVICE (Saat Aplikasi Dibuka)
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('finance_data_v3');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setTransactions(parsed.transactions || []);
          setBudgets(parsed.budgets || []);
          setSavings(parsed.savings || 0);
        }
      } catch (e) { 
        console.log("Gagal memuat data keuangan:", e); 
      }
    };
    loadData();
  }, []);

  // 2. HITUNG SALDO & SIMPAN OTOMATIS (Setiap ada perubahan)
  useEffect(() => {
    let currentBalance = 0;
    let expenseToday = 0;
    const today = new Date().toISOString().split('T')[0];

    // Hitung Saldo & Pengeluaran Hari Ini
    transactions.forEach(t => {
      if (t.type === 'income') {
        currentBalance += t.amount;
      } else {
        currentBalance -= t.amount;
      }

      // Cek apakah pengeluaran terjadi hari ini
      if (t.type === 'expense' && t.date.startsWith(today)) {
        expenseToday += t.amount;
      }
    });

    setBalance(currentBalance);
    setTodayExpense(expenseToday);

    // Simpan ke AsyncStorage
    const saveToDevice = async () => {
      try {
        const dataToSave = { transactions, budgets, savings };
        await AsyncStorage.setItem('finance_data_v3', JSON.stringify(dataToSave));
      } catch (e) {
        console.log("Gagal menyimpan data:", e);
      }
    };
    saveToDevice();

  }, [transactions, budgets, savings]);

  // --- ACTIONS TRANSAKSI ---
  const addTransaction = (title: string, amount: number, type: 'income' | 'expense', category?: string) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      title,
      amount,
      type,
      category,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const editTransaction = (id: string, title: string, amount: number, category?: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, title, amount, category } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- ACTIONS BUDGET ---
  const addBudget = (name: string, limit: number, color: string) => {
    const newBudget: Budget = { id: Date.now().toString(), name, limit, color };
    setBudgets(prev => [...prev, newBudget]);
  };

  const editBudget = (id: string, name: string, limit: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, name, limit } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // --- ACTIONS SAVINGS ---
  const moveToSavings = () => {
    if (balance > 0) {
        // 1. Tambahkan ke tabungan
        setSavings(prev => prev + balance);
        
        // 2. Buat transaksi pengeluaran otomatis agar saldo aktif jadi 0
        // (Ini penting agar perhitungan balance tetap konsisten)
        addTransaction("Pindah ke Tabungan", balance, 'expense', 'System');
    }
  };

  // --- ACTION RESET ---
  const resetFinanceData = async () => {
    try {
      // 1. Kosongkan State
      setTransactions([]);
      setBudgets([]);
      setBalance(0);
      setSavings(0);
      setTodayExpense(0);

      // 2. Hapus dari Device Storage
      await AsyncStorage.removeItem('finance_data_v3');
      
      console.log("Data keuangan berhasil di-reset.");
    } catch (error) {
      console.log("Gagal reset data:", error);
    }
  };

  return (
    <FinanceContext.Provider value={{ 
        transactions, budgets, balance, savings, todayExpense, 
        addTransaction, editTransaction, deleteTransaction, 
        addBudget, editBudget, deleteBudget, 
        moveToSavings, resetFinanceData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};