import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView, FlatList, Dimensions, Modal, Switch
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { PieChart, LineChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy'; 
import Animated, { FadeInDown, FadeInUp, Layout, ZoomIn, FadeIn } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import { useFonts, Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDoc, setDoc, getDocs } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyCVArmx877dE2kq7CSjplzOgD1p7IDCQUQ",
  authDomain: "financeapp-14777.firebaseapp.com",
  projectId: "financeapp-14777",
  storageBucket: "financeapp-14777.firebasestorage.app",
  messagingSenderId: "897276604467",
  appId: "1:897276604467:web:4fd7f2843bd1d018b27346"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

const Colors = {
  background: '#0B0F19', surface: '#1A2235', primary: '#00F0FF', success: '#00FF66', 
  warning: '#FFD700', danger: '#FF003C', textMain: '#FFFFFF', textMuted: '#8B949E'
};

const screenWidth = Dimensions.get("window").width;
const formatRp = (number) => 'Rp ' + Math.round(number || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const formatUSD = (number) => '$ ' + (number || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

const getNeonColor = (index) => {
  const neonPalette = [
    '#00F0FF', '#00FF66', '#FF003C', '#FFD700', '#FF00FF', '#00FFFF', '#FFA500', 
    '#BFFF00', '#FF1493', '#7DF9FF', '#8A2BE2', '#39FF14', '#FF4500', '#F0E68C', 
    '#9400D3', '#00FA9A', '#FF69B4', '#1E90FF', '#ADFF2F', '#DDA0DD', '#FFFF00', 
    '#00CED1', '#FF6347', '#DA70D6', '#7CFC00', '#4169E1', '#FF8C00', '#FFB6C1', 
    '#20B2AA', '#F08080', '#9370DB', '#00FF7F', '#87CEFA', '#F4A460', '#BA55D3'  
  ];
  return neonPalette[index % neonPalette.length];
};

const formatMonthYear = (date) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatFileDate = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const KATEGORI_PILIHAN = {
  pemasukan: [{ label: 'Gaji Bulanan', icon: 'cash' }, { label: 'Bonus', icon: 'gift' }, { label: 'Hasil Investasi', icon: 'trending-up' }, { label: 'Freelance', icon: 'laptop' }, { label: 'Pemberian', icon: 'heart' }, { label: 'Lainnya', icon: 'add-circle' }],
  pengeluaran: [{ label: 'Makanan & Minuman', icon: 'fast-food' }, { label: 'Transportasi', icon: 'car' }, { label: 'Tagihan Listrik/Air', icon: 'flash' }, { label: 'Belanja', icon: 'cart' }, { label: 'Hiburan', icon: 'game-controller' }, { label: 'Kesehatan', icon: 'medkit' }, { label: 'Pendidikan', icon: 'book' }, { label: 'Lainnya', icon: 'ellipsis-horizontal' }]
};

const SUMBER_DANA = [
  { label: 'Dompet Tunai', icon: 'wallet' },
  { label: 'Rekening Bank', icon: 'card' },
  { label: 'E-Wallet', icon: 'phone-portrait' },
  { label: 'Crypto Wallet', icon: 'logo-bitcoin' } 
];

const ICON_LIST = [
  'pricetag', 'fast-food', 'car', 'cart', 'medkit', 'game-controller', 'book', 'home', 
  'airplane', 'barbell', 'briefcase', 'cafe', 'camera', 'desktop', 'gift', 'paw', 
  'wine', 'train', 'bus', 'shirt', 'fitness', 'school', 'build', 'color-palette', 
  'headset', 'musical-notes', 'planet', 'restaurant', 'basketball', 'bicycle', 
  'hammer', 'leaf', 'cut', 'bed'
];

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = () => {
    if (!email || !password) return Alert.alert('Error', 'Email dan sandi tidak boleh kosong!');
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => setIsLoading(false))
      .catch((e) => { setIsLoading(false); Alert.alert('Login Gagal', e.message); });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Animated.Text entering={FadeInDown.duration(800)} style={styles.title}>FIN<Text style={{color: Colors.primary}}>-X</Text></Animated.Text>
      <Animated.Text entering={FadeInDown.duration(800).delay(200)} style={styles.subtitle}>Sistem Pelacakan Keuangan</Animated.Text>
      <Animated.View entering={ZoomIn.duration(800).delay(400)} style={styles.card}>
        <TextInput style={styles.input} placeholder="Alamat Email" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <View style={styles.passwordContainer}>
          <TextInput style={styles.passwordInput} placeholder="Sandi" placeholderTextColor={Colors.textMuted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('LupaSandi')} style={styles.forgotPassword}>
          <Text style={styles.linkText}>Lupa Sandi?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.buttonText}>LOGIN</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{marginTop: 20, alignItems: 'center'}}>
          <Text style={styles.linkTextPrimary}>Daftar Akun Baru</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [isLoading, setIsLoading] = useState(false);
  
  const handleRegister = () => {
    if (!email || !password) return Alert.alert('Error', 'Lengkapi semua data!');
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => { setIsLoading(false); Alert.alert('Sukses', 'Registrasi berhasil.'); })
      .catch((e) => { setIsLoading(false); Alert.alert('Gagal', e.message); });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Text style={[styles.title, { marginBottom: 40 }]}>REGISTRASI</Text>
      <Animated.View entering={ZoomIn.duration(500)} style={styles.card}>
        <TextInput style={styles.input} placeholder="Alamat Email Baru" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <View style={styles.passwordContainer}>
          <TextInput style={styles.passwordInput} placeholder="Buat Sandi" placeholderTextColor={Colors.textMuted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.buttonText}>DAFTAR</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 25, alignItems: 'center' }}>
          <Text style={styles.linkText}>Kembali ke Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  
  const handleReset = () => {
    if (!email) return Alert.alert('Error', 'Masukkan email Anda!');
    sendPasswordResetEmail(auth, email)
      .then(() => { Alert.alert('Berhasil', 'Tautan reset sandi dikirim.'); navigation.goBack(); })
      .catch((e) => Alert.alert('Error', e.message));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginBottom: 40 }]}>RESET SANDI</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Email terdaftar" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>KIRIM TAUTAN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 25, alignItems: 'center' }}>
          <Text style={styles.linkText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LockedScreen({ onUnlock }) {
  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
        <Ionicons name="finger-print" size={80} color={Colors.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.title}>SYSTEM LOCKED</Text>
        <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 40 }]}>Sistem dilindungi fitur Biometrik.</Text>
        <TouchableOpacity style={[styles.button, { width: 250 }]} onPress={onUnlock}>
          <Text style={styles.buttonText}>BUKA KUNCI</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function DashboardScreen() {
  const user = auth.currentUser;
  const [allTransactions, setAllTransactions] = useState([]); 
  const [filteredTransactions, setFilteredTransactions] = useState([]); 
  const [summary, setSummary] = useState({ balance: 0, income: 0, expense: 0 }); 
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date());
  const [walletBalances, setWalletBalances] = useState({'Dompet Tunai': 0, 'Rekening Bank': 0, 'E-Wallet': 0, 'Crypto Wallet': 0});
  
  const [budgetLimit, setBudgetLimit] = useState(0); 
  const [budgetBulananLimit, setBudgetBulananLimit] = useState(0); 
  const [currentMonthExpense, setCurrentMonthExpense] = useState(0);
  const [currentYearExpense, setCurrentYearExpense] = useState(0);
  
  const [envelopes, setEnvelopes] = useState([]);
  const [envSpent, setEnvSpent] = useState({});
  const [customCategories, setCustomCategories] = useState([]); 
  const [showAllZBB, setShowAllZBB] = useState(false); 
  
  const [usdRate, setUsdRate] = useState(15500); 
  
  const [momDetails, setMomDetails] = useState({ incPerc: '0', incIsUp: true, expPerc: '0', expIsUp: true });
  
  const [goals, setGoals] = useState([]);
  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundSource, setFundSource] = useState('Rekening Bank');
  const [selectedTx, setSelectedTx] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [showAllTxModal, setShowAllTxModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!user?.uid) return;
    
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr')
      .then(res => res.json())
      .then(apiData => { 
         if (apiData?.tether?.idr) setUsdRate(apiData.tether.idr); 
      }).catch(e => {}); 

    const checkRecurring = async () => {
      try {
        const qRec = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('isRecurring', '==', true));
        const snap = await getDocs(qRec);
        const now = new Date();
        snap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (data.nextRecurringDate && data.nextRecurringDate.toDate() <= now) {
            const nextDate = new Date(data.nextRecurringDate.toDate());
            await addDoc(collection(db, 'transactions'), {
              ...data, 
              date: nextDate, 
              nextRecurringDate: new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate())
            });
            await updateDoc(docSnap.ref, { isRecurring: false, nextRecurringDate: null });
          }
        });
      } catch (e) {}
    };
    checkRecurring(); 
    
    const loadCache = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(`@dashboard_cache_${user.uid}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const restoredTx = parsed.transactions.map(t => ({...t, dateObj: new Date(t.dateObj)}));
          setAllTransactions(restoredTx); 
          setGoals(parsed.goals || []); 
          if(parsed.budgetLimit !== undefined) setBudgetLimit(parsed.budgetLimit); 
          if(parsed.budgetBulananLimit !== undefined) setBudgetBulananLimit(parsed.budgetBulananLimit); 
          setEnvelopes(parsed.envelopes || []); 
          if(parsed.usdRate) setUsdRate(parsed.usdRate); 
          setLoading(false); 
        }
      } catch (e) {}
    };
    loadCache(); 

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', user.uid), (docSnap) => {
       if (docSnap.exists()) {
          const data = docSnap.data();
          if(data.budgetLimit !== undefined) setBudgetLimit(data.budgetLimit);
          if(data.budgetBulananLimit !== undefined) setBudgetBulananLimit(data.budgetBulananLimit);
          if(data.envelopes) setEnvelopes(data.envelopes);
          if(data.customCategories) setCustomCategories(data.customCategories); 
       }
    });

    const unsubscribeTx = onSnapshot(query(collection(db, 'transactions'), where('userId', '==', user.uid)), (snapshot) => {
      let tempTransactions = []; 
      snapshot.forEach((doc) => { 
        const data = doc.data(); 
        if (data) tempTransactions.push({ id: doc.id, dateObj: data.date ? data.date.toDate() : new Date(), ...data }); 
      });
      tempTransactions.sort((a, b) => b.dateObj - a.dateObj); 
      setAllTransactions(tempTransactions); 
      setLoading(false);
    }, () => { setLoading(false); });

    const unsubscribeGoals = onSnapshot(query(collection(db, 'goals'), where('userId', '==', user.uid)), (snapshot) => {
      let tempGoals = []; 
      snapshot.forEach(doc => tempGoals.push({ id: doc.id, ...doc.data() })); 
      setGoals(tempGoals);
    });

    return () => { unsubscribeTx(); unsubscribeGoals(); unsubscribeSettings(); };
  }, [user]);

  useEffect(() => {
    let monthlyInc = 0; let monthlyExp = 0; let monthlyBudgetExp = 0; let yearlyExp = 0;
    let prevMonthExp = 0; let prevMonthInc = 0;
    let wBalances = {'Dompet Tunai': 0, 'Rekening Bank': 0, 'E-Wallet': 0, 'Crypto Wallet': 0}; 
    let fTx = []; let eSpent = {}; 
    
    const fMonth = filterDate.getMonth(); const fYear = filterDate.getFullYear(); 
    const pMonth = fMonth === 0 ? 11 : fMonth - 1; const pYear = fMonth === 0 ? fYear - 1 : fYear;

    allTransactions.forEach(t => {
      if (t.type === 'pemasukan') { 
        if(wBalances[t.wallet] !== undefined) wBalances[t.wallet] += t.amount; 
      } else if (t.type === 'pengeluaran') { 
        if(wBalances[t.wallet] !== undefined) wBalances[t.wallet] -= t.amount; 
      } else if (t.type === 'transfer') { 
        if(wBalances[t.fromWallet] !== undefined) wBalances[t.fromWallet] -= t.amount; 
        
        let receivedAmt = t.amount;
        if (t.fromWallet !== t.toWallet && (t.fromWallet === 'Crypto Wallet' || t.toWallet === 'Crypto Wallet')) {
            receivedAmt = t.convertedAmount !== undefined ? t.convertedAmount : t.amount;
        } else {
            receivedAmt = t.baseAmount !== undefined ? t.baseAmount : t.amount;
        }
        if(wBalances[t.toWallet] !== undefined) wBalances[t.toWallet] += receivedAmt; 
      }
      
      const amtIDR = (t.type === 'transfer' ? t.fromWallet === 'Crypto Wallet' : t.wallet === 'Crypto Wallet') ? (t.amount * usdRate) : t.amount;
      
      if (t.type === 'pengeluaran' && t.category !== 'Alokasi Tabungan' && t.dateObj.getFullYear() === fYear) {
         yearlyExp += amtIDR;
      }

      if (t.type === 'pengeluaran' && t.dateObj.getMonth() === fMonth && t.dateObj.getFullYear() === fYear) { 
        if(t.category !== 'Alokasi Tabungan') { 
          monthlyBudgetExp += amtIDR; 
          eSpent[t.category] = (eSpent[t.category] || 0) + amtIDR; 
        } 
      }
      
      if (t.dateObj.getMonth() === fMonth && t.dateObj.getFullYear() === fYear) { 
        fTx.push(t); 
        if (t.type === 'pemasukan') monthlyInc += amtIDR; 
        if (t.type === 'pengeluaran') monthlyExp += amtIDR; 
      }
      
      if (t.dateObj.getMonth() === pMonth && t.dateObj.getFullYear() === pYear) { 
        if (t.type === 'pengeluaran' && t.category !== 'Alokasi Tabungan') prevMonthExp += amtIDR; 
        if (t.type === 'pemasukan') prevMonthInc += amtIDR;
      }
    });

    const globalBalance = wBalances['Dompet Tunai'] + wBalances['Rekening Bank'] + wBalances['E-Wallet'] + (wBalances['Crypto Wallet'] * usdRate);
    
    const incDiff = monthlyInc - prevMonthInc;
    const incPerc = prevMonthInc > 0 ? (Math.abs(incDiff) / prevMonthInc * 100).toFixed(0) : (monthlyInc > 0 ? '100' : '0');
    
    const expDiff = monthlyExp - prevMonthExp;
    const expPerc = prevMonthExp > 0 ? (Math.abs(expDiff) / prevMonthExp * 100).toFixed(0) : (monthlyExp > 0 ? '100' : '0');

    setMomDetails({ incPerc, incIsUp: incDiff >= 0, expPerc, expIsUp: expDiff >= 0 });
    setSummary({ balance: globalBalance, income: monthlyInc, expense: monthlyExp }); 
    setWalletBalances(wBalances); 
    setCurrentMonthExpense(monthlyBudgetExp); 
    setCurrentYearExpense(yearlyExp);
    setEnvSpent(eSpent); 
    setFilteredTransactions(fTx);
    
    AsyncStorage.setItem(`@dashboard_cache_${user?.uid}`, JSON.stringify({ transactions: allTransactions, goals: goals, budgetLimit: budgetLimit, budgetBulananLimit: budgetBulananLimit, envelopes: envelopes, usdRate: usdRate }));
  }, [allTransactions, filterDate, goals, usdRate]);

  const getCategoryIcon = (catName) => {
    const defaultCat = KATEGORI_PILIHAN.pengeluaran.find(c => c.label === catName);
    if (defaultCat) return defaultCat.icon;
    const customCat = customCategories.find(c => c.label === catName);
    if (customCat) return customCat.icon;
    return 'mail'; 
  };

  const changeMonth = (offset) => { 
    const newDate = new Date(filterDate); 
    newDate.setMonth(newDate.getMonth() + offset); 
    setFilterDate(newDate); 
    setCurrentPage(1); 
  };
  
  const handleSaveGoal = async () => { 
    if (!newGoalName || !newGoalTarget) return Alert.alert('Error', 'Lengkapi data target tabungan.'); 
    try { 
      await addDoc(collection(db, 'goals'), { userId: user.uid, name: newGoalName, target: parseFloat(newGoalTarget), saved: 0, color: getNeonColor(goals.length) }); 
      setNewGoalName(''); setNewGoalTarget(''); setShowGoalModal(false); 
    } catch (e) { Alert.alert('Error', e.message); } 
  };
  
  const handleAddFund = async () => { 
    if (!fundAmount) return Alert.alert('Error', 'Nominal kosong.'); 
    const fund = parseFloat(fundAmount); 
    if (fund > walletBalances[fundSource]) { 
      return Alert.alert('Saldo Tidak Cukup', `Saldo di ${fundSource} Anda saat ini hanya ${formatRp(walletBalances[fundSource])}. Silakan isi nominal yang lebih kecil atau tambah saldo dompet Anda terlebih dahulu.`); 
    } 
    try { 
      await updateDoc(doc(db, 'goals', selectedGoal.id), { saved: selectedGoal.saved + fund }); 
      // V 1.5.0: Logika Virtual (Tidak menambah data transaksi keluar)
      setFundAmount(''); setShowFundModal(false); Alert.alert('Sukses', 'Dana berhasil dialokasikan secara virtual!'); 
    } catch (e) { Alert.alert('Error', e.message); } 
  };
  
  const handleDeleteGoal = (goal) => { 
    Alert.alert( "Hapus Target Tabungan", `Yakin ingin menghapus target "${goal.name}"?`, [ { text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: async () => { try { await deleteDoc(doc(db, "goals", goal.id)); } catch (error) { Alert.alert("Error", error.message); } } } ] ); 
  };
  
  const handleOpenEdit = (item) => { 
    setSelectedTx(item); setEditAmount(item.amount.toString()); setEditDesc(item.description || ''); setShowEditModal(true); 
  };
  
  const handleSaveEdit = async () => { 
    if (!editAmount) return Alert.alert("Error", "Nominal tidak boleh kosong"); 
    if (!selectedTx?.id) return; 
    try { 
      await updateDoc(doc(db, "transactions", selectedTx.id), { amount: parseFloat(editAmount), description: editDesc }); 
      setShowEditModal(false); 
    } catch (e) { Alert.alert("Error", e.message); } 
  };

  const renderRightActions = (item) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, paddingLeft: 10 }}>
      <TouchableOpacity style={{ backgroundColor: 'rgba(0, 240, 255, 0.2)', width: 50, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 10 }} onPress={() => handleOpenEdit(item)}>
        <Ionicons name="pencil" size={20} color={Colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={{ backgroundColor: 'rgba(255, 0, 60, 0.2)', width: 50, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }} onPress={() => { Alert.alert("Hapus Data", "Yakin menghapus transaksi ini?", [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: async () => { try { await deleteDoc(doc(db, "transactions", item.id)); } catch (e) { Alert.alert("Error", e.message); } } }]); }}>
        <Ionicons name="trash" size={20} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );

  const renderTransactionItem = ({ item, index }) => {
    if (!item) return null;
    const isIncome = item.type === 'pemasukan'; 
    const isTransfer = item.type === 'transfer';
    const iconName = isTransfer ? 'swap-horizontal' : (isIncome ? 'arrow-down' : 'arrow-up');
    const iconColor = isTransfer ? Colors.warning : (isIncome ? Colors.success : Colors.danger);
    const bgOpacity = isTransfer ? 'rgba(255, 215, 0, 0.1)' : (isIncome ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 0, 60, 0.1)');
    const amountPrefix = isTransfer ? '' : (isIncome ? '+' : '-');
    const displayCategory = isTransfer ? 'Transfer Saldo' : (item.category || 'Tanpa Kategori');
    const displayDesc = isTransfer ? `${item.fromWallet} ➝ ${item.toWallet}` : `${item.dateObj ? item.dateObj.toLocaleDateString('id-ID') : ''} • ${item.wallet || 'Dompet Tunai'}`;
    
    const isCrypto = item.type === 'transfer' ? item.fromWallet === 'Crypto Wallet' : item.wallet === 'Crypto Wallet';
    
    let amountText = isCrypto ? formatUSD(item.amount) : formatRp(item.amount);
    if (item.type === 'transfer') {
        let receivedAmt = item.amount;
        if (item.fromWallet !== item.toWallet && (item.fromWallet === 'Crypto Wallet' || item.toWallet === 'Crypto Wallet')) {
            receivedAmt = item.convertedAmount !== undefined ? item.convertedAmount : (item.baseAmount || item.amount);
        } else {
            receivedAmt = item.baseAmount !== undefined ? item.baseAmount : item.amount;
        }

        if (receivedAmt !== undefined && receivedAmt !== item.amount) {
             const isToCrypto = item.toWallet === 'Crypto Wallet';
             amountText += ` ➝ ${isToCrypto ? formatUSD(receivedAmt) : formatRp(receivedAmt)}`;
        }
    }

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
        <Animated.View entering={FadeInDown.delay(index * 50).springify()} layout={Layout.springify()} style={styles.transactionItem}>
          <View style={[styles.transactionIcon, { backgroundColor: bgOpacity }]}>
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.transactionInfo}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.transactionCategory}>{displayCategory}</Text>
              {item.isRecurring && <Ionicons name="sync" size={12} color={Colors.primary} style={{marginLeft: 5}} />}
            </View>
            <Text style={styles.transactionDesc} numberOfLines={1}>{displayDesc}</Text>
          </View>
          <View style={styles.transactionAmountContainer}>
            <Text style={[styles.transactionAmount, { color: iconColor, fontSize: amountText.includes('➝') ? 11 : 14 }]}>{amountPrefix}{amountText}</Text>
          </View>
        </Animated.View>
      </Swipeable>
    );
  };

  let budgetGlobalPercentage = 0; let budgetGlobalColor = Colors.success; 
  if (budgetLimit > 0) { 
    budgetGlobalPercentage = (currentYearExpense / budgetLimit) * 100; 
    if (budgetGlobalPercentage > 100) budgetGlobalPercentage = 100; 
    if (budgetGlobalPercentage >= 80 && budgetGlobalPercentage < 100) budgetGlobalColor = Colors.warning; 
    else if (budgetGlobalPercentage >= 100) budgetGlobalColor = Colors.danger; 
  }

  let budgetBulananPercentage = 0; let budgetBulananColor = Colors.success; 
  if (budgetBulananLimit > 0) { 
    budgetBulananPercentage = (currentMonthExpense / budgetBulananLimit) * 100; 
    if (budgetBulananPercentage > 100) budgetBulananPercentage = 100; 
    if (budgetBulananPercentage >= 80 && budgetBulananPercentage < 100) budgetBulananColor = Colors.warning; 
    else if (budgetBulananPercentage >= 100) budgetBulananColor = Colors.danger; 
  }

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const currentPaginatedData = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const MAX_VISIBLE_PAGES = 7;
  const currentBlock = Math.ceil(currentPage / MAX_VISIBLE_PAGES);
  const startPage = (currentBlock - 1) * MAX_VISIBLE_PAGES + 1;
  const endPage = Math.min(startPage + MAX_VISIBLE_PAGES - 1, totalPages);
  
  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
  }

  return (
    <View style={styles.containerScreen}>
      <View style={styles.headerDashboard}>
        <View>
          <Text style={styles.headerTitle}>FIN-X DASBOR</Text>
          <Text style={styles.headerSubtitle}>Ringkasan keuangan Anda</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
          <Animated.View entering={ZoomIn} style={[styles.balanceCard, { minHeight: 120 }]}>
            <Text style={styles.balanceLabel}>SALDO TOTAL HARI INI</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.balanceAmount}>{formatRp(summary.balance)}</Text>
          </Animated.View>
          
          <View style={styles.walletGrid}>
            {SUMBER_DANA.map((w, i) => ( 
              <Animated.View key={i} entering={FadeInUp.delay(100 + (i*50))} style={[styles.walletMiniCard, { minHeight: 110 }]}>
                <Ionicons name={w.icon} size={24} color={Colors.primary} style={{marginBottom: 8}}/>
                <Text style={styles.walletMiniTitle}>{w.label.toUpperCase()}</Text>
                <Text adjustsFontSizeToFit numberOfLines={1} style={styles.walletMiniAmount}> 
                  {w.label === 'Crypto Wallet' ? formatUSD(walletBalances[w.label]) : formatRp(walletBalances[w.label])} 
                </Text>
                {w.label === 'Crypto Wallet' && ( 
                  <Animated.Text entering={FadeIn} style={{fontSize: 8, color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', marginTop: 3}}> 
                    ● Live Rate
                  </Animated.Text> 
                )}
              </Animated.View> 
            ))}
          </View>
          
          {budgetLimit > 0 && ( 
             <Animated.View entering={FadeInUp.delay(200)} style={styles.newBudgetCard}>
               <Text style={styles.newBudgetTitle}>BUDGET GLOBAL KESELURUHAN</Text>
               <View style={styles.newBudgetHeader}>
                 <View>
                    <Text style={styles.newBudgetSubText}>Total Budget</Text>
                    <Text style={styles.newBudgetValue}>{formatRp(budgetLimit)}</Text>
                 </View>
                 <Text style={[styles.newBudgetPerc, {color: budgetGlobalColor}]}>{budgetGlobalPercentage.toFixed(0)}%</Text>
               </View>
               
               <View style={styles.budgetTrackBg}>
                 <View style={[styles.budgetTrackFill, { width: `${budgetGlobalPercentage}%`, backgroundColor: budgetGlobalColor }]} />
               </View>
               
               <View style={styles.newBudgetFooter}>
                 <View style={{flex: 1}}>
                    <Text style={styles.newBudgetSubText}>Terpakai</Text>
                    <Text style={[styles.newBudgetValue, {fontSize: 12}]}>{formatRp(currentYearExpense)}</Text>
                 </View>
                 <View style={styles.verticalDivider} />
                 <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <Text style={styles.newBudgetSubText}>Sisa</Text>
                    {(() => {
                       const sisa = budgetLimit - currentYearExpense;
                       const isMinus = sisa < 0;
                       return (
                          <Text style={[styles.newBudgetValue, {fontSize: 12, color: isMinus ? Colors.danger : Colors.success}]}>
                             {isMinus ? `-Rp ${formatRp(Math.abs(sisa)).replace('Rp ', '')}` : formatRp(sisa)}
                          </Text>
                       )
                    })()}
                 </View>
               </View>
             </Animated.View> 
          )}

          {budgetBulananLimit > 0 && ( 
             <Animated.View entering={FadeInUp.delay(250)} style={styles.newBudgetCard}>
               <Text style={styles.newBudgetTitle}>BUDGET BULAN INI</Text>
               <View style={styles.newBudgetHeader}>
                 <View>
                    <Text style={styles.newBudgetSubText}>Budget Bulan Ini</Text>
                    <Text style={styles.newBudgetValue}>{formatRp(budgetBulananLimit)}</Text>
                 </View>
                 <Text style={[styles.newBudgetPerc, {color: budgetBulananColor}]}>{budgetBulananPercentage.toFixed(0)}%</Text>
               </View>
               
               <View style={styles.budgetTrackBg}>
                 <View style={[styles.budgetTrackFill, { width: `${budgetBulananPercentage}%`, backgroundColor: budgetBulananColor }]} />
               </View>
               
               <View style={styles.newBudgetFooter}>
                 <View style={{flex: 1}}>
                    <Text style={styles.newBudgetSubText}>Terpakai</Text>
                    <Text style={[styles.newBudgetValue, {fontSize: 12}]}>{formatRp(currentMonthExpense)}</Text>
                 </View>
                 <View style={styles.verticalDivider} />
                 <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <Text style={styles.newBudgetSubText}>Sisa</Text>
                    {(() => {
                       const sisa = budgetBulananLimit - currentMonthExpense;
                       const isMinus = sisa < 0;
                       return (
                          <Text style={[styles.newBudgetValue, {fontSize: 12, color: isMinus ? Colors.danger : Colors.success}]}>
                             {isMinus ? `-Rp ${formatRp(Math.abs(sisa)).replace('Rp ', '')}` : formatRp(sisa)}
                          </Text>
                       )
                    })()}
                 </View>
               </View>
             </Animated.View> 
          )}
          
          {envelopes.length > 0 && (
            <View style={{marginBottom: 10, marginTop: 10}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                 <Text style={styles.historyTitle}>SISTEM AMPLOP ZBB</Text>
                 {envelopes.length > 3 && (
                   <TouchableOpacity onPress={() => setShowAllZBB(!showAllZBB)}>
                      <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>
                         {showAllZBB ? 'Tutup <' : 'Lihat Semua >'}
                      </Text>
                   </TouchableOpacity>
                 )}
              </View>

              {envelopes.slice(0, showAllZBB ? envelopes.length : 3).map((env, i) => { 
                const spent = envSpent[env.name] || 0; 
                let p = (spent / env.limit) * 100; 
                if(p > 100) p = 100; 
                
                let cColor = Colors.success; 
                if(p >= 100) cColor = Colors.danger;
                else if(p >= 80) cColor = Colors.warning;
                
                return ( 
                  <Animated.View key={i} entering={FadeInUp.delay(300 + i*50)} style={[styles.card, {padding: 15, marginBottom: 12, borderColor: cColor, flexDirection: 'row', alignItems: 'center'}]}>
                    <View style={{width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(0, 240, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15}}>
                       <Ionicons name={getCategoryIcon(env.name)} size={24} color={Colors.primary} />
                    </View>
                    <View style={{flex: 1}}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6}}>
                        <Text style={{fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 12}}>{env.name.toUpperCase()}</Text>
                        <Text style={{fontFamily: 'Orbitron_700Bold', color: cColor, fontSize: 12}}>{p.toFixed(0)}%</Text>
                      </View>
                      <View style={[styles.budgetTrackBg, {height: 6}]}>
                        <View style={[styles.budgetTrackFill, { width: `${p}%`, backgroundColor: cColor }]} />
                      </View>
                      <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginTop: 6}}> 
                        Terpakai {formatRp(spent)} / {formatRp(env.limit)} 
                      </Text>
                    </View>
                  </Animated.View> 
                ); 
              })}
            </View>
          )}

          <View style={{marginBottom: 20}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
               <Text style={styles.historyTitle}>TARGET TABUNGAN SAYA</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingBottom: 5, paddingRight: 15}}>
              {goals.map((goal, idx) => { 
                let p = (goal.saved / goal.target) * 100; 
                if(p > 100) p = 100; 
                return ( 
                  <TouchableOpacity key={idx} activeOpacity={0.8} onPress={() => {setSelectedGoal(goal); setShowFundModal(true);}} onLongPress={() => handleDeleteGoal(goal)} style={[styles.card, styles.newGoalCard]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                       <View style={{width: 35, height: 35, borderRadius: 10, backgroundColor: 'rgba(0, 240, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                          <Ionicons name="flag" size={18} color={Colors.primary} />
                       </View>
                       <View>
                          <Text style={styles.goalTitle}>{goal.name}</Text>
                          <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: Colors.textMain}}>{formatRp(goal.target)}</Text>
                       </View>
                    </View>
                    <View style={[styles.budgetTrackBg, {height: 6, marginBottom: 8}]}>
                      <View style={[styles.budgetTrackFill, { width: `${p}%`, backgroundColor: goal.color }]} />
                    </View>
                    <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular'}}>
                      {p.toFixed(0)}% • Rp {formatRp(goal.saved)} / Rp {formatRp(goal.target)}
                    </Text>
                  </TouchableOpacity> 
                ) 
              })}
              <TouchableOpacity style={styles.newAddGoalCard} onPress={() => setShowGoalModal(true)}>
                <Ionicons name="add" size={32} color={Colors.primary} />
                <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 12, marginTop: 5}}>Buat Target</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          <View style={styles.historyContainer}>
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthArrowBtn}>
                <Ionicons name="chevron-back" color={Colors.primary} size={20}/>
              </TouchableOpacity>
              <Text style={styles.monthSelectorText}>{formatMonthYear(filterDate)}</Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrowBtn}>
                <Ionicons name="chevron-forward" color={Colors.primary} size={20}/>
              </TouchableOpacity>
            </View>
            
            <Animated.View entering={FadeInDown} style={styles.newSummaryCard}>
               <Text style={[styles.historyTitle, {marginBottom: 15}]}>RINGKASAN BULAN INI</Text>
               
               <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                     <View style={{width: 35, height: 35, borderRadius: 10, backgroundColor: 'rgba(0, 255, 102, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                        <Ionicons name="arrow-down" size={20} color={Colors.success} />
                     </View>
                     <View>
                        <Text style={styles.newBudgetSubText}>Pemasukan</Text>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: Colors.textMain}}>{formatRp(summary.income)}</Text>
                     </View>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 15}}>
                     <View style={{width: 35, height: 35, borderRadius: 10, backgroundColor: 'rgba(255, 0, 60, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                        <Ionicons name="arrow-up" size={20} color={Colors.danger} />
                     </View>
                     <View>
                        <Text style={styles.newBudgetSubText}>Pengeluaran</Text>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: Colors.textMain}}>{formatRp(summary.expense)}</Text>
                     </View>
                  </View>
               </View>

               <View style={styles.dashedDivider} />

               <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <View style={{flex: 1.5}}>
                     <Text style={[styles.newBudgetSubText, {marginBottom: 8}]}>Perbandingan bulan lalu</Text>
                     <View style={{flexDirection: 'row'}}>
                        <View style={{marginRight: 15}}>
                           <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMain, marginBottom: 3}}>Pemasukan</Text>
                           <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Ionicons name={momDetails.incIsUp ? "caret-up" : "caret-down"} size={12} color={momDetails.incIsUp ? Colors.success : Colors.danger} style={{marginRight: 4}}/>
                              <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 12, color: Colors.textMain}}>{momDetails.incPerc}%</Text>
                           </View>
                        </View>
                        <View>
                           <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMain, marginBottom: 3}}>Pengeluaran</Text>
                           <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Ionicons name={momDetails.expIsUp ? "caret-up" : "caret-down"} size={12} color={momDetails.expIsUp ? Colors.danger : Colors.success} style={{marginRight: 4}}/>
                              <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 12, color: Colors.textMain}}>{momDetails.expPerc}%</Text>
                           </View>
                        </View>
                     </View>
                  </View>
                  <View style={[styles.verticalDivider, {height: 40}]} />
                  <View style={{flex: 1, alignItems: 'flex-end', paddingLeft: 10}}>
                     <Text style={[styles.newBudgetSubText, {marginBottom: 5}]}>Saldo Bersih</Text>
                     <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: summary.income - summary.expense >= 0 ? Colors.success : Colors.danger}}>
                        {formatRp(summary.income - summary.expense)}
                     </Text>
                  </View>
               </View>
            </Animated.View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
              <Text style={styles.historyTitle}>RIWAYAT TRANSAKSI TERBARU</Text>
              <TouchableOpacity onPress={() => setShowAllTxModal(true)}>
                 <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular'}}>Lihat Semua ></Text>
              </TouchableOpacity>
            </View>
            
            {filteredTransactions.length === 0 ? (
              <Text style={styles.emptyText}>Tidak ada aktivitas di bulan ini.</Text>
            ) : ( 
              <>
                <FlatList scrollEnabled={false} data={currentPaginatedData} keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()} renderItem={renderTransactionItem} /> 
                {totalPages > 1 && (
                  <View style={styles.paginationContainer}>
                    {currentBlock > 1 && (
                      <TouchableOpacity style={styles.pageBox} onPress={() => setCurrentPage(startPage - 1)}>
                        <Ionicons name="ellipsis-horizontal" size={14} color={Colors.textMuted} />
                      </TouchableOpacity>
                    )}
                    {visiblePages.map(page => (
                       <TouchableOpacity key={page} style={[styles.pageBox, currentPage === page && styles.pageBoxActive]} onPress={() => setCurrentPage(page)}>
                          <Text style={[styles.pageText, currentPage === page && styles.pageTextActive]}>{page}</Text>
                       </TouchableOpacity>
                    ))}
                    {endPage < totalPages && (
                      <TouchableOpacity style={styles.pageBox} onPress={() => setCurrentPage(endPage + 1)}>
                        <Ionicons name="ellipsis-horizontal" size={14} color={Colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {}
      <Modal visible={showAllTxModal} animationType="slide" transparent={false}>
         <View style={[styles.containerScreen, {paddingTop: 40}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
               <Text style={styles.headerTitle}>SEMUA TRANSAKSI</Text>
               <TouchableOpacity onPress={() => setShowAllTxModal(false)} style={{padding: 5, backgroundColor: 'rgba(255, 0, 60, 0.1)', borderRadius: 8}}>
                  <Ionicons name="close" size={24} color={Colors.danger}/>
               </TouchableOpacity>
            </View>
            <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', marginBottom: 20, fontSize: 12}}>Periode: {formatMonthYear(filterDate)}</Text>
            
            <FlatList 
               data={filteredTransactions} 
               keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()} 
               renderItem={renderTransactionItem}
               showsVerticalScrollIndicator={false}
               contentContainerStyle={{paddingBottom: 40}}
            />
         </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }} keyboardShouldPersistTaps="handled">
              
              <Text style={[styles.modalTitle, {marginBottom: 5}]}>EDIT TRANSAKSI</Text>
              <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular', marginBottom: 20}}>Ubah informasi transaksi sesuai kebutuhan</Text>

              <Text style={styles.inputLabel}>KATEGORI TRANSAKSI</Text>
              <View style={[styles.inputWithIconWrapper, {backgroundColor: 'rgba(0,0,0,0.2)'}]}>
                 <Ionicons name="pricetag-outline" size={18} color={Colors.textMuted} style={{marginRight: 10}} />
                 <Text style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12}}>{selectedTx?.category || selectedTx?.type}</Text>
                 <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
              </View>
              <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginTop: -10, marginBottom: 15, marginLeft: 5}}>Kategori transaksi</Text>

              <Text style={styles.inputLabel}>NOMINAL TRANSAKSI</Text>
              <View style={styles.inputWithIconWrapper}>
                 <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', marginRight: 10, fontSize: 14}}>Rp</Text>
                 <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 14}} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={editAmount} onChangeText={(val) => setEditAmount(val.replace(/[^0-9.]/g, ''))} />
                 {editAmount.length > 0 && (
                    <TouchableOpacity onPress={() => setEditAmount('')} style={{padding: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10}}>
                       <Ionicons name="close" size={12} color={Colors.textMain} />
                    </TouchableOpacity>
                 )}
              </View>
              <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginTop: -10, marginBottom: 15, marginLeft: 5}}>Masukkan nominal transaksi</Text>

              <Text style={styles.inputLabel}>DESKRIPSI</Text>
              <View style={[styles.inputWithIconWrapper, {height: 80, alignItems: 'flex-start', paddingVertical: 12}]}>
                 <Ionicons name="document-text-outline" size={18} color={Colors.primary} style={{marginRight: 10}} />
                 <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12, textAlignVertical: 'top'}} placeholder="Tulis deskripsi transaksi (opsional)" placeholderTextColor={Colors.textMuted} multiline maxLength={200} value={editDesc} onChangeText={setEditDesc} />
              </View>
              <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginTop: -10, marginBottom: 20, textAlign: 'right'}}>{editDesc.length}/200</Text>

              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginRight: 5, backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.textMuted}]} onPress={() => setShowEditModal(false)}>
                   <Text style={[styles.buttonText, {color: Colors.textMuted, fontSize: 12}]}>BATAL</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginLeft: 5}]} onPress={handleSaveEdit}>
                   <Text style={[styles.buttonText, {fontSize: 12}]}>SIMPAN PERUBAHAN</Text>
                 </TouchableOpacity>
              </View>
              
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showGoalModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }} keyboardShouldPersistTaps="handled">
              
              <Text style={[styles.modalTitle, {marginBottom: 5}]}>TARGET TABUNGAN BARU</Text>
              <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular', marginBottom: 20}}>Buat target baru untuk tujuan keuanganmu</Text>

              <Text style={styles.inputLabel}>NAMA TARGET</Text>
              <View style={styles.inputWithIconWrapper}>
                 <Ionicons name="flag-outline" size={18} color={Colors.primary} style={{marginRight: 10}} />
                 <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12}} placeholder="Misal: Beli Motor" placeholderTextColor={Colors.textMuted} maxLength={40} value={newGoalName} onChangeText={setNewGoalName} />
                 <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular'}}>{newGoalName.length}/40</Text>
              </View>
              <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginTop: -10, marginBottom: 15, marginLeft: 5}}>Masukkan nama tujuan tabunganmu</Text>

              <Text style={styles.inputLabel}>TARGET NOMINAL</Text>
              <View style={styles.inputWithIconWrapper}>
                 <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', marginRight: 10, fontSize: 14}}>Rp</Text>
                 <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 14}} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={newGoalTarget} onChangeText={(val) => setNewGoalTarget(val.replace(/[^0-9.]/g, ''))} />
              </View>
              <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginTop: -10, marginBottom: 15, marginLeft: 5}}>Masukkan jumlah target yang ingin dicapai</Text>

              <Text style={styles.inputLabel}>PRESET CEPAT (OPSIONAL)</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20}}>
                 {['1 Juta', '5 Juta', '10 Juta', '20 Juta'].map((preset, i) => {
                    const val = preset.replace(' Juta', '000000');
                    return (
                       <TouchableOpacity key={i} style={{paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#2A344A', marginRight: 10, marginBottom: 10}} onPress={() => setNewGoalTarget(val)}>
                          <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>{preset}</Text>
                       </TouchableOpacity>
                    )
                 })}
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginRight: 5, backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.textMuted}]} onPress={() => setShowGoalModal(false)}>
                   <Text style={[styles.buttonText, {color: Colors.textMuted, fontSize: 12}]}>BATAL</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginLeft: 5}]} onPress={handleSaveGoal}>
                   <Text style={[styles.buttonText, {fontSize: 12}]}>BUAT TARGET</Text>
                 </TouchableOpacity>
              </View>
              
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showFundModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }} keyboardShouldPersistTaps="handled">
              
              <Text style={[styles.modalTitle, {marginBottom: 20}]}>ALOKASI DANA TABUNGAN</Text>
              
              <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 240, 255, 0.05)', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#2A344A', marginBottom: 20}}>
                 <Ionicons name="pie-chart-outline" size={24} color={Colors.primary} style={{marginRight: 15}} />
                 <View>
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 12}}>Target: {selectedGoal?.name}</Text>
                    <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 9, marginTop: 4}}>Dana akan dialokasikan ke target ini</Text>
                 </View>
              </View>
              
              <Text style={styles.inputLabel}>SUMBER DANA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 2}}>
                 {SUMBER_DANA.map((w,i)=>(
                   <TouchableOpacity key={i} style={[styles.modernToggleBtn, {marginRight: 10, width: 120}, fundSource === w.label && {borderColor: Colors.primary, backgroundColor: 'rgba(0, 240, 255, 0.1)'}]} onPress={()=>setFundSource(w.label)}>
                     <Text style={[styles.modernToggleText, {textAlign: 'center', fontSize: 10}, fundSource === w.label && {color: Colors.primary}]}>{w.label}</Text>
                   </TouchableOpacity>
                 ))}
              </ScrollView>
              <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginBottom: 15, marginLeft: 5, marginTop: 5}}>Pilih dompet dari mana dana akan dialokasikan</Text>
              
              <Text style={styles.inputLabel}>NOMINAL ALOKASI</Text>
              <View style={styles.inputWithAction}>
                 <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', marginRight: 10, fontSize: 14}}>Rp</Text>
                 <TextInput style={{ flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular' }} placeholder="Masukkan nominal alokasi" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={fundAmount} onChangeText={(val) => setFundAmount(val.replace(/[^0-9.]/g, ''))} />
                 <TouchableOpacity onPress={() => setFundAmount(walletBalances[fundSource] > 0 ? walletBalances[fundSource].toString() : '0')} style={{backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary}}>
                   <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>MAKS</Text>
                 </TouchableOpacity>
              </View>
              <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginTop: -20, marginBottom: 20, marginLeft: 5}}>Masukkan jumlah dana yang ingin dialokasikan. Klik MAKS untuk menggunakan saldo tersedia</Text>

              <View style={{flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2A344A', marginBottom: 20}}>
                 <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} style={{marginRight: 10}} />
                 <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10, flex: 1, lineHeight: 14}}>
                   Alokasi dana akan langsung menambah progres target tabungan. Dana tetap aman di dompet sumber.
                 </Text>
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginRight: 5, backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.textMuted}]} onPress={() => setShowFundModal(false)}>
                   <Text style={[styles.buttonText, {color: Colors.textMuted, fontSize: 12}]}>BATAL</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginLeft: 5}]} onPress={handleAddFund}>
                   <Text style={[styles.buttonText, {fontSize: 12}]}>TAMBAH DANA</Text>
                 </TouchableOpacity>
              </View>
              
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function InputScreen() {
  const user = auth.currentUser;
  const [type, setType] = useState('pengeluaran'); 
  const [amount, setAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [wallet, setWallet] = useState('Dompet Tunai');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  
  const [showAddCustomCatModal, setShowAddCustomCatModal] = useState(false);
  const [editCatLabel, setEditCatLabel] = useState('');
  const [catFormLabel, setCatFormLabel] = useState('');
  const [catFormIcon, setCatFormIcon] = useState('pricetag');

  const [fromWallet, setFromWallet] = useState('Rekening Bank');
  const [toWallet, setToWallet] = useState('Dompet Tunai');
  const [walletTargetType, setWalletTargetType] = useState('wallet'); 
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [usdRate, setUsdRate] = useState(15500); 
  const [walletBalances, setWalletBalances] = useState({'Dompet Tunai': 0, 'Rekening Bank': 0, 'E-Wallet': 0, 'Crypto Wallet': 0});

  useEffect(() => {
     if(!user) return;
     
     fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr')
       .then(res => res.json())
       .then(apiData => { 
          if (apiData?.tether?.idr) setUsdRate(apiData.tether.idr); 
       }).catch(e => {}); 

     const unsubscribeSettings = onSnapshot(doc(db, 'settings', user.uid), (docSnap) => { 
       if (docSnap.exists() && docSnap.data().customCategories) { 
         setCustomCategories(docSnap.data().customCategories); 
       } 
     });
     
     const qTx = query(collection(db, 'transactions'), where('userId', '==', user.uid));
     const unsubTx = onSnapshot(qTx, (snap) => {
       let balances = {'Dompet Tunai': 0, 'Rekening Bank': 0, 'E-Wallet': 0, 'Crypto Wallet': 0};
       snap.forEach(doc => { 
         const t = doc.data(); 
         if (t.type === 'pemasukan' && balances[t.wallet] !== undefined) balances[t.wallet] += t.amount; 
         else if (t.type === 'pengeluaran' && balances[t.wallet] !== undefined) balances[t.wallet] -= t.amount; 
         else if (t.type === 'transfer') { 
           if (balances[t.fromWallet] !== undefined) balances[t.fromWallet] -= t.amount; 
           
           let receivedAmt = t.amount;
           if (t.fromWallet !== t.toWallet && (t.fromWallet === 'Crypto Wallet' || t.toWallet === 'Crypto Wallet')) {
               receivedAmt = t.convertedAmount !== undefined ? t.convertedAmount : t.amount;
           } else {
               receivedAmt = t.baseAmount !== undefined ? t.baseAmount : t.amount;
           }
           if (balances[t.toWallet] !== undefined) balances[t.toWallet] += receivedAmt; 
         } 
       });
       setWalletBalances(balances);
     });
     return () => { unsubscribeSettings(); unsubTx(); };
  }, [user]);

  const baseAmt = parseFloat(amount) || 0; 
  const taxAmt = parseFloat(taxAmount) || 0; 
  const finalAmount = type === 'pemasukan' ? (baseAmt - taxAmt) : (baseAmt + taxAmt);
  const isInputUSD = type === 'transfer' ? fromWallet === 'Crypto Wallet' : wallet === 'Crypto Wallet';

  const openAddCustomCat = () => {
    setEditCatLabel(''); setCatFormLabel(''); setCatFormIcon('pricetag');
    setShowAddCustomCatModal(true);
  };

  const openEditCustomCat = (cat) => {
    setEditCatLabel(cat.label); setCatFormLabel(cat.label); setCatFormIcon(cat.icon || 'pricetag');
    setShowAddCustomCatModal(true);
  };

  const handleSaveCustomCategoryForm = async () => {
    if(!catFormLabel.trim()) return Alert.alert('Error', 'Nama kategori tidak boleh kosong.');
    const newLabel = catFormLabel.trim();
    let updatedCats = [...customCategories];
    
    try {
      const settingsRef = doc(db, 'settings', user.uid);
      const snap = await getDoc(settingsRef);
      let currentEnvelopes = snap.exists() && snap.data().envelopes ? snap.data().envelopes : [];

      if (editCatLabel) {
         updatedCats = updatedCats.map(c => {
           if (c.label === editCatLabel && c.type === type) {
             return { ...c, label: newLabel, icon: catFormIcon };
           }
           return c;
         });
         if (editCatLabel !== newLabel) {
           currentEnvelopes = currentEnvelopes.map(env => {
             if (env.name === editCatLabel) return { ...env, name: newLabel };
             return env;
           });
         }
      } else {
         if (updatedCats.find(c => c.label.toLowerCase() === newLabel.toLowerCase() && c.type === type)) {
            return Alert.alert('Error', 'Nama kategori ini sudah pernah dibuat.');
         }
         updatedCats.push({ label: newLabel, icon: catFormIcon, type: type });
      }

      await setDoc(settingsRef, { customCategories: updatedCats, envelopes: currentEnvelopes }, { merge: true });
      setShowAddCustomCatModal(false);
      if (category === editCatLabel) setCategory(newLabel);
    } catch(e) { 
      Alert.alert('Error', 'Gagal menyimpan kategori: ' + e.message); 
    }
  };

  const handleDeleteCustomCategory = async (catToDelete) => { 
    Alert.alert(
      "Hapus Kategori", 
      `Yakin ingin menghapus kategori kustom "${catToDelete.label}"? Amplop ZBB terkait juga akan terhapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus", style: "destructive",
          onPress: async () => {
            const updatedCats = customCategories.filter(c => c.label !== catToDelete.label || c.type !== catToDelete.type); 
            setCustomCategories(updatedCats); 
            try { 
              const settingsRef = doc(db, 'settings', user.uid); 
              const snap = await getDoc(settingsRef); 
              let currentEnvelopes = []; 
              if (snap.exists() && snap.data().envelopes) currentEnvelopes = snap.data().envelopes; 
              const updatedEnvelopes = currentEnvelopes.filter(env => env.name !== catToDelete.label); 
              await setDoc(settingsRef, { customCategories: updatedCats, envelopes: updatedEnvelopes }, { merge: true }); 
              if (category === catToDelete.label) setCategory('');
            } catch(e) { Alert.alert('Error', 'Gagal menghapus kategori dan sinkronisasi amplop.'); } 
          }
        }
      ]
    );
  };

  const handleSaveTransaction = async () => {
    if (!amount) return Alert.alert('Error', 'Nominal wajib diisi!');
    if (type !== 'transfer' && !category) return Alert.alert('Error', 'Kategori wajib diisi!');
    if (type === 'transfer' && fromWallet === toWallet) return Alert.alert('Error', 'Asal dan tujuan dompet tidak boleh sama!');
    if (type === 'transfer' && finalAmount > walletBalances[fromWallet]) { 
      return Alert.alert('Saldo Tidak Cukup', `Saldo di ${fromWallet} Anda saat ini hanya ${isInputUSD ? formatUSD(walletBalances[fromWallet]) : formatRp(walletBalances[fromWallet])}.`); 
    }
    if (type === 'pengeluaran' && finalAmount > walletBalances[wallet]) { 
      return Alert.alert('Saldo Tidak Cukup', `Saldo di ${wallet} Anda saat ini hanya ${isInputUSD ? formatUSD(walletBalances[wallet]) : formatRp(walletBalances[wallet])}.`); 
    }

    setIsLoading(true);
    try {
      if(!user?.uid) throw new Error("Gagal mengidentifikasi user.");
      
      let finalConvertedAmount = baseAmt; 
      if (type === 'transfer') {
         if (fromWallet === 'Crypto Wallet' && toWallet !== 'Crypto Wallet') {
            finalConvertedAmount = baseAmt * usdRate; 
         } else if (fromWallet !== 'Crypto Wallet' && toWallet === 'Crypto Wallet') {
            finalConvertedAmount = baseAmt / usdRate; 
         }
      }

      const payload = { 
        userId: user.uid, type: type, amount: finalAmount, baseAmount: baseAmt, taxAmount: taxAmt, 
        description: description, date: date, isRecurring: isRecurring, 
        nextRecurringDate: isRecurring ? new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()) : null 
      };
      
      if (type === 'transfer') { 
        payload.fromWallet = fromWallet; payload.toWallet = toWallet; 
        payload.convertedAmount = finalConvertedAmount;
        if (fromWallet !== toWallet && (fromWallet === 'Crypto Wallet' || toWallet === 'Crypto Wallet')) {
            payload.exchangeRate = usdRate; 
        }
      } else { 
        payload.category = category; payload.wallet = wallet; 
      }

      await addDoc(collection(db, 'transactions'), payload);
      Alert.alert('Sukses', 'Data berhasil dicatat!');
      setAmount(''); setTaxAmount(''); setCategory(''); setDescription(''); setDate(new Date()); setIsRecurring(false);
    } catch (error) { Alert.alert('Error', error.message); } finally { setIsLoading(false); }
  };

  const openWalletSelection = (target) => { setWalletTargetType(target); setShowWalletModal(true); };
  const selectWalletItem = (label) => { 
    if(walletTargetType === 'wallet') setWallet(label); 
    else if(walletTargetType === 'from') setFromWallet(label); 
    else if(walletTargetType === 'to') setToWallet(label); 
    setShowWalletModal(false); 
  };
  
  const activeCategories = type !== 'transfer' ? [ ...KATEGORI_PILIHAN[type].map(c => ({...c, isCustom: false})), ...customCategories.filter(c => c.type === type).map(c => ({...c, isCustom: true})) ] : [];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.containerScreen}>
      <View style={styles.headerDashboard}>
        <View>
          <Text style={styles.headerTitle}>FIN-X CATAT ARUS</Text>
          <Text style={styles.headerSubtitle}>{user?.email}</Text>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View style={styles.modernToggleContainer}>
          <TouchableOpacity style={[styles.modernToggleBtn, {paddingVertical: 10}, type === 'pengeluaran' && { backgroundColor: 'rgba(255, 0, 60, 0.2)', borderColor: Colors.danger }]} onPress={() => {setType('pengeluaran'); setCategory('');}}>
            <Ionicons name="arrow-up-circle" size={18} color={type === 'pengeluaran' ? Colors.danger : Colors.textMuted} style={{marginBottom: 3}}/>
            <Text style={[styles.modernToggleText, {fontSize: 10}, type === 'pengeluaran' && {color: Colors.danger}]}>KELUAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modernToggleBtn, {paddingVertical: 10}, type === 'transfer' && { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderColor: Colors.warning }]} onPress={() => setType('transfer')}>
            <Ionicons name="swap-horizontal" size={18} color={type === 'transfer' ? Colors.warning : Colors.textMuted} style={{marginBottom: 3}}/>
            <Text style={[styles.modernToggleText, {fontSize: 10}, type === 'transfer' && {color: Colors.warning}]}>TRANSFER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modernToggleBtn, {paddingVertical: 10}, type === 'pemasukan' && { backgroundColor: 'rgba(0, 255, 102, 0.2)', borderColor: Colors.success }]} onPress={() => {setType('pemasukan'); setCategory('');}}>
            <Ionicons name="arrow-down-circle" size={18} color={type === 'pemasukan' ? Colors.success : Colors.textMuted} style={{marginBottom: 3}}/>
            <Text style={[styles.modernToggleText, {fontSize: 10}, type === 'pemasukan' && {color: Colors.success}]}>MASUK</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={ZoomIn} style={[styles.card, { paddingVertical: 20 }]}>
          
          {type === 'transfer' && (fromWallet === 'Crypto Wallet' || toWallet === 'Crypto Wallet') && ( 
            <Text style={{color: Colors.warning, fontSize: 9, fontFamily: 'Orbitron_400Regular', textAlign: 'center', marginBottom: 15, paddingHorizontal: 10}}> 
              *Transfer lintas mata uang dikonversi otomatis sesuai Live Rate ({formatRp(usdRate)}).
            </Text> 
          )}

          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
             <View style={{flex: 1, marginRight: 5}}>
                {type === 'transfer' ? ( 
                  <Text style={styles.inputLabel} numberOfLines={1}>NOMINAL DASAR</Text> 
                ) : ( 
                  <Text style={styles.inputLabel}>NOMINAL DASAR</Text> 
                )}
                {type === 'transfer' ? (
                   <View style={[styles.inputWithAction, {height: 45, marginBottom: 0}]}> 
                      <TextInput style={{ flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 16 }} placeholder={isInputUSD ? "$ 0" : "Rp 0"} placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={amount} onChangeText={(val) => setAmount(val.replace(/[^0-9.]/g, ''))} /> 
                      <TouchableOpacity onPress={() => setAmount(walletBalances[fromWallet] > 0 ? walletBalances[fromWallet].toString() : '0')} style={{backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary}}> 
                        <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 8}}>MAX</Text> 
                      </TouchableOpacity> 
                   </View>
                ) : (
                   <TextInput style={[styles.input, { fontSize: 16, height: 45, marginBottom: 0 }]} placeholder={isInputUSD ? "$ 0" : "Rp 0"} placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={amount} onChangeText={(val) => setAmount(val.replace(/[^0-9.]/g, ''))} /> 
                )}
             </View>
             
             <View style={{flex: 1, marginLeft: 5}}>
                <Text style={styles.inputLabel} numberOfLines={1}>PAJAK / BIAYA</Text>
                <TextInput style={[styles.input, { height: 45, marginBottom: 0, fontSize: 16 }]} placeholder={isInputUSD ? "$ 0" : "Rp 0"} placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={taxAmount} onChangeText={(val) => setTaxAmount(val.replace(/[^0-9.]/g, ''))} />
             </View>
          </View>
          
          <View style={{backgroundColor: '#0B0F19', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2A344A', marginBottom: 15}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
               <Text style={{fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 10, flexShrink: 0, marginRight: 10}}> 
                 {type === 'pemasukan' ? 'Pemasukan - Pajak' : 'Pengeluaran/Transfer + Biaya'} 
               </Text>
               <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', color: type === 'pemasukan' ? Colors.success : (type === 'transfer' ? Colors.warning : Colors.danger), fontSize: 14, flexShrink: 1, textAlign: 'right'}}> 
                 {type === 'pemasukan' ? 'Total: ' : 'Bayar: '}{isInputUSD ? formatUSD(finalAmount) : formatRp(finalAmount)} 
               </Text>
            </View>
          </View>

          {type !== 'transfer' ? ( 
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}> 
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={styles.inputLabel}>KATEGORI</Text> 
                <TouchableOpacity style={[styles.inputPicker, {height: 45, marginBottom: 0, paddingHorizontal: 10}]} onPress={() => setShowCategoryModal(true)}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}> 
                    {category !== '' ? ( 
                      <Ionicons name={activeCategories.find(k => k.label === category)?.icon || 'pricetag'} size={16} color={Colors.primary} style={{marginRight: 6}} /> 
                    ) : null} 
                    <Text style={{ color: category ? Colors.textMain : Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10 }} numberOfLines={1}>
                      {category ? category : "Kategori..."}
                    </Text> 
                  </View> 
                  <Ionicons name="chevron-down" size={16} color={Colors.textMuted} /> 
                </TouchableOpacity> 
              </View>

              <View style={{flex: 1, marginLeft: 5}}>
                <Text style={styles.inputLabel}>SUMBER DANA</Text> 
                <TouchableOpacity style={[styles.inputPicker, {height: 45, marginBottom: 0, paddingHorizontal: 10}]} onPress={() => openWalletSelection('wallet')}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}> 
                    <Ionicons name={SUMBER_DANA.find(w => w.label === wallet)?.icon} size={16} color={Colors.primary} style={{marginRight: 6}}/> 
                    <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 10 }} numberOfLines={1}>{wallet}</Text> 
                  </View> 
                  <Ionicons name="chevron-down" size={16} color={Colors.textMuted} /> 
                </TouchableOpacity> 
              </View>
            </View> 
          ) : ( 
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}> 
              <View style={{flex: 1, marginRight: 5}}> 
                <Text style={styles.inputLabel}>DARI DOMPET</Text> 
                <TouchableOpacity style={[styles.inputPicker, {height: 45, marginBottom: 0, paddingHorizontal: 10}]} onPress={() => openWalletSelection('from')}> 
                  <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 10 }}>{fromWallet}</Text> 
                  <Ionicons name="chevron-down" size={16} color={Colors.textMuted} /> 
                </TouchableOpacity> 
              </View> 
              <View style={{flex: 1, marginLeft: 5}}> 
                <Text style={styles.inputLabel}>KE DOMPET</Text> 
                <TouchableOpacity style={[styles.inputPicker, {height: 45, marginBottom: 0, paddingHorizontal: 10}]} onPress={() => openWalletSelection('to')}> 
                  <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 10 }}>{toWallet}</Text> 
                  <Ionicons name="chevron-down" size={16} color={Colors.textMuted} /> 
                </TouchableOpacity> 
              </View> 
            </View> 
          )}

          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
             <View style={{flex: 1, marginRight: type !== 'transfer' ? 5 : 0}}>
                <Text style={styles.inputLabel}>TANGGAL</Text>
                <TouchableOpacity style={[styles.inputPicker, {height: 45, marginBottom: 0}]} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12 }}>{date.toLocaleDateString('id-ID')}</Text>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(Platform.OS === 'ios'); setDate(d || date); }} />
                )}
             </View>

             {type !== 'transfer' && ( 
               <View style={{flex: 1, marginLeft: 5}}> 
                  <Text style={styles.inputLabel}>BERULANG</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, paddingHorizontal: 12, height: 45, borderRadius: 8, borderWidth: 1, borderColor: '#2A344A'}}> 
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>BERULANG</Text> 
                    <Switch trackColor={{ false: '#2A344A', true: 'rgba(0, 240, 255, 0.5)' }} thumbColor={isRecurring ? Colors.primary : '#8B949E'} onValueChange={setIsRecurring} value={isRecurring} style={{transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]}} /> 
                  </View>
               </View> 
             )}
          </View>

          <Text style={styles.inputLabel}>CATATAN (Opsional)</Text>
          <TextInput style={[styles.input, { height: 45, textAlignVertical: 'center', marginBottom: 10 }]} placeholder="Deskripsi..." placeholderTextColor={Colors.textMuted} value={description} onChangeText={setDescription} />

          <TouchableOpacity style={[styles.button, { backgroundColor: type === 'pemasukan' ? Colors.success : (type === 'transfer' ? Colors.warning : Colors.danger), marginTop: 15, height: 50 }]} onPress={handleSaveTransaction} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={Colors.background} /> : <Text style={[styles.buttonText, { color: Colors.background, fontSize: 14 }]}>SIMPAN DATA</Text>}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal visible={showCategoryModal} transparent animationType="slide">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>PILIH KATEGORI</Text>
              <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular', textAlign: 'center', marginBottom: 15}}>
                (Geser ke kiri pada kategori kustom untuk Edit/Hapus)
              </Text>
              
              <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 300, marginBottom: 15}}>
                {type !== 'transfer' && activeCategories.map((item, i) => { 
                  if (item.isCustom) { 
                    return ( 
                      <Swipeable key={i} overshootRight={false} renderRightActions={() => ( 
                        <View style={{flexDirection: 'row'}}>
                           <TouchableOpacity style={{ backgroundColor: 'rgba(0, 240, 255, 0.2)', width: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2A344A' }} onPress={() => openEditCustomCat(item)}>
                             <Ionicons name="pencil" size={20} color={Colors.primary} />
                           </TouchableOpacity> 
                           <TouchableOpacity style={{ backgroundColor: 'rgba(255, 0, 60, 0.2)', width: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2A344A' }} onPress={() => handleDeleteCustomCategory(item)}>
                             <Ionicons name="trash" size={20} color={Colors.danger} />
                           </TouchableOpacity> 
                        </View>
                      )}>
                        <TouchableOpacity style={[styles.modalItem, { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface }]} onPress={() => { setCategory(item.label); setShowCategoryModal(false); }}>
                          <Ionicons name={item.icon || 'pricetag'} size={20} color={Colors.primary} style={{marginRight: 15}}/>
                          <Text style={styles.modalItemText}>{item.label} (Kustom)</Text>
                        </TouchableOpacity>
                      </Swipeable> 
                    ) 
                  } 
                  return ( 
                    <TouchableOpacity key={i} style={[styles.modalItem, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => { setCategory(item.label); setShowCategoryModal(false); }}>
                      <Ionicons name={item.icon || 'pricetag'} size={20} color={Colors.primary} style={{marginRight: 15}}/>
                      <Text style={styles.modalItemText}>{item.label}</Text>
                    </TouchableOpacity> 
                  ) 
                })}
              </ScrollView>
              
              <TouchableOpacity style={[styles.cleanActionBtn, { borderColor: Colors.primary, backgroundColor: 'rgba(0, 240, 255, 0.05)', marginBottom: 15, height: 45 }]} onPress={openAddCustomCat}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="add-circle" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 12 }}>BUAT KATEGORI BARU</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCloseText}>TUTUP</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </Modal>

      <Modal visible={showAddCustomCatModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={[styles.modalContent, {paddingTop: 30}]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editCatLabel ? "EDIT KATEGORI" : "KATEGORI KUSTOM BARU"}</Text>
              
              <Text style={styles.inputLabel}>NAMA KATEGORI</Text>
              <TextInput style={styles.input} placeholder="Misal: Langganan Netflix" placeholderTextColor={Colors.textMuted} value={catFormLabel} onChangeText={setCatFormLabel} maxLength={25} />
              
              <Text style={[styles.inputLabel, {marginBottom: 10}]}>PILIH IKON VISUAL</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20}}>
                 {ICON_LIST.map((ic, i) => (
                    <TouchableOpacity key={i} style={{width: 45, height: 45, justifyContent: 'center', alignItems: 'center', margin: 5, borderRadius: 10, borderWidth: 1, borderColor: catFormIcon === ic ? Colors.primary : '#2A344A', backgroundColor: catFormIcon === ic ? 'rgba(0, 240, 255, 0.1)' : 'transparent'}} onPress={() => setCatFormIcon(ic)}>
                       <Ionicons name={ic} size={22} color={catFormIcon === ic ? Colors.primary : Colors.textMuted}/>
                    </TouchableOpacity>
                 ))}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSaveCustomCategoryForm}>
                <Text style={styles.buttonText}>SIMPAN KATEGORI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowAddCustomCatModal(false)}>
                <Text style={styles.modalCloseText}>BATAL</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showWalletModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PILIH DOMPET</Text>
            {SUMBER_DANA.map((item, i) => ( 
              <TouchableOpacity key={i} style={[styles.modalItem, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => selectWalletItem(item.label)}>
                <Ionicons name={item.icon} size={20} color={Colors.primary} style={{marginRight: 15}}/>
                <Text style={styles.modalItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowWalletModal(false)}>
              <Text style={styles.modalCloseText}>BATAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function AnalyticsScreen() {
  const user = auth.currentUser;
  const [allTransactions, setAllTransactions] = useState([]);
  const [expenseChartData, setExpenseChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [chartRawData, setChartRawData] = useState({ inc: [], exp: [] }); 
  const [summary, setSummary] = useState({ income: 0, expense: 0, type: 'MENGKALKULASI...', typeColor: Colors.primary });
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date());
  const [usdRate, setUsdRate] = useState(15500); 
  const [momDetails, setMomDetails] = useState({ incPerc: '0', incIsUp: true, expPerc: '0', expIsUp: true });
  
  const [isExporting, setIsExporting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfRangeType, setPdfRangeType] = useState('bulanan');
  const [customStart, setCustomStart] = useState(new Date());
  const [customEnd, setCustomEnd] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [tooltipPos, setTooltipPos] = useState({ visible: false, x: 0, y: 0, index: 0, day: 0 }); 
  const [budgetBulanan, setBudgetBulanan] = useState(0);

  const [showExpDetails, setShowExpDetails] = useState(false);
  const [sortExpAsc, setSortExpAsc] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr').then(res => res.json()).then(apiData => { if (apiData?.tether?.idr) setUsdRate(apiData.tether.idr); }).catch(e => {}); 
    
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', user.uid), (docSnap) => {
       if (docSnap.exists() && docSnap.data().budgetBulananLimit) {
           setBudgetBulanan(docSnap.data().budgetBulananLimit);
       }
    });

    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let tempTransactions = []; 
      snapshot.forEach((doc) => {
        const data = doc.data();
        if(data) tempTransactions.push({ id: doc.id, dateObj: data.date ? data.date.toDate() : new Date(), ...data });
      });
      tempTransactions.sort((a, b) => b.dateObj - a.dateObj);
      setAllTransactions(tempTransactions); setLoading(false);
    });
    return () => { unsubscribe(); unsubscribeSettings(); };
  }, [user]);

  useEffect(() => {
    let inc = 0; let exp = 0; let prevMonthExp = 0; let prevMonthInc = 0; let expCatTotals = {}; 
    const fMonth = filterDate.getMonth(); const fYear = filterDate.getFullYear();
    const pMonth = fMonth === 0 ? 11 : fMonth - 1; const pYear = fMonth === 0 ? fYear - 1 : fYear;
    
    const daysInMonth = new Date(fYear, fMonth + 1, 0).getDate();
    let dailyInc = Array(daysInMonth).fill(0);
    let dailyExp = Array(daysInMonth).fill(0);

    allTransactions.forEach((t) => {
      const amtIDR = (t.type === 'transfer' ? t.fromWallet === 'Crypto Wallet' : t.wallet === 'Crypto Wallet') ? (t.amount * usdRate) : t.amount;
      
      if (t.dateObj.getMonth() === fMonth && t.dateObj.getFullYear() === fYear) {
        const dayIndex = t.dateObj.getDate() - 1; 
        if (t.type === 'pemasukan') { 
            inc += amtIDR; 
            dailyInc[dayIndex] += amtIDR;
        } else if (t.type === 'pengeluaran') {
            exp += amtIDR; 
            const cat = t.category || 'Lainnya'; 
            expCatTotals[cat] = (expCatTotals[cat] || 0) + amtIDR;
            dailyExp[dayIndex] += amtIDR;
        }
      }
      
      if (t.dateObj.getMonth() === pMonth && t.dateObj.getFullYear() === pYear) {
        if (t.type === 'pengeluaran' && t.category !== 'Alokasi Tabungan') prevMonthExp += amtIDR;
        if (t.type === 'pemasukan') prevMonthInc += amtIDR;
      }
    });

    const prepExpChart = Object.keys(expCatTotals).map((key, i) => ({ name: key, amount: expCatTotals[key], color: getNeonColor(i) })).sort((a,b) => b.amount - a.amount);
    
    const chartLabels = dailyInc.map((_, i) => (i + 1) % 5 === 0 || i === 0 ? (i + 1).toString() : '');

    setLineChartData({
      labels: chartLabels,
      datasets: [
        { data: dailyInc, color: () => Colors.success, strokeWidth: 2, id: 'Pemasukan' },
        { data: dailyExp, color: () => Colors.danger, strokeWidth: 2, id: 'Pengeluaran' }
      ]
    });

    setChartRawData({ inc: dailyInc, exp: dailyExp });

    const incDiff = inc - prevMonthInc;
    const incPerc = prevMonthInc > 0 ? (Math.abs(incDiff) / prevMonthInc * 100).toFixed(0) : (inc > 0 ? '100' : '0');
    
    const expDiff = exp - prevMonthExp;
    const expPerc = prevMonthExp > 0 ? (Math.abs(expDiff) / prevMonthExp * 100).toFixed(0) : (exp > 0 ? '100' : '0');

    setMomDetails({ incPerc, incIsUp: incDiff >= 0, expPerc, expIsUp: expDiff >= 0 });

    let userType = 'BELUM ADA DATA'; let typeColor = Colors.textMuted;
    if (inc > 0) { 
      const ratio = ((inc - exp) / inc) * 100; 
      if (ratio >= 50) { userType = 'MASTER INVESTOR'; typeColor = Colors.primary; } 
      else if (ratio >= 20) { userType = 'STRATEGIST'; typeColor = Colors.success; } 
      else if (ratio >= 0) { userType = 'SURVIVOR'; typeColor = Colors.warning; } 
      else { userType = 'DEFICIT ALERT'; typeColor = Colors.danger; } 
    } else if (exp > 0) { userType = 'DEFICIT ALERT'; typeColor = Colors.danger; }

    setExpenseChartData(prepExpChart); 
    setSummary({ income: inc, expense: exp, type: userType, typeColor: typeColor }); 
    setTooltipPos({ visible: false, x: 0, y: 0, index: 0, day: 0 }); 
  }, [allTransactions, filterDate, usdRate]);

  const changeMonth = (offset) => { const newDate = new Date(filterDate); newDate.setMonth(newDate.getMonth() + offset); setFilterDate(newDate); };

  const handleDataPointClick = (data) => {
     setTooltipPos({
        visible: true,
        x: data.x,
        y: data.y,
        index: data.index,
        day: data.index + 1
     });
  };

  const executePDFGeneration = async () => {
    setShowPdfModal(false); setIsExporting(true);
    let startDateObj = new Date(); let endDateObj = new Date(); const now = new Date();

    if (pdfRangeType === 'mingguan') { startDateObj.setDate(now.getDate() - 7); startDateObj.setHours(0,0,0,0); } 
    else if (pdfRangeType === 'bulanan') { startDateObj = new Date(now.getFullYear(), now.getMonth(), 1); endDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 0); } 
    else if (pdfRangeType === 'tahunan') { startDateObj = new Date(now.getFullYear(), 0, 1); endDateObj = new Date(now.getFullYear(), 11, 31); } 
    else if (pdfRangeType === 'kustom') { startDateObj = new Date(customStart); startDateObj.setHours(0,0,0,0); endDateObj = new Date(customEnd); endDateObj.setHours(23,59,59,999); }

    try {
      const txInRange = allTransactions.filter(t => t.dateObj >= startDateObj && t.dateObj <= endDateObj);
      let totMasuk = 0; let totKeluar = 0; let expDist = {};

      const tableRows = txInRange.map(t => {
        let tType = t.type.toUpperCase(); let cat = t.category || '-';
        if(t.type === 'transfer'){ tType = 'TRANSFER'; cat = `${t.fromWallet} ➝ ${t.toWallet}`; }
        const isCrypto = t.type === 'transfer' ? t.fromWallet === 'Crypto Wallet' : t.wallet === 'Crypto Wallet';
        const amtIDR = isCrypto ? (t.amount * usdRate) : t.amount;
        let amountText = isCrypto ? formatUSD(t.amount) : formatRp(t.amount);
        
        if (t.type === 'transfer') {
            let receivedAmt = t.amount;
            if (t.fromWallet !== t.toWallet && (t.fromWallet === 'Crypto Wallet' || t.toWallet === 'Crypto Wallet')) {
                receivedAmt = t.convertedAmount !== undefined ? t.convertedAmount : (t.baseAmount || t.amount);
            } else {
                receivedAmt = t.baseAmount !== undefined ? t.baseAmount : t.amount;
            }
            if (receivedAmt !== undefined && receivedAmt !== t.amount) {
                 amountText += ` ➝ ${t.toWallet === 'Crypto Wallet' ? formatUSD(receivedAmt) : formatRp(receivedAmt)}`;
            }
        }

        if(t.type === 'pemasukan') totMasuk += amtIDR;
        if(t.type === 'pengeluaran') { totKeluar += amtIDR; expDist[cat] = (expDist[cat] || 0) + amtIDR; }

        return `<tr style="border-bottom: 1px solid #2A344A;"><td style="padding: 10px; color: ${t.type === 'pemasukan' ? '#00FF66' : (t.type === 'transfer' ? '#FFD700' : '#FF003C')};">${t.dateObj.toLocaleDateString('id-ID')}</td><td style="padding: 10px;">${tType}</td><td style="padding: 10px;">${cat}</td><td style="padding: 10px; text-align: right;">${amountText}</td></tr>`;
      }).join('');

      const sortedExpDist = Object.keys(expDist).sort((a,b) => expDist[b] - expDist[a]).slice(0, 5);
      let distHTML = sortedExpDist.length > 0 ? `<div style="background-color: #0B0F19; padding: 15px; border-radius: 8px; border: 1px solid #2A344A; margin-bottom: 20px;"><h4 style="color: #00F0FF; margin-top: 0;">TOP 5 KATEGORI PENGELUARAN:</h4><ul style="color: #8B949E; list-style-type: none; padding: 0;">` : '';
      sortedExpDist.forEach(k => { distHTML += `<li style="margin-bottom: 5px;"><strong style="color: #FFFFFF;">${k}:</strong> ${formatRp(expDist[k])}</li>`; });
      if(distHTML !== '') distHTML += `</ul></div>`;

      const selisih = totMasuk - totKeluar;
      const htmlContent = `<html><head><style> body { font-family: 'Courier New', Courier, monospace; background-color: #0B0F19; color: #FFFFFF; padding: 40px; } h1 { color: #00F0FF; text-align: center; letter-spacing: 2px; text-shadow: 0 0 10px #00F0FF; margin-bottom: 5px; } h3 { color: #8B949E; text-align: center; margin-top: 0; } .summary { background-color: #1A2235; padding: 20px; border-radius: 10px; border: 1px solid #00F0FF; margin-bottom: 20px; text-align: center; } .summary p { margin: 5px 0; font-size: 16px; font-weight: bold; } table { width: 100%; border-collapse: collapse; margin-top: 10px; background-color: #1A2235; } th { background-color: #00F0FF; color: #0B0F19; padding: 12px; text-align: left; } td { padding: 10px; } </style></head><body><h1>FIN-X REPORT</h1><h3>IDENTITAS SISTEM: ${user?.email}</h3><h4 style="text-align: center; color: #8B949E; padding-bottom: 20px; border-bottom: 1px dashed #2A344A;">PERIODE: ${formatFileDate(startDateObj)} s/d ${formatFileDate(endDateObj)}</h4>
      <div class="summary"><p style="color: #00FF66;">TOTAL MASUK: ${formatRp(totMasuk)}</p><p style="color: #FF003C;">TOTAL KELUAR: ${formatRp(totKeluar)}</p><p style="color: ${selisih >= 0 ? '#00FF66' : '#FF003C'}; margin-top: 15px;">NET MARGIN (SELISIH): ${formatRp(selisih)}</p></div>
      ${distHTML}
      <table><thead><tr><th>TANGGAL</th><th>TIPE ARUS</th><th>KATEGORI / INFO</th><th style="text-align: right;">NOMINAL</th></tr></thead><tbody>${tableRows || `<tr><td colspan="4" style="text-align:center; padding: 20px; color:#8B949E;">Tidak ada transaksi di rentang tanggal ini.</td></tr>`}</tbody></table><p style="text-align: center; color: #8B949E; margin-top: 50px; font-size: 10px;">GENERATED BY FIN-X SYSTEM | SECURE ENCRYPTED</p></body></html>`;
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const newUri = `${FileSystem.documentDirectory}FINX_Report_${formatFileDate(startDateObj)}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) { Alert.alert('Error Generate PDF', error.message); } finally { setIsExporting(false); }
  };

  if (loading) return <View style={styles.containerScreen}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  let financialScore = 0; let scoreText = "Belum Ada Data"; let scoreIcon = "thumbs-down";
  if (summary.income > 0) {
      const marginPerc = ((summary.income - summary.expense) / summary.income) * 100;
      financialScore = Math.min(100, Math.max(0, Math.round(marginPerc + 50))); 
      if (financialScore >= 80) { scoreText = "Keuangan Sehat"; scoreIcon = "thumbs-up"; }
      else if (financialScore >= 50) { scoreText = "Cukup Stabil"; scoreIcon = "hand-right"; }
      else { scoreText = "Perlu Perhatian"; scoreIcon = "warning"; }
  }

  const netBalance = summary.income - summary.expense;
  const currentDay = new Date().getDate();
  const avgDailyExpense = summary.expense / currentDay;

  const isStabilitasGood = summary.expense <= (budgetBulanan > 0 ? budgetBulanan : summary.income);
  const isPertumbuhanGood = momDetails.incIsUp && summary.income > 0;
  const isLikuiditasGood = netBalance > 0;
  const isEfisiensiGood = summary.expense < (summary.income * 0.8); 

  return (
    <View style={styles.containerScreen}>
      <View style={styles.headerDashboard}>
        <View>
          <Text style={styles.headerTitle}>FIN-X ANALITIK</Text>
          <Text style={styles.headerSubtitle}>Pahami keuanganmu, ambil keputusan terbaik</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2A344A', marginBottom: 15}}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Ionicons name="calendar-outline" size={18} color={Colors.primary} style={{marginRight: 8}}/>
                 <Text style={{fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 12}}>{formatMonthYear(filterDate)}</Text>
             </View>
             <View style={{flexDirection: 'row'}}>
                 <TouchableOpacity onPress={() => changeMonth(-1)} style={{paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(0, 240, 255, 0.1)', borderRadius: 6, marginRight: 8}}>
                     <Ionicons name="chevron-back" color={Colors.primary} size={16}/>
                 </TouchableOpacity>
                 <TouchableOpacity onPress={() => changeMonth(1)} style={{paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(0, 240, 255, 0.1)', borderRadius: 6}}>
                     <Ionicons name="chevron-forward" color={Colors.primary} size={16}/>
                 </TouchableOpacity>
             </View>
        </View>

        <Animated.View entering={ZoomIn} style={[styles.card, { flexDirection: 'row', marginBottom: 15, padding: 20 }]}>
           <View style={{flex: 1, paddingRight: 15}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                 <Ionicons name="bulb-outline" size={16} color={Colors.warning} style={{marginRight: 5}}/>
                 <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 10, color: Colors.textMuted}}>INSIGHT UTAMA</Text>
              </View>
              {netBalance > 0 ? (
                 <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 16, color: Colors.textMain, marginBottom: 8}}>
                    Kamu surplus <Text style={{color: Colors.success}}>{formatRp(netBalance)}</Text> bulan ini ↗
                 </Text>
              ) : (
                 <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 16, color: Colors.textMain, marginBottom: 8}}>
                    Kamu defisit <Text style={{color: Colors.danger}}>{formatRp(Math.abs(netBalance))}</Text> bulan ini ↘
                 </Text>
              )}
              <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted, lineHeight: 14}}>
                 Pengeluaranmu {momDetails.expIsUp ? 'naik' : 'turun'} {momDetails.expPerc}% dan pemasukan {momDetails.incIsUp ? 'naik' : 'turun'} {momDetails.incPerc}%. Terus pantau pergerakan uangmu!
              </Text>
           </View>
           
           <View style={{alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#2A344A', paddingLeft: 15}}>
              <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 8, color: Colors.textMuted, marginBottom: 8}}>SKOR KEUANGAN</Text>
              <View style={{width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: financialScore >= 80 ? Colors.success : (financialScore >= 50 ? Colors.warning : Colors.danger), justifyContent: 'center', alignItems: 'center', marginBottom: 8}}>
                 <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 18, color: Colors.textMain}}>{financialScore}</Text>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted}}>/100</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#2A344A'}}>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMain, marginRight: 4}}>{scoreText}</Text>
                 <Ionicons name={scoreIcon} size={10} color={financialScore >= 80 ? Colors.success : Colors.warning} />
              </View>
           </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 5}}>
           <View style={[styles.card, {width: '48%', marginBottom: 10, padding: 15}]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(0, 255, 102, 0.1)', justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons name="arrow-down" size={16} color={Colors.success}/>
                 </View>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted}}>PEMASUKAN</Text>
              </View>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: Colors.textMain, marginBottom: 5}}>{formatRp(summary.income)}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Ionicons name={momDetails.incIsUp ? "caret-up" : "caret-down"} size={10} color={momDetails.incIsUp ? Colors.success : Colors.danger} style={{marginRight: 4}}/>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted}}><Text style={{color: momDetails.incIsUp ? Colors.success : Colors.danger}}>{momDetails.incPerc}%</Text> vs Bln Lalu</Text>
              </View>
           </View>

           <View style={[styles.card, {width: '48%', marginBottom: 10, padding: 15}]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255, 0, 60, 0.1)', justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons name="arrow-up" size={16} color={Colors.danger}/>
                 </View>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted}}>PENGELUARAN</Text>
              </View>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: Colors.textMain, marginBottom: 5}}>{formatRp(summary.expense)}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Ionicons name={momDetails.expIsUp ? "caret-up" : "caret-down"} size={10} color={momDetails.expIsUp ? Colors.danger : Colors.success} style={{marginRight: 4}}/>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted}}><Text style={{color: momDetails.expIsUp ? Colors.danger : Colors.success}}>{momDetails.expPerc}%</Text> vs Bln Lalu</Text>
              </View>
           </View>

           <View style={[styles.card, {width: '48%', marginBottom: 10, padding: 15}]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(0, 240, 255, 0.1)', justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons name="wallet-outline" size={16} color={Colors.primary}/>
                 </View>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted}}>SALDO BERSIH</Text>
              </View>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: netBalance >= 0 ? Colors.success : Colors.danger, marginBottom: 5}}>{formatRp(netBalance)}</Text>
           </View>

           <View style={[styles.card, {width: '48%', marginBottom: 10, padding: 15}]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons name="pie-chart-outline" size={16} color={Colors.warning}/>
                 </View>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted}}>RATA HARI INI</Text>
              </View>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 14, color: Colors.textMain, marginBottom: 5}}>{formatRp(avgDailyExpense)}</Text>
              <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted}}>dari total pengeluaran</Text>
           </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={[styles.card, {marginBottom: 15, paddingHorizontal: 0, paddingBottom: 15}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20}}>
             <Text style={styles.historyTitle}>TREN CASHFLOW</Text>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <View style={{width: 8, height: 8, backgroundColor: Colors.success, borderRadius: 4, marginRight: 4}}/>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted, marginRight: 10}}>Masuk</Text>
                 <View style={{width: 8, height: 8, backgroundColor: Colors.danger, borderRadius: 4, marginRight: 4}}/>
                 <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted}}>Keluar</Text>
             </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            <View style={{ position: 'relative' }}>
               <LineChart 
                 data={lineChartData} 
                 width={Math.max(screenWidth - 40, lineChartData.labels.length * 35)} 
                 height={180} 
                 withDots={true}
                 withInnerLines={false}
                 chartConfig={{
                    backgroundColor: Colors.surface, backgroundGradientFrom: Colors.surface, backgroundGradientTo: Colors.surface,
                    decimalPlaces: 0, color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
                    propsForDots: { r: "4", strokeWidth: "2" } 
                 }} 
                 bezier 
                 style={{ marginVertical: 8, borderRadius: 16 }}
                 onDataPointClick={handleDataPointClick}
               />

               {tooltipPos.visible && (
                  <View style={[styles.tooltipContainer, { 
                    top: tooltipPos.y < 65 ? tooltipPos.y + 15 : tooltipPos.y - 65, 
                    left: Math.max(10, Math.min(tooltipPos.x - 45, Math.max(screenWidth - 40, lineChartData.labels.length * 35) - 110)), 
                    minWidth: 100, alignItems: 'flex-start' 
                  }]}>
                     <Text style={{fontSize: 8, fontFamily: 'Orbitron_400Regular', color: Colors.textMain, marginBottom: 4}}>Tgl {tooltipPos.day}</Text>
                     <Text style={{fontSize: 9, fontFamily: 'Orbitron_700Bold', color: Colors.success}}>In : {formatRp(chartRawData.inc[tooltipPos.index])}</Text>
                     <Text style={{fontSize: 9, fontFamily: 'Orbitron_700Bold', color: Colors.danger}}>Out: {formatRp(chartRawData.exp[tooltipPos.index])}</Text>
                  </View>
               )}
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={[styles.card, {marginBottom: 15, padding: 15}]}>
           <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
               <Text style={styles.historyTitle}>DISTRIBUSI PENGELUARAN</Text>
               <TouchableOpacity onPress={() => setShowExpDetails(!showExpDetails)}>
                  <Ionicons name={showExpDetails ? "chevron-up" : "chevron-down"} size={20} color={Colors.textMuted} />
               </TouchableOpacity>
           </View>

           <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: showExpDetails ? 20 : 0}}>
               {expenseChartData.length > 0 ? (
                  <View style={{position: 'relative', alignItems: 'center', justifyContent: 'center'}}>
                     <PieChart
                        data={expenseChartData}
                        width={screenWidth - 70}
                        height={160}
                        chartConfig={{ color: () => `rgba(255, 255, 255, 1)` }}
                        accessor={"amount"}
                        backgroundColor={"transparent"}
                        paddingLeft={((screenWidth - 70) / 4) - 20}
                        absolute
                        hasLegend={false}
                     />
                     <View style={{position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A344A'}}>
                        <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted, marginBottom: 2}}>Total</Text>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={{fontFamily: 'Orbitron_700Bold', fontSize: 11, color: Colors.textMain, paddingHorizontal: 5}}>{formatRp(summary.expense)}</Text>
                     </View>
                  </View>
               ) : (
                  <View style={{width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#2A344A', justifyContent: 'center', alignItems: 'center'}}>
                     <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted}}>No Data</Text>
                  </View>
               )}
           </View>

           {showExpDetails && (
              <Animated.View entering={FadeInDown}>
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderTopWidth: 1, borderTopColor: '#2A344A', paddingTop: 15}}>
                    <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 10, color: Colors.textMuted}}>DETAIL KATEGORI</Text>
                    <TouchableOpacity onPress={() => setSortExpAsc(!sortExpAsc)} style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary}}>
                       <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 9, marginRight: 5}}>
                          {sortExpAsc ? 'TERKECIL' : 'TERBESAR'}
                       </Text>
                       <Ionicons name="swap-vertical" size={12} color={Colors.primary} />
                    </TouchableOpacity>
                 </View>

                 {[...expenseChartData].sort((a,b) => sortExpAsc ? a.amount - b.amount : b.amount - a.amount).map((item, idx) => {
                    const perc = summary.expense > 0 ? ((item.amount / summary.expense) * 100).toFixed(0) : 0;
                    return (
                       <View key={idx} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10}}>
                             <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: item.color, marginRight: 10}} />
                             <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 11}} numberOfLines={1}>{item.name}</Text>
                          </View>
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                             <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 11, marginRight: 8}}>{formatRp(item.amount)}</Text>
                             <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10, width: 35, textAlign: 'right'}}>({perc}%)</Text>
                          </View>
                       </View>
                    );
                 })}
                 {expenseChartData.length === 0 && <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'center'}}>Belum ada pengeluaran dicatat.</Text>}
              </Animated.View>
           )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={[styles.card, {marginBottom: 20, padding: 15}]}>
           <Text style={[styles.historyTitle, {marginBottom: 15}]}>FINANCIAL HEALTH CHECK</Text>
           <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
              
              <View style={{width: '48%', flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: isStabilitasGood ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={isStabilitasGood ? Colors.success : Colors.warning}/>
                 </View>
                 <View style={{flex: 1}}>
                    <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 9, color: Colors.textMain}}>Stabilitas</Text>
                    <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: isStabilitasGood ? Colors.success : Colors.warning}}>{isStabilitasGood ? 'Baik (Terkontrol)' : 'Awas (Over-budget)'}</Text>
                 </View>
              </View>

              <View style={{width: '48%', flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: isPertumbuhanGood ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 0, 60, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                    <Ionicons name="trending-up-outline" size={16} color={isPertumbuhanGood ? Colors.success : Colors.danger}/>
                 </View>
                 <View style={{flex: 1}}>
                    <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 9, color: Colors.textMain}}>Pertumbuhan</Text>
                    <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: isPertumbuhanGood ? Colors.success : Colors.danger}}>{isPertumbuhanGood ? 'Pemasukan Naik' : 'Pemasukan Turun'}</Text>
                 </View>
              </View>

              <View style={{width: '48%', flexDirection: 'row', alignItems: 'center'}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: isLikuiditasGood ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 0, 60, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                    <Ionicons name="water-outline" size={16} color={isLikuiditasGood ? Colors.success : Colors.danger}/>
                 </View>
                 <View style={{flex: 1}}>
                    <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 9, color: Colors.textMain}}>Likuiditas</Text>
                    <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: isLikuiditasGood ? Colors.success : Colors.danger}}>{isLikuiditasGood ? 'Cashflow Positif' : 'Cashflow Negatif'}</Text>
                 </View>
              </View>

              <View style={{width: '48%', flexDirection: 'row', alignItems: 'center'}}>
                 <View style={{width: 30, height: 30, borderRadius: 8, backgroundColor: isEfisiensiGood ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                    <Ionicons name="options-outline" size={16} color={isEfisiensiGood ? Colors.success : Colors.warning}/>
                 </View>
                 <View style={{flex: 1}}>
                    <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 9, color: Colors.textMain}}>Efisiensi</Text>
                    <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: isEfisiensiGood ? Colors.success : Colors.warning}}>{isEfisiensiGood ? 'Bagus (Hemat)' : 'Perlu Diperketat'}</Text>
                 </View>
              </View>

           </View>
        </Animated.View>
        
        <TouchableOpacity style={[styles.cleanActionBtn, { borderColor: Colors.primary, backgroundColor: 'rgba(0, 240, 255, 0.05)', marginTop: 5 }]} onPress={() => setShowPdfModal(true)} disabled={isExporting}>
          {isExporting ? <ActivityIndicator color={Colors.primary} /> : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
              <Text style={{ color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 14, letterSpacing: 1 }}>GENERATE LAPORAN PDF</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={showPdfModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, {padding: 20}]}>
             <Text style={styles.modalTitle}>KONFIGURASI LAPORAN</Text>
             <Text style={styles.inputLabel}>PILIH RENTANG WAKTU</Text>
             <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20}}>
                {['mingguan', 'bulanan', 'tahunan', 'kustom'].map((r) => (
                  <TouchableOpacity key={r} style={[styles.modernToggleBtn, {width: '48%', marginHorizontal: 0, marginBottom: 10, paddingVertical: 12}, pdfRangeType === r && {borderColor: Colors.primary, backgroundColor: 'rgba(0, 240, 255, 0.1)'}]} onPress={() => setPdfRangeType(r)}>
                    <Text style={[styles.modernToggleText, {textAlign: 'center', fontSize: 10}, pdfRangeType === r && {color: Colors.primary}]}>{r.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
             </View>

             {pdfRangeType === 'kustom' && (
                <View style={{marginBottom: 20, backgroundColor: 'rgba(0, 240, 255, 0.05)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#2A344A'}}>
                   <Text style={[styles.inputLabel, {color: Colors.textMain}]}>DARI TANGGAL</Text>
                   <TouchableOpacity style={[styles.inputPicker, {marginBottom: 15, height: 45}]} onPress={() => setShowStartPicker(true)}>
                     <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12 }}>{customStart.toLocaleDateString('id-ID')}</Text>
                     <Ionicons name="calendar" size={16} color={Colors.primary} />
                   </TouchableOpacity>
                   {showStartPicker && (<DateTimePicker value={customStart} mode="date" display="default" onChange={(e, d) => { setShowStartPicker(Platform.OS === 'ios'); if(d) setCustomStart(d); }} />)}

                   <Text style={[styles.inputLabel, {color: Colors.textMain}]}>SAMPAI TANGGAL</Text>
                   <TouchableOpacity style={[styles.inputPicker, {marginBottom: 0, height: 45}]} onPress={() => setShowEndPicker(true)}>
                     <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12 }}>{customEnd.toLocaleDateString('id-ID')}</Text>
                     <Ionicons name="calendar" size={16} color={Colors.primary} />
                   </TouchableOpacity>
                   {showEndPicker && (<DateTimePicker value={customEnd} mode="date" display="default" onChange={(e, d) => { setShowEndPicker(Platform.OS === 'ios'); if(d) setCustomEnd(d); }} />)}
                </View>
             )}

             <TouchableOpacity style={[styles.button, {marginTop: 10}]} onPress={executePDFGeneration}>
               <Text style={styles.buttonText}>EKSPOR SEKARANG</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.modalCloseBtn, {marginTop: 15}]} onPress={() => setShowPdfModal(false)}>
               <Text style={styles.modalCloseText}>BATAL</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function DebtScreen() {
  const user = auth.currentUser;
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [debtType, setDebtType] = useState('hutang'); 
  const [isAdvancedMode, setIsAdvancedMode] = useState(false); 
  const [personName, setPersonName] = useState('');
  
  const [totalAmount, setTotalAmount] = useState(''); 
  const [plafon, setPlafon] = useState('');           
  const [cair, setCair] = useState('');               
  const [totalKembali, setTotalKembali] = useState('');
  const [tenor, setTenor] = useState('');             
  
  const [targetWallet, setTargetWallet] = useState('Rekening Bank');
  const [showDebtWalletModal, setShowDebtWalletModal] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payWallet, setPayWallet] = useState('Dompet Tunai');
  
  const [walletBalances, setWalletBalances] = useState({'Dompet Tunai': 0, 'Rekening Bank': 0, 'E-Wallet': 0, 'Crypto Wallet': 0});
  const [isProcessing, setIsProcessing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');

  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(new Date());
  const [filterEndDate, setFilterEndDate] = useState(new Date());
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [showFilterStartPicker, setShowFilterStartPicker] = useState(false);
  const [showFilterEndPicker, setShowFilterEndPicker] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    
    const qDebts = query(collection(db, 'debts'), where('userId', '==', user.uid));
    const unsubDebts = onSnapshot(qDebts, (snap) => {
      let temp = [];
      snap.forEach(doc => temp.push({ id: doc.id, ...doc.data(), dueDateObj: doc.data().dueDate.toDate() }));
      temp.sort((a, b) => b.dueDateObj - a.dueDateObj);
      setDebts(temp);
      setLoading(false);
    });

    const qTx = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsubTx = onSnapshot(qTx, (snap) => {
      let balances = {'Dompet Tunai': 0, 'Rekening Bank': 0, 'E-Wallet': 0, 'Crypto Wallet': 0};
      snap.forEach(doc => { 
        const t = doc.data(); 
        if (t.type === 'pemasukan' && balances[t.wallet] !== undefined) balances[t.wallet] += t.amount; 
        else if (t.type === 'pengeluaran' && balances[t.wallet] !== undefined) balances[t.wallet] -= t.amount; 
        else if (t.type === 'transfer') { 
          if (balances[t.fromWallet] !== undefined) balances[t.fromWallet] -= t.amount; 
          let receivedAmt = t.baseAmount !== undefined ? t.baseAmount : t.amount;
          if (balances[t.toWallet] !== undefined) balances[t.toWallet] += receivedAmt; 
        } 
      });
      setWalletBalances(balances);
    });

    return () => { unsubDebts(); unsubTx(); };
  }, [user]);

  const handleSaveDebt = async () => {
    if (!personName) return Alert.alert("Error", "Nama/Lembaga wajib diisi!");
    if (!isAdvancedMode && !totalAmount) return Alert.alert("Error", "Nominal wajib diisi!");
    if (isAdvancedMode && (!plafon || !cair || !totalKembali || !tenor)) return Alert.alert("Error", "Plafon, Pencairan, Total Kembali, dan Tenor wajib diisi di Mode Advanced!");
    
    setIsProcessing(true);
    try {
      const amountParsed = parseFloat(totalAmount) || 0;
      const pPlafon = parseFloat(plafon) || 0;
      const pCair = parseFloat(cair) || 0;
      const pTotal = parseFloat(totalKembali) || 0;
      const parsedTenor = parseInt(tenor) || 1;

      const finalPlafon = isAdvancedMode ? pPlafon : amountParsed;
      const finalCair = isAdvancedMode ? pCair : amountParsed;
      const finalTotalKembali = isAdvancedMode ? pTotal : amountParsed;
      
      if (debtType === 'piutang' && finalCair > walletBalances[targetWallet]) {
         setIsProcessing(false);
         return Alert.alert("Saldo Tidak Cukup", `Anda hanya memiliki ${formatRp(walletBalances[targetWallet])} di ${targetWallet}. Tidak bisa meminjamkan uang melebihi saldo.`);
      }

      let installmentsArray = [];
      if (isAdvancedMode) {
          const baseTerm = Math.floor(finalTotalKembali / parsedTenor);
          let remainder = Math.round(finalTotalKembali - (baseTerm * parsedTenor));
          let currentDate = new Date(startDate);

          for (let i = 0; i < parsedTenor; i++) {
              let termAmount = baseTerm;
              if (remainder > 0) { termAmount += 1; remainder -= 1; }
              currentDate.setMonth(currentDate.getMonth() + 1);
              installmentsArray.push({ id: `term_${i+1}`, term: i + 1, amount: termAmount, dueDate: currentDate.toISOString(), status: 'unpaid' });
          }
      }

      const docRef = await addDoc(collection(db, 'debts'), {
        userId: user.uid, type: debtType, personName: personName, 
        totalAmount: finalTotalKembali, paidAmount: 0,
        plafon: finalPlafon, cair: finalCair, tenor: parsedTenor, isAdvanced: isAdvancedMode,
        startDate: startDate, dueDate: dueDate, wallet: targetWallet, status: 'active', createdAt: new Date(),
        installments: installmentsArray 
      });

      const debtId = docRef.id;

      if (debtType === 'hutang') {
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid, type: 'pemasukan', amount: finalPlafon, baseAmount: finalPlafon, taxAmount: 0,
            category: 'Pencairan Pinjaman', wallet: targetWallet, description: `Plafon dari: ${personName}`, date: startDate, isRecurring: false, debtContractId: debtId
          });
          const adminFee = finalPlafon - finalCair;
          if (adminFee > 0) {
             await addDoc(collection(db, 'transactions'), {
                userId: user.uid, type: 'pengeluaran', amount: adminFee, baseAmount: adminFee, taxAmount: 0,
                category: 'Biaya Admin Pinjaman', wallet: targetWallet, description: `Potongan Admin: ${personName}`, date: startDate, isRecurring: false, debtContractId: debtId
             });
          }
      } else {
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid, type: 'pengeluaran', amount: finalPlafon, baseAmount: finalPlafon, taxAmount: 0,
            category: 'Memberi Pinjaman (Piutang)', wallet: targetWallet, description: `Plafon untuk: ${personName}`, date: startDate, isRecurring: false, debtContractId: debtId
          });
          const adminFee = finalPlafon - finalCair;
          if (adminFee > 0) {
             await addDoc(collection(db, 'transactions'), {
                userId: user.uid, type: 'pemasukan', amount: adminFee, baseAmount: adminFee, taxAmount: 0,
                category: 'Pendapatan Admin Pinjaman', wallet: targetWallet, description: `Potongan Admin: ${personName}`, date: startDate, isRecurring: false, debtContractId: debtId
             });
          }
      }

      setShowAddModal(false);
      setPersonName(''); setTotalAmount(''); setPlafon(''); setCair(''); setTotalKembali(''); setTenor(''); setStartDate(new Date()); setDueDate(new Date());
      Alert.alert("Sukses", "Kontrak berhasil dibuat dan saldo dompet telah disinkronkan sesuai pencairan.");
    } catch (e) { Alert.alert("Error", e.message); } finally { setIsProcessing(false); }
  };

  const handlePayDebt = async () => {
    if (!payAmount) return Alert.alert("Error", "Nominal bayar kosong.");
    const pAmt = parseFloat(payAmount);
    const remaining = selectedDebt.totalAmount - selectedDebt.paidAmount;

    if (pAmt > remaining) return Alert.alert("Error", `Nominal melebihi sisa tagihan (${formatRp(remaining)}).`);
    
    if (selectedDebt.type === 'hutang' && pAmt > walletBalances[payWallet]) {
      return Alert.alert("Saldo Tidak Cukup", `Saldo ${payWallet} Anda tidak cukup untuk membayar tagihan ini.`);
    }

    setIsProcessing(true);
    try {
      const newPaidAmount = selectedDebt.paidAmount + pAmt;
      const newStatus = newPaidAmount >= selectedDebt.totalAmount ? 'completed' : 'active';

      await updateDoc(doc(db, 'debts', selectedDebt.id), { paidAmount: newPaidAmount, status: newStatus });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid, type: selectedDebt.type === 'hutang' ? 'pengeluaran' : 'pemasukan', 
        amount: pAmt, baseAmount: pAmt, taxAmount: 0, category: selectedDebt.type === 'hutang' ? 'Bayar Cicilan Hutang' : 'Terima Cicilan Piutang',
        wallet: payWallet, description: `Cicilan untuk: ${selectedDebt.personName}`, date: new Date(), isRecurring: false, debtContractId: selectedDebt.id
      });

      setShowPayModal(false); setPayAmount('');
      Alert.alert("Sukses", "Cicilan berhasil diproses.");
    } catch (e) { Alert.alert("Error", e.message); } finally { setIsProcessing(false); }
  };

  const handlePayAdvancedTerm = async (termId, termAmount) => {
    if (selectedDebt.type === 'hutang' && termAmount > walletBalances[payWallet]) {
      return Alert.alert("Saldo Tidak Cukup", `Saldo ${payWallet} Anda hanya ${formatRp(walletBalances[payWallet])}. Tidak cukup untuk membayar termin ini.`);
    }

    setIsProcessing(true);
    try {
      const updatedInstallments = selectedDebt.installments.map(inst => inst.id === termId ? { ...inst, status: 'paid' } : inst);
      const newPaidAmount = selectedDebt.paidAmount + termAmount;
      const newStatus = newPaidAmount >= selectedDebt.totalAmount ? 'completed' : 'active';

      await updateDoc(doc(db, 'debts', selectedDebt.id), { paidAmount: newPaidAmount, status: newStatus, installments: updatedInstallments });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid, type: selectedDebt.type === 'hutang' ? 'pengeluaran' : 'pemasukan', 
        amount: termAmount, baseAmount: termAmount, taxAmount: 0, category: selectedDebt.type === 'hutang' ? 'Bayar Cicilan Kredit' : 'Terima Cicilan Kredit',
        wallet: payWallet, description: `Cicilan Termin untuk: ${selectedDebt.personName}`, date: new Date(), isRecurring: false, debtContractId: selectedDebt.id
      });

      setSelectedDebt(prev => ({...prev, paidAmount: newPaidAmount, status: newStatus, installments: updatedInstallments}));
      Alert.alert("Termin Lunas!", `Pembayaran senilai ${formatRp(termAmount)} berhasil diproses.`);
    } catch (e) { Alert.alert("Error", e.message); } finally { setIsProcessing(false); }
  };

  const handleDeleteDebt = (item) => {
    Alert.alert(
      "Hapus Kontrak (Cascade Delete)", 
      `Hapus kontrak ${item.type} dengan ${item.personName}? Seluruh riwayat transaksi (pencairan & cicilan) di Dasbor yang berkaitan dengan kontrak ini akan ikut terhapus bersih.`, 
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus Bersih", style: "destructive", onPress: async () => {
            try { 
              const txQuery = query(collection(db, 'transactions'), where('debtContractId', '==', item.id));
              const txSnap = await getDocs(txQuery);
              const deletePromises = [];
              txSnap.forEach((d) => { deletePromises.push(deleteDoc(d.ref)); });
              await Promise.all(deletePromises);
              await deleteDoc(doc(db, "debts", item.id)); 
              Alert.alert("Sukses", "Kontrak dan seluruh jejak transaksinya berhasil dihapus.");
            } catch (e) { Alert.alert("Error", e.message); }
        }}
      ]
    );
  };

  const activeDebtsList = debts.filter(d => d.status === 'active');
  const completedDebtsList = debts.filter(d => d.status === 'completed');

  const activeHutang = activeDebtsList.filter(d => d.type === 'hutang');
  const totalHutangAmount = activeHutang.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0);
  const hutangJatuhTempoCount = activeHutang.filter(d => {
      const daysDiff = Math.ceil((d.dueDateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 7;
  }).length;

  const activePiutang = activeDebtsList.filter(d => d.type === 'piutang');
  const totalPiutangAmount = activePiutang.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0);
  const piutangJatuhTempoCount = activePiutang.filter(d => {
      const daysDiff = Math.ceil((d.dueDateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 7;
  }).length;

  const totalActiveContracts = activeDebtsList.length;
  const totalJatuhTempoMingguIni = activeDebtsList.filter(d => {
      const daysDiff = Math.ceil((d.dueDateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
  }).length;
  const totalTerlambat = activeDebtsList.filter(d => {
      const daysDiff = Math.ceil((d.dueDateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysDiff < 0;
  }).length;
  const lunasBulanIni = completedDebtsList.length;

  let filteredDebts = debts.filter(d => {
    const matchSearch = d.personName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    
    if (activeFilter === 'Hutang') { if (d.type !== 'hutang') return false; }
    else if (activeFilter === 'Piutang') { if (d.type !== 'piutang') return false; }
    else if (activeFilter === 'Kredit (Berbunga)') { if (d.isAdvanced !== true) return false; }
    else if (activeFilter === 'Lunas') { if (d.status !== 'completed') return false; }
    else if (activeFilter === 'Belum Lunas') { if (d.status !== 'active') return false; }

    if (isDateFilterActive) {
        const dDate = new Date(d.dueDateObj);
        dDate.setHours(0,0,0,0);
        const sDate = new Date(filterStartDate);
        sDate.setHours(0,0,0,0);
        const eDate = new Date(filterEndDate);
        eDate.setHours(23,59,59,999);
        if (dDate < sDate || dDate > eDate) return false;
    }

    return true;
  });

  const filterOptions = ['Semua', 'Hutang', 'Piutang', 'Kredit (Berbunga)', 'Lunas', 'Belum Lunas'];

  return (
    <View style={styles.containerScreen}>
      <View style={styles.headerDashboard}>
        <View>
          <Text style={styles.headerTitle}>FIN-X DEBT</Text>
          <Text style={styles.headerSubtitle}>Kelola Hutang & Piutang Anda</Text>
        </View>
        <TouchableOpacity style={{padding: 8, backgroundColor: 'rgba(0, 240, 255, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: Colors.primary}} onPress={() => setShowAddModal(true)}>
           <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (<ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 50}} />) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, {backgroundColor: 'rgba(255,0,60,0.05)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: Colors.danger, alignItems: 'flex-start'}]}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                <Ionicons name="warning-outline" size={16} color={Colors.danger} style={{marginRight: 5}} />
                <Text style={styles.statLabel}>TOTAL HUTANG SAYA</Text>
              </View>
              <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, { color: Colors.textMain, fontSize: 18, marginBottom: 10 }]}>{formatRp(totalHutangAmount)}</Text>
              <View style={{backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: '#2A344A'}}>
                 <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular'}}>{activeHutang.length} Kontrak • {hutangJatuhTempoCount} Jatuh Tempo</Text>
              </View>
            </View>
            <View style={{width: 10}}/>
            <View style={[styles.statCard, {backgroundColor: 'rgba(0,255,102,0.05)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: Colors.success, alignItems: 'flex-start'}]}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                <Ionicons name="leaf-outline" size={16} color={Colors.success} style={{marginRight: 5}} />
                <Text style={styles.statLabel}>TOTAL PIUTANG SAYA</Text>
              </View>
              <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, { color: Colors.textMain, fontSize: 18, marginBottom: 10 }]}>{formatRp(totalPiutangAmount)}</Text>
              <View style={{backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: '#2A344A'}}>
                 <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular'}}>{activePiutang.length} Orang • {piutangJatuhTempoCount} Jatuh Tempo</Text>
              </View>
            </View>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
             <View style={{alignItems: 'center', flex: 1}}>
                <Ionicons name="document-text-outline" size={20} color={Colors.textMain} style={{marginBottom: 5}}/>
                <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted, textAlign: 'center'}}>KONTRAK AKTIF</Text>
                <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 16, color: Colors.textMain}}>{totalActiveContracts}</Text>
             </View>
             <View style={{alignItems: 'center', flex: 1, borderLeftWidth: 1, borderLeftColor: '#2A344A'}}>
                <Ionicons name="calendar-outline" size={20} color={Colors.textMain} style={{marginBottom: 5}}/>
                <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted, textAlign: 'center'}}>JATUH TEMPO</Text>
                <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 16, color: Colors.textMain}}>{totalJatuhTempoMingguIni}</Text>
             </View>
             <View style={{alignItems: 'center', flex: 1, borderLeftWidth: 1, borderLeftColor: '#2A344A'}}>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textMain} style={{marginBottom: 5}}/>
                <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted, textAlign: 'center'}}>LUNAS</Text>
                <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 16, color: Colors.textMain}}>{lunasBulanIni}</Text>
             </View>
             <View style={{alignItems: 'center', flex: 1, borderLeftWidth: 1, borderLeftColor: '#2A344A'}}>
                <Ionicons name="time-outline" size={20} color={Colors.textMain} style={{marginBottom: 5}}/>
                <Text style={{fontFamily: 'Orbitron_400Regular', fontSize: 8, color: Colors.textMuted, textAlign: 'center'}}>TERLAMBAT</Text>
                <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 16, color: Colors.textMain}}>{totalTerlambat}</Text>
             </View>
          </View>

          <View style={{flexDirection: 'row', marginBottom: 15}}>
             <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: '#2A344A', paddingHorizontal: 12}}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                <TextInput style={{flex: 1, height: 40, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', marginLeft: 8, fontSize: 12}} placeholder="Cari nama atau kontrak..." placeholderTextColor={Colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
             </View>
             <TouchableOpacity onPress={() => setShowDateFilterModal(true)} style={{width: 50, height: 40, backgroundColor: isDateFilterActive ? 'rgba(0, 240, 255, 0.1)' : Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: isDateFilterActive ? Colors.primary : '#2A344A', marginLeft: 10, justifyContent: 'center', alignItems: 'center', shadowColor: isDateFilterActive ? Colors.primary : 'transparent', shadowOpacity: 0.5, shadowRadius: 5, elevation: isDateFilterActive ? 5 : 0}}>
                <Ionicons name="options-outline" size={20} color={isDateFilterActive ? Colors.primary : Colors.textMain} />
             </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
             {filterOptions.map((opt, i) => (
                <TouchableOpacity key={i} style={{paddingHorizontal: 15, paddingVertical: 8, backgroundColor: activeFilter === opt ? Colors.textMain : Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: activeFilter === opt ? Colors.textMain : '#2A344A', marginRight: 10}} onPress={() => setActiveFilter(opt)}>
                   <Text style={{fontFamily: 'Orbitron_700Bold', fontSize: 10, color: activeFilter === opt ? Colors.background : Colors.textMuted}}>{opt}</Text>
                </TouchableOpacity>
             ))}
          </ScrollView>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
             <Text style={styles.historyTitle}>KONTRAK BERJALAN</Text>
             <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular'}}>Urutkan: Terbaru ∨</Text>
          </View>
          
          {filteredDebts.length === 0 ? (
             <Text style={styles.emptyText}>Tidak ada kontrak yang sesuai filter.</Text>
          ) : (
             filteredDebts.map((item, index) => {
               const p = (item.paidAmount / item.totalAmount) * 100;
               const isHutang = item.type === 'hutang';
               const iconColor = isHutang ? Colors.danger : Colors.success;
               const tagText = item.isAdvanced ? (isHutang ? 'PINJOL/KREDIT' : 'KREDITUR') : item.type.toUpperCase();
               
               const timeDiff = item.dueDateObj.getTime() - new Date().getTime();
               const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
               
               let badgeColor = Colors.success; let badgeText = "AMAN"; let badgeBg = 'rgba(0, 255, 102, 0.1)';
               if (item.status === 'completed') {
                  badgeColor = Colors.success; badgeText = "LUNAS"; badgeBg = 'rgba(0, 255, 102, 0.1)';
               } else {
                  if (daysDiff < 0) {
                     badgeColor = Colors.danger; badgeText = "TERLAMBAT"; badgeBg = 'rgba(255, 0, 60, 0.1)';
                  } else if (daysDiff <= 7) {
                     badgeColor = Colors.warning; badgeText = "JATUH TEMPO"; badgeBg = 'rgba(255, 215, 0, 0.1)';
                  }
               }

               let progressText = `${p.toFixed(0)}% Terbayar`;
               if (item.isAdvanced && item.installments) {
                   const paidCount = item.installments.filter(i => i.status === 'paid').length;
                   progressText += ` (${paidCount} / ${item.installments.length} termin)`;
               } else {
                   progressText += ` (Basic)`;
               }

               return (
                 <TouchableOpacity key={item.id} activeOpacity={0.8} onPress={() => {setSelectedDebt(item); setShowPayModal(true);}} onLongPress={() => handleDeleteDebt(item)}>
                    <Animated.View entering={FadeInUp.delay(index * 50)} style={{backgroundColor: Colors.surface, borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#2A344A'}}>
                       
                       <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15}}>
                          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                             <View style={{width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: iconColor, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 12}}>
                                <Ionicons name={isHutang ? 'arrow-down' : 'arrow-up'} size={18} color={iconColor} />
                             </View>
                             <View style={{flex: 1}}>
                                <Text style={{fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 14}} numberOfLines={1}>{item.personName}</Text>
                                <Text style={{fontFamily: 'Orbitron_700Bold', color: iconColor, fontSize: 9, marginTop: 4}}>{tagText}</Text>
                             </View>
                          </View>
                          <View style={{alignItems: 'flex-end', marginLeft: 10}}>
                             <Text style={{fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 9, marginBottom: 2}}>Total Tagihan</Text>
                             <Text style={{fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 13}}>{formatRp(item.totalAmount)}</Text>
                          </View>
                       </View>
                       
                       <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_700Bold', marginBottom: 6}}>{progressText}</Text>
                       <View style={[styles.budgetTrackBg, {height: 8, marginBottom: 12, backgroundColor: Colors.background}]}>
                         <View style={[styles.budgetTrackFill, { width: `${p > 100 ? 100 : p}%`, backgroundColor: Colors.textMain }]} />
                       </View>
                       
                       <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                          <View>
                             <Text style={{fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 9, marginBottom: 2}}>Sisa Tagihan</Text>
                             <Text style={{fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 14}}>{formatRp(item.totalAmount - item.paidAmount)}</Text>
                             <View style={{backgroundColor: badgeBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: badgeColor, marginTop: 6, alignSelf: 'flex-start'}}>
                                <Text style={{color: badgeColor, fontSize: 8, fontFamily: 'Orbitron_700Bold'}}>{badgeText}</Text>
                             </View>
                          </View>
                          <View style={{alignItems: 'flex-end'}}>
                             <Text style={{fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 9, marginBottom: 4}}>
                                {item.status === 'completed' ? 'Lunas pada' : 'Jatuh Tempo'}
                             </Text>
                             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontFamily: 'Orbitron_400Regular', color: Colors.textMain, fontSize: 11, marginRight: 5}}>{item.dueDateObj.toLocaleDateString('id-ID')}</Text>
                                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                             </View>
                          </View>
                       </View>

                    </Animated.View>
                 </TouchableOpacity>
               )
             })
          )}
        </ScrollView>
      )}

      {}
      <Modal visible={showDateFilterModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, {padding: 20}]}>
             <Text style={styles.modalTitle}>FILTER JATUH TEMPO</Text>
             <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular', textAlign: 'center', marginBottom: 20}}>
               Tampilkan tagihan yang jatuh tempo di antara rentang tanggal ini:
             </Text>

             <View style={{marginBottom: 20, backgroundColor: 'rgba(0, 240, 255, 0.05)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#2A344A'}}>
                <Text style={[styles.inputLabel, {color: Colors.textMain}]}>DARI TANGGAL</Text>
                <TouchableOpacity style={[styles.inputPicker, {marginBottom: 15, height: 45}]} onPress={() => setShowFilterStartPicker(true)}>
                  <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12 }}>{filterStartDate.toLocaleDateString('id-ID')}</Text>
                  <Ionicons name="calendar" size={16} color={Colors.primary} />
                </TouchableOpacity>
                {showFilterStartPicker && (<DateTimePicker value={filterStartDate} mode="date" display="default" onChange={(e, d) => { setShowFilterStartPicker(Platform.OS === 'ios'); if(d) setFilterStartDate(d); }} />)}

                <Text style={[styles.inputLabel, {color: Colors.textMain}]}>SAMPAI TANGGAL</Text>
                <TouchableOpacity style={[styles.inputPicker, {marginBottom: 0, height: 45}]} onPress={() => setShowFilterEndPicker(true)}>
                  <Text style={{ color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12 }}>{filterEndDate.toLocaleDateString('id-ID')}</Text>
                  <Ionicons name="calendar" size={16} color={Colors.primary} />
                </TouchableOpacity>
                {showFilterEndPicker && (<DateTimePicker value={filterEndDate} mode="date" display="default" onChange={(e, d) => { setShowFilterEndPicker(Platform.OS === 'ios'); if(d) setFilterEndDate(d); }} />)}
             </View>

             <TouchableOpacity style={[styles.button, {marginTop: 10}]} onPress={() => { setIsDateFilterActive(true); setShowDateFilterModal(false); }}>
               <Text style={styles.buttonText}>TERAPKAN FILTER</Text>
             </TouchableOpacity>
             
             {isDateFilterActive && (
                 <TouchableOpacity style={[styles.cleanActionBtn, {borderColor: Colors.danger, backgroundColor: 'rgba(255, 0, 60, 0.05)', marginTop: 15}]} onPress={() => { setIsDateFilterActive(false); setShowDateFilterModal(false); }}>
                   <Text style={{color: Colors.danger, fontFamily: 'Orbitron_700Bold', fontSize: 12}}>HAPUS FILTER</Text>
                 </TouchableOpacity>
             )}

             <TouchableOpacity style={[styles.modalCloseBtn, {marginTop: 15}]} onPress={() => setShowDateFilterModal(false)}>
               <Text style={styles.modalCloseText}>BATAL</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={[styles.modalContent, {paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
               <Text style={[styles.modalTitle, {marginBottom: 0}]}>BUAT KONTRAK BARU</Text>
               <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.textMuted} />
               </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              <View style={styles.modernToggleContainer}>
                <TouchableOpacity style={[styles.modernToggleBtn, {paddingVertical: 12, flexDirection: 'row', justifyContent: 'center'}, debtType === 'hutang' && { backgroundColor: 'rgba(255, 0, 60, 0.1)', borderColor: Colors.danger }]} onPress={() => setDebtType('hutang')}>
                  <Ionicons name="arrow-down" size={14} color={debtType === 'hutang' ? Colors.danger : Colors.textMuted} style={{marginRight: 6}} />
                  <Text style={[styles.modernToggleText, {fontSize: 10}, debtType === 'hutang' && {color: Colors.danger}]}>SAYA BERHUTANG</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modernToggleBtn, {paddingVertical: 12, flexDirection: 'row', justifyContent: 'center'}, debtType === 'piutang' && { backgroundColor: 'rgba(0, 255, 102, 0.1)', borderColor: Colors.success }]} onPress={() => setDebtType('piutang')}>
                  <Ionicons name="arrow-up" size={14} color={debtType === 'piutang' ? Colors.success : Colors.textMuted} style={{marginRight: 6}} />
                  <Text style={[styles.modernToggleText, {fontSize: 10}, debtType === 'piutang' && {color: Colors.success}]}>MEMBERI PINJAMAN</Text>
                </TouchableOpacity>
              </View>

              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: isAdvancedMode ? Colors.primary : '#2A344A', backgroundColor: isAdvancedMode ? 'rgba(0, 240, 255, 0.05)' : Colors.background, marginBottom: 20}}>
                 <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Ionicons name="wallet-outline" size={24} color={isAdvancedMode ? Colors.primary : Colors.textMuted} style={{marginRight: 15}} />
                    <View style={{flex: 1, paddingRight: 10}}>
                       <Text style={{color: isAdvancedMode ? Colors.primary : Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 11, marginBottom: 4}}>KREDIT ADVANCED</Text>
                       <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 9}}>Aktifkan untuk pinjaman dari Bank atau Pinjol</Text>
                    </View>
                 </View>
                 <Switch trackColor={{ false: '#2A344A', true: 'rgba(0, 240, 255, 0.5)' }} thumbColor={isAdvancedMode ? Colors.primary : '#8B949E'} onValueChange={setIsAdvancedMode} value={isAdvancedMode} style={{transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }]}} />
              </View>

              <Text style={styles.inputLabel}>{isAdvancedMode ? 'NAMA LEMBAGA KREDIT / BANK' : 'NAMA PIHAK KEDUA'}</Text>
              <View style={styles.inputWithIconWrapper}>
                 <Ionicons name="person-outline" size={18} color={Colors.primary} style={{marginRight: 10}} />
                 <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12}} placeholder={isAdvancedMode ? "Bank BCA / Akulaku" : "Masukkan nama pihak kedua"} placeholderTextColor={Colors.textMuted} value={personName} onChangeText={setPersonName} />
              </View>
              
              {isAdvancedMode ? (
                 <>
                   <Text style={styles.inputLabel}>PLAFON (NOMINAL PENGAJUAN)</Text>
                   <View style={styles.inputWithIconWrapper}>
                      <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', marginRight: 10, fontSize: 14}}>Rp</Text>
                      <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 14}} placeholder="Contoh: 1500000" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={plafon} onChangeText={(val) => setPlafon(val.replace(/[^0-9.]/g, ''))} />
                   </View>
                   
                   <Text style={styles.inputLabel}>NOMINAL CAIR (DITERIMA BERSIH)</Text>
                   <View style={styles.inputWithIconWrapper}>
                      <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', marginRight: 10, fontSize: 14}}>Rp</Text>
                      <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 14}} placeholder="Contoh: 1450000" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={cair} onChangeText={(val) => setCair(val.replace(/[^0-9.]/g, ''))} />
                   </View>
                   
                   <Text style={styles.inputLabel}>TOTAL PENGEMBALIAN (POKOK + BUNGA)</Text>
                   <View style={styles.inputWithIconWrapper}>
                      <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', marginRight: 10, fontSize: 14}}>Rp</Text>
                      <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 14}} placeholder="Contoh: 1750000" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={totalKembali} onChangeText={(val) => setTotalKembali(val.replace(/[^0-9.]/g, ''))} />
                   </View>
                   
                   <Text style={styles.inputLabel}>TENOR (BULAN)</Text>
                   <View style={styles.inputWithIconWrapper}>
                      <Ionicons name="calendar-outline" size={18} color={Colors.primary} style={{marginRight: 10}} />
                      <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12}} placeholder="Contoh: 6" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={3} value={tenor} onChangeText={(val) => setTenor(val.replace(/[^0-9.]/g, ''))} />
                   </View>
                 </>
              ) : (
                 <>
                   <Text style={styles.inputLabel}>NOMINAL KONTRAK</Text>
                   <View style={styles.inputWithIconWrapper}>
                      <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', marginRight: 10, fontSize: 14}}>Rp</Text>
                      <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 14}} placeholder="Masukkan nominal kontrak" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={totalAmount} onChangeText={(val) => setTotalAmount(val.replace(/[^0-9.]/g, ''))} />
                   </View>
                 </>
              )}
              
              <Text style={styles.inputLabel}>UANG MASUK/KELUAR DARI DOMPET</Text>
              <TouchableOpacity style={[styles.inputWithIconWrapper, {justifyContent: 'space-between'}]} onPress={() => setShowDebtWalletModal(true)}>
                 <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="wallet-outline" size={18} color={Colors.primary} style={{marginRight: 10}} />
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 12}}>{targetWallet}</Text>
                 </View>
                 <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                 <View style={{flex: 1, marginRight: 5}}>
                    <Text style={styles.inputLabel}>TANGGAL MULAI</Text>
                    <TouchableOpacity style={[styles.inputWithIconWrapper, {justifyContent: 'space-between', paddingHorizontal: 10}]} onPress={() => setShowStartDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.primary} style={{marginRight: 6}} />
                      <Text style={{ flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 10 }}>{startDate.toLocaleDateString('id-ID')}</Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker value={startDate} mode="date" display="default" onChange={(e, d) => { setShowStartDatePicker(Platform.OS === 'ios'); if(d) setStartDate(d); }} />
                    )}
                 </View>
                 <View style={{flex: 1, marginLeft: 5}}>
                    <Text style={styles.inputLabel} numberOfLines={1}>AKHIR JATUH TEMPO</Text>
                    <TouchableOpacity style={[styles.inputWithIconWrapper, {justifyContent: 'space-between', paddingHorizontal: 10}]} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.primary} style={{marginRight: 6}} />
                      <Text style={{ flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 10 }}>{dueDate.toLocaleDateString('id-ID')}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (<DateTimePicker value={dueDate} mode="date" display="default" minimumDate={startDate} onChange={(e, d) => { setShowDatePicker(Platform.OS === 'ios'); if(d) setDueDate(d); }} />)}
                 </View>
              </View>

              <View style={{backgroundColor: 'rgba(0, 240, 255, 0.02)', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#2A344A', marginBottom: 20}}>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <Ionicons name="document-text-outline" size={18} color={Colors.primary} style={{marginRight: 8}} />
                    <View>
                       <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>RINGKASAN KONTRAK</Text>
                       <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 8}}>Akan ditampilkan setelah data diisi</Text>
                    </View>
                 </View>
                 
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                    <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>• Pihak Kedua</Text>
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>{personName || '-'}</Text>
                 </View>
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                    <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>• Nominal Kontrak</Text>
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>{isAdvancedMode ? (totalKembali ? formatRp(totalKembali) : '-') : (totalAmount ? formatRp(totalAmount) : '-')}</Text>
                 </View>
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12}}>
                    <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>• Dompet</Text>
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>{targetWallet}</Text>
                 </View>
                 
                 <View style={[styles.dashedDivider, {marginVertical: 5, marginBottom: 12}]} />
                 
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                    <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>• Tanggal Mulai</Text>
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>{startDate.toLocaleDateString('id-ID')}</Text>
                 </View>
                 <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>• Tanggal Akhir Jatuh Tempo</Text>
                    <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>{dueDate.toLocaleDateString('id-ID')}</Text>
                 </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginRight: 5, backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.textMuted}]} onPress={() => setShowAddModal(false)}>
                   <Text style={[styles.buttonText, {color: Colors.textMuted, fontSize: 12}]}>BATAL</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.button, {flex: 1, marginLeft: 5}]} onPress={handleSaveDebt} disabled={isProcessing}>
                   {isProcessing ? <ActivityIndicator color={Colors.background} /> : <Text style={[styles.buttonText, {fontSize: 12}]}>BUAT KONTRAK</Text>}
                 </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showDebtWalletModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PILIH DOMPET</Text>
            {SUMBER_DANA.map((item, i) => ( 
              <TouchableOpacity key={i} style={[styles.modalItem, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => {setTargetWallet(item.label); setShowDebtWalletModal(false);}}>
                <Ionicons name={item.icon} size={20} color={Colors.primary} style={{marginRight: 15}}/>
                <Text style={styles.modalItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowDebtWalletModal(false)}>
              <Text style={styles.modalCloseText}>BATAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPayModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={[styles.modalContent, selectedDebt?.isAdvanced && selectedDebt?.installments ? { maxHeight: '90%', padding: 20 } : {}]}>
            
            {selectedDebt?.isAdvanced && selectedDebt?.installments ? (
              <View style={{ width: '100%', flexShrink: 1 }}>
                <Text style={styles.modalTitle}>MATRIX INSTALLMENT GRID</Text>
                <Text style={{color: Colors.textMuted, marginBottom: 15, fontFamily: 'Orbitron_400Regular', textAlign: 'center'}}>{selectedDebt?.personName} ({selectedDebt?.tenor} Bulan)</Text>
                
                <View style={{backgroundColor: 'rgba(0, 240, 255, 0.05)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#2A344A', marginBottom: 20}}>
                   <Text style={[styles.inputLabel, {marginBottom: 10}]}>SUMBER DANA UNTUK PEMBAYARAN TERMIN</Text>
                   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight: 45}}>
                     {SUMBER_DANA.map((w,i)=>( 
                       <TouchableOpacity key={i} style={[styles.modernToggleBtn, {marginRight: 10, width: 100, height: 40, paddingVertical: 0, justifyContent: 'center'}, payWallet === w.label && {borderColor: Colors.primary, backgroundColor: 'rgba(0, 240, 255, 0.1)'}]} onPress={()=>setPayWallet(w.label)}>
                         <Text style={[styles.modernToggleText, {textAlign: 'center', fontSize: 9}, payWallet === w.label && {color: Colors.primary}]}>{w.label}</Text>
                       </TouchableOpacity> 
                     ))}
                   </ScrollView>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                  {(() => {
                    const currentUnpaidIndex = selectedDebt.installments.findIndex(inst => inst.status === 'unpaid');
                    
                    return selectedDebt.installments.map((inst, index) => {
                      const isPaid = inst.status === 'paid';
                      const isCurrent = index === currentUnpaidIndex;
                      const isLocked = !isPaid && !isCurrent;
                      
                      const dueDateObj = new Date(inst.dueDate);
                      const isOverdue = !isPaid && (dueDateObj < new Date());

                      let cardBorderColor = '#2A344A'; 
                      let cardBgColor = 'transparent';
                      let iconName = 'lock-closed';
                      let iconColor = Colors.textMuted;
                      let statusText = 'LOCKED';

                      if (isPaid) {
                        cardBorderColor = Colors.success;
                        cardBgColor = 'rgba(0, 255, 102, 0.05)';
                        iconName = 'checkmark-circle';
                        iconColor = Colors.success;
                        statusText = 'PAID (LUNAS)';
                      } else if (isCurrent && isOverdue) {
                        cardBorderColor = Colors.danger;
                        cardBgColor = 'rgba(255, 0, 60, 0.1)';
                        iconName = 'warning';
                        iconColor = Colors.danger;
                        statusText = 'OVERDUE (TERLEWAT)';
                      } else if (isCurrent) {
                        cardBorderColor = Colors.primary;
                        cardBgColor = 'rgba(0, 240, 255, 0.1)';
                        iconName = 'flash';
                        iconColor = Colors.primary;
                        statusText = 'CURRENT (AKTIF)';
                      }

                      return (
                        <View key={inst.id} style={{
                          borderColor: cardBorderColor, borderWidth: 1, backgroundColor: cardBgColor,
                          padding: 12, borderRadius: 12, marginBottom: 10, opacity: isLocked ? 0.6 : 1
                        }}>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <View>
                              <Text style={{fontFamily: 'Orbitron_700Bold', color: isPaid ? Colors.textMuted : Colors.textMain, fontSize: 13, textDecorationLine: isPaid ? 'line-through' : 'none'}}>
                                Termin {inst.term}
                              </Text>
                              <Text style={{fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 9, marginTop: 2}}>
                                Tempo: {dueDateObj.toLocaleDateString('id-ID')}
                              </Text>
                            </View>
                            <View style={{alignItems: 'flex-end'}}>
                              <Text style={{fontFamily: 'Orbitron_700Bold', color: isPaid ? Colors.textMuted : Colors.primary, fontSize: 13, textDecorationLine: isPaid ? 'line-through' : 'none'}}>
                                {formatRp(inst.amount)}
                              </Text>
                              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                                <Ionicons name={iconName} size={12} color={iconColor} style={{marginRight: 4}} />
                                <Text style={{fontFamily: 'Orbitron_700Bold', color: iconColor, fontSize: 9}}>{statusText}</Text>
                              </View>
                            </View>
                          </View>
                          
                          {isCurrent && (
                             <TouchableOpacity 
                                style={[styles.button, {height: 40, marginTop: 15, backgroundColor: isOverdue ? Colors.danger : Colors.primary}]} 
                                onPress={() => handlePayAdvancedTerm(inst.id, inst.amount)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? <ActivityIndicator color={Colors.background} /> : <Text style={[styles.buttonText, {fontSize: 12}]}>BAYAR TERMIN INI</Text>}
                             </TouchableOpacity>
                          )}
                        </View>
                      );
                    });
                  })()}
                </ScrollView>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowPayModal(false)}>
                  <Text style={styles.modalCloseText}>TUTUP GRID</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>{selectedDebt?.type === 'hutang' ? 'BAYAR CICILAN' : 'TERIMA CICILAN'}</Text>
                <Text style={{color: Colors.textMuted, marginBottom: 15, fontFamily: 'Orbitron_400Regular'}}>Kontrak: {selectedDebt?.personName}</Text>
                
                <Text style={styles.inputLabel}>SUMBER/TUJUAN DANA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
                  {SUMBER_DANA.map((w,i)=>( 
                    <TouchableOpacity key={i} style={[styles.modernToggleBtn, {marginRight: 10, width: 100}, payWallet === w.label && {borderColor: Colors.primary, backgroundColor: 'rgba(0, 240, 255, 0.1)'}]} onPress={()=>setPayWallet(w.label)}>
                      <Text style={[styles.modernToggleText, {textAlign: 'center', fontSize: 9}, payWallet === w.label && {color: Colors.primary}]}>{w.label}</Text>
                    </TouchableOpacity> 
                  ))}
                </ScrollView>
                
                <Text style={styles.inputLabel}>NOMINAL CICILAN</Text>
                <View style={styles.inputWithAction}>
                  <TextInput style={{ flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular' }} placeholder="Rp 0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={payAmount} onChangeText={(val) => setPayAmount(val.replace(/[^0-9.]/g, ''))} />
                  <TouchableOpacity onPress={() => { if(selectedDebt) setPayAmount((selectedDebt.totalAmount - selectedDebt.paidAmount).toString()) }} style={{backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary}}>
                    <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>LUNASI</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.button} onPress={handlePayDebt} disabled={isProcessing}>
                  {isProcessing ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.buttonText}>PROSES TRANSAKSI</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowPayModal(false)}>
                  <Text style={styles.modalCloseText}>TUTUP</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

function SettingsScreen() {
  const user = auth.currentUser;
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetBulananInput, setBudgetBulananInput] = useState('');
  const [envelopes, setEnvelopes] = useState([]);
  const [envName, setEnvName] = useState('');
  const [envLimit, setEnvLimit] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [showEnvCatModal, setShowEnvCatModal] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  
  const [showAddEnvUI, setShowAddEnvUI] = useState(false);

  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchBio = async () => {
      const bioStatus = await AsyncStorage.getItem('biometricEnabled');
      setIsBiometricEnabled(bioStatus === 'true');
    }
    fetchBio();
    
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', user.uid), (docSnap) => {
       if (docSnap.exists()) {
          const data = docSnap.data();
          if(data.budgetLimit !== undefined) setBudgetInput(data.budgetLimit.toString());
          if(data.budgetBulananLimit !== undefined) setBudgetBulananInput(data.budgetBulananLimit.toString());
          if(data.envelopes) setEnvelopes(data.envelopes);
          if(data.customCategories) setCustomCategories(data.customCategories);
       }
    });
    return () => unsubscribeSettings();
  }, [user]);

  const toggleBiometric = async (value) => {
    const promptMsg = value ? 'Verifikasi untuk Mengaktifkan Kunci' : 'Verifikasi untuk Mematikan Kunci';
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: promptMsg, fallbackLabel: 'Gunakan Sandi' });
    
    if (result.success) {
      setIsBiometricEnabled(value);
      await AsyncStorage.setItem('biometricEnabled', value.toString());
    } else {
      Alert.alert("Dibatalkan", "Otorisasi Sidik Jari / Sandi gagal atau dibatalkan.");
    }
  };

  const handleSaveBudgetGlobal = async () => {
     try {
       await setDoc(doc(db, 'settings', user.uid), { 
         budgetLimit: parseFloat(budgetInput || 0),
         budgetBulananLimit: parseFloat(budgetBulananInput || 0)
       }, { merge: true });
       Alert.alert('Sukses', 'Sistem Budget Ganda diperbarui!');
     } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleResetBudgetGlobal = async () => {
     try {
       await setDoc(doc(db, 'settings', user.uid), { budgetLimit: 0, budgetBulananLimit: 0 }, { merge: true });
       setBudgetInput('0');
       setBudgetBulananInput('0');
       Alert.alert('Berhasil', 'Budget Global & Bulanan telah di-reset ke 0.');
     } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleAddEnvelope = async () => {
     if(!envName.trim() || !envLimit) return Alert.alert("Error", "Kategori amplop dan limit wajib diisi!");
     const newEnv = { name: envName.trim(), limit: parseFloat(envLimit) };
     const newEnvelopesArr = [...envelopes, newEnv];
     
     setEnvelopes(newEnvelopesArr);
     setEnvName(''); setEnvLimit(''); setShowAddEnvUI(false);
     
     try {
       await setDoc(doc(db, 'settings', user.uid), { envelopes: newEnvelopesArr }, { merge: true });
     } catch(e) { Alert.alert('Error', e.message); }
  };

  const handleRemoveEnvelope = async (index) => {
     const newEnvelopesArr = envelopes.filter((_, i) => i !== index);
     setEnvelopes(newEnvelopesArr);
     
     try {
       await setDoc(doc(db, 'settings', user.uid), { envelopes: newEnvelopesArr }, { merge: true });
     } catch(e) { Alert.alert('Error', e.message); }
  };

  const handleLogout = () => signOut(auth).catch((error) => Alert.alert('Error', error.message));

  const handleDeleteAccount = () => {
    Alert.alert(
      "HAPUS AKUN PERMANEN",
      "Peringatan: Seluruh akses Anda akan dihapus dan tidak bisa dikembalikan. Yakin ingin menghapus akun?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "HAPUS AKUN", style: "destructive", 
          onPress: async () => {
             try {
                await deleteUser(user);
             } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                   Alert.alert("Keamanan Sistem", "Demi keamanan, sistem menolak aksi ini. Silakan Logout dan Login kembali untuk memverifikasi identitas Anda sebelum menghapus akun.");
                } else {
                   Alert.alert("Error", error.message);
                }
             }
          }
        }
      ]
    );
  };
  
  const handleChangePassword = async () => {
     if (!oldPwd || !newPwd) return Alert.alert('Error', 'Sandi lama dan sandi baru wajib diisi!');
     if (newPwd.length < 6) return Alert.alert('Error', 'Sandi baru minimal 6 karakter!');
     
     setIsChangingPwd(true);
     try {
        const credential = EmailAuthProvider.credential(user.email, oldPwd);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPwd);
        
        Alert.alert('Sukses', 'Sandi berhasil diperbarui secara aman!');
        setShowChangePwdModal(false);
        setOldPwd(''); setNewPwd('');
     } catch (error) {
        let msg = error.message;
        if (error.code === 'auth/invalid-credential') msg = 'Sandi lama yang Anda masukkan salah.';
        Alert.alert('Gagal Mengubah Sandi', msg);
     } finally {
        setIsChangingPwd(false);
     }
  };

  const handleForgotOldPassword = async () => {
     try {
        await sendPasswordResetEmail(auth, user.email);
        Alert.alert('Email Terkirim', `Tautan untuk mengatur ulang sandi telah dikirim ke email: ${user.email}. Silakan periksa kotak masuk atau folder spam Anda.`);
        setShowChangePwdModal(false);
     } catch (e) {
        Alert.alert('Error', e.message);
     }
  };

  const combinedCategories = [...KATEGORI_PILIHAN.pengeluaran, ...customCategories.filter(c => c.type === 'pengeluaran')];
  
  const getCategoryIcon = (catName) => {
    const defaultCat = KATEGORI_PILIHAN.pengeluaran.find(c => c.label === catName);
    if (defaultCat) return defaultCat.icon;
    const customCat = customCategories.find(c => c.label === catName);
    if (customCat) return customCat.icon;
    return 'mail'; 
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.containerScreen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerDashboard}>
          <View>
            <Text style={styles.headerTitle}>FIN-X PENGATURAN</Text>
            <Text style={styles.headerSubtitle}>Kelola akun, keamanan, budget dan preferensi</Text>
          </View>
        </View>
        
        <Animated.View entering={FadeInUp.delay(100)} style={styles.settingsCard}>
          <View style={styles.settingsHeaderRow}>
             <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMain} style={{marginRight: 8}}/>
             <Text style={styles.settingsCardTitle}>KEAMANAN AKUN</Text>
          </View>
          
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#2A344A'}}>
             <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <View style={{width: 35, height: 35, borderRadius: 8, backgroundColor: 'rgba(0, 240, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                   <Ionicons name="finger-print" size={20} color={Colors.primary}/>
                </View>
                <View style={{flex: 1, paddingRight: 10}}>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 11}}>KUNCI BIOMETRIK</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular'}}>Gunakan sidik jari untuk mengamankan aplikasi</Text>
                </View>
             </View>
             <Switch trackColor={{ false: '#2A344A', true: 'rgba(0, 240, 255, 0.5)' }} thumbColor={isBiometricEnabled ? Colors.primary : '#8B949E'} onValueChange={toggleBiometric} value={isBiometricEnabled} style={{transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]}}/>
          </View>

          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}} onPress={() => setShowChangePwdModal(true)}>
             <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <View style={{width: 35, height: 35, borderRadius: 8, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                   <Ionicons name="key-outline" size={20} color={Colors.warning}/>
                </View>
                <View style={{flex: 1}}>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 11}}>UBAH SANDI</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular'}}>Ubah sandi login untuk keamanan akun</Text>
                </View>
             </View>
             <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)} style={styles.settingsCard}>
          <View style={styles.settingsHeaderRow}>
             <Ionicons name="wallet-outline" size={18} color={Colors.textMain} style={{marginRight: 8}}/>
             <Text style={styles.settingsCardTitle}>LIMIT BUDGET SISTEM</Text>
          </View>

          <Text style={styles.inputLabel}>BUDGET TAHUNAN</Text>
          <View style={[styles.inputWithAction, {height: 40, marginBottom: 15}]}>
             <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_700Bold', marginRight: 10}}>Rp</Text>
             <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', textAlign: 'right'}} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={budgetInput} onChangeText={(val) => setBudgetInput(val.replace(/[^0-9.]/g, ''))} />
          </View>
          
          <Text style={styles.inputLabel}>BUDGET BULANAN</Text>
          <View style={[styles.inputWithAction, {height: 40, marginBottom: 15}]}>
             <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_700Bold', marginRight: 10}}>Rp</Text>
             <TextInput style={{flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', textAlign: 'right'}} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={budgetBulananInput} onChangeText={(val) => setBudgetBulananInput(val.replace(/[^0-9.]/g, ''))} />
          </View>
          
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             <TouchableOpacity onPress={handleSaveBudgetGlobal} style={{flex: 1, backgroundColor: 'rgba(0, 240, 255, 0.1)', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, marginRight: 10}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Ionicons name="save-outline" size={14} color={Colors.primary} style={{marginRight: 6}}/>
                   <Text style={{color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>SIMPAN PERUBAHAN</Text>
                </View>
             </TouchableOpacity>
             <TouchableOpacity onPress={handleResetBudgetGlobal} style={{flex: 0.5, backgroundColor: 'rgba(255, 0, 60, 0.1)', borderWidth: 1, borderColor: Colors.danger, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Ionicons name="refresh-outline" size={14} color={Colors.danger} style={{marginRight: 6}}/>
                   <Text style={{color: Colors.danger, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>RESET</Text>
                </View>
             </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.settingsCard}>
          <View style={[styles.settingsHeaderRow, {justifyContent: 'space-between'}]}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Ionicons name="mail-outline" size={18} color={Colors.textMain} style={{marginRight: 8}}/>
                 <Text style={styles.settingsCardTitle}>SISTEM AMPLOP ZBB</Text>
             </View>
             <TouchableOpacity onPress={() => Alert.alert('Info', 'Zero-Based Budgeting: Beri tugas pada setiap rupiah Anda dengan membuat limit per kategori.')}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted}/>
             </TouchableOpacity>
          </View>
          <Text style={{color: Colors.textMuted, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginBottom: 15}}>Atur amplop dan limit setiap kategori sesuai metode Zero-Based Budgeting.</Text>

          {envelopes.map((env, index) => (
            <View key={index} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2A344A'}}>
               <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Ionicons name={getCategoryIcon(env.name)} size={16} color={Colors.textMuted} style={{marginRight: 15, width: 20, textAlign: 'center'}}/>
                 <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 11}}>{env.name}</Text>
               </View>
               <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_400Regular', fontSize: 11, marginRight: 15}}>{formatRp(env.limit)}</Text>
                 <TouchableOpacity onPress={() => handleRemoveEnvelope(index)}>
                   <Ionicons name="trash-outline" size={16} color={Colors.danger}/>
                 </TouchableOpacity>
               </View>
            </View>
          ))}

          {showAddEnvUI ? (
             <Animated.View entering={FadeInDown} style={{marginTop: 15, backgroundColor: 'rgba(0, 240, 255, 0.05)', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#2A344A'}}>
                <View style={{flexDirection: 'row', marginBottom: 10}}>
                  <TouchableOpacity style={[styles.inputPicker, {flex: 1, marginRight: 5, marginBottom: 0, height: 40, paddingHorizontal: 10}]} onPress={() => setShowEnvCatModal(true)}>
                    <Text style={{ color: envName ? Colors.textMain : Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 10 }} numberOfLines={1}>{envName ? envName : "Kategori..."}</Text>
                    <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
                  </TouchableOpacity>
                  <TextInput style={[styles.input, {flex: 1, marginBottom: 0, height: 40, marginLeft: 5, fontSize: 12}]} placeholder="Limit (Rp)" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={13} value={envLimit} onChangeText={(val) => setEnvLimit(val.replace(/[^0-9.]/g, ''))}/>
                </View>
                <View style={{flexDirection: 'row'}}>
                   <TouchableOpacity style={{flex: 1, backgroundColor: Colors.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginRight: 5}} onPress={handleAddEnvelope}>
                     <Text style={{color: Colors.background, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>SIMPAN</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={{flex: 1, backgroundColor: 'transparent', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.danger, alignItems: 'center', marginLeft: 5}} onPress={() => setShowAddEnvUI(false)}>
                     <Text style={{color: Colors.danger, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>BATAL</Text>
                   </TouchableOpacity>
                </View>
             </Animated.View>
          ) : (
             <TouchableOpacity style={{borderStyle: 'dashed', borderWidth: 1, borderColor: '#2A344A', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15}} onPress={() => setShowAddEnvUI(true)}>
               <Text style={{color: Colors.textMuted, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>+ TAMBAH AMPLOP BARU</Text>
             </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250)} style={styles.settingsCard}>
          <View style={styles.settingsHeaderRow}>
             <Ionicons name="settings-outline" size={18} color={Colors.textMain} style={{marginRight: 8}}/>
             <Text style={styles.settingsCardTitle}>PREFERENSI APLIKASI</Text>
          </View>
          
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A344A'}}>
             <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Ionicons name="moon-outline" size={18} color={Colors.textMuted} style={{marginRight: 12}}/>
                <View>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>TEMA</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 8, fontFamily: 'Orbitron_400Regular'}}>Mode gelap</Text>
                </View>
             </View>
             <View style={{borderWidth: 1, borderColor: '#2A344A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: Colors.textMain, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginRight: 5}}>Gelap</Text>
                <Ionicons name="chevron-down" size={10} color={Colors.textMuted} />
             </View>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A344A'}}>
             <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Ionicons name="globe-outline" size={18} color={Colors.textMuted} style={{marginRight: 12}}/>
                <View>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>BAHASA</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 8, fontFamily: 'Orbitron_400Regular'}}>Bahasa Indonesia</Text>
                </View>
             </View>
             <View style={{borderWidth: 1, borderColor: '#2A344A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: Colors.textMain, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginRight: 5}}>Indonesia</Text>
                <Ionicons name="chevron-down" size={10} color={Colors.textMuted} />
             </View>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A344A'}}>
             <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Ionicons name="cash-outline" size={18} color={Colors.textMuted} style={{marginRight: 12}}/>
                <View>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>MATA UANG UTAMA</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 8, fontFamily: 'Orbitron_400Regular'}}>Rupiah (IDR)</Text>
                </View>
             </View>
             <View style={{borderWidth: 1, borderColor: '#2A344A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: Colors.textMain, fontSize: 9, fontFamily: 'Orbitron_400Regular', marginRight: 5}}>IDR - Rp</Text>
                <Ionicons name="chevron-down" size={10} color={Colors.textMuted} />
             </View>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12}}>
             <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Ionicons name="notifications-outline" size={18} color={Colors.textMuted} style={{marginRight: 12}}/>
                <View>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>NOTIFIKASI</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 8, fontFamily: 'Orbitron_400Regular'}}>Kelola pengingat & notifikasi</Text>
                </View>
             </View>
             <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.settingsCard}>
          <View style={styles.settingsHeaderRow}>
             <Ionicons name="cloud-upload-outline" size={18} color={Colors.textMain} style={{marginRight: 8}}/>
             <Text style={styles.settingsCardTitle}>DATA & CADANGAN</Text>
          </View>
          
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A344A'}} onPress={() => Alert.alert('Info', 'Fitur segera hadir.')}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="cloud-download-outline" size={18} color={Colors.textMuted} style={{marginRight: 12}}/>
                <View>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>CADANGAN DATA</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 8, fontFamily: 'Orbitron_400Regular'}}>Backup data ke cloud</Text>
                </View>
             </View>
             <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A344A'}} onPress={() => Alert.alert('Info', 'Fitur segera hadir.')}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="refresh-circle-outline" size={18} color={Colors.textMuted} style={{marginRight: 12}}/>
                <View>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>PULIHKAN DATA</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 8, fontFamily: 'Orbitron_400Regular'}}>Pulihkan data dari cadangan</Text>
                </View>
             </View>
             <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12}} onPress={() => Alert.alert('Info', 'Untuk saat ini ekspor PDF bisa dilakukan di menu Analitik.')}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="download-outline" size={18} color={Colors.textMuted} style={{marginRight: 12}}/>
                <View>
                   <Text style={{color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 10}}>EKSPOR DATA</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 8, fontFamily: 'Orbitron_400Regular'}}>Ekspor data ke file (CSV / PDF)</Text>
                </View>
             </View>
             <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350)} style={styles.settingsCard}>
          <View style={styles.settingsHeaderRow}>
             <Ionicons name="person-outline" size={18} color={Colors.textMain} style={{marginRight: 8}}/>
             <Text style={styles.settingsCardTitle}>AKUN</Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
             <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 45, borderRadius: 8, borderWidth: 1, borderColor: '#2A344A', marginRight: 5, backgroundColor: Colors.surface}} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
                <Text style={{ color: Colors.textMuted, fontFamily: 'Orbitron_700Bold', fontSize: 10 }}>LOGOUT</Text>
             </TouchableOpacity>

             <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 45, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 0, 60, 0.3)', marginLeft: 5, backgroundColor: 'rgba(255, 0, 60, 0.05)'}} onPress={handleDeleteAccount}>
                <Ionicons name="trash-outline" size={16} color={Colors.danger} style={{ marginRight: 8 }} />
                <Text style={{ color: Colors.danger, fontFamily: 'Orbitron_700Bold', fontSize: 10 }}>HAPUS AKUN</Text>
             </TouchableOpacity>
          </View>
          
          <Text style={{textAlign: 'center', color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 8, paddingHorizontal: 20}}>
             Menghapus akun akan menghilangkan semua data secara permanen dan tidak dapat dikembalikan.
          </Text>
        </Animated.View>

      </ScrollView>

      {}
      <Modal visible={showEnvCatModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PILIH KATEGORI AMPLOP</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {combinedCategories.map((item, i) => (
                <TouchableOpacity key={i} style={[styles.modalItem, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => { setEnvName(item.label); setShowEnvCatModal(false); }}>
                  <Ionicons name={item.icon || 'pricetag'} size={20} color={Colors.primary} style={{marginRight: 15}}/>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEnvCatModal(false)}>
              <Text style={styles.modalCloseText}>BATAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showChangePwdModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>UBAH SANDI</Text>
            <Text style={{color: Colors.textMuted, fontSize: 10, fontFamily: 'Orbitron_400Regular', textAlign: 'center', marginBottom: 20}}>
              Verifikasi identitas dengan memasukkan sandi lama Anda.
            </Text>
            
            <Text style={styles.inputLabel}>SANDI LAMA</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="Masukkan Sandi Lama" placeholderTextColor={Colors.textMuted} value={oldPwd} onChangeText={setOldPwd} />
            
            <TouchableOpacity onPress={handleForgotOldPassword} style={{alignSelf: 'flex-end', marginTop: -15, marginBottom: 20}}>
               <Text style={{color: Colors.primary, fontFamily: 'Orbitron_400Regular', fontSize: 10}}>Lupa Sandi Lama? Reset via Email</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>SANDI BARU</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="Buat Sandi Baru (Min. 6 Karakter)" placeholderTextColor={Colors.textMuted} value={newPwd} onChangeText={setNewPwd} />
            
            <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={isChangingPwd}>
              {isChangingPwd ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.buttonText}>SIMPAN SANDI</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.modalCloseBtn, {marginTop: 15}]} onPress={() => { setShowChangePwdModal(false); setOldPwd(''); setNewPwd(''); }}>
              <Text style={styles.modalCloseText}>BATAL</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const Stack = createNativeStackNavigator(); 
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, 
        tabBarStyle: { 
          backgroundColor: Colors.surface, 
          borderTopWidth: 1, 
          borderTopColor: '#2A344A', 
          height: 70, 
          paddingBottom: 15,
          paddingTop: 5
        },
        tabBarActiveTintColor: Colors.primary, 
        tabBarInactiveTintColor: Colors.textMuted, 
        tabBarLabelStyle: { fontFamily: 'Orbitron_400Regular', fontSize: 9 },
      }}>
      
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
        }} 
      />
      
      <Tab.Screen 
        name="Debt" 
        component={DebtScreen} 
        options={{
          tabBarLabel: 'Debt',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />
        }} 
      />
      
      <Tab.Screen 
        name="Catat" 
        component={InputScreen} 
        options={{
          tabBarLabel: 'Tambah',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 55, height: 55, 
              backgroundColor: Colors.background, 
              borderRadius: 30, 
              justifyContent: 'center', alignItems: 'center',
              borderWidth: 2, borderColor: Colors.primary,
              marginTop: -25, 
              shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5
            }}>
              <Ionicons name="add" size={32} color={Colors.primary} />
            </View>
          )
        }} 
      />
      
      <Tab.Screen 
        name="Analitik" 
        component={AnalyticsScreen} 
        options={{
          tabBarLabel: 'Analitik',
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart" size={24} color={color} />
        }} 
      />
      
      <Tab.Screen 
        name="Setting" 
        component={SettingsScreen} 
        options={{
          tabBarLabel: 'Pengaturan',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({ Orbitron_400Regular, Orbitron_700Bold });
  const [user, setUser] = useState(null); 
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { 
      setUser(currentUser); 
      if (currentUser) {
        const bioStatus = await AsyncStorage.getItem('biometricEnabled');
        if (bioStatus === 'true') {
           const promptAuth = async () => {
             try {
               const result = await LocalAuthentication.authenticateAsync({ 
                 promptMessage: 'Buka FIN-X', 
                 fallbackLabel: 'Gunakan Sandi',
                 cancelLabel: 'Batal' 
               });
               if (result.success) {
                  setIsUnlocked(true);
               } else {
                  setIsUnlocked(false);
               }
             } catch (error) {
               setIsUnlocked(false);
             }
           };
           promptAuth();
        } else { 
           setIsUnlocked(true); 
        }
      }
      setIsAuthReady(true); 
    }); 
    return unsubscribe; 
  }, []);

  const handleManualUnlock = async () => {
     try {
       const result = await LocalAuthentication.authenticateAsync({ 
         promptMessage: 'Verifikasi Identitas', 
         fallbackLabel: 'Gunakan Sandi',
         cancelLabel: 'Batal'
       });
       if (result.success) {
         setIsUnlocked(true);
       }
     } catch (e) {}
  };

  if (!fontsLoaded || !isAuthReady) return (<View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>);
  if (user && !isUnlocked) return <LockedScreen onUnlock={handleManualUnlock} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user && isUnlocked ? (<Stack.Screen name="MainApp" component={MainTabNavigator} />) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="LupaSandi" component={ForgotPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  containerScreen: { flex: 1, backgroundColor: Colors.background, padding: 20, paddingTop: 50 },
  title: { fontFamily: 'Orbitron_700Bold', fontSize: 40, color: Colors.textMain, marginBottom: 5, letterSpacing: 2, textShadowColor: Colors.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontFamily: 'Orbitron_400Regular', color: Colors.primary, marginBottom: 40, fontSize: 12, letterSpacing: 1 },
  card: { width: '100%', backgroundColor: Colors.surface, padding: 25, borderRadius: 15, borderWidth: 1, borderColor: '#2A344A', elevation: 10, shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 15 },
  inputLabel: { fontFamily: 'Orbitron_700Bold', color: Colors.primary, fontSize: 10, marginBottom: 8, letterSpacing: 1, marginLeft: 5 },
  input: { height: 55, backgroundColor: Colors.background, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', paddingHorizontal: 15, borderRadius: 8, marginBottom: 25, borderWidth: 1, borderColor: '#2A344A' },
  
  inputWithAction: { flexDirection: 'row', alignItems: 'center', height: 45, backgroundColor: Colors.background, paddingHorizontal: 15, borderRadius: 8, marginBottom: 25, borderWidth: 1, borderColor: '#2A344A' },
  inputPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 45, backgroundColor: Colors.background, paddingHorizontal: 15, borderRadius: 8, marginBottom: 25, borderWidth: 1, borderColor: '#2A344A' },
  inputWithIconWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 8, borderWidth: 1, borderColor: '#2A344A', height: 45, paddingHorizontal: 12, marginBottom: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', height: 55, backgroundColor: Colors.background, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#2A344A' },
  passwordInput: { flex: 1, color: Colors.textMain, fontFamily: 'Orbitron_400Regular', paddingHorizontal: 15, height: '100%' },
  eyeIcon: { paddingHorizontal: 15, height: '100%', justifyContent: 'center' },
  button: { backgroundColor: Colors.primary, height: 55, justifyContent: 'center', borderRadius: 8, alignItems: 'center', marginTop: 10, shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  buttonText: { color: Colors.background, fontFamily: 'Orbitron_700Bold', fontSize: 16, letterSpacing: 1 },
  cleanActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 55, borderRadius: 12, borderWidth: 1 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 25 },
  linkText: { color: Colors.textMuted, fontFamily: 'Orbitron_400Regular', fontSize: 12 },
  linkTextPrimary: { color: Colors.primary, fontFamily: 'Orbitron_700Bold', fontSize: 14, marginTop: 10 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  modernToggleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, width: '100%' },
  modernToggleBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: '#2A344A', marginHorizontal: 5 },
  modernToggleText: { fontFamily: 'Orbitron_700Bold', fontSize: 12, color: Colors.textMuted },
  headerDashboard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontFamily: 'Orbitron_700Bold', fontSize: 18, color: Colors.primary, letterSpacing: 1 },
  headerSubtitle: { fontFamily: 'Orbitron_400Regular', fontSize: 10, color: Colors.textMuted },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(255,0,60,0.1)', borderRadius: 8, borderWidth: 1, borderColor: Colors.danger },
  
  balanceCard: { minHeight: 110, paddingVertical: 20, paddingHorizontal: 20, borderRadius: 15, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 15, backgroundColor: 'rgba(0, 240, 255, 0.05)' },
  balanceLabel: { fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 10, marginBottom: 5, letterSpacing: 1 },
  balanceAmount: { fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 36, textShadowColor: Colors.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  
  newBudgetCard: { backgroundColor: Colors.surface, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#2A344A', marginBottom: 15 },
  newBudgetTitle: { fontFamily: 'Orbitron_700Bold', fontSize: 12, color: Colors.textMain, marginBottom: 10, letterSpacing: 1 },
  newBudgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  newBudgetSubText: { fontFamily: 'Orbitron_400Regular', fontSize: 9, color: Colors.textMuted, marginBottom: 2 },
  newBudgetValue: { fontFamily: 'Orbitron_700Bold', fontSize: 16, color: Colors.textMain },
  newBudgetPerc: { fontFamily: 'Orbitron_700Bold', fontSize: 20 },
  newBudgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  verticalDivider: { width: 1, backgroundColor: '#2A344A' },
  dashedDivider: { width: '100%', height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#2A344A', marginVertical: 15, borderRadius: 1 },

  newSummaryCard: { backgroundColor: Colors.surface, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#2A344A', marginBottom: 20 },
  
  budgetTrackBg: { width: '100%', height: 10, backgroundColor: '#0B0F19', borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: '#2A344A' },
  budgetTrackFill: { height: '100%', borderRadius: 5 },
  
  walletGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 5 },
  walletMiniCard: { width: '48%', minHeight: 110, justifyContent: 'center', backgroundColor: Colors.surface, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#2A344A', marginBottom: 15, alignItems: 'center' },
  walletMiniTitle: { fontFamily: 'Orbitron_400Regular', fontSize: 10, color: Colors.textMuted, marginBottom: 5 },
  walletMiniAmount: { fontFamily: 'Orbitron_700Bold', fontSize: 12, color: Colors.primary, textAlign: 'center' },
  
  newGoalCard: { width: 200, padding: 15, marginRight: 15, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.5)', backgroundColor: Colors.surface },
  newAddGoalCard: { width: 120, marginRight: 10, padding: 15, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primary, backgroundColor: 'rgba(0, 240, 255, 0.05)' },
  goalTitle: { fontFamily: 'Orbitron_700Bold', fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#2A344A', marginBottom: 20 },
  monthSelectorText: { color: Colors.textMain, fontFamily: 'Orbitron_700Bold', fontSize: 14, letterSpacing: 1 },
  monthArrowBtn: { padding: 5 },

  historyContainer: { flex: 1, marginBottom: 20 },
  historyTitle: { fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 12, letterSpacing: 1 },
  emptyText: { fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, textAlign: 'center', marginTop: 20, fontSize: 12 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 15 },
  statCard: { flex: 1, alignItems: 'center' },
  statLabel: { fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 10, marginTop: 5, marginBottom: 2, textAlign: 'center' },
  statValue: { fontFamily: 'Orbitron_700Bold', fontSize: 14 },

  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A344A', backgroundColor: Colors.background },
  transactionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  transactionInfo: { flex: 1 },
  transactionCategory: { fontFamily: 'Orbitron_700Bold', color: Colors.textMain, fontSize: 14 },
  transactionDesc: { fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 10, marginTop: 4 },
  transactionAmountContainer: { alignItems: 'flex-end', marginLeft: 10 },
  transactionAmount: { fontFamily: 'Orbitron_700Bold', fontSize: 14 },

  settingsCard: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: '#2A344A', padding: 20, marginBottom: 20 },
  settingsHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#2A344A' },
  settingsCardTitle: { fontFamily: 'Orbitron_700Bold', fontSize: 12, color: Colors.textMain, letterSpacing: 1 },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(11, 15, 25, 0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: Colors.surface, borderRadius: 15, padding: 25, borderWidth: 1, borderColor: Colors.primary, maxHeight: '85%' },
  modalTitle: { fontFamily: 'Orbitron_700Bold', color: Colors.primary, fontSize: 16, textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2A344A' },
  modalItemText: { fontFamily: 'Orbitron_400Regular', color: Colors.textMain, fontSize: 14 },
  modalCloseBtn: { marginTop: 10, padding: 15, backgroundColor: 'rgba(255,0,60,0.1)', borderRadius: 8, borderWidth: 1, borderColor: Colors.danger },
  modalCloseText: { fontFamily: 'Orbitron_700Bold', color: Colors.danger, textAlign: 'center' },

  paginationContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2A344A' },
  pageBox: { width: 30, height: 30, borderWidth: 1, borderColor: '#2A344A', borderRadius: 5, justifyContent: 'center', alignItems: 'center', margin: 4, backgroundColor: 'transparent' },
  pageBoxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pageText: { fontFamily: 'Orbitron_400Regular', color: Colors.textMuted, fontSize: 10 },
  pageTextActive: { color: Colors.background, fontFamily: 'Orbitron_700Bold' },

  tooltipContainer: { position: 'absolute', backgroundColor: 'rgba(26, 34, 53, 0.95)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', zIndex: 100 }
});