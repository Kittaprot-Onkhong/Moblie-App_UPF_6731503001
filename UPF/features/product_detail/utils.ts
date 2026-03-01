import { COLORS } from './constants';

export const getUPFColor = (level: string) => {
  switch (level) {
    case 'ต่ำ': return COLORS.GREEN;
    case 'ปานกลาง': return COLORS.YELLOW;
    case 'สูง': return COLORS.ORANGE;
    case 'สูงมาก': return COLORS.RED;
    default: return COLORS.TEXT_MID;
  }
};

export const getUPFBgColor = (level: string) => {
  switch (level) {
    case 'ต่ำ': return COLORS.GREEN_LIGHT;
    case 'ปานกลาง': return '#FFF9E6';
    case 'สูง': return COLORS.ORANGE_LIGHT;
    case 'สูงมาก': return '#FDEAEA';
    default: return '#F5F5F5';
  }
};

export const getUPFDescription = (level: string) => {
  switch (level) {
    case 'ต่ำ':
      return 'อาหารแปรรูปน้อยหรือไม่แปรรูป เหมาะสำหรับรับประทานเป็นประจำ';
    case 'ปานกลาง':
      return 'อาหารแปรรูปปานกลาง ควรรับประทานอย่างพอเหมาะ';
    case 'สูง':
      return 'อาหารแปรรูปสูง ควรจำกัดการรับประทาน';
    case 'สูงมาก':
      return 'อาหารแปรรูปสูงมาก ควรหลีกเลี่ยงหรือรับประทานน้อยที่สุด';
    default:
      return '';
  }
};

export const getProductWarnings = (level: string, hasHighSodium?: boolean, hasMSG?: boolean) => {
  const warnings: string[] = [];

  switch (level) {
    case 'สูงมาก':
      warnings.push('⚠️ อาหารแปรรูปสูงมาก - หลีกเลี่ยงหรือรับประทานอย่างน้อยที่สุด');
      warnings.push('มีส่วนประกอบเทียมมากมาย');
      warnings.push('ปริมาณน้ำตาล เกลือ และไขมันสูง');
      warnings.push('ไม่เหมาะสำหรับเด็กและผู้สูงอายุ');
      break;
    case 'สูง':
      warnings.push('⚠️ อาหารแปรรูปสูง - ควรจำกัดการรับประทาน');
      if (hasHighSodium) warnings.push('มีโซเดียมสูง ผู้ป่วยโรคความดันควรหลีกเลี่ยง');
      if (hasMSG) warnings.push('มี MSG (กลูตาเมต) อาจทำให้แพ้ในบางคน');
      warnings.push('รับประทานบ่อย ๆ อาจเพิ่มความเสี่ยงโรค');
      break;
    case 'ปานกลาง':
      warnings.push('⚠️ อาหารแปรรูปปานกลาง - ควรรับประทานอย่างพอเหมาะ');
      if (hasHighSodium) warnings.push('มีโซเดียมสูง');
      warnings.push('อ่านส่วนผสมให้ดี');
      break;
    case 'ต่ำ':
      warnings.push('✅ อาหารแปรรูปต่ำ - เหมาะสำหรับรับประทานเป็นประจำ');
      warnings.push('มีสารอาหารสูง');
      break;
  }

  return warnings;
};
