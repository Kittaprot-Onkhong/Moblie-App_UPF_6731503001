import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ✅ FIX 1: เปลี่ยนจาก { LoginScreen } → LoginScreen (default export)
//           และระบุ path ตรงไปที่ screen.tsx เลย
import LoginScreen        from './features/login/screen';
import HomeScreen         from './features/home/screen';
import ProductDetailScreen from './features/product_detail/screen';
import ProfileScreen from './features/profile/screen';
import AboutUPFScreen from './features/profile/screen';
import ScannerScreen      from './features/scanner/screen';

// ✅ FIX 2: Safe import LanguageProvider — ถ้าไม่มีจะใช้ fallback
let LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
try {
  LanguageProvider = require('./core/i18n').LanguageProvider;
} catch {}

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      {/* ✅ FIX 2: ครอบ LanguageProvider ให้ useLanguage() ใช้งานได้ */}
      <LanguageProvider>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Login"
        >
          <Stack.Screen name="Login"         component={LoginScreen} />
          <Stack.Screen name="Home"          component={HomeScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Profile"       component={ProfileScreen} />
          <Stack.Screen name="Scanner"       component={ScannerScreen} />
          {/* ✅ FIX 3: เพิ่ม AboutUPF ที่ ProfileScreen navigate ไปหา */}
          <Stack.Screen name="AboutUPF"      component={AboutUPFScreen} />
        </Stack.Navigator>
      </LanguageProvider>
    </NavigationContainer>
  );
};

export default App;