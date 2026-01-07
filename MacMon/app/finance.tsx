import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFinance, Budget, Transaction } from '@/context/FinanceContext';
import { exportToPDF, exportToExcel } from '@/utils/exportHelper'; 

// Palet Warna Konsisten
const Colors = {
  background: '#F2F4F8',
  surface: '#FFFFFF',
  primary: '#6366F1',        // Indigo
  success: '#10B981',        // Emerald
  danger: '#EF4444',         // Red
  warning: '#F59E0B',        // Amber
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export default function FinanceScreen() {
  const { 
    balance, savings, transactions, budgets, 
    addTransaction, editTransaction, deleteTransaction, 
    addBudget, editBudget, deleteBudget, moveToSavings,
    resetFinanceData 
  } = useFinance();
  
  // -- STATE MODALS --
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 

  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const formatRupiah = (num: number) => 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  const getBudgetUsage = (budgetName: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === budgetName)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // --- ACTIONS ---
  const handleReset = () => {
    Alert.alert("Reset Data?", "Semua data akan dihapus permanen.", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus Semua", style: 'destructive', onPress: resetFinanceData }
    ]);
  };

  const handleExport = () => {
    Alert.alert("Export Laporan", "Pilih format:", [
        { text: "Excel (.xlsx)", onPress: () => exportToExcel(transactions) },
        { text: "PDF", onPress: () => exportToPDF(transactions, balance, savings, budgets) },
        { text: "Batal", style: "cancel" }
    ]);
  };

  // --- TX HANDLERS ---
  const openAddTx = (type: 'income' | 'expense') => {
      setEditingTx(null); setTxTitle(''); setTxAmount(''); setTxType(type); setSelectedCategory(''); setTxModalVisible(true);
  };
  const openEditTx = (tx: Transaction) => {
      setEditingTx(tx); setTxTitle(tx.title); setTxAmount(tx.amount.toString()); setTxType(tx.type); setSelectedCategory(tx.category || ''); setTxModalVisible(true);
  };
  const handleSaveTx = () => {
    if (!txTitle || !txAmount) return;
    if (editingTx) editTransaction(editingTx.id, txTitle, parseInt(txAmount), txType === 'expense' ? selectedCategory : undefined);
    else addTransaction(txTitle, parseInt(txAmount), txType, txType === 'expense' ? selectedCategory : undefined);
    setTxModalVisible(false);
  };
  const handleDeleteTx = () => {
      if (editingTx) { deleteTransaction(editingTx.id); setTxModalVisible(false); }
  };

  // --- BUDGET HANDLERS ---
  const openAddBudget = () => { setEditingBudget(null); setBudgetName(''); setBudgetLimit(''); setBudgetModalVisible(true); };
  const openEditBudget = (b: Budget) => { setEditingBudget(b); setBudgetName(b.name); setBudgetLimit(b.limit.toString()); setBudgetModalVisible(true); };
  const handleSaveBudget = () => {
      if (!budgetName || !budgetLimit) return;
      if (editingBudget) editBudget(editingBudget.id, budgetName, parseInt(budgetLimit));
      else {
          const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          addBudget(budgetName, parseInt(budgetLimit), colors[Math.floor(Math.random() * colors.length)]);
      }
      setBudgetModalVisible(false);
  };
  const handleDeleteBudget = () => { if (editingBudget) { deleteBudget(editingBudget.id); setBudgetModalVisible(false); } };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* HEADER UTAMA */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <MaterialIcons name="arrow-back-ios-new" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Financial Overview</Text>
          <View style={{flexDirection: 'row', gap: 10}}>
             <TouchableOpacity onPress={handleExport} style={styles.iconBtn}><MaterialIcons name="file-download" size={20} color={Colors.primary} /></TouchableOpacity>
             <TouchableOpacity onPress={handleReset} style={styles.iconBtn}><MaterialIcons name="delete-outline" size={20} color={Colors.danger} /></TouchableOpacity>
          </View>
      </View>

      <View style={styles.mainLayout}>
        
        {/* === KOLOM KIRI (OVERVIEW & BUDGETS) === */}
        <View style={styles.leftColumn}>
            
            {/* 1. BALANCE CARDS */}
            <View style={styles.balanceRow}>
                {/* Main Balance */}
                <View style={[styles.card, styles.balanceCard]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconBox}><MaterialIcons name="account-balance-wallet" size={20} color={Colors.primary} /></View>
                        <MaterialIcons name="more-horiz" size={20} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.labelTitle}>Active Balance</Text>
                    <Text style={styles.bigBalance}>{formatRupiah(balance)}</Text>
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, {backgroundColor: Colors.primary}]} onPress={() => openAddTx('income')}>
                             <MaterialIcons name="add" size={16} color="white" />
                             <Text style={styles.btnTextWhite}>Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, {backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border}]} onPress={moveToSavings}>
                             <MaterialIcons name="savings" size={16} color={Colors.textPrimary} />
                             <Text style={styles.btnTextDark}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Savings Card */}
                <View style={[styles.card, styles.savingsCard]}>
                    <Text style={styles.labelTitle}>Savings</Text>
                    <Text style={[styles.bigBalance, {fontSize: 24}]}>{formatRupiah(savings)}</Text>
                    <View style={styles.savingsIcon}>
                        <Ionicons name="wallet" size={40} color={Colors.success + '40'} />
                    </View>
                </View>
            </View>

            {/* 2. BUDGETS */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Monthly Budgets</Text>
                <TouchableOpacity onPress={openAddBudget} style={styles.addBtnSmall}>
                    <MaterialIcons name="add" size={14} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
                {budgets.map((b) => {
                    const used = getBudgetUsage(b.name);
                    const percent = Math.min((used / b.limit) * 100, 100);
                    return (
                        <TouchableOpacity key={b.id} style={styles.budgetCard} onPress={() => openEditBudget(b)}>
                            <View style={[styles.budgetIcon, {backgroundColor: b.color + '20'}]}>
                                <MaterialIcons name="pie-chart" size={18} color={b.color} />
                            </View>
                            <View style={{marginTop: 10}}>
                                <Text style={styles.budgetName}>{b.name}</Text>
                                <Text style={styles.budgetLimit}>{formatRupiah(used)} / {formatRupiah(b.limit)}</Text>
                            </View>
                            <View style={styles.progressBg}>
                                <View style={[styles.progressFill, {width: `${percent}%`, backgroundColor: b.color}]} />
                            </View>
                        </TouchableOpacity>
                    )
                })}
                {budgets.length === 0 && <Text style={styles.emptyText}>No budgets set. Click + to add.</Text>}
            </ScrollView>

        </View>

        {/* === KOLOM KANAN (TRANSACTIONS) === */}
        <View style={styles.rightColumn}>
             <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => openAddTx('expense')} style={[styles.addBtnSmall, {backgroundColor: Colors.danger}]}>
                    <MaterialIcons name="remove" size={14} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.txList} showsVerticalScrollIndicator={false}>
                {transactions.map((tx) => (
                    <TouchableOpacity key={tx.id} style={styles.txItem} onPress={() => openEditTx(tx)}>
                        <View style={[styles.txIcon, { backgroundColor: tx.type === 'income' ? '#DCFCE7' : '#FEE2E2' }]}>
                            <MaterialIcons 
                                name={tx.type === 'income' ? "arrow-downward" : "arrow-upward"} 
                                size={18} 
                                color={tx.type === 'income' ? Colors.success : Colors.danger} 
                            />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.txTitle}>{tx.title}</Text>
                            <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString()} • {tx.category || 'General'}</Text>
                        </View>
                        <Text style={[styles.txAmount, { color: tx.type === 'income' ? Colors.success : Colors.textPrimary }]}>
                            {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                        </Text>
                    </TouchableOpacity>
                ))}
                {transactions.length === 0 && <Text style={styles.emptyText}>No transactions yet.</Text>}
            </ScrollView>
        </View>

      </View>

      {/* === MODAL (Reusable Style) === */}
      <CustomModal visible={txModalVisible} onClose={() => setTxModalVisible(false)}>
          <Text style={styles.modalTitle}>{editingTx ? "Edit Transaction" : `New ${txType === 'income' ? 'Income' : 'Expense'}`}</Text>
          
          <TextInput style={styles.input} placeholder="Title (e.g. Salary)" value={txTitle} onChangeText={setTxTitle} />
          <TextInput style={styles.input} placeholder="Amount (e.g. 50000)" keyboardType="numeric" value={txAmount} onChangeText={setTxAmount} />
          
          {txType === 'expense' && budgets.length > 0 && (
             <View style={{marginVertical: 10}}>
                <Text style={styles.labelTitle}>Select Budget Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 5}}>
                    {budgets.map(b => (
                        <TouchableOpacity key={b.id} 
                            style={[styles.chip, selectedCategory === b.name && {backgroundColor: Colors.primary}]}
                            onPress={() => setSelectedCategory(b.name)}
                        >
                            <Text style={[styles.chipText, selectedCategory === b.name && {color: 'white'}]}>{b.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
             </View>
          )}

          <View style={styles.modalActions}>
              {editingTx && <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteTx}><Text style={styles.btnTextWhite}>Delete</Text></TouchableOpacity>}
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveTx}><Text style={styles.btnTextWhite}>Save</Text></TouchableOpacity>
          </View>
      </CustomModal>

      <CustomModal visible={budgetModalVisible} onClose={() => setBudgetModalVisible(false)}>
          <Text style={styles.modalTitle}>{editingBudget ? "Edit Budget" : "New Budget"}</Text>
          <TextInput style={styles.input} placeholder="Category Name" value={budgetName} onChangeText={setBudgetName} />
          <TextInput style={styles.input} placeholder="Limit Amount" keyboardType="numeric" value={budgetLimit} onChangeText={setBudgetLimit} />
          <View style={styles.modalActions}>
              {editingBudget && <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteBudget}><Text style={styles.btnTextWhite}>Delete</Text></TouchableOpacity>}
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveBudget}><Text style={styles.btnTextWhite}>Save</Text></TouchableOpacity>
          </View>
      </CustomModal>

    </SafeAreaView>
  );
}

