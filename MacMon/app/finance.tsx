import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useFinance, Budget, Transaction } from '@/context/FinanceContext';
import { exportToPDF, exportToExcel } from '@/utils/exportHelper'; 

export default function FinanceScreen() {
  const { 
    balance, savings, transactions, budgets, 
    addTransaction, editTransaction, deleteTransaction, 
    addBudget, editBudget, deleteBudget, moveToSavings,
    resetFinanceData 
  } = useFinance();
  
  // -- STATE MODAL TRANSAKSI --
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 

  // -- STATE MODAL BUDGET --
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

  // --- HANDLER RESET ---
  const handleReset = () => {
    Alert.alert(
      "Reset Data Keuangan ⚠️",
      "Apakah Anda yakin ingin menghapus SEMUA data transaksi, budget, dan tabungan? Tindakan ini tidak bisa dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus Semua", style: 'destructive', onPress: resetFinanceData }
      ]
    );
  };

  // --- HANDLER EXPORT ---
  const handleExport = () => {
    Alert.alert(
      "Export Laporan 📄",
      "Pilih format laporan keuangan Anda:",
      [
        { text: "Batal", style: "cancel" },
        { text: "Export Excel (.xlsx)", onPress: () => exportToExcel(transactions) },
        { text: "Export PDF (Lucu)", onPress: () => exportToPDF(transactions, balance, savings, budgets) }
      ]
    );
  };

  // --- HANDLER TRANSAKSI ---
  const openAddTx = (type: 'income' | 'expense') => {
      setEditingTx(null);
      setTxTitle(''); setTxAmount(''); setTxType(type); setSelectedCategory('');
      setTxModalVisible(true);
  };

  const openEditTx = (tx: Transaction) => {
      setEditingTx(tx);
      setTxTitle(tx.title);
      setTxAmount(tx.amount.toString());
      setTxType(tx.type);
      setSelectedCategory(tx.category || '');
      setTxModalVisible(true);
  };

  const handleSaveTx = () => {
    if (!txTitle || !txAmount) return;
    
    if (editingTx) {
        editTransaction(editingTx.id, txTitle, parseInt(txAmount), txType === 'expense' ? selectedCategory : undefined);
    } else {
        addTransaction(txTitle, parseInt(txAmount), txType, txType === 'expense' ? selectedCategory : undefined);
    }
    setTxModalVisible(false);
  };

  const handleDeleteTx = () => {
      if (editingTx) {
          Alert.alert("Hapus Transaksi", "Yakin hapus transaksi ini?", [
              { text: "Batal" },
              { text: "Hapus", style: 'destructive', onPress: () => { deleteTransaction(editingTx.id); setTxModalVisible(false); } }
          ]);
      }
  };

  // --- HANDLER BUDGET ---
  const openAddBudget = () => {
      setEditingBudget(null); setBudgetName(''); setBudgetLimit(''); setBudgetModalVisible(true);
  };
  const openEditBudget = (budget: Budget) => {
      setEditingBudget(budget); setBudgetName(budget.name); setBudgetLimit(budget.limit.toString()); setBudgetModalVisible(true);
  };
  const handleSaveBudget = () => {
      if (!budgetName || !budgetLimit) return;
      if (editingBudget) {
          editBudget(editingBudget.id, budgetName, parseInt(budgetLimit));
      } else {
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          addBudget(budgetName, parseInt(budgetLimit), randomColor);
      }
      setBudgetModalVisible(false);
  };
  const handleDeleteBudget = () => {
      if (editingBudget) {
          Alert.alert("Hapus Budget", "Kategori ini akan dihapus permanen.", [
              { text: "Batal" }, 
              { text: "Hapus", style: 'destructive', onPress: () => { deleteBudget(editingBudget.id); setBudgetModalVisible(false); } }
          ]);
      }
  };

  const handleMoveToSavings = () => {
      Alert.alert("Tabung Sisa Saldo?", `Pindahkan ${formatRupiah(balance)} ke Simpanan?`, [
          { text: "Batal" }, { text: "Ya, Tabung", onPress: moveToSavings }
      ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Manajemen Keuangan', 
        headerStyle: { backgroundColor: '#34C759' }, 
        headerTintColor: '#fff',
        headerRight: () => (
          <View style={{flexDirection: 'row', gap: 20, marginRight: 10}}>
             <TouchableOpacity onPress={handleReset}>
                <FontAwesome name="trash-o" size={20} color="white" />
             </TouchableOpacity>
             <TouchableOpacity onPress={handleExport}>
                <FontAwesome name="share-square-o" size={20} color="white" />
             </TouchableOpacity>
          </View>
        )
      }} />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER RINGKASAN */}
        <View style={styles.headerContainer}>
            <View style={[styles.card, {backgroundColor: '#34C759', marginBottom: 10}]}>
                <Text style={styles.labelWhite}>Saldo Mingguan Aktif</Text>
                <Text style={styles.balanceBig}>{formatRupiah(balance)}</Text>
                
                <View style={styles.rowBtn}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => openAddTx('income')}>
                        <FontAwesome name="plus" size={12} color="#34C759" />
                        <Text style={[styles.btnTextSmall, {color: '#34C759'}]}>Input Mingguan</Text>
                    </TouchableOpacity>
                    {balance > 0 && (
                        <TouchableOpacity style={[styles.smallBtn, {backgroundColor: 'rgba(255,255,255,0.3)'}]} onPress={handleMoveToSavings}>
                            <FontAwesome name="save" size={12} color="white" />
                            <Text style={styles.btnTextSmall}>Tabung Sisa</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={[styles.card, {backgroundColor: 'white', padding: 15}]}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={styles.iconCircle}><FontAwesome name="bank" size={16} color="#5856D6" /></View>
                    <View style={{marginLeft: 10}}>
                        <Text style={styles.labelGray}>Total Simpanan / Tabungan</Text>
                        <Text style={[styles.balanceSmall, {color: '#5856D6'}]}>{formatRupiah(savings)}</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* BUDGETING SECTION */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budgeting & Anggaran</Text>
            <TouchableOpacity onPress={openAddBudget}><Text style={{color:'#007AFF', fontWeight:'bold'}}>+ Tambah</Text></TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingLeft: 20, marginBottom: 20}}>
            {budgets.map((budget) => {
                const used = getBudgetUsage(budget.name);
                const percent = Math.min((used / budget.limit) * 100, 100);
                return (
                    <TouchableOpacity key={budget.id} style={styles.budgetCard} onPress={() => openEditBudget(budget)}>
                        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 5}}>
                            <Text style={styles.budgetName}>{budget.name}</Text>
                            <Text style={[styles.budgetPercent, percent >= 100 && {color: 'red'}]}>{percent.toFixed(0)}%</Text>
                        </View>
                        <Text style={styles.budgetAmount}>{formatRupiah(used)} / {formatRupiah(budget.limit)}</Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, {width: `${percent}%`, backgroundColor: percent >= 100 ? 'red' : budget.color}]} />
                        </View>
                    </TouchableOpacity>
                );
            })}
            {budgets.length === 0 && <Text style={{color:'#999', fontStyle:'italic', marginLeft: 5}}>Belum ada budget. Klik + Tambah.</Text>}
            <View style={{width: 20}} />
        </ScrollView>

        {/* LIST TRANSAKSI */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
            <TouchableOpacity onPress={() => openAddTx('expense')}><Text style={{color:'#FF3B30', fontWeight:'bold'}}>+ Pengeluaran</Text></TouchableOpacity>
        </View>

        <View style={{paddingHorizontal: 20}}>
            {transactions.map((item) => (
                <TouchableOpacity key={item.id} style={styles.txItem} onPress={() => openEditTx(item)}>
                    <View style={[styles.iconBox, {backgroundColor: item.type === 'income' ? '#E8F5E9' : '#FFEBEE'}]}>
                        <FontAwesome name={item.type === 'income' ? "arrow-up" : "arrow-down"} size={16} color={item.type === 'income' ? "#34C759" : "#FF3B30"} />
                    </View>
                    <View style={{flex: 1, marginLeft: 10}}>
                        <Text style={styles.txTitle}>{item.title}</Text>
                        {item.category && <Text style={styles.txCategory}>{item.category}</Text>}
                        <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString('id-ID')}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                        <Text style={[styles.txAmount, {color: item.type === 'income' ? "#34C759" : "#FF3B30"}]}>
                            {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                        </Text>
                        <FontAwesome name="pencil" size={10} color="#ccc" style={{marginTop: 5}} />
                    </View>
                </TouchableOpacity>
            ))}
            {transactions.length === 0 && <Text style={{textAlign:'center', color:'#999', marginTop: 20}}>Belum ada transaksi</Text>}
        </View>

      </ScrollView>

      {/* --- MODAL TRANSAKSI --- */}
      <Modal visible={txModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editingTx ? "Edit Transaksi" : `Catat ${txType === 'income' ? 'Pemasukan' : 'Pengeluaran'}`}</Text>
                
                <Text style={styles.inputLabel}>Keterangan</Text>
                <TextInput style={styles.input} placeholder="Contoh: Beli Bensin" value={txTitle} onChangeText={setTxTitle} />
                
                <Text style={styles.inputLabel}>Nominal</Text>
                <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={txAmount} onChangeText={setTxAmount} />

                {txType === 'expense' && budgets.length > 0 && (
                    <>
                        <Text style={styles.inputLabel}>Kategori Budget</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                            {budgets.map(b => (
                                <TouchableOpacity 
                                    key={b.id} 
                                    style={[styles.categoryChip, selectedCategory === b.name && {backgroundColor: '#34C759', borderColor: '#34C759'}]}
                                    onPress={() => setSelectedCategory(b.name === selectedCategory ? '' : b.name)}
                                >
                                    <Text style={[styles.categoryText, selectedCategory === b.name && {color: 'white'}]}>{b.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                <View style={styles.modalBtns}>
                    <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#ccc'}]} onPress={() => setTxModalVisible(false)}><Text style={styles.modalBtnText}>Batal</Text></TouchableOpacity>
                    {editingTx && (
                        <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#FF3B30', marginRight: 10}]} onPress={handleDeleteTx}><Text style={styles.modalBtnText}>Hapus</Text></TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#34C759'}]} onPress={handleSaveTx}><Text style={styles.modalBtnText}>Simpan</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* --- MODAL BUDGET --- */}
      <Modal visible={budgetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editingBudget ? "Edit Budget" : "Tambah Budget Baru"}</Text>
                
                <Text style={styles.inputLabel}>Nama Kategori</Text>
                <TextInput style={styles.input} placeholder="Contoh: Makan" value={budgetName} onChangeText={setBudgetName} />
                
                <Text style={styles.inputLabel}>Batas Limit (Rp)</Text>
                <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={budgetLimit} onChangeText={setBudgetLimit} />

                <View style={styles.modalBtns}>
                    <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#ccc'}]} onPress={() => setBudgetModalVisible(false)}><Text style={styles.modalBtnText}>Batal</Text></TouchableOpacity>
                    {editingBudget && (
                        <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#FF3B30', marginRight: 10}]} onPress={handleDeleteBudget}><Text style={styles.modalBtnText}>Hapus</Text></TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#007AFF'}]} onPress={handleSaveBudget}><Text style={styles.modalBtnText}>Simpan</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  headerContainer: { padding: 20 },
  card: { borderRadius: 15, padding: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  labelWhite: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  labelGray: { color: '#888', fontSize: 12 },
  balanceBig: { color: 'white', fontSize: 28, fontWeight: 'bold', marginVertical: 10 },
  balanceSmall: { fontSize: 20, fontWeight: 'bold' },
  rowBtn: { flexDirection: 'row', gap: 10, marginTop: 5 },
  smallBtn: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, alignItems: 'center', gap: 5 },
  btnTextSmall: { fontSize: 10, fontWeight: 'bold', color: 'white' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', justifyContent:'center', alignItems:'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  budgetCard: { backgroundColor: 'white', width: 160, padding: 12, borderRadius: 12, marginRight: 10, elevation: 1 },
  budgetName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  budgetPercent: { fontSize: 12, color: '#666' },
  budgetAmount: { fontSize: 10, color: '#999', marginBottom: 8 },
  progressBarBg: { height: 6, backgroundColor: '#eee', borderRadius: 3, width: '100%' },
  progressBarFill: { height: 6, borderRadius: 3 },
  txItem: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  txCategory: { fontSize: 10, color: '#007AFF', marginTop: 2 },
  txDate: { fontSize: 10, color: '#999' },
  txAmount: { fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  modalBtnText: { color: 'white', fontWeight: 'bold' },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  categoryText: { fontSize: 12, color: '#555' }
});