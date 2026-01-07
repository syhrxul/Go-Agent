import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Palet Warna Minimalis & Stabil
export const Colors = {
  background: '#F2F4F8',     // Abu-abu sangat muda (Background utama)
  surface: '#FFFFFF',        // Putih bersih (Kartu)
  primary: '#6366F1',        // Indigo Soft
  textPrimary: '#1E293B',    // Slate Dark
  textSecondary: '#64748B',  // Slate Light
  success: '#10B981',        // Emerald
  warning: '#F59E0B',        // Amber
  border: '#E2E8F0',         // Border tipis
  danger: '#EF4444',
};

// Mixin Shadow
const softShadow = {
  shadowColor: "#64748B",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 6,
};

export const styles = StyleSheet.create({
  // --- LAYOUT UTAMA ---
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row', // KUNCI: Layout Landscape (Kiri-Kanan)
    padding: 24,
    gap: 24, // Jarak antar kolom
  },
  
  // --- KOLOM KIRI (DASHBOARD) ---
  leftColumn: {
    flex: 2, // Mengambil 2/3 layar
    flexDirection: 'column',
    gap: 20,
  },
  
  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  clockContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    ...softShadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  clockText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },

  // CARD ROW (POMODORO & FINANCE)
  cardRow: {
    flexDirection: 'row',
    gap: 20,
    flex: 1, // Mengisi sisa ruang vertikal
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 28, // Sudut sangat membulat
    padding: 24,
    ...softShadow,
  },

  // STYLE POMODORO
  cardPomodoro: {
    justifyContent: 'space-between',
  },
  pomoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  playButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBig: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 48, // Besar
    textAlign: 'center',
    marginVertical: 10,
    letterSpacing: -2,
  },
  cardLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // STYLE FINANCE
  cardFinance: {
    justifyContent: 'space-between',
  },
  financeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconSquare: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFBEB', // Light yellow
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  financeBody: {
    marginTop: 10,
  },
  labelSmall: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 12,
  },
  expenseLabel: {
    fontSize: 11,
    color: Colors.danger,
  },
  expenseValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },

  // SHORTCUT BAR
  shortcutBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 24,
    justifyContent: 'space-around',
    ...softShadow,
  },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  shortcutIcon: {
    borderRadius: 8,
    padding: 6,
  },
  shortcutLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // --- KOLOM KANAN (SIDEBAR) ---
  rightColumn: {
    flex: 1, // Mengambil 1/3 layar
  },
  sidebarCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 24,
    ...softShadow,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  linkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // TASK ITEM
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkCircleDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  taskTag: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
});