// --- COMPONENTS ---
const CustomModal = ({ visible, onClose, children }: any) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {children}
                <TouchableOpacity style={styles.btnClose} onPress={onClose}><MaterialIcons name="close" size={20} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  iconBtn: { 
      width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, 
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
  },

  mainLayout: { flex: 1, flexDirection: 'row', padding: 24, gap: 24 },
  leftColumn: { flex: 1.8, gap: 24 },
  rightColumn: { flex: 1.2, backgroundColor: Colors.surface, borderRadius: 28, padding: 20, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },

  // BALANCE CARDS
  balanceRow: { flexDirection: 'row', gap: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 28, padding: 20, flex: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  balanceCard: { flex: 1.5 },
  savingsCard: { flex: 1 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  iconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  labelTitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  bigBalance: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'SpaceMono-Regular', letterSpacing: -1 },
  savingsIcon: { position: 'absolute', bottom: 10, right: 10 },
  
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', gap: 6 },
  btnTextWhite: { color: 'white', fontWeight: '600', fontSize: 12 },
  btnTextDark: { color: Colors.textPrimary, fontWeight: '600', fontSize: 12 },

  // BUDGETS
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  addBtnSmall: { width: 24, height: 24, borderRadius: 8, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  
  budgetCard: { 
      backgroundColor: Colors.surface, width: 140, padding: 16, borderRadius: 20, marginRight: 12,
      borderWidth: 1, borderColor: Colors.border
  },
  budgetIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  budgetName: { fontWeight: '600', color: Colors.textPrimary, fontSize: 13 },
  budgetLimit: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  progressBg: { height: 6, backgroundColor: Colors.background, borderRadius: 3, marginTop: 12, width: '100%' },
  progressFill: { height: 6, borderRadius: 3 },

  // TRANSACTIONS
  txList: { flex: 1 },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.background },
  txIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  txDate: { fontSize: 11, color: Colors.textSecondary },
  txAmount: { fontSize: 13, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 20, fontStyle: 'italic', fontSize: 12 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.surface, width: 400, padding: 24, borderRadius: 28, alignItems: 'stretch' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnSave: { flex: 1, backgroundColor: Colors.primary, padding: 14, borderRadius: 14, alignItems: 'center' },
  btnDelete: { flex: 1, backgroundColor: Colors.danger, padding: 14, borderRadius: 14, alignItems: 'center' },
  btnClose: { position: 'absolute', top: 16, right: 16 },
  
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.background, marginRight: 8 },
  chipText: { fontSize: 12, color: Colors.textSecondary }
});