# Quick Start Guide - Testing the App

## 🚀 Getting Started

### Prerequisites
```
- Node.js (v14+)
- npm or yarn
- React Native development environment set up
- Expo CLI (npm install -g expo-cli) - OR -
- Android Studio + Xcode for native development
```

### Installation Steps

```bash
# 1. Navigate to project directory
cd "d:\งาน\เรียน\ปี2\t2\Mobile Application Development\week4\UPF"

# 2. Install dependencies
npm install
# OR
yarn install

# 3. Start the Metro bundler
npx react-native start

# 4. In another terminal, run on your platform
# For iOS
npx react-native run-ios

# For Android
npx react-native run-android

# For Expo (if using Expo)
expo start
```

---

## 📱 Testing Walkthrough

### Screen 1: Login Screen
**Location:** First screen on app launch

1. **Fields to test:**
   - Email input field (accepts any text)
   - Password input field (masked by default)
   - Toggle button for password visibility (👁️ icon)

2. **Interactions:**
   - Type email and password
   - "Forgot Password?" button (visual, non-functional in demo)
   - "Sign Up" link (visual, non-functional in demo)
   - Login button (enabled only when both fields filled)

3. **Navigation:**
   - Tap "Login" → Goes to Home Screen
   - ⚠️ No validation - any email/password works (demo mode)

---

### Screen 2: Home Screen
**Location:** After successful login

1. **Featured Products Carousel (Complex Component)**
   - Look at the top section with product cards
   - **Test horizontal scrolling:**
     - Swipe left/right on the carousel
     - Cards snap into position smoothly
     - Shows: Name, Price, Rating, Review count
   
2. **Category Filter Tabs**
   - Three buttons: "All", "Electronics", "Accessories"
   - Tap each category
   - Products below update in real-time
   - Active category shows blue background

3. **All Products List**
   - Scroll down to see all products
   - Shows all products or filtered by category
   - Each product has: Image, Name, Price, Rating

4. **Navigation Features:**
   - Tap any product card → Goes to Product Detail
   - Tap "Profile" button (top right) → Goes to Profile
   - Cards have press feedback (slight opacity change)

5. **Product Data to Verify:**
   - ✅ Wireless Headphones - $79.99 - Electronics
   - ✅ Smart Watch - $199.99 - Electronics
   - ✅ USB-C Cable - $12.99 - Accessories
   - ✅ Phone Case - $24.99 - Accessories
   - ✅ Portable Charger - $39.99 - Electronics
   - ✅ Screen Protector - $9.99 - Accessories

---

### Screen 3: Product Detail Screen
**Location:** After tapping a product from Home Screen

1. **Header Section**
   - Back button (← Back) - returns to Home Screen
   - "Product Details" title

2. **Product Information**
   - Large product image (emoji icon: 🎧, ⌚, 🔌, etc.)
   - Product name in large bold text
   - Rating with star and review count
   - Category badge
   - Large price display in blue

3. **Description Section**
   - Full product description shown
   - Example: "Premium wireless headphones with active noise cancellation"

4. **Specifications Section**
   - Brand: "Premium Electronics"
   - Warranty: "1 Year Manufacturer"
   - Availability: "In Stock"

5. **Action Buttons**
   - "🛒 Add to Cart" (outlines style)
   - "💳 Buy Now" (filled blue style)
   - Both buttons tap-responsive (visual feedback)
   - ⚠️ Buttons are visual only, no backend connection

6. **Navigation**
   - Tap "← Back" → Returns to Home Screen
   - Auto-scroll to top on different products

---

### Screen 4: Profile Screen
**Location:** After tapping "Profile" button from Home Screen

1. **User Profile Section**
   - Avatar: 👤 (emoji icon)
   - Name: "John Doe"
   - Email: "john.doe@example.com"
   - Member since: "January 2023"

2. **Statistics Cards**
   - Total Orders: 12
   - Total Spent: $459.87
   - Visual cards with white background

3. **Account Settings**
   Tap-able menu items:
   - 👤 Edit Profile
   - 🔒 Change Password
   - 📍 Addresses
   Each item shows arrow (›) indicating more options

4. **Preferences**
   - 🔔 Notifications
   - 🌙 Dark Mode
   - 🌐 Language
   All with arrow indicators

5. **Help & Support**
   - ❓ FAQ
   - 📧 Contact Us
   All with arrow indicators

6. **Logout Button**
   - Red "🚪 Logout" button at bottom
   - Tap to return to Login Screen

7. **Navigation Behavior**
   - "← Back" → Returns to Home Screen
   - "Logout" → Returns to Login Screen

---

## ✅ Features to Verify

### Code Quality
- [ ] App starts without errors
- [ ] No console warnings or errors
- [ ] Proper app structure (models, features, etc.)
- [ ] TypeScript/TSX syntax is correct

