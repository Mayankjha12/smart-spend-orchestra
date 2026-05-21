export type BankKey = "Axis Bank" | "HDFC Bank" | "ICICI Bank" | "SBI";

export const BANK_URLS: Record<BankKey, string> = {
  "Axis Bank": "https://www.axisbank.com",
  "HDFC Bank": "https://www.hdfcbank.com",
  "ICICI Bank": "https://www.icicibank.com",
  SBI: "https://www.onlinesbi.sbi",
};

export const BANK_CARDS: Record<BankKey, { debit: string[]; credit: string[] }> = {
  "Axis Bank": {
    debit: [
      "Burgundy Debit Card",
      "Priority Platinum Debit Card",
      "Prestige Debit Card",
      "RuPay Platinum Debit Card",
      "Visa Signature Debit Card",
    ],
    credit: [
      "Axis Magnus",
      "Axis Reserve",
      "Axis Atlas",
      "Flipkart Axis Bank Credit Card",
      "Axis Vistara Infinite",
      "Axis Ace Credit Card",
      "Neo Credit Card",
    ],
  },
  "HDFC Bank": {
    debit: [
      "EasyShop Platinum Debit Card",
      "Millennia Debit Card",
      "RuPay Premium Debit Card",
      "Imperia Platinum Debit Card",
      "JetPrivilege Debit Card",
    ],
    credit: [
      "HDFC Infinia",
      "HDFC Diners Black",
      "HDFC Millennia",
      "HDFC Regalia",
      "HDFC Swiggy Card",
      "Tata Neu Infinity",
      "MoneyBack+",
    ],
  },
  "ICICI Bank": {
    debit: [
      "Coral Paywave Debit Card",
      "Titanium Debit Card",
      "Sapphiro Debit Card",
      "Expressions Debit Card",
      "RuPay Platinum Debit Card",
    ],
    credit: [
      "Amazon Pay ICICI Card",
      "ICICI Sapphiro",
      "ICICI Coral",
      "ICICI Rubyx",
      "ICICI Emeralde",
      "HPCL Super Saver Card",
    ],
  },
  SBI: {
    debit: [
      "Global International Debit Card",
      "Platinum Debit Card",
      "Classic Debit Card",
      "Pride Debit Card",
      "RuPay Select Debit Card",
    ],
    credit: [
      "SBI Cashback Card",
      "SBI SimplyClick",
      "SBI Prime",
      "SBI Elite",
      "BPCL SBI Card",
      "IRCTC SBI Card",
    ],
  },
};

export const ALL_BANKS = Object.keys(BANK_CARDS) as BankKey[];
