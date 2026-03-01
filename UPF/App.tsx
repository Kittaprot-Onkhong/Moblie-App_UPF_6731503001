import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './features/login';
import { HomeScreen } from './features/home';
import { ProductDetailScreen } from './features/product_detail';
import { ProfileScreen } from './features/profile';
import { ScannerScreen } from './features/scanner';

// contexts
import { LanguageProvider } from './core/i18n';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      {/* language context provider required for t() and toggles */}
      <LanguageProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="Login"
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Home' }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'Product Details' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{ title: 'Scanner' }}
          />
        </Stack.Navigator>
      </LanguageProvider>
    </NavigationContainer>
  );
};

export default App;
