import { format } from "date-fns";

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
};


export const numberToWords = (num) => {

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (typeof num === 'string') num = parseFloat(num);
  if (isNaN(num)) return '';

  if (num === 0) return 'Zero Pesos Only';

  const numToStr = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) {
      return (
        a[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' and ' + numToStr(n % 100) : '')
      );
    }
    return '';
  };

  const numParts = [
    { value: 10000000, label: 'Crore' },
    { value: 100000, label: 'Lakh' },
    { value: 1000, label: 'Thousand' },
    { value: 1, label: '' }
  ];

  // Split integer and decimal parts
  const [intPart, decPart] = num.toFixed(2).split('.').map(Number);

  let result = '';
  let n = intPart;
  for (const part of numParts) {
    const partValue = Math.floor(n / part.value);
    if (partValue > 0) {
      result += numToStr(partValue) + (part.label ? ' ' + part.label : '') + ' ';
      n %= part.value;
    }
  }
  result = result.trim() + ' Pesos';

  // Handle cents/centavos
  if (decPart > 0) {
    result += ' and ' + numToStr(decPart) + ' Centavos';
  } else {
    result += ' Only';
  }

  return result;
};