### UI/UX
- [ ] All screens render properly
- [ ] Proper spacing and alignment
- [ ] Colors are consistent (blue primary, white backgrounds)
- [ ] Text is readable (good contrast)
- [ ] Buttons are tappable (48px+ size)
- [ ] Icons and emojis display correctly

### Navigation
- [ ] All screen transitions work
- [ ] Back buttons work properly
- [ ] Navigation params pass correctly (product data)
- [ ] No navigation errors in console

### State Management
- [ ] Category filter works on Home Screen
- [ ] Products update when category changes
- [ ] Form validation works on Login Screen
- [ ] Password visibility toggle works

### Mock Data
- [ ] All 6 products display correctly
- [ ] Product information is accurate
- [ ] User profile data shows correctly
- [ ] No API calls (using hardcoded data)

### Complex Component (Carousel)
- [ ] Horizontal scrolling works smoothly
- [ ] Cards snap into position
- [ ] Featured products show first 4 items
- [ ] Carousel items are tap-able
- [ ] Carousel integrates with filtering

---

## 📊 Testing Checklist

```
SCREENS:
✅ Login Screen - Fully implemented
✅ Home Screen - With carousel
✅ Product Detail Screen - Rich view
✅ Profile Screen - Settings

COMPLEX COMPONENTS:
✅ Product Carousel - Horizontal FlatList
✅ Category Filter - State management
✅ Form Validation - Input handling

DATA:
✅ 6 Products with full data
✅ 1 User profile data
✅ No database - Mock data only

NAVIGATION:
✅ Login → Home (tap Login)
✅ Home → Product Detail (tap product)
✅ Home → Profile (tap Profile button)
✅ Profile → Home (tap Back)
✅ Profile → Login (tap Logout)
✅ ProductDetail → Home (tap Back)

REQUIREMENTS:
✅ 4+ distinct screens
✅ Complex component (carousel)
✅ Mock data (no real DB)
✅ Professional styling
✅ Working navigation
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Metro bundler not starting
**Solution:**
```bash
# Kill existing bundlers
lsof -ti:8081 | xargs kill -9

# Restart
npx react-native start --reset-cache
```

### Issue: App crashes on navigation
**Solution:**
- Check console for errors
- Verify all imports in App.tsx are correct
- Ensure index.tsx files export properly

### Issue: Carousel not scrolling
**Solution:**
- Check FlatList `horizontal` prop is set
- Verify `CAROUSEL_ITEM_WIDTH` is calculated
- Check `snapToInterval` value

### Issue: Images not showing
**Solution:**
- Using emoji icons (📱 🎧 etc.) - should always work
- Check platform specific rendering

---

## 📝 File Reference

| File | Purpose | Status |
|------|---------|--------|
| App.tsx | Navigation setup | ✅ Complete |
| features/login/screen.tsx | Login form | ✅ Complete |
| features/home/screen.tsx | Home with carousel | ✅ Complete |
| features/product_detail/screen.tsx | Product view | ✅ Complete |
| features/profile/screen.tsx | User profile | ✅ Complete |
| models/product.ts | Product data | ✅ Complete |
| models/user.ts | User data | ✅ Complete |
| NAVIGATION_SETUP.md | Documentation | ✅ Complete |
| PROJECT_COMPLETION.md | Summary | ✅ Complete |
| CAROUSEL_COMPONENT_GUIDE.md | Component guide | ✅ Complete |

---

## 🎯 What to Show in Demo

**Recommended demo flow:**

1. **Show Login Screen**
   - Enter any email/password
   - Tap Login button
   - Mention form validation

2. **Show Home Screen**
   - Scroll carousel left/right (highlight as complex component)
   - Tap category filter (show real-time filtering)
   - Tap a product

3. **Show Product Detail**
   - Show all product information
   - Mention mock data structure
   - Tap Back button

4. **Show Profile Screen**
   - Scroll through menu items
   - Mention comprehensive features
   - Tap Logout

5. **Return to Login**
   - Complete the navigation flow

---

## ✨ Assignment Completion Status

| Requirement | Implemented | Status |
|---|---|---|
| 4+ Screens | Login, Home, ProductDetail, Profile | ✅ |
| Complex Component | Product Carousel with FlatList | ✅ |
| Category Filtering | Dynamic product filter | ✅ |
| Form Validation | Login form with validation | ✅ |
| Mock Data | 6 products + 1 user | ✅ |
| Navigation | Full app flow | ✅ |
| Professional UI | Modern design & styling | ✅ |
| Documentation | Multiple guide files | ✅ |

---

**Ready to Test!** 🚀

For any issues, refer to the console output and the documentation files included in the project.
