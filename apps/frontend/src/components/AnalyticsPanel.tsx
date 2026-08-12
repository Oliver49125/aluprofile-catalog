import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Globe,
  Smartphone,
  Laptop,
  Clock,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  Calendar,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

type VisitorRecord = {
  id: string;
  ipAddress: string;
  userType: 'REGISTERED' | 'GUEST';
  userEmail?: string;
  userName?: string;
  country: string;
  city: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  visitedPage: string;
  profileSearched?: string;
  durationSeconds: number;
  timestamp: string;
  status: 'Active' | 'Completed';
};

// Initial Mock Analytics Dataset reflecting real-world usage of AluProfile Catalog
const INITIAL_VISITORS: VisitorRecord[] = [
  {
    id: 'VIS-9081',
    ipAddress: '194.230.145.12',
    userType: 'REGISTERED',
    userEmail: 'customer@aluprofile.com',
    userName: 'Oliver Tech GmbH',
    country: 'Germany',
    city: 'Stuttgart',
    device: 'Desktop',
    browser: 'Chrome 122',
    os: 'macOS',
    visitedPage: '/catalog/B40-Sonderprofil',
    profileSearched: 'B40 Sonderprofil',
    durationSeconds: 420,
    timestamp: '2026-08-12 04:45:10',
    status: 'Active',
  },
  {
    id: 'VIS-9082',
    ipAddress: '82.165.201.44',
    userType: 'GUEST',
    country: 'Germany',
    city: 'Munich',
    device: 'Mobile',
    browser: 'Safari Mobile',
    os: 'iOS 17',
    visitedPage: '/catalog',
    profileSearched: 'T-Slot 40x40',
    durationSeconds: 185,
    timestamp: '2026-08-12 04:38:22',
    status: 'Completed',
  },
  {
    id: 'VIS-9083',
    ipAddress: '213.127.89.05',
    userType: 'REGISTERED',
    userEmail: 'purchasing@bosch.de',
    userName: 'Bosch Industrial',
    country: 'Germany',
    city: 'Berlin',
    device: 'Desktop',
    browser: 'Firefox 123',
    os: 'Windows 11',
    visitedPage: '/customer/orders',
    durationSeconds: 610,
    timestamp: '2026-08-12 04:22:15',
    status: 'Completed',
  },
  {
    id: 'VIS-9084',
    ipAddress: '178.62.190.11',
    userType: 'GUEST',
    country: 'Austria',
    city: 'Vienna',
    device: 'Desktop',
    browser: 'Chrome 122',
    os: 'Windows 10',
    visitedPage: '/catalog/Trenner-9.5x26',
    profileSearched: 'Trenner 9.5x26',
    durationSeconds: 95,
    timestamp: '2026-08-12 04:10:04',
    status: 'Completed',
  },
  {
    id: 'VIS-9085',
    ipAddress: '109.236.88.92',
    userType: 'GUEST',
    country: 'Switzerland',
    city: 'Zurich',
    device: 'Tablet',
    browser: 'Safari',
    os: 'iPadOS',
    visitedPage: '/search',
    profileSearched: 'Heavy Duty Frame',
    durationSeconds: 310,
    timestamp: '2026-08-12 03:55:40',
    status: 'Completed',
  },
  {
    id: 'VIS-9086',
    ipAddress: '87.123.45.67',
    userType: 'REGISTERED',
    userEmail: 'engineer@siemens.com',
    userName: 'Siemens Energy',
    country: 'Germany',
    city: 'Frankfurt',
    device: 'Desktop',
    browser: 'Edge 122',
    os: 'Windows 11',
    visitedPage: '/catalog/X-Profil-Transport',
    profileSearched: 'X-Profil Transport',
    durationSeconds: 740,
    timestamp: '2026-08-12 03:40:12',
    status: 'Completed',
  },
  {
    id: 'VIS-9087',
    ipAddress: '185.220.101.5',
    userType: 'GUEST',
    country: 'Netherlands',
    city: 'Amsterdam',
    device: 'Mobile',
    browser: 'Chrome Mobile',
    os: 'Android 14',
    visitedPage: '/',
    durationSeconds: 45,
    timestamp: '2026-08-12 03:15:30',
    status: 'Completed',
  },
];

type Props = {
  lang: 'en' | 'de';
};

