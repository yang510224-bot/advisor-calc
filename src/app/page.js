'use client'

import { useState, useEffect } from 'react';
import { calculatePMT, calculateBankSIP, calculateAllianzSIP, calculateChubbLumpSum, calculateArbitrage, getMinimumFaceAmountRatio } from '../utils/calculations';

export default function AdvisorCalculator() {
  const [activeTab, setActiveTab] = useState('sip'); // sip, lumpsum, loan, arbitrage

  // SIP Params
  const [sipParams, setSipParams] = useState({
    targetPremium: 5000,
    excessPremium: 0,
    bankInvestment: 5000,
    annualRate: 6,
    years: 10,
    age: 34,
    gender: 'M',
    faceAmount: 2500000
  });

  // LumpSum Params (Chubb)
  const [lumpSumParams, setLumpSumParams] = useState({
    lumpSum: 1000000,
    annualRate: 6,
    years: 10,
    age: 34,
    gender: 'M',
    faceAmount: 2500000,
    isHighPremium: true
  });

  // Loan Params
  const [loanParams, setLoanParams] = useState({
    type: 'personal', // personal, mortgage
    amount: 1000000,
    years: 7,
    rate: 3
  });

  // Arbitrage Params
  const [arbitrageParams, setArbitrageParams] = useState({
    loanAmount: 1000000,
    loanYears: 7,
    loanRate: 3,
    dividendRate: 7,
    sipRate: 6, // 定期定額滾存率
    sipType: 'bank', // bank or insurance
    faceAmount: 2500000,
    age: 34,
    gender: 'M'
  });

  // UI Updates helper
  const updateSip = (key, val) => setSipParams(prev => ({ ...prev, [key]: key === 'gender' ? val : Number(val) }));
  const updateLump = (key, val) => setLumpSumParams(prev => ({ ...prev, [key]: key === 'gender' ? val : (val === 'true' ? true : (val === 'false' ? false : Number(val))) }));
  const updateLoan = (key, val) => setLoanParams(prev => ({ ...prev, [key]: key === 'type' ? val : Number(val) }));
  const updateArb = (key, val) => setArbitrageParams(prev => ({ ...prev, [key]: key === 'sipType' || key === 'gender' ? val : Number(val) }));

  // Results
  const [sipResult, setSipResult] = useState(null);
  const [lumpResult, setLumpResult] = useState(null);
  const [loanPmt, setLoanPmt] = useState(0);
  const [arbResult, setArbResult] = useState(null);

  // Live Recalculation
  useEffect(() => {
    // 1. SIP Recalc
    const bankSip = calculateBankSIP({
      monthlyInvestment: sipParams.bankInvestment,
      annualRate: sipParams.annualRate,
      years: sipParams.years
    });
    const allianzSip = calculateAllianzSIP({
      targetPremium: sipParams.targetPremium,
      excessPremium: sipParams.excessPremium,
      annualRate: sipParams.annualRate,
      years: sipParams.years,
      age: sipParams.age,
      gender: sipParams.gender,
      faceAmount: sipParams.faceAmount
    });
    setSipResult({ bank: bankSip, allianz: allianzSip });

    // 2. LumpSum Recalc
    const chubbRatio = getMinimumFaceAmountRatio(lumpSumParams.age);
    const chubbFaceAmount = lumpSumParams.lumpSum * chubbRatio;
    const chubbSum = calculateChubbLumpSum({
      ...lumpSumParams,
      faceAmount: chubbFaceAmount
    });
    setLumpResult({...chubbSum, currentRatio: chubbRatio, autoFaceAmount: chubbFaceAmount});

    // 3. Loan Recalc
    setLoanPmt(calculatePMT(loanParams.amount, loanParams.rate, loanParams.years));

    // 4. Arbitrage Recalc
    setArbResult(calculateArbitrage(arbitrageParams));
  }, [sipParams, lumpSumParams, loanParams, arbitrageParams]);

  const formatMoney = (val) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>專業財務顧問計算機 💼 <span style={{fontSize:'16px', color:'#718096', fontWeight:'normal'}}>(v2 穩定版)</span></h1>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '32px' }}>
        高階套利分析與多元理財模組核算引擎
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['sip', 'lumpsum', 'loan', 'arbitrage'].map(tab => (
          <button 
            key={tab}
            className={`btn ${activeTab === tab ? '' : 'btn-secondary'}`}
            style={{ flex: 1, minWidth: '150px' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'sip' && '對比：定期定額'}
            {tab === 'lumpsum' && '滾存：單筆大額'}
            {tab === 'loan' && '計算：各類貸款'}
            {tab === 'arbitrage' && '🔥 終極信貸套利'}
          </button>
        ))}
      </div>

      <div className="fade-in">
        {/* TAB 1: 定期定額比較 */}
        {activeTab === 'sip' && sipResult && (
          <div className="card">
            <h2>一般銀行定額 vs 投資型定額 (安聯)</h2>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">年紀與性別</label>
                <div className="flex gap-2">
                  <input type="number" className="form-input" value={sipParams.age} onChange={e => updateSip('age', e.target.value)} />
                  <select className="form-input" value={sipParams.gender} onChange={e => updateSip('gender', e.target.value)}>
                    <option value="M">男性</option>
                    <option value="F">女性</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">設定身故保額 (元)</label>
                <input type="number" className="form-input" value={sipParams.faceAmount} onChange={e => updateSip('faceAmount', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">規劃期限 (年) / 預估年化 (%)</label>
                <div className="flex gap-2">
                  <input type="number" className="form-input" value={sipParams.years} onChange={e => updateSip('years', e.target.value)} />
                  <input type="number" className="form-input" value={sipParams.annualRate} onChange={e => updateSip('annualRate', e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '16px' }}>
              {/* Bank SIP Input */}
              <div style={{ flex: '1 1 45%', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                <h3 style={{ color: '#4A5568' }}>銀行定額設定 (0手續費)</h3>
                <div className="form-group">
                  <label className="form-label">每月投入 (元)</label>
                  <input type="number" className="form-input" value={sipParams.bankInvestment} onChange={e => updateSip('bankInvestment', e.target.value)} />
                </div>
                <div style={{ marginTop: '24px', borderTop: '2px dashed #CBD5E0', paddingTop: '16px' }}>
                  <p>總投入成本：<strong>{formatMoney(sipResult.bank.totalInvested)}</strong></p>
                  <p style={{ fontSize: '20px', color: 'var(--success-color)', fontWeight: 'bold' }}>最終淨值：{formatMoney(sipResult.bank.finalValue)}</p>
                </div>
              </div>

              {/* Allianz SIP Input */}
              <div style={{ flex: '1 1 45%', padding: '16px', background: 'rgba(212,175,106,0.1)', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--primary-dark)' }}>安聯定額設定 (含保險成本)</h3>
                <div className="flex gap-2">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">目標保費 (元)</label>
                    <input type="number" className="form-input" value={sipParams.targetPremium} onChange={e => updateSip('targetPremium', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">超額保費 (元)</label>
                    <input type="number" className="form-input" value={sipParams.excessPremium} onChange={e => updateSip('excessPremium', e.target.value)} />
                  </div>
                </div>
                <div style={{ marginTop: '8px', borderTop: '2px dashed var(--primary-color)', paddingTop: '16px' }}>
                  <p>總投入成本：<strong>{formatMoney(sipResult.allianz.totalInvested)}</strong></p>
                  <p style={{ fontSize: '20px', color: 'var(--success-color)', fontWeight: 'bold' }}>最終淨值：{formatMoney(sipResult.allianz.finalValue)}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)'}}>*已內扣每月100建黨費及動態NAR危險保費</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 單筆大額 */}
        {activeTab === 'lumpsum' && lumpResult && (
          <div className="card">
            <h2>安達富貴大贏家 - 單筆滾存 (不配息)</h2>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">單筆投入資金 (元)</label>
                <input type="number" className="form-input" value={lumpSumParams.lumpSum} onChange={e => updateLump('lumpSum', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">預估年化報酬率 (%)</label>
                <input type="number" className="form-input" value={lumpSumParams.annualRate} onChange={e => updateLump('annualRate', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">滾存年期 (年)</label>
                <input type="number" className="form-input" value={lumpSumParams.years} onChange={e => updateLump('years', e.target.value)} />
              </div>
            </div>

              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">年紀與性別</label>
                <div className="flex gap-2">
                  <input type="number" className="form-input" value={lumpSumParams.age} onChange={e => updateLump('age', e.target.value)} />
                  <select className="form-input" value={lumpSumParams.gender} onChange={e => updateLump('gender', e.target.value)}>
                    <option value="M">男性</option>
                    <option value="F">女性</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">自動核算身故保額 (元)</label>
                <div className="flex gap-2 align-center">
                  <input type="text" className="form-input" value={formatMoney(lumpResult.autoFaceAmount)} disabled style={{ background: '#edf2f7', cursor: 'not-allowed', color: '#4a5568' }} />
                  <span style={{ whiteSpace: 'nowrap', color: 'var(--primary-dark)', fontWeight: 'bold' }}>({Math.round(lumpResult.currentRatio * 100)}%)</span>
                </div>
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                <label className="form-label">此筆為「高保費」級距？</label>
                <select className="form-input" value={lumpSumParams.isHighPremium} onChange={e => updateLump('isHighPremium', e.target.value)}>
                   <option value="true">是 (免每月100元保管費)</option>
                   <option value="false">否 (須扣每月100保管費)</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: '8px', marginTop: '16px', textAlign: 'center' }}>
              <h3>歷經 {lumpSumParams.years} 年滾存後終值： <span className="text-success" style={{ fontSize: '28px' }}>{formatMoney(lumpResult.finalValue)}</span></h3>
              <p style={{ color: 'var(--text-light)' }}>已涵蓋安達前四年 (0.2% ~ 0.13%) 資金管理費階梯遞減以及甲型危險保費核算</p>
            </div>
          </div>
        )}

        {/* TAB 3: 貸款 */}
        {activeTab === 'loan' && (
          <div className="card">
            <h2>獨立貸款計算機 (本息平均攤還)</h2>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
               <div className="form-group" style={{ flex: '1 1 20%' }}>
                  <label className="form-label">貸款種類</label>
                  <select className="form-input" value={loanParams.type} onChange={e => updateLoan('type', e.target.value)}>
                    <option value="personal">個人信貸</option>
                    <option value="mortgage">房屋貸款</option>
                  </select>
               </div>
               <div className="form-group" style={{ flex: '1 1 20%' }}>
                  <label className="form-label">貸款總額 (元)</label>
                  <input type="number" className="form-input" value={loanParams.amount} onChange={e => updateLoan('amount', e.target.value)} />
               </div>
               <div className="form-group" style={{ flex: '1 1 20%' }}>
                  <label className="form-label">還款年限 (年)</label>
                  <input type="number" className="form-input" value={loanParams.years} onChange={e => updateLoan('years', e.target.value)} />
               </div>
               <div className="form-group" style={{ flex: '1 1 20%' }}>
                  <label className="form-label">貸款年利率 (%)</label>
                  <input type="number" className="form-input" value={loanParams.rate} onChange={e => updateLoan('rate', e.target.value)} />
               </div>
            </div>
            
            <div style={{ marginTop: '16px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '18px' }}>試算每月應繳本息：</p>
                <div className="text-danger" style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatMoney(loanPmt)}</div>
                <p style={{ color: 'var(--text-light)' }}>此期間總付息利息約：{formatMoney((loanPmt * loanParams.years * 12) - loanParams.amount)}</p>
            </div>
          </div>
        )}

        {/* TAB 4: 終極套利 */}
        {activeTab === 'arbitrage' && arbResult && (
          <div className="card">
            <h2>🔥 終極信貸套利模擬 (借貸 👉 配息 👉 養定額)</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>演示將信貸借出的大資金投入高配息，將配息轉投入定期定額持續複利，並結算 X 年後清償債務的實質獲利。</p>
            
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>第一步：信貸起源參數</h3>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">借出總額 (元)</label>
                  <input type="number" className="form-input" value={arbitrageParams.loanAmount} onChange={e => updateArb('loanAmount', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">貸款年期 (年)[即套利期限]</label>
                  <input type="number" className="form-input" value={arbitrageParams.loanYears} onChange={e => updateArb('loanYears', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">貸款利率 (%)</label>
                  <input type="number" className="form-input" value={arbitrageParams.loanRate} onChange={e => updateArb('loanRate', e.target.value)} />
              </div>
            </div>

            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginTop: '16px' }}>第二步：配息與定額參數</h3>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">投資標的年配息率 (%)</label>
                  <input type="number" className="form-input" value={arbitrageParams.dividendRate} onChange={e => updateArb('dividendRate', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">配息投入：定期定額管道</label>
                  <select className="form-input" value={arbitrageParams.sipType} onChange={e => updateArb('sipType', e.target.value)}>
                    <option value="bank">一般銀行定額 (0成本)</option>
                    <option value="insurance">投資型定額 (含保費前置與危險)</option>
                  </select>
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">定額標的：預期年化報酬 (%)</label>
                  <input type="number" className="form-input" value={arbitrageParams.sipRate} onChange={e => updateArb('sipRate', e.target.value)} />
              </div>
            </div>

            {/* 第三步：核算結果，展示震撼對比 */}
            <div style={{ marginTop: '32px', background: 'var(--white)', border: '2px solid var(--primary-color)', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>💰 {arbitrageParams.loanYears} 年後套利大決算</h2>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  
                  {/* 付出端 */}
                  <div style={{ flex: '1 1 45%', padding: '16px', background: 'rgba(198, 40, 40, 0.05)', borderRadius: '8px' }}>
                    <h3 style={{ color: 'var(--danger-color)', textAlign: 'center' }}>🥊 客戶真實付出</h3>
                    <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '16px'}}>每月信貸須繳交: {formatMoney(arbResult.monthlyLoanPmt)}</p>
                    <p style={{ textAlign: 'center' }}>因為配息 {formatMoney(arbResult.monthlyDividend)} 全拿去滾定額<br/>客戶需以薪資支付貸款。</p>
                    <div style={{ textAlign: 'center', marginTop: '16px'}}>
                      <div style={{ fontSize: '14px' }}>{arbitrageParams.loanYears} 年自掏腰包總負擔:</div>
                      <div className="text-danger" style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(arbResult.totalOutofPocket)}</div>
                    </div>
                  </div>

                  {/* 收穫端 */}
                  <div style={{ flex: '1 1 45%', padding: '16px', background: 'rgba(46, 125, 50, 0.05)', borderRadius: '8px' }}>
                    <h3 style={{ color: 'var(--success-color)', textAlign: 'center' }}>🏆 最終總持倉資產</h3>
                    <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '16px'}}>借來的本金仍在配息帳戶中留存</p>
                    <div style={{ marginBottom: '8px' }}>
                      ✓ 大額本金底座：{formatMoney(arbResult.remainingPrincipal)} <br/>
                      ✓ 定額養大的金雞：{formatMoney(arbResult.sipFinalValue)}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px'}}>
                      <div style={{ fontSize: '14px' }}>貸款清償後，此時實質擁有總資產:</div>
                      <div className="text-success" style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(arbResult.finalTotalAsset)}</div>
                    </div>
                  </div>
                </div>

                {/* 淨算結語 */}
                <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                  <p style={{ fontSize: '18px' }}>
                    👉 這代表客戶用7年付出了 <strong>{formatMoney(arbResult.totalOutofPocket)}</strong>，
                    卻創造了價值 <strong>{formatMoney(arbResult.finalTotalAsset)}</strong> 的資產防護網。
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-dark)', marginTop: '8px' }}>
                    套利淨值轉換：+{formatMoney(arbResult.profit)}
                  </p>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
