import { Module } from '@/types';

export const MODULES: Module[] = [
  {
    id: 'accounting',
    title: 'Accounting Essentials',
    description: 'Payslips, tax basics, budgeting foundations, and work-related financial paperwork.',
    icon: 'Calculator',
    lead: 'Rui',
    topics: [
      { id: 'acc_1', title: 'Decoding Your Payslip', moduleId: 'accounting' },
      { id: 'acc_2', title: 'Tax Basics & Self-Assessment', moduleId: 'accounting' },
      { id: 'acc_3', title: 'Budgeting Foundations', moduleId: 'accounting' },
      { id: 'acc_4', title: 'Managing Work Expenses', moduleId: 'accounting' },
    ]
  },
  {
    id: 'investment',
    title: 'Future Security',
    description: 'Risk awareness, long-term security, pensions, and responsible investment basics.',
    icon: 'TrendingUp',
    lead: 'Helen',
    topics: [
      { id: 'inv_1', title: 'Understanding Financial Risk', moduleId: 'investment' },
      { id: 'inv_2', title: 'Pensions & Long-term Security', moduleId: 'investment' },
      { id: 'inv_3', title: 'Responsible Investment Basics', moduleId: 'investment' },
      { id: 'inv_4', title: 'Building Financial Resilience', moduleId: 'investment' },
    ]
  },
  {
    id: 'management',
    title: 'Household Management',
    description: 'Household cashflow, irregular income, debt awareness, and financial planning for stability.',
    icon: 'Briefcase',
    lead: 'Yan',
    topics: [
      { id: 'mgt_1', title: 'Mastering Household Cashflow', moduleId: 'management' },
      { id: 'mgt_2', title: 'Managing Irregular Income', moduleId: 'management' },
      { id: 'mgt_3', title: 'Debt Awareness & Management', moduleId: 'management' },
      { id: 'mgt_4', title: 'Planning for Stability', moduleId: 'management' },
    ]
  },
  {
    id: 'fintech',
    title: 'Digital Finance (FinTech)',
    description: 'Safe digital payments, online banking tools, fraud awareness, and practical fintech for daily life.',
    icon: 'Cpu',
    lead: 'Xiaojun',
    topics: [
      { id: 'fin_1', title: 'Safe Digital Payments', moduleId: 'fintech' },
      { id: 'fin_2', title: 'Online Banking Tools', moduleId: 'fintech' },
      { id: 'fin_3', title: 'Fraud Awareness & Prevention', moduleId: 'fintech' },
      { id: 'fin_4', title: 'Fintech for Daily Life', moduleId: 'fintech' },
    ]
  }
];