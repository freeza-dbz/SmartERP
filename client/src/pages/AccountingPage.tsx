import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button } from '../components/ui';
import { FileText, Calculator, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}

export function TrialBalancePage() {
  const { selectedCompany, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  useEffect(() => {
    if (!selectedCompany) return;
    const companyId = selectedCompany._id || selectedCompany.id;
    setLoading(true);
    api.get(`/reports/trial-balance?companyId=${companyId}`)
      .then(res => {
        setRows(res.data.data.rows);
        setTotalDebit(res.data.data.totalDebit);
        setTotalCredit(res.data.data.totalCredit);
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load trial balance' }))
      .finally(() => setLoading(false));
  }, [selectedCompany, addToast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trial Balance</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Summary of all ledger balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Excel</Button>
          <Button variant="outline">Print</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <LoadingSpinner /> : rows.length === 0 ? (
            <p className="text-center py-16 text-slate-500">No ledger data available. Create some customers, suppliers, or ledgers first.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Ledger</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Debit (₹)</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {rows.map((ledger, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{ledger.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {ledger.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {ledger.debit > 0 ? ledger.debit.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {ledger.credit > 0 ? ledger.credit.toLocaleString('en-IN') : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 dark:bg-slate-700 font-bold">
                  <td className="px-4 py-3" colSpan={2}>Total</td>
                  <td className="px-4 py-3 text-right font-mono">{totalDebit.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right font-mono">{totalCredit.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ProfitLossPage() {
  const { selectedCompany, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  useEffect(() => {
    if (!selectedCompany) return;
    const companyId = selectedCompany._id || selectedCompany.id;
    setLoading(true);
    api.get(`/reports/profit-loss?companyId=${companyId}`)
      .then(res => {
        const d = res.data.data;
        setIncome(d.income);
        setExpenses(d.expenses);
        setTotalIncome(d.totalIncome);
        setTotalExpenses(d.totalExpenses);
        setNetProfit(d.netProfit);
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load P&L' }))
      .finally(() => setLoading(false));
  }, [selectedCompany, addToast]);

  const financialYear = selectedCompany?.financialYear || new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profit & Loss Statement</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">For financial year {financialYear}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Excel</Button>
          <Button variant="outline">Print</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <TrendingUp className="w-5 h-5 text-success-500 inline mr-2" />
                Income
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {income.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3 text-right font-mono">₹ {Number(item.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr className="bg-success-50 dark:bg-success-900/20 font-medium">
                      <td className="px-4 py-3">Total Income</td>
                      <td className="px-4 py-3 text-right font-mono text-success-700 dark:text-success-400">₹ {totalIncome.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingDown className="w-5 h-5 text-error-500 inline mr-2" />
                Expenses
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {expenses.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3 text-right font-mono">₹ {Number(item.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr className="bg-error-50 dark:bg-error-900/20 font-medium">
                      <td className="px-4 py-3">Total Expenses</td>
                      <td className="px-4 py-3 text-right font-mono text-error-700 dark:text-error-400">₹ {totalExpenses.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <Card className={netProfit >= 0 ? 'border-success-300 dark:border-success-700' : 'border-error-300 dark:border-error-700'}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                  <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                    ₹ {Math.abs(netProfit).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className={`p-4 rounded-full ${netProfit >= 0 ? 'bg-success-100 dark:bg-success-900/30' : 'bg-error-100 dark:bg-error-900/30'}`}>
                  {netProfit >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-success-600" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-error-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export function BalanceSheetPage() {
  const { selectedCompany, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [assetGroups, setAssetGroups] = useState<any[]>([]);
  const [liabilityGroups, setLiabilityGroups] = useState<any[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);

  useEffect(() => {
    if (!selectedCompany) return;
    const companyId = selectedCompany._id || selectedCompany.id;
    setLoading(true);
    api.get(`/reports/balance-sheet?companyId=${companyId}`)
      .then(res => {
        const d = res.data.data;
        setAssetGroups(d.assetGroups);
        setLiabilityGroups(d.liabilityGroups);
        setTotalAssets(d.totalAssets);
        setTotalLiabilities(d.totalLiabilities);
      })
      .catch(() => addToast({ type: 'error', title: 'Failed to load balance sheet' }))
      .finally(() => setLoading(false));
  }, [selectedCompany, addToast]);

  const asOf = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Balance Sheet</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">As on {asOf}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Excel</Button>
          <Button variant="outline">Print</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Calculator className="w-5 h-5 text-primary-500 inline mr-2" />
              Assets
            </CardHeader>
            <CardContent>
              {assetGroups.map((group) => (
                <div key={group.group} className="mb-4 last:mb-0">
                  <p className="font-medium text-slate-600 dark:text-slate-400 mb-2">{group.group}</p>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {group.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 pl-4">{item.name}</td>
                          <td className="py-2 text-right font-mono">₹ {Number(item.amount).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <hr className="my-4 border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between font-bold">
                <span>Total Assets</span>
                <span className="text-primary-600">₹ {totalAssets.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="w-5 h-5 text-primary-500 inline mr-2" />
              Liabilities & Capital
            </CardHeader>
            <CardContent>
              {liabilityGroups.map((group) => (
                <div key={group.group} className="mb-4 last:mb-0">
                  <p className="font-medium text-slate-600 dark:text-slate-400 mb-2">{group.group}</p>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {group.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 pl-4">{item.name}</td>
                          <td className="py-2 text-right font-mono">₹ {Number(item.amount).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <hr className="my-4 border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between font-bold">
                <span>Total Liabilities</span>
                <span className="text-primary-600">₹ {totalLiabilities.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
