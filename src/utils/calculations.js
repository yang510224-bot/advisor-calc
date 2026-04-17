// calculations.js

// -------------------------------------------------------------
// 1. 基本工具函數
// -------------------------------------------------------------
export function calculatePMT(principal, annualRate, years) {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / (years * 12);
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// 取得台灣投資型壽險最低身故保額門檻 (第五解約金規定)
export function getMinimumFaceAmountRatio(age) {
  if (age <= 30) return 1.9;
  if (age <= 40) return 1.6;
  if (age <= 50) return 1.4;
  if (age <= 70) return 1.2;
  return 1.01;
}

// 內部真實年齡費率對照表 (引用自十來旺附表二，單位：每萬淨危險保額)
const insuranceRates = {
  male: {
    15: 0.6267, 16: 0.8467, 17: 1.0500, 18: 1.0733, 19: 1.0875,
    20: 1.0942, 21: 1.1000, 22: 1.1117, 23: 1.1175, 24: 1.1183,
    25: 1.1183, 26: 1.1183, 27: 1.1258, 28: 1.1417, 29: 1.1667,
    30: 1.2042, 31: 1.2567, 32: 1.3258, 33: 1.4083, 34: 1.5033,
    35: 1.6083, 36: 1.7258, 37: 1.8550, 38: 1.9950, 39: 2.1442,
    40: 2.3008, 41: 2.4833, 42: 2.6833, 43: 2.9033, 44: 3.1425,
    45: 3.4033, 46: 3.6842, 47: 3.9867, 48: 4.3125, 49: 4.6642,
    50: 5.0467, 51: 5.4650, 52: 5.9233, 53: 6.4275, 54: 6.9833,
    55: 7.5983, 56: 8.2792, 57: 9.0325, 58: 9.8667, 59: 10.7867,
    60: 11.7983, 61: 12.9150, 62: 14.1500, 63: 15.5267, 64: 17.0658,
    65: 18.7833, 66: 20.6975, 67: 22.8258, 68: 25.1842, 69: 27.7950,
    70: 30.6842, 71: 33.8825, 72: 37.4208, 73: 41.3417, 74: 45.6983,
    75: 50.5508, 76: 55.9750, 77: 62.0625, 78: 68.9183, 79: 76.6575,
    80: 85.4050, 81: 95.3133, 82: 106.5683, 83: 119.3800, 84: 134.0042,
    85: 150.7300, 86: 169.8700, 87: 191.7617, 88: 216.7825, 89: 245.3192,
    90: 277.7817, 91: 314.6142, 92: 356.3050, 93: 403.3850, 94: 456.4233,
    95: 516.0358, 96: 582.8875, 97: 657.6533, 98: 741.0508, 99: 833.8242
  },
  female: {
    15: 0.2867, 16: 0.3267, 17: 0.3608, 18: 0.4008, 19: 0.4275,
    20: 0.4417, 21: 0.4500, 22: 0.4500, 23: 0.4500, 24: 0.4500,
    25: 0.4500, 26: 0.4500, 27: 0.4500, 28: 0.4558, 29: 0.4667,
    30: 0.4858, 31: 0.5125, 32: 0.5483, 33: 0.5892, 34: 0.6358,
    35: 0.6867, 36: 0.7417, 37: 0.7983, 38: 0.8550, 39: 0.9100,
    40: 1.0333, 41: 1.1133, 42: 1.2042, 43: 1.3058, 44: 1.4225,
    45: 1.5558, 46: 1.7075, 47: 1.8808, 48: 2.0758, 49: 2.2892,
    50: 2.5142, 51: 2.7450, 52: 2.9767, 53: 3.2067, 54: 3.4500,
    55: 3.7242, 56: 4.0483, 57: 4.4392, 58: 4.9125, 59: 5.4617,
    60: 6.0792, 61: 6.7558, 62: 7.4908, 63: 8.2892, 64: 9.1608,
    65: 10.1175, 66: 11.1733, 67: 12.3483, 68: 13.6658, 69: 15.1500,
    70: 16.8275, 71: 18.7300, 72: 20.8808, 73: 23.3083, 74: 26.0400,
    75: 29.1033, 76: 32.5317, 77: 36.3575, 78: 40.6183, 79: 45.3525,
    80: 50.6092, 81: 56.4425, 82: 62.9092, 83: 70.0767, 84: 78.0167,
    85: 86.8042, 86: 96.5292, 87: 107.2883, 88: 119.1867, 89: 132.3392,
    90: 146.8617, 91: 162.8833, 92: 180.5367, 93: 199.9625, 94: 221.3125,
    95: 244.7500, 96: 270.4392, 97: 298.5442, 98: 329.2317, 99: 362.6658
  }
};

function getInsuranceCostPerTenThousand(age, gender) {
  const g = gender === 'F' ? 'female' : 'male';
  return insuranceRates[g][age] || insuranceRates[g][99] || 0;
}

// -------------------------------------------------------------
// 2. 一般銀行定期定額 (Bank SIP)
// -------------------------------------------------------------
export function calculateBankSIP({ monthlyInvestment, annualRate, years }) {
  const months = years * 12;
  const monthlyRate = (annualRate / 100) / 12;
  
  let totalValue = 0;
  let totalInvested = 0;
  const history = [];

  for (let m = 1; m <= months; m++) {
    totalValue += monthlyInvestment;
    totalInvested += monthlyInvestment;
    totalValue = totalValue * (1 + monthlyRate); // 月底生息
    
    if (m % 12 === 0) {
      history.push({
        year: m / 12,
        totalInvested: Math.round(totalInvested),
        totalValue: Math.round(totalValue)
      });
    }
  }

  return { totalInvested, finalValue: totalValue, history };
}

// -------------------------------------------------------------
// 3. 安聯投資型定期定額 (Allianz SIP)
// -------------------------------------------------------------
export function calculateAllianzSIP({ targetPremium, excessPremium, annualRate, years, age, gender, faceAmount }) {
  const months = years * 12;
  const monthlyRate = (annualRate / 100) / 12;
  let accountValue = 0;
  let totalInvested = 0;
  const history = [];

  // 安聯階梯前置費用
  const frontLoadRates = [0.60, 0.40, 0.20, 0.20, 0.20];
  
  let currentAge = age;

  for (let m = 1; m <= months; m++) {
    const yearIndex = Math.ceil(m / 12);
    if (m > 1 && (m - 1) % 12 === 0) {
      currentAge++; // 每年年紀增長
    }

    // A. 投入與手續費扣除
    let targetDeduction = 0;
    if (yearIndex <= 5) {
      targetDeduction = frontLoadRates[yearIndex - 1];
    }
    const targetNet = targetPremium * (1 - targetDeduction);
    
    // 超額保費固定扣 3%
    const excessNet = excessPremium * 0.97;
    
    totalInvested += (targetPremium + excessPremium);
    accountValue += (targetNet + excessNet);

    // B. 加值返還入帳 (第6年開始)
    if (yearIndex >= 6 && yearIndex <= 10) {
      const refundPercentages = { 6: 0.10, 7: 0.20, 8: 0.20, 9: 0.40, 10: 0.60 };
      const refund = targetPremium * refundPercentages[yearIndex];
      accountValue += refund;
    }

    // C. 計算保單成本與扣除 (甲型 NAR = 保額 - 帳戶價值)
    let nar = Math.max(faceAmount - accountValue, 0); // 淨危險保額
    let costPerTenThousand = getInsuranceCostPerTenThousand(currentAge, gender);
    let monthlyInsuranceCost = (nar / 10000) * costPerTenThousand;
    
    // 保單管理費 100
    accountValue -= (monthlyInsuranceCost + 100);
    if (accountValue < 0) accountValue = 0;

    // D. 基金複利
    accountValue = accountValue * (1 + monthlyRate);

    // E. 記錄年末狀態
    if (m % 12 === 0) {
      history.push({
        year: yearIndex,
        age: currentAge,
        totalInvested: Math.round(totalInvested),
        accountValue: Math.round(accountValue),
        nar: Math.round(nar),
        yearlyInsuranceCostEst: Math.round(monthlyInsuranceCost * 12)
      });
    }
  }

  return { totalInvested, finalValue: accountValue, history, faceAmount };
}

// -------------------------------------------------------------
// 4. 安達富貴大贏家 - 單筆滾存 (Chubb Lump Sum)
// -------------------------------------------------------------
export function calculateChubbLumpSum({ lumpSum, annualRate, years, age, gender, faceAmount, isHighPremium = true, reinvestType = 'none', reinvestRate = 6, reinvestFaceAmount = 2000000 }) {
  const months = years * 12;
  const monthlyRate = (annualRate / 100) / 12;
  
  let accValue = lumpSum;
  let divValue = lumpSum;
  let totalDivDistributed = 0;
  
  let currentAge = age;
  const history = [];

  for (let m = 1; m <= months; m++) {
    const yearIndex = Math.ceil(m / 12);
    if (m > 1 && (m - 1) % 12 === 0) currentAge++; 

    // 安達保單帳戶管理費率 (階梯式)
    let accMaintenanceRate = 0;
    if (yearIndex === 1) accMaintenanceRate = 0.0020; // 0.2%
    else if (yearIndex === 2) accMaintenanceRate = 0.001816; // 0.1816%
    else if (yearIndex === 3 || yearIndex === 4) accMaintenanceRate = 0.0013; // 0.13%
    else accMaintenanceRate = 0; // 第5年起為0

    const costPerTenThousand = getInsuranceCostPerTenThousand(currentAge, gender);
    const fixedFee = isHighPremium ? 0 : 100;

    // --- Scenario A: 單筆滾存 (Accumulation) ---
    const accMaintFee = accValue * accMaintenanceRate;
    let narAcc = Math.max(faceAmount - accValue, 0); 
    let monthlyInsCostAcc = (narAcc / 10000) * costPerTenThousand;

    accValue -= (accMaintFee + monthlyInsCostAcc + fixedFee);
    if (accValue < 0) accValue = 0;
    accValue = accValue * (1 + monthlyRate); // 全額滾存

    // --- Scenario B: 單筆月配息 (Dividend Distribution) ---
    const divMaintFee = divValue * accMaintenanceRate;
    let narDiv = Math.max(faceAmount - divValue, 0); 
    let monthlyInsCostDiv = (narDiv / 10000) * costPerTenThousand;

    divValue -= (divMaintFee + monthlyInsCostDiv + fixedFee);
    if (divValue < 0) divValue = 0;
    const thisMonthDiv = divValue * monthlyRate; // 發配息
    totalDivDistributed += thisMonthDiv;
    // divValue 原金維持不變

    // 記錄
    if (m % 12 === 0) {
      history.push({
        year: yearIndex,
        age: currentAge,
        accValue: Math.round(accValue),
        divValue: Math.round(divValue),
        totalDivDistributed: Math.round(totalDivDistributed)
      });
    }
  }

  // ====================
  // 配息再投資 (Reinvestment)
  // ====================
  let reinvestResult = null;
  if (reinvestType !== 'none') {
    const averageDiv = totalDivDistributed / months;
    if (reinvestType === 'bank') {
      reinvestResult = calculateBankSIP({
        monthlyInvestment: averageDiv,
        annualRate: reinvestRate,
        years: years
      });
    } else if (reinvestType === 'insurance') {
      reinvestResult = calculateAllianzSIP({
        targetPremium: averageDiv * 0.7,
        excessPremium: averageDiv * 0.3,
        annualRate: reinvestRate,
        years: years,
        age: age,
        gender: gender,
        faceAmount: reinvestFaceAmount
      });
    }
  }

  return { 
    totalInvested: lumpSum,
    accFinalValue: accValue,
    divPrincipal: divValue,
    divTotalDistributed: totalDivDistributed,
    divTotalAsset: divValue + totalDivDistributed,
    reinvestResult,
    history 
  };
}

// -------------------------------------------------------------
// 5. 終極套利綜合試算 (Arbitrage Engine)
// -------------------------------------------------------------
export function calculateArbitrage({
  loanAmount,      // 信貸金額 (如 1,000,000)
  loanYears,       // 信貸年期 (如 7)
  loanRate,        // 信貸利率 (如 3%)
  dividendRate,    // 單筆配息率 (如 7%)
  sipType,         // 'bank' or 'insurance' or 'lumpsum'
  sipRate,         // 標的報酬率
  age, gender, faceAmount // 若為 insurance 才需要
}) {
  const months = loanYears * 12;
  
  // 1. 每月信貸本息攤還
  const monthlyLoanPmt = calculatePMT(loanAmount, loanRate, loanYears);
  
  // 2. 100萬配息創造的月現金流
  const monthlyDividend = (loanAmount * (dividendRate / 100)) / 12;

  // 3. 計算差額 (每月需自掏腰包的錢)
  // 如果配息大於攤還額，代表正現金流；否則代表負現金流(需掏錢)
  const netMonthlyCashflow = monthlyDividend - monthlyLoanPmt;
  
  // 我們假設所有的配息都被拿去買定期定額 (每月定額投入 = monthlyDividend)
  // 所以真實自掏腰包繳貸款的錢就是 = monthlyLoanPmt 每個月硬繳
  // (這是一種解讀：用配息全買定額，自己拿薪水繳信貸)
  const totalOutofPocket = monthlyLoanPmt * months;

  // 若為單筆滾存不配息
  if (sipType === 'lumpsum') {
    const sumResult = calculateChubbLumpSum({
      lumpSum: loanAmount,
      annualRate: sipRate, 
      years: loanYears,
      age: age,
      gender: gender,
      faceAmount: faceAmount,
      isHighPremium: true,
      reinvestType: 'none'
    });
    return {
      monthlyLoanPmt: Math.round(monthlyLoanPmt),
      monthlyDividend: 0,
      netMonthlyCashflow: Math.round(-monthlyLoanPmt),
      totalOutofPocket: Math.round(monthlyLoanPmt * months),
      sipFinalValue: Math.round(sumResult.accFinalValue),
      remainingPrincipal: 0,
      finalTotalAsset: Math.round(sumResult.accFinalValue),
      profit: Math.round(sumResult.accFinalValue - (monthlyLoanPmt * months))
    };
  }

  // 4. 配息轉往定期定額的終值 (Bank or Insurance)
  let sipResult;
  if (sipType === 'bank') {
    sipResult = calculateBankSIP({
      monthlyInvestment: monthlyDividend,
      annualRate: sipRate, 
      years: loanYears
    });
  } else {
    sipResult = calculateAllianzSIP({
      targetPremium: monthlyDividend * 0.7,
      excessPremium: monthlyDividend * 0.3,
      annualRate: sipRate,
      years: loanYears,
      age, gender, faceAmount
    });
  }

  // 5. 原本安達大帳戶的 100 萬經過 7 年的資產變化 (不留利息，所以本金不複利？)
  // 因為設定為「全配息」，所以安達帳戶內的本金原則上平盤，但要扣除前述的安達管理費！
  // 更精確作法：本金維持 100 萬，但每月要扣「安達帳管費跟危費」。
  // 我們先假設配息型商品本金大約維持平盤 100 萬 (這符合多數配息基金的推演)
  const remainingPrincipal = loanAmount; 
  
  const finalTotalAsset = remainingPrincipal + sipResult.finalValue;

  return {
    monthlyLoanPmt: Math.round(monthlyLoanPmt),
    monthlyDividend: Math.round(monthlyDividend),
    netMonthlyCashflow: Math.round(netMonthlyCashflow), // 正值代表領錢，負值代表掏錢
    totalOutofPocket: Math.round(totalOutofPocket), // 7年真實血汗付出
    sipFinalValue: Math.round(sipResult.finalValue), // 養出來的雞
    remainingPrincipal: Math.round(remainingPrincipal), // 原本的大額本金
    finalTotalAsset: Math.round(finalTotalAsset), // 貸款結清後，淨擁有的雙重資產！
    profit: Math.round(finalTotalAsset - totalOutofPocket)
  };
}

// -------------------------------------------------------------
// 6. 房貸套利綜合試算 (Mortgage Arbitrage Engine)
// -------------------------------------------------------------
export function calculateMortgageArbitrage({
  mortgageType,    // 'grace' or 'interest_only'
  loanAmount,
  loanYears,
  loanRate,
  graceYears,
  dividendRate,
  sipType,
  sipRate,
  age, gender, faceAmount
}) {
  const months = loanYears * 12;
  const graceMonths = graceYears * 12;
  const moLoanRate = (loanRate / 100) / 12;
  
  let pmtGrace = 0;
  let pmtPostGrace = 0;
  let totalOutofPocket = 0;
  
  if (mortgageType === 'interest_only') {
    pmtGrace = loanAmount * moLoanRate;
    pmtPostGrace = pmtGrace;
    totalOutofPocket = pmtGrace * months;
  } else {
    pmtGrace = loanAmount * moLoanRate;
    const postGraceMonths = months - graceMonths;
    pmtPostGrace = postGraceMonths > 0 ? calculatePMT(loanAmount, loanRate, loanYears - graceYears) : 0;
    totalOutofPocket = (pmtGrace * graceMonths) + (pmtPostGrace * postGraceMonths);
  }

  const monthlyDividend = (loanAmount * (dividendRate / 100)) / 12;
  const netCashflowGrace = monthlyDividend - pmtGrace;
  const netCashflowPost = monthlyDividend - pmtPostGrace;

  if (sipType === 'lumpsum') {
    const sumResult = calculateChubbLumpSum({
      lumpSum: loanAmount,
      annualRate: sipRate, 
      years: loanYears,
      age: age,
      gender: gender,
      faceAmount: faceAmount,
      isHighPremium: true,
      reinvestType: 'none'
    });
    return {
      pmtGrace: Math.round(pmtGrace),
      pmtPostGrace: Math.round(pmtPostGrace),
      monthlyDividend: 0,
      netCashflowGrace: Math.round(-pmtGrace),
      netCashflowPost: Math.round(-pmtPostGrace),
      totalOutofPocket: Math.round(totalOutofPocket),
      sipFinalValue: Math.round(sumResult.accFinalValue),
      remainingPrincipal: 0,
      finalTotalAsset: Math.round(sumResult.accFinalValue),
      profit: Math.round(sumResult.accFinalValue - totalOutofPocket)
    };
  }

  let sipResult;
  if (sipType === 'bank') {
    sipResult = calculateBankSIP({
      monthlyInvestment: monthlyDividend,
      annualRate: sipRate,
      years: loanYears
    });
  } else {
    sipResult = calculateAllianzSIP({
      targetPremium: monthlyDividend * 0.7,
      excessPremium: monthlyDividend * 0.3,
      annualRate: sipRate,
      years: loanYears,
      age, gender, faceAmount
    });
  }

  const remainingPrincipal = loanAmount; 
  const finalTotalAsset = remainingPrincipal + sipResult.finalValue;

  return {
    pmtGrace: Math.round(pmtGrace),
    pmtPostGrace: Math.round(pmtPostGrace),
    monthlyDividend: Math.round(monthlyDividend),
    netCashflowGrace: Math.round(netCashflowGrace),
    netCashflowPost: Math.round(netCashflowPost),
    totalOutofPocket: Math.round(totalOutofPocket),
    sipFinalValue: Math.round(sipResult.finalValue),
    remainingPrincipal: Math.round(remainingPrincipal),
    finalTotalAsset: Math.round(finalTotalAsset),
    profit: Math.round(finalTotalAsset - totalOutofPocket)
  };
}
