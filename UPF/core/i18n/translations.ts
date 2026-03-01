export type Language = 'th' | 'en';

export const translations = {
  th: {
    // Shared
    appName: 'UPF',
    tagline: 'รู้จักอาหารแปรรูปของคุณ',
    
    // Login
    welcome: 'ยินดีต้อนรับกลับมา 👋',
    loginSub: 'เข้าสู่ระบบเพื่อตรวจสอบฉลากอาหารและดูแลสุขภาพ',
    forgot: 'ลืมรหัสผ่าน?',
    login: 'เข้าสู่ระบบ',
    signup: 'สมัครสมาชิก',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    name: 'ชื่อ',
    
    // Home
    home: 'หน้าหลัก',
    scanCount: 'สินค้าที่แสกน',
    favoriteCount: 'สินค้าที่ชอบ',
    products: 'สินค้าทั้งหมด',
    
    // Scanner
    scanner: 'กล้อง',
    takePicture: 'ถ่ายรูปสินค้า',
    detectUPF: 'ตรวจหา UPF',
    cameraAccess: 'ขออนุญาตการเข้าถึงกล้อง',
    cameraRequired: 'กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่า',
    
    // Product Detail
    productDetail: 'รายละเอียดสินค้า',
    upfLevel: 'ระดับ UPF',
    score: 'คะแนน',
    calories: 'แคลอรี่',
    ingredients: 'ส่วนผสมหลัก',
    nutrition: 'ข้อมูลโภชนาการ (ต่อหนึ่งหน่วย)',
    warnings: 'ข้อควรระวัง',
    specs: 'ข้อมูลผลิตภัณฑ์',
    brand: 'ยี่ห้อ',
    size: 'ขนาดบรรจุ',
    origin: 'ผลิตที่',
    shelfLife: 'อายุการเก็บ',
    
    // UPF Levels
    low: 'ต่ำ',
    medium: 'ปานกลาง',
    high: 'สูง',
    veryHigh: 'สูงมาก',
    
    // UPF Descriptions
    lowDesc: 'อาหารแปรรูปน้อยหรือไม่แปรรูป เหมาะสำหรับรับประทานเป็นประจำ',
    mediumDesc: 'อาหารแปรรูปปานกลาง ควรรับประทานอย่างพอเหมาะ',
    highDesc: 'อาหารแปรรูปสูง ควรจำกัดการรับประทาน',
    veryHighDesc: 'อาหารแปรรูปสูงมาก ควรหลีกเลี่ยงหรือรับประทานน้อยที่สุด',
    
    // Profile
    profile: 'โปรไฟล์',
    aboutUPF: 'เกี่ยวกับ UPF',
    logout: 'ออกจากระบบ',
    language: 'ภาษา',
    
    // About UPF
    upfTitle: 'อาหารแปรรูปขั้นสูง',
    upfDef: 'UPF ย่อมาจาก Ultra-Processed Food หรือ "อาหารแปรรูปขั้นสูง" คืออาหารที่ผ่านกระบวนการผลิตทางอุตสาหกรรมหลายขั้นตอน เติมสารสังเคราะห์ สารกันเสีย สี กลิ่น และรสชาติเทียม เพื่อให้เก็บได้นานและอร่อย มักมีไขมัน น้ำตาล และเกลือสูง แต่สารอาหารต่ำ เช่น บะหมี่กึ่งสำเร็จรูป ขนมกรุบกรอบ และอาหารแช่แข็ง',
    upfImportantInfo: 'ข้อมูลสำคัญของ UPF (อาหารแปรรูปขั้นสูง)',
    upfDef2: 'นิยาม:',
    upfDef2Desc: 'เป็นผลิตภัณฑ์ที่ทำจากส่วนผสมที่ผ่านกระบวนการมาแล้ว หรือสกัดจากสารอาหารอื่น ๆ เช่น สารสกัดจากโปรตีนน้ำมันเติมไฮโดรเจนน้ำตาลฟรุกโตส',
    upfIndicators: 'จุดสังเกต:',
    upfIndicatorsDesc: 'มีส่วนผสมที่มักจะไม่มีในครัวเรือนปกติ เช่น สารกันบูด (Preservatives) สารอิมัลซิไฟเออร์ (Emulsifiers) สีและกลิ่นสังเคราะห์',
    upfExamples: 'ตัวอย่างอาหาร:',
    upfExamplesDesc: 'ขนมขบเคี้ยว น้ำอัดลม เครื่องดื่มรสหวาน ไส้กรอก แฮม บะหมี่กึ่งสำเร็จรูป ซีเรียลปรุงรส ไอศกรีม และอาหารสำเร็จรูปแช่แข็ง',
    upfImpact: 'ผลกระทบต่อสุขภาพ:',
    upfImpactDesc: 'การบริโภค UPF เป็นประจำมีความเชื่อมโยงกับโรคอ้วน โรคหัวใจและหลอดเลือด ความดันโลหิตสูง และความเสี่ยงต่อมะเร็ง',
    upfReduction: 'วิธีลดการบริโภค UPF',
    upfReduction1: 'เน้นกินอาหารที่ทำจากวัตถุดิบสดใหม่ (Whole Foods)',
    upfReduction2: 'ทำอาหารทานเองเพื่อควบคุมวัตถุดิบ',
    upfReduction3: 'อ่านฉลากโภชนาการเพื่อหลีกเลี่ยงอาหารที่มีน้ำตาล เกลือ และไขมันสูง',
  },
  en: {
    // Shared
    appName: 'UPF',
    tagline: 'Know your ultra-processed food',
    
    // Login
    welcome: 'Welcome back 👋',
    loginSub: 'Sign in to check food labels and care for your health',
    forgot: 'Forgot password?',
    login: 'Sign In',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    
    // Home
    home: 'Home',
    scanCount: 'Scanned Products',
    favoriteCount: 'Favorite Products',
    products: 'All Products',
    
    // Scanner
    scanner: 'Camera',
    takePicture: 'Take Product Photo',
    detectUPF: 'Detect UPF',
    cameraAccess: 'Request Camera Access',
    cameraRequired: 'Please allow camera access in settings',
    
    // Product Detail
    productDetail: 'Product Details',
    upfLevel: 'UPF Level',
    score: 'Score',
    calories: 'Calories',
    ingredients: 'Main Ingredients',
    nutrition: 'Nutrition Information (per serving)',
    warnings: 'Warnings',
    specs: 'Product Information',
    brand: 'Brand',
    size: 'Package Size',
    origin: 'Made In',
    shelfLife: 'Shelf Life',
    
    // UPF Levels
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    veryHigh: 'Very High',
    
    // UPF Descriptions
    lowDesc: 'Minimally processed or unprocessed food. Suitable for regular consumption',
    mediumDesc: 'Moderately processed food. Should be consumed in moderation',
    highDesc: 'Highly processed food. Should limit consumption',
    veryHighDesc: 'Very highly processed food. Should avoid or consume minimally',
    
    // Profile
    profile: 'Profile',
    aboutUPF: 'About UPF',
    logout: 'Sign Out',
    language: 'Language',
    
    // About UPF
    upfTitle: 'Ultra-Processed Food',
    upfDef: 'UPF stands for Ultra-Processed Food, which refers to food that has undergone multiple industrial processing steps, with added synthetic additives, preservatives, colors, flavors, and artificial taste enhancers to ensure long shelf life and appeal. These foods typically have high fat, sugar, and salt content, but low nutritional value, such as instant noodles, crispy snacks, and frozen meals.',
    upfImportantInfo: 'Important Information About UPF (Ultra-Processed Food)',
    upfDef2: 'Definition:',
    upfDef2Desc: 'Products made from ingredients that have already been processed, or extracted from other food sources such as protein extracts, hydrogenated oils, high-fructose sugar.',
    upfIndicators: 'Key Indicators:',
    upfIndicatorsDesc: 'Contains ingredients that are not typically found in regular kitchens, such as preservatives, emulsifiers, synthetic colors and flavors.',
    upfExamples: 'Examples:',
    upfExamplesDesc: 'Snack chips, soft drinks, sweetened beverages, sausages, ham, instant noodles, flavored cereals, ice cream, and frozen ready-made meals.',
    upfImpact: 'Health Impact:',
    upfImpactDesc: 'Regular consumption of UPF is linked to obesity, cardiovascular diseases, high blood pressure, and increased cancer risk.',
    upfReduction: 'Ways to Reduce UPF Consumption',
    upfReduction1: 'Focus on eating fresh, whole foods',
    upfReduction2: 'Cook meals yourself to control ingredients',
    upfReduction3: 'Read nutrition labels to avoid foods high in sugar, salt, and fat',
  },
};