export const AnalyticsPanel: React.FC<Props> = ({ lang }) => {
  const [visitors] = useState<VisitorRecord[]>(INITIAL_VISITORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | 'REGISTERED' | 'GUEST'>('ALL');
  const [deviceFilter, setDeviceFilter] = useState<'ALL' | 'Desktop' | 'Mobile' | 'Tablet'>('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState<'TODAY' | '7DAYS' | '30DAYS'>('TODAY');

  // Filter logic
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      // User Type
      if (userTypeFilter !== 'ALL' && v.userType !== userTypeFilter) return false;
      // Device
      if (deviceFilter !== 'ALL' && v.device !== deviceFilter) return false;
      // Country
      if (countryFilter !== 'ALL' && v.country !== countryFilter) return false;
      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchIp = v.ipAddress.toLowerCase().includes(q);
        const matchEmail = v.userEmail?.toLowerCase().includes(q);
        const matchName = v.userName?.toLowerCase().includes(q);
        const matchCity = v.city.toLowerCase().includes(q);
        const matchPage = v.visitedPage.toLowerCase().includes(q);
        const matchProfile = v.profileSearched?.toLowerCase().includes(q);
        if (!matchIp && !matchEmail && !matchName && !matchCity && !matchPage && !matchProfile) {
          return false;
        }
      }
      return true;
    });
  }, [visitors, searchQuery, userTypeFilter, deviceFilter, countryFilter]);

  // Aggregate statistics
  const totalVisitorsCount = filteredVisitors.length;
  const activeNowCount = filteredVisitors.filter((v) => v.status === 'Active').length;
  const registeredCount = filteredVisitors.filter((v) => v.userType === 'REGISTERED').length;
  const guestCount = filteredVisitors.filter((v) => v.userType === 'GUEST').length;
  const avgDuration = totalVisitorsCount > 0
    ? Math.round(filteredVisitors.reduce((acc, v) => acc + v.durationSeconds, 0) / totalVisitorsCount)
    : 0;

  const exportAnalytics = (format: 'csv' | 'pdf') => {
    const headers = ['ID', 'User Type', 'Email / Name', 'IP Address', 'Country', 'City', 'Device', 'Visited Page', 'Duration (s)', 'Timestamp'];
    const rows = filteredVisitors.map((v) => [
      v.id,
      v.userType,
      v.userEmail || v.userName || 'Guest Visitor',
      v.ipAddress,
      v.country,
      v.city,
      v.device,
      v.visitedPage,
      v.durationSeconds,
      v.timestamp,
    ]);

    if (format === 'csv') {
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'de' ? 'Google Visitor Analytics' : 'Google & Visitor Analytics'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {lang === 'de'
              ? 'Echtzeit-Besucherstatistiken, Benutzeraktivitäten und Filterwerkzeuge'
              : 'Real-time visitor telemetry, registered user activities, and detailed traffic filters'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="TODAY">{lang === 'de' ? 'Heute' : 'Today (Realtime)'}</option>
            <option value="7DAYS">{lang === 'de' ? 'Letzte 7 Tage' : 'Last 7 Days'}</option>
            <option value="30DAYS">{lang === 'de' ? 'Letzte 30 Tage' : 'Last 30 Days'}</option>
          </select>
          <Button
            onClick={() => exportAnalytics('csv')}
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportAnalytics('pdf')}
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === 'de' ? 'Gesamtbesucher' : 'Total Visitors'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalVisitorsCount}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +14.2% {lang === 'de' ? 'vs. gestern' : 'vs yesterday'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === 'de' ? 'Aktive Benutzer' : 'Live Active Users'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeNowCount}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Now
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === 'de' ? 'Registrierte Konten' : 'Registered Customers'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{registeredCount}</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                {guestCount} Guest Visitors
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === 'de' ? 'Avg. Verweildauer' : 'Avg. Session Time'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{avgDuration}s</h3>
              <p className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> High engagement
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar Section */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Filter className="h-4 w-4 text-blue-600" />
            {lang === 'de' ? 'Besucherfilte & Suche' : 'Filter & Search Visitor Telemetry'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={lang === 'de' ? 'Suche nach IP, E-Mail, Seite...' : 'Search IP, Email, Page...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* User Type Filter */}
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="ALL">{lang === 'de' ? 'Alle Benutzertypen' : 'All User Types (Registered & Guests)'}</option>
              <option value="REGISTERED">{lang === 'de' ? 'Nur Registrierte Kunden' : 'Registered Customers'}</option>
              <option value="GUEST">{lang === 'de' ? 'Nur Anonyme Gäste' : 'Guest Visitors'}</option>
            </select>

            {/* Device Filter */}
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="ALL">{lang === 'de' ? 'Alle Geräte' : 'All Devices (Desktop, Mobile, Tablet)'}</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </select>

            {/* Country Filter */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="ALL">{lang === 'de' ? 'Alle Länder' : 'All Countries'}</option>
              <option value="Germany">Germany</option>
              <option value="Austria">Austria</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Netherlands">Netherlands</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Visitor Records Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Eye className="h-4 w-4 text-blue-600" />
              {lang === 'de' ? 'Besucherprotokoll & Sitzungsinformationen' : 'Visitor Activity Log & Details'}
            </CardTitle>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredVisitors.length} of {visitors.length} records
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Visitor / User</th>
                  <th className="px-4 py-3.5">IP Address</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Device & Browser</th>
                  <th className="px-4 py-3.5">Visited Page / Search</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {v.userType === 'REGISTERED' ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-black text-[10px]">
                            REG
                          </span>
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-black text-[10px]">
                            GST
                          </span>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-900">
                            {v.userName || v.userEmail || 'Anonymous Visitor'}
                          </p>
                          {v.userEmail && (
                            <p className="text-[11px] text-slate-500">{v.userEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">
                      {v.ipAddress}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                        <span>{v.city}, {v.country}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        {v.device === 'Desktop' ? (
                          <Laptop className="h-3.5 w-3.5 text-slate-500" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-slate-500" />
                        )}
                        <span>{v.device} • {v.browser}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-blue-600 font-mono text-[11px]">
                          {v.visitedPage}
                        </p>
                        {v.profileSearched && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Search className="h-3 w-3 text-slate-400" />
                            Query: {v.profileSearched}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        <Clock className="h-3 w-3" />
                        {v.durationSeconds}s
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-500 font-medium">
                      {v.timestamp}
                    </td>
                  </tr>
                ))}

                {filteredVisitors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No visitor records found matching your selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;
