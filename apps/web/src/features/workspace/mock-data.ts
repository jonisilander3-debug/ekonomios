import {
  getAterkommandeFakturorPageData,
  getBankPageData,
  getBankReconciliationPageData,
  getBokforingPageData,
  getLeverantorerPageData,
  getKunderPageData,
  getCustomerReceivablesPageData,
  getFakturorPageData,
  getGroupChecklistPageData,
  getIntercompanyMatchingPageData,
  getIntercompanyTransactionsPageData,
  getKvittonPageData,
  getLonerPageData,
  getOfferterPageData,
  getPeriodsPageData,
  getProjektPageData,
  getSupplierLedgerPageData,
  getUppgifterPageData
} from './pages-data';

export const workspaceNavigation = [
  { href: '/dashboard', label: 'Skrivbord' },
  { href: '/uppgifter', label: 'Uppgifter' },
  { href: '/bank', label: 'Bank' },
  { href: '/perioder', label: 'Perioder' },
  { href: '/kunder', label: 'Kunder' },
  { href: '/leverantorer', label: 'Leverantörer' },
  { href: '/offerter', label: 'Offerter' },
  { href: '/fakturor', label: 'Fakturor' },
  { href: '/projekt', label: 'Projekt' },
  { href: '/kvitton', label: 'Kvitton' },
  { href: '/loner', label: 'Löner' },
  { href: '/bokforing', label: 'Bokföring' },
  { href: '/installningar', label: 'Inställningar' }
] as const;

export {
  getAterkommandeFakturorPageData,
  getBankPageData,
  getBankReconciliationPageData,
  getBokforingPageData,
  getLeverantorerPageData,
  getKunderPageData,
  getCustomerReceivablesPageData,
  getFakturorPageData,
  getGroupChecklistPageData,
  getIntercompanyMatchingPageData,
  getIntercompanyTransactionsPageData,
  getKvittonPageData,
  getLonerPageData,
  getOfferterPageData,
  getPeriodsPageData,
  getProjektPageData,
  getSupplierLedgerPageData,
  getUppgifterPageData
};
