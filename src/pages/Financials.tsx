import { Layout } from "../components/Layout";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function Financials() {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  useEffect(() => {
    async function fetchFinancials() {
      const { data: recentSales } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentSales) {
        setSales(recentSales);
      }

      const { data: allSales } = await supabase
        .from('sales')
        .select('amount, created_at, status, client_name, tx_id');

      if (allSales) {
        let monthSum = 0;
        let pendingSum = 0;

        allSales.forEach(s => {
          const sAmount = Number(s.amount);
          if (s.status?.toLowerCase().includes('pago')) {
             monthSum += sAmount;
          } else if (s.status?.toLowerCase().includes('pendente')) {
            pendingSum += sAmount;
          }
        });

        setMonthlyTotal(monthSum);
        setPendingTotal(pendingSum);
      }
      
      try {
        const { data: allExpenses, error } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!error && allExpenses) {
          setExpenses(allExpenses);
        }
      } catch (err) {
        console.error("Expenses logic error", err);
      }
    }
    fetchFinancials();
  }, []);

  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // Calculate cost centers dynamically or fallback if empty
  const operationsTotal = expenses.filter(e => e.category === 'Operacional').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const marketingTotal = expenses.filter(e => e.category === 'Marketing').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalCost = totalExpenses > 0 ? totalExpenses : 1; // Prevent div by 0
  const operationsPercent = expenses.length > 0 ? Math.round((operationsTotal / totalCost) * 100) : 45;
  const marketingPercent = expenses.length > 0 ? Math.round((marketingTotal / totalCost) * 100) : 30;

  return (
    <Layout title="Gestão Financeira">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Gestão Financeira</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Visão consolidada do seu negócio.</p>
        </div>
        <div className="flex p-1 bg-surface-container rounded-lg w-fit">
          <button className="px-4 py-2 rounded-md font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant/50 transition-colors">Semana</button>
          <button className="px-4 py-2 rounded-md font-label-md text-label-md bg-secondary-container text-on-secondary-container shadow-sm transition-colors">Mês</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Consolidated Balance Card */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-body-lg text-body-lg text-on-surface-variant">Saldo Consolidado</h2>
              <p className="font-label-sm text-label-sm text-outline mt-1">Todas as contas bancárias</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-primary">MT {monthlyTotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container/30 text-secondary-fixed-dim font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                +12.5%
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant text-sm">vs. mês anterior</span>
            </div>
          </div>
        </div>

        {/* Cost Centers Pie Chart Simulation */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] p-6">
          <h2 className="font-headline-md text-headline-md text-primary mb-6 text-xl">Centros de Custo</h2>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative w-40 h-40 rounded-full" style={{ background: "conic-gradient(#006c49 0% 45%, #1a2b4b 45% 75%, #8293b8 75% 90%, #e0e3e5 90% 100%)" }}>
              <div className="absolute inset-0 m-auto w-24 h-24 bg-surface-container-lowest rounded-full"></div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="font-body-md text-body-md text-on-surface">Operacional</span>
                </div>
                <span className="font-label-md text-label-md">{operationsPercent}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                  <span className="font-body-md text-body-md text-on-surface">Marketing</span>
                </div>
                <span className="font-label-md text-label-md">{marketingPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Receivable & Payable Overview */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-headline-md text-primary text-xl">Contas a Receber</h2>
          </div>
          <div className="mb-4">
            <div className="flex justify-between font-label-md text-label-md mb-2">
              <span className="text-on-surface-variant">Total Pendente</span>
              <span className="text-primary font-semibold">MZN {pendingTotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2">
              <div className="bg-secondary h-2 rounded-full" style={{ width: "30%" }}></div>
            </div>
          </div>
          <div className="space-y-4 mt-6">
            {sales.filter(s => s.status !== 'Pago').slice(0, 3).map((s, i) => (
              <div key={i} className="flex justify-between items-center border-b border-surface-variant/50 pb-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{s.client_name || 'Cliente'} (TX-{s.tx_id})</p>
                    <p className="font-label-sm text-label-sm text-error">Pendente</p>
                  </div>
                </div>
                <span className="font-label-md text-label-md font-semibold text-primary">MZN {Number(s.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-headline-md text-primary text-xl">Contas a Pagar</h2>
          </div>
          <div className="mb-4">
            <div className="flex justify-between font-label-md text-label-md mb-2">
              <span className="text-on-surface-variant">Total Comprometido</span>
              <span className="text-error font-semibold">MZN {(pendingExpenses || 850200).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2">
              <div className="bg-error h-2 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>
          <div className="space-y-4 mt-6">
            {expenses.length > 0 ? expenses.slice(0, 3).map((e, i) => (
              <div key={i} className="flex justify-between items-center border-b border-surface-variant/50 pb-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg bg-error-container/30 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{e.supplier_name || 'Fornecedor'}</p>
                    <p className="font-label-sm text-label-sm text-outline">{new Date(e.due_date || e.created_at).toLocaleDateString('pt-MZ')}</p>
                  </div>
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface">- MZN {Number(e.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</span>
              </div>
            )) : (
              <div className="flex justify-between items-center border-b border-surface-variant/50 pb-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg bg-error-container/30 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Fornecedores Diversos</p>
                    <p className="font-label-sm text-label-sm text-outline">Várias datas</p>
                  </div>
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface">- MZN 85.000,00</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions History */}
        <div className="lg:col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] overflow-hidden">
          <div className="p-6 border-b border-surface-variant/50 flex justify-between items-center">
            <h2 className="font-headline-md text-headline-md text-primary text-xl">Transações Recentes</h2>
          </div>
          <div className="divide-y divide-surface-variant/50">
            {sales.slice(0, 5).map((activity, i) => (
              <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-surface transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Venda #{activity.tx_id}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">{activity.client_name || 'Cliente'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-label-md text-label-md ${activity.status === 'Pago' ? 'text-secondary' : 'text-primary'}`}>+ MZN {Number(activity.amount).toFixed(2)}</p>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">{new Date(activity.created_at).toLocaleString('pt-MZ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
