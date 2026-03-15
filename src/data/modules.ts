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
    title: 'Investment in Practice',
    description: 'Investment market, risk and return, client suitability, portfolio diversification, and managing market volatility.',
    icon: 'TrendingUp',
    lead: 'Helen',
    topics: [
      { id: 'inv_1', title: 'Understanding the Product Range', moduleId: 'investment' },
      { id: 'inv_2', title: 'Understanding What the Client Needs', moduleId: 'investment' },
      { id: 'inv_3', title: 'Building a Recommendation', moduleId: 'investment' },
      { id: 'inv_4', title: 'When Markets Move', moduleId: 'investment' },
    ]
  },
  {
    id: 'management',
    title: 'Corporate Finance in Practice',
    description: 'Corporate cashflow, foreign exchange impact, short-term funding decisions, and financial risk management.',
    icon: 'Building2',
    lead: 'Yan',
    topics: [
      { id: 'mgt_1', title: 'Mapping the Company\'s Cashflow', moduleId: 'management' },
      { id: 'mgt_2', title: 'Foreign Exchange Impact', moduleId: 'management' },
      { id: 'mgt_3', title: 'Funding the Shortfall', moduleId: 'management' },
      { id: 'mgt_4', title: 'Building a Risk Management Plan', moduleId: 'management' },
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