import React from 'react';
import { Card, CardContent, CardHeader, Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import { FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export function GSTPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">GST Compliance</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            File returns and manage GST compliance <span className="kbd">F7</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-success-200 dark:border-success-700">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success-100 dark:bg-success-900/30">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">GSTR-1</p>
                <p className="font-semibold text-success-600">Filed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning-200 dark:border-warning-700">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning-100 dark:bg-warning-900/30">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">GSTR-3B</p>
                <p className="font-semibold text-warning-600">Due in 3 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                <AlertTriangle className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500">GST Input Credit</p>
                <p className="font-semibold text-slate-900 dark:text-white">₹ 78,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader action={<Button size="sm" variant="outline">View Full Report</Button>}>
            GSTR-1 Summary - January 2024
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Section</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Records</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Value (₹)</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Tax (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {[
                  { section: 'B2B - Registered', records: 45, value: 1250000, tax: 225000 },
                  { section: 'B2C - Small', records: 128, value: 456000, tax: 82080 },
                  { section: 'B2C - Large', records: 12, value: 289000, tax: 52020 },
                  { section: 'Credit/Debit Notes', records: 5, value: 45000, tax: 8100 },
                  { section: 'Export', records: 3, value: 156000, tax: 0 },
                ].map((row) => (
                  <tr key={row.section} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">{row.section}</td>
                    <td className="px-4 py-3 text-right">{row.records}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.value.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.tax.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-700 font-medium">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">193</td>
                  <td className="px-4 py-3 text-right font-mono">{(1250000 + 456000 + 289000 + 45000 + 156000).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right font-mono">367200</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Quick Actions</CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button fullWidth variant="outline">Generate GSTR-1</Button>
              <Button fullWidth variant="outline">Generate GSTR-3B</Button>
              <Button fullWidth variant="outline">HSN/SAC Summary</Button>
              <Button fullWidth variant="outline">GST Input Report</Button>
              <Button fullWidth variant="outline">Reconciliation</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function GSTR1Page() {
  const b2bData = [
    { gstin: '27AABCC1234M1Z5', name: 'ABC Corp', invoice: 'INV-001', date: '2024-01-15', value: 45000, tax: 8100 },
    { gstin: '07AABCX5678L1Z2', name: 'XYZ Ltd', invoice: 'INV-002', date: '2024-01-15', value: 32500, tax: 5850 },
    { gstin: '29AABCG9012N1Z8', name: 'Global Traders', invoice: 'INV-003', date: '2024-01-14', value: 28000, tax: 5040 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">GSTR-1 Report</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Outward Supplies for January 2024</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export JSON</Button>
          <Button>File Return</Button>
        </div>
      </div>

      <Card>
        <CardHeader>B2B - Registered Taxable Supplies</CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">GSTIN</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Invoice</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Value</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {b2bData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-xs">{row.gstin}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.invoice}</td>
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3 text-right font-mono">{row.value.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right font-mono">{row.tax.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export function GSTR3BPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">GSTR-3B Report</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Summary Return for January 2024</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export JSON</Button>
          <Button>File Return</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>3.1 - Outward Supplies</CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nature</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Taxable Value</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">IGST</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">CGST</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">SGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {[
                  { nature: '(a) Taxable outward supplies', value: 1245000, igst: 0, cgst: 112050, sgst: 112050 },
                  { nature: '(b) Zero-rated supplies', value: 156000, igst: 0, cgst: 0, sgst: 0 },
                  { nature: '(c) Exempt supplies', value: 45000, igst: 0, cgst: 0, sgst: 0 },
                ].map((row) => (
                  <tr key={row.nature} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-xs">{row.nature}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.value.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.igst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.cgst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.sgst.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>4 - Eligible ITC</CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">IGST</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">CGST</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">SGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {[
                  { desc: 'Import of goods', igst: 15000, cgst: 0, sgst: 0 },
                  { desc: 'Inputs', igst: 0, cgst: 28000, sgst: 28000 },
                  { desc: 'Capital goods', igst: 0, cgst: 7000, sgst: 7000 },
                ].map((row) => (
                  <tr key={row.desc} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-xs">{row.desc}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.igst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.cgst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.sgst.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-700 font-medium">
                <tr>
                  <td className="px-4 py-3">Total ITC</td>
                  <td className="px-4 py-3 text-right font-mono">15,000</td>
                  <td className="px-4 py-3 text-right font-mono">35,000</td>
                  <td className="px-4 py-3 text-right font-mono">35,000</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
