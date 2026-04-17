'use client'

import { useState, useEffect } from 'react';
import { calculatePMT, calculateBankSIP, calculateAllianzSIP, calculateChubbLumpSum, calculateArbitrage, calculateMortgageArbitrage, getMinimumFaceAmountRatio } from '../utils/calculations';

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
    isHighPremium: true,
    reinvestType: 'none',
    reinvestRate: 6,
    reinvestFaceAmount: 2000000
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

  // Mortgage Params
  const [mortgageParams, setMortgageParams] = useState({
    mortgageType: 'grace', // grace, interest_only
    loanAmount: 10000000,
    loanYears: 30, // Usually 30 years
    loanRate: 2.1,
    graceYears: 3,
    dividendRate: 7,
    sipRate: 6,
    sipType: 'bank',
    faceAmount: 2500000,
    age: 34,
    gender: 'M'
  });

  // UI Updates helper
  const updateSip = (key, val) => setSipParams(prev => ({ ...prev, [key]: key === 'gender' ? val : Number(val) }));
  const updateLump = (key, val) => setLumpSumParams(prev => ({ ...prev, [key]: key === 'gender' || key === 'reinvestType' ? val : (val === 'true' ? true : (val === 'false' ? false : Number(val))) }));
  const updateLoan = (key, val) => setLoanParams(prev => ({ ...prev, [key]: key === 'type' ? val : Number(val) }));
  const updateArb = (key, val) => setArbitrageParams(prev => ({ ...prev, [key]: key === 'sipType' || key === 'gender' ? val : Number(val) }));
  const updateMort = (key, val) => setMortgageParams(prev => ({ ...prev, [key]: key === 'sipType' || key === 'gender' || key === 'mortgageType' ? val : Number(val) }));

  // Results
  const [sipResult, setSipResult] = useState(null);
  const [lumpResult, setLumpResult] = useState(null);
  const [loanPmt, setLoanPmt] = useState(0);
  const [arbResult, setArbResult] = useState(null);
  const [mortgageResult, setMortgageResult] = useState(null);

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

    // 5. Mortgage Recalc
    setMortgageResult(calculateMortgageArbitrage(mortgageParams));
  }, [sipParams, lumpSumParams, loanParams, arbitrageParams, mortgageParams]);

  const formatMoney = (val) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>專業財務顧問計算機 💼 <span style={{fontSize:'16px', color:'#718096', fontWeight:'normal'}}>(v2 穩定版)</span></h1>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '32px' }}>
        高階套利分析與多元理財模組核算引擎
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['sip', 'lumpsum', 'loan', 'arbitrage', 'mortgage'].map(tab => (
          <button 
            key={tab}
            className={`btn ${activeTab === tab ? '' : 'btn-secondary'}`}
            style={{ flex: 1, minWidth: '150px' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'sip' && '對比：定期定額'}
            {tab === 'lumpsum' && '滾存：單筆大額'}
            {tab === 'loan' && '計算：各類貸款'}
            {tab === 'arbitrage' && '🔥 信貸套利'}
            {tab === 'mortgage' && '🏠 房貸印鈔機'}
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

            <div style={{ marginTop: '24px', padding: '16px', background: '#FEF3C7', borderRadius: '8px', borderLeft: '5px solid #D97706' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#B45309', marginBottom: '8px' }}>
                🛡️ 深層防護罩價值拆解：買保單值得嗎？
              </div>
              <div style={{ fontSize: '15px', color: '#78350f', lineHeight: '1.6' }}>
                這 {sipParams.years} 年的過程中，若發生走得太早的意外：
                <ul style={{ paddingLeft: '24px', margin: '8px 0' }}>
                  <li><strong>銀行定額：</strong> 家屬 <span style={{ color: '#dc2626' }}>僅能領回當時的投資現值</span> (且若逢股災可能還會面臨虧損)。</li>
                  <li><strong>投資型保單：</strong> 立即啟動高達 <strong style={{ fontSize: '18px', color: '#16a34a' }}>{formatMoney(sipParams.faceAmount)}</strong> 的身故防護罩理賠金！</li>
                </ul>
                <div style={{ marginTop: '12px', borderTop: '1px dashed #d97706', paddingTop: '12px' }}>
                  雖然 {sipParams.years} 年後保單淨值比銀行少了 {formatMoney(Math.max(0, sipResult.bank.finalValue - sipResult.allianz.finalValue))} 左右，但攤提下來，您平均每個月只花了大約 <strong>{formatMoney(Math.max(0, sipResult.bank.finalValue - sipResult.allianz.finalValue) / (sipParams.years * 12))}</strong> 的成本，就幫家庭撐起了幾百萬的巨盾！這是在銀行單純存錢絕對買不到的防護機制。
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: 單筆大額 */}
        {activeTab === 'lumpsum' && lumpResult && (
          <div className="card">
            <h2>安Ｘ富貴大Ｘ家 - 單筆滾存 (不配息)</h2>
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

            <div className="flex gap-4" style={{ flexWrap: 'wrap', marginTop: '16px' }}>
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

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>
              <div style={{ flex: '1 1 45%', padding: '20px', background: 'rgba(46, 125, 50, 0.05)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(46, 125, 50, 0.2)' }}>
                <h3 style={{ color: 'var(--success-color)' }}>📈 A. 單筆全額滾存 (不配息)</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '16px' }}>利息全數再投資，挑戰極限複利</p>
                <div style={{ marginBottom: '8px' }}>歷經 {lumpSumParams.years} 年後保單現值：</div>
                <div className="text-success" style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatMoney(lumpResult.accFinalValue)}</div>
              </div>

              <div style={{ flex: '1 1 45%', padding: '20px', background: 'rgba(198, 40, 40, 0.05)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(198, 40, 40, 0.2)' }}>
                <h3 style={{ color: 'var(--danger-color)' }}>💸 B. 單筆月配息 (維持 {lumpSumParams.annualRate}%)</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '16px' }}>利息全數以現金領出，本金獨自承擔隱含費用</p>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
                   <div>
                     <div style={{ fontSize: '13px', color: '#718096' }}>累積已領配息總和</div>
                     <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#4A5568' }}>{formatMoney(lumpResult.divTotalDistributed)}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '13px', color: '#718096' }}>最終剩餘保單現值</div>
                     <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#4A5568' }}>{formatMoney(lumpResult.divPrincipal)}</div>
                   </div>
                </div>
                <div style={{ borderTop: '1px dashed #CBD5E0', paddingTop: '16px' }}>
                  <div style={{ fontSize: '14px' }}>配息動向設定：</div>
                  <div className="flex gap-2" style={{ marginTop: '8px' }}>
                    <select className="form-input" style={{ flex: '2', padding: '8px', fontSize: '13px' }} value={lumpSumParams.reinvestType} onChange={e => updateLump('reinvestType', e.target.value)}>
                      <option value="none">配息全數領出現金</option>
                      <option value="bank">配息全投入 一般銀行定額</option>
                      <option value="insurance">配息全投入 投資型定額 (安聯)</option>
                    </select>
                    {lumpSumParams.reinvestType !== 'none' && (
                      <input type="number" className="form-input" style={{ flex: '1', padding: '8px', fontSize: '13px' }} value={lumpSumParams.reinvestRate} onChange={e => updateLump('reinvestRate', e.target.value)} title="自訂投報率%" placeholder="投報率%" />
                    )}
                    {lumpSumParams.reinvestType === 'insurance' && (
                      <input type="number" className="form-input" style={{ flex: '1', padding: '8px', fontSize: '13px' }} value={lumpSumParams.reinvestFaceAmount} onChange={e => updateLump('reinvestFaceAmount', e.target.value)} title="自訂新單保額" placeholder="新單保額" />
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #CBD5E0', paddingTop: '16px', marginTop: '16px' }}>
                  <div style={{ fontSize: '14px' }}>總資產 ({lumpSumParams.reinvestType === 'none' ? '現金配息' : '配息定額終值'} ＋ 剩餘本金)：</div>
                  <div className="text-danger" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {formatMoney(
                      lumpSumParams.reinvestType === 'none' 
                        ? lumpResult.divTotalAsset 
                        : lumpResult.divPrincipal + (lumpResult.reinvestResult?.finalValue || 0)
                    )}
                  </div>
                  {lumpSumParams.reinvestType !== 'none' && lumpResult.reinvestResult && (
                    <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', marginTop: '12px', textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', color: '#4A5568', fontWeight: 'bold' }}>
                        🔹 其中定額滾存終值：<span className="text-success">{formatMoney(lumpResult.reinvestResult.finalValue)}</span>
                      </div>
                      {lumpSumParams.reinvestType === 'insurance' && lumpResult.reinvestResult.faceAmount && (
                        <>
                          <div style={{ fontSize: '14px', color: '#d97706', marginTop: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🛡️ 額外獲得子單防護：<span style={{ fontSize: '16px' }}>{formatMoney(lumpResult.reinvestResult.faceAmount)}</span>
                          </div>
                          <div style={{ fontSize: '15px', color: '#b45309', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(217,119,6,0.3)', fontWeight: 'bold' }}>
                            🔥 萬一發生意外，【母單＋子單】共計將理賠約：<br/>
                            <span style={{ fontSize: '24px', color: '#ea580c' }}>{formatMoney(lumpResult.autoFaceAmount + lumpSumParams.reinvestFaceAmount)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-light)', textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>*以上試算皆已精準涵蓋安Ｘ前四年 (0.2% ~ 0.13%) 資金管理費階梯遞減、以及每月隨保單價值與年紀變動之甲型危險保費核算。</p>
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
                    <option value="bank">分流定額：一般銀行定額 (0成本)</option>
                    <option value="insurance">分流定額：投資型定額 (含保費前置與危險)</option>
                    <option value="lumpsum">直接滾存：單筆大額不配息 (全額複利)</option>
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
                    <p style={{ textAlign: 'center' }}>
                      {arbitrageParams.sipType === 'lumpsum' 
                        ? '信貸直接全額滾存，配息 $0。客戶需以薪資支付全額貸款。'
                        : `因為配息 ${formatMoney(arbResult.monthlyDividend)} 全拿去滾定額，客戶需以薪資支付信貸。`
                      }
                    </p>
                    <div style={{ textAlign: 'center', marginTop: '16px'}}>
                      <div style={{ fontSize: '14px' }}>{arbitrageParams.loanYears} 年自掏腰包總負擔:</div>
                      <div className="text-danger" style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(arbResult.totalOutofPocket)}</div>
                    </div>
                  </div>

                  {/* 收穫端 */}
                  <div style={{ flex: '1 1 45%', padding: '16px', background: 'rgba(46, 125, 50, 0.05)', borderRadius: '8px' }}>
                    <h3 style={{ color: 'var(--success-color)', textAlign: 'center' }}>🏆 最終總持倉資產</h3>
                    <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '16px'}}>
                      {arbitrageParams.sipType === 'lumpsum' ? '全額母單滾存後價值' : '借來的本金仍在配息帳戶中留存'}
                    </p>
                    <div style={{ marginBottom: '8px' }}>
                      {arbitrageParams.sipType !== 'lumpsum' && (
                        <>✓ 大額本金底座：{formatMoney(arbResult.remainingPrincipal)} <br/></>
                      )}
                      ✓ {arbitrageParams.sipType === 'lumpsum' ? '單筆滾存大金庫' : '定額養大的金雞'}：{formatMoney(arbResult.sipFinalValue)}
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

        {/* TAB 5: 房貸套利印鈔機 */}
        {activeTab === 'mortgage' && mortgageResult && (
          <div className="card">
            <h2>🏠 房貸印鈔機 (活化不動產轉保險利差)</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>活化不動產淨值，搭配銀行寬限期或理財型房貸，將房貸資金轉作美元債或高配息保單，賺取利差並加掛巨大防護罩。</p>
            
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>第一步：房貸專案參數</h3>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">房貸類型</label>
                  <select className="form-input" value={mortgageParams.mortgageType} onChange={e => updateMort('mortgageType', e.target.value)}>
                    <option value="grace">一般房貸 (附寬限期型)</option>
                    <option value="interest_only">理財型房貸 (全程只繳息)</option>
                  </select>
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">增/房貸總額 (元)</label>
                  <input type="number" className="form-input" value={mortgageParams.loanAmount} onChange={e => updateMort('loanAmount', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">房貸總年期 (年)</label>
                  <input type="number" className="form-input" value={mortgageParams.loanYears} onChange={e => updateMort('loanYears', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">房貸利率 (%)</label>
                  <input type="number" className="form-input" value={mortgageParams.loanRate} onChange={e => updateMort('loanRate', e.target.value)} />
              </div>
              {mortgageParams.mortgageType === 'grace' && (
                <div className="form-group" style={{ flex: '1 1 30%' }}>
                    <label className="form-label">寬限期 (年) [不在此列則免填]</label>
                    <input type="number" className="form-input" value={mortgageParams.graceYears} onChange={e => updateMort('graceYears', e.target.value)} />
                </div>
              )}
            </div>

            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginTop: '16px' }}>第二步：投資標的與配息動向</h3>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">母單：年配息率 (%)</label>
                  <input type="number" className="form-input" value={mortgageParams.dividendRate} onChange={e => updateMort('dividendRate', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">配息投入動向</label>
                  <select className="form-input" value={mortgageParams.sipType} onChange={e => updateMort('sipType', e.target.value)}>
                    <option value="bank">分流定額：一般銀行定額 (0成本)</option>
                    <option value="insurance">分流定額：投資型定額 (雙重防護網)</option>
                    <option value="lumpsum">直接滾存：單筆大額不配息 (全額複利)</option>
                  </select>
              </div>
              <div className="form-group" style={{ flex: '1 1 30%' }}>
                  <label className="form-label">標的：預期年化報酬 (%)</label>
                  <input type="number" className="form-input" value={mortgageParams.sipRate} onChange={e => updateMort('sipRate', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '32px', background: 'var(--white)', border: '2px solid var(--primary-color)', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>🏦 {mortgageParams.loanYears} 年套利與現金流決算</h2>
                <div style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '24px' }}>每月母單配息將產生：<strong style={{ color: '#2d3748', fontSize: '18px' }}>{formatMoney(mortgageResult.monthlyDividend)}</strong></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  
                  {/* 付出與現金流 */}
                  <div style={{ flex: '1 1 45%', padding: '16px', background: 'rgba(217, 119, 6, 0.05)', borderRadius: '8px' }}>
                    <h3 style={{ color: '#b45309', textAlign: 'center' }}>💸 房貸繳款與現金流盈虧</h3>
                    
                    {mortgageParams.mortgageType === 'grace' ? (
                       <>
                         <div style={{ marginTop: '16px' }}>
                           <strong style={{ color: '#92400e' }}>前 {mortgageParams.graceYears} 年 (寬限期)</strong><br/>
                           每月房貸：{formatMoney(mortgageResult.pmtGrace)}<br/>
                           每月現金流 (配息已扣除房貸)：
                           <span className={mortgageResult.netCashflowGrace >= 0 ? "text-success" : "text-danger"}>
                             {formatMoney(mortgageResult.netCashflowGrace)}
                           </span>
                         </div>
                         <div style={{ marginTop: '16px' }}>
                           <strong style={{ color: '#92400e' }}>第 {mortgageParams.graceYears + 1} 年起 (本息攤還)</strong><br/>
                           每月房貸：{formatMoney(mortgageResult.pmtPostGrace)}<br/>
                           每月現金流 (配息已扣除房貸)：
                           <span className={mortgageResult.netCashflowPost >= 0 ? "text-success" : "text-danger"}>
                             {formatMoney(mortgageResult.netCashflowPost)}
                           </span>
                         </div>
                       </>
                    ) : (
                       <div style={{ marginTop: '16px' }}>
                         <strong style={{ color: '#92400e' }}>全程理財型 (只繳息)</strong><br/>
                         每月房貸：{formatMoney(mortgageResult.pmtGrace)}<br/>
                         每月淨現金流 (盈餘或缺口)：
                         <span className={mortgageResult.netCashflowGrace >= 0 ? "text-success" : "text-danger"}>
                           {formatMoney(mortgageResult.netCashflowGrace)}
                         </span>
                       </div>
                    )}
                    
                    <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #d97706'}}>
                      <div style={{ fontSize: '14px' }}>{mortgageParams.loanYears} 年自掏腰包總負擔 (房貸本利總額):</div>
                      <div className="text-danger" style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatMoney(mortgageResult.totalOutofPocket)}</div>
                    </div>
                  </div>

                  {/* 收穫端 */}
                  <div style={{ flex: '1 1 45%', padding: '16px', background: 'rgba(46, 125, 50, 0.05)', borderRadius: '8px' }}>
                    <h3 style={{ color: 'var(--success-color)', textAlign: 'center' }}>🏆 最終總資產結算</h3>
                    <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '16px'}}>
                      {mortgageParams.sipType === 'lumpsum' ? '全額母單滾存後價值' : '借來的房款本金底座加上子單系統'}
                    </p>
                    <div style={{ marginBottom: '8px' }}>
                      {mortgageParams.sipType !== 'lumpsum' && (
                        <>✓ 母單本金底座：{formatMoney(mortgageResult.remainingPrincipal)} <br/></>
                      )}
                      ✓ {mortgageParams.sipType === 'lumpsum' ? '單筆滾存大金庫' : '定額系統最終淨值'}：{formatMoney(mortgageResult.sipFinalValue)}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px'}}>
                      <div style={{ fontSize: '14px' }}>{mortgageParams.loanYears} 年後，實質擁有現金資產:</div>
                      <div className="text-success" style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(mortgageResult.finalTotalAsset)}</div>
                    </div>
                  </div>
                </div>

                {/* 淨算結語 */}
                <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                  <p style={{ fontSize: '18px' }}>
                    👉 用這棟房子的 {formatMoney(mortgageParams.loanAmount)} 轉做資本運作，支付了 <strong>{formatMoney(mortgageResult.totalOutofPocket)}</strong> 的房貸，
                  </p>
                  <p style={{ fontSize: '18px' }}>
                    結清房貸後，還倒賺了高達 <strong>{formatMoney(mortgageResult.profit)}</strong> 的龐大利差資產！
                  </p>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
