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
