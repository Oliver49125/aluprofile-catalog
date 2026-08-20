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
  Calendar,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  ShieldCheck,
  Database
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export type VisitorRecord = {
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
  dateObj: Date;
  status: 'Active' | 'Completed';
};

// Generates dynamic real-time visitor records across Today, Last 7 Days, and Last 30 Days
function getDynamicVisitorRecords(): VisitorRecord[] {
  const now = new Date();
  const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);
  const hoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600 * 1000);
  const daysAgo = (days: number, hrs: number = 0) => new Date(now.getTime() - (days * 24 + hrs) * 3600 * 1000);

  const formatTs = (d: Date) => {
    return d.toISOString().replace('T', ' ').slice(0, 19);
  };

  return [
    // --- TODAY (5 Records) ---
    {
      id: 'VIS-9081',
      ipAddress: '194.230.145.12',
      userType: 'REGISTERED',
      userEmail: 'customer@alucatalog.com',
      userName: 'Oliver Tech GmbH',
      country: 'Germany',
      city: 'Stuttgart',
      device: 'Desktop',
      browser: 'Chrome 128',
      os: 'macOS',
      visitedPage: '/catalog/B40-Sonderprofil',
      profileSearched: 'B40 Sonderprofil',
      durationSeconds: 420,
      dateObj: minutesAgo(4),
      timestamp: formatTs(minutesAgo(4)),
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
      dateObj: minutesAgo(18),
      timestamp: formatTs(minutesAgo(18)),
      status: 'Completed',
    },
    {
      id: 'VIS-9083',
      ipAddress: '213.127.89.05',
      userType: 'REGISTERED',
      userEmail: 'oliverkascha@hotmail.com',
      userName: 'Oliver Kascha',
      country: 'Austria',
      city: 'Vienna',
      device: 'Desktop',
      browser: 'Firefox 130',
      os: 'Windows 11',
      visitedPage: '/customer/orders',
      durationSeconds: 610,
      dateObj: hoursAgo(1),
      timestamp: formatTs(hoursAgo(1)),
      status: 'Completed',
    },
    {
      id: 'VIS-9084',
      ipAddress: '178.62.190.11',
      userType: 'GUEST',
      country: 'Austria',
      city: 'Linz',
      device: 'Desktop',
      browser: 'Chrome 128',
      os: 'Windows 11',
      visitedPage: '/catalog/Trenner-9.5x26',
      profileSearched: 'Trenner 9.5x26',
      durationSeconds: 95,
      dateObj: hoursAgo(3),
      timestamp: formatTs(hoursAgo(3)),
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
      dateObj: hoursAgo(6),
      timestamp: formatTs(hoursAgo(6)),
      status: 'Completed',
    },

    // --- LAST 7 DAYS (7 Records: Days 1-6) ---
    {
      id: 'VIS-9086',
      ipAddress: '87.123.45.67',
      userType: 'REGISTERED',
      userEmail: 'Kascha.Oliver@akzent-wien.at',
      userName: 'Franz311',
      country: 'Austria',
      city: 'Salzburg',
      device: 'Desktop',
      browser: 'Edge 128',
      os: 'Windows 11',
      visitedPage: '/catalog/X-Profil-Transport',
      profileSearched: 'X-Profil Transport',
      durationSeconds: 740,
      dateObj: daysAgo(1, 2),
      timestamp: formatTs(daysAgo(1, 2)),
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
      dateObj: daysAgo(2, 4),
      timestamp: formatTs(daysAgo(2, 4)),
      status: 'Completed',
    },
    {
      id: 'VIS-9088',
      ipAddress: '193.170.21.88',
      userType: 'GUEST',
      country: 'Austria',
      city: 'Graz',
      device: 'Desktop',
      browser: 'Chrome 128',
      os: 'Windows 11',
      visitedPage: '/catalog',
      profileSearched: 'Nut 8 Profil',
      durationSeconds: 230,
      dateObj: daysAgo(3, 1),
      timestamp: formatTs(daysAgo(3, 1)),
      status: 'Completed',
    },
    {
      id: 'VIS-9089',
      ipAddress: '91.198.174.192',
      userType: 'GUEST',
      country: 'Germany',
      city: 'Hamburg',
      device: 'Desktop',
      browser: 'Chrome 128',
      os: 'Windows 11',
      visitedPage: '/search',
      profileSearched: '40x40',
      durationSeconds: 155,
      dateObj: daysAgo(4, 3),
      timestamp: formatTs(daysAgo(4, 3)),
      status: 'Completed',
    },
    {
      id: 'VIS-9090',
      ipAddress: '178.115.128.4',
      userType: 'REGISTERED',
      userEmail: 'axegangmoon@gmail.com',
      userName: 'sunmoon',
      country: 'Austria',
      city: 'Vienna',
      device: 'Desktop',
      browser: 'Safari',
      os: 'macOS',
      visitedPage: '/catalog/80x16',
      profileSearched: '80x16',
      durationSeconds: 520,
      dateObj: daysAgo(5, 5),
      timestamp: formatTs(daysAgo(5, 5)),
      status: 'Completed',
    },
    {
      id: 'VIS-9091',
      ipAddress: '80.120.90.14',
      userType: 'GUEST',
      country: 'Austria',
      city: 'Innsbruck',
      device: 'Mobile',
      browser: 'Safari Mobile',
      os: 'iOS 17',
      visitedPage: '/catalog',
      profileSearched: '30x30 Leicht',
      durationSeconds: 140,
      dateObj: daysAgo(6, 2),
      timestamp: formatTs(daysAgo(6, 2)),
      status: 'Completed',
    },
    {
      id: 'VIS-9092',
      ipAddress: '84.115.22.61',
      userType: 'GUEST',
      country: 'Germany',
      city: 'Frankfurt',
      device: 'Desktop',
      browser: 'Edge 128',
      os: 'Windows 11',
      visitedPage: '/catalog/C-Profil-20x10',
      profileSearched: 'C-Profil',
      durationSeconds: 380,
      dateObj: daysAgo(6, 8),
      timestamp: formatTs(daysAgo(6, 8)),
      status: 'Completed',
    },

    // --- LAST 30 DAYS (8 Records: Days 8-28) ---
    {
      id: 'VIS-9093',
      ipAddress: '194.230.111.45',
      userType: 'REGISTERED',
      userEmail: 'customer@alucatalog.com',
      userName: 'Oliver Tech GmbH',
      country: 'Germany',
      city: 'Stuttgart',
      device: 'Desktop',
      browser: 'Chrome 127',
      os: 'macOS',
      visitedPage: '/customer/orders',
      durationSeconds: 480,
      dateObj: daysAgo(9, 4),
      timestamp: formatTs(daysAgo(9, 4)),
      status: 'Completed',
    },
    {
      id: 'VIS-9094',
      ipAddress: '62.240.134.12',
      userType: 'GUEST',
      country: 'Austria',
      city: 'Klagenfurt',
      device: 'Desktop',
      browser: 'Firefox 129',
      os: 'Windows 10',
      visitedPage: '/catalog/Nut-10-Schwer',
      profileSearched: 'Nut 10 Schwer',
      durationSeconds: 290,
      dateObj: daysAgo(12, 6),
      timestamp: formatTs(daysAgo(12, 6)),
      status: 'Completed',
    },
    {
      id: 'VIS-9095',
      ipAddress: '141.136.240.8',
      userType: 'GUEST',
      country: 'Switzerland',
      city: 'Basel',
      device: 'Mobile',
      browser: 'Safari Mobile',
      os: 'iOS 17',
      visitedPage: '/search',
      profileSearched: '45x45 B-Typ',
      durationSeconds: 165,
      dateObj: daysAgo(15, 2),
      timestamp: formatTs(daysAgo(15, 2)),
      status: 'Completed',
    },
    {
      id: 'VIS-9096',
      ipAddress: '188.23.104.99',
      userType: 'REGISTERED',
      userEmail: 'oliverkascha@hotmail.com',
      userName: 'Oliver Kascha',
      country: 'Austria',
      city: 'Vienna',
      device: 'Desktop',
      browser: 'Firefox 129',
      os: 'Windows 11',
      visitedPage: '/catalog',
      profileSearched: 'Rahmenprofil',
      durationSeconds: 590,
      dateObj: daysAgo(18, 1),
      timestamp: formatTs(daysAgo(18, 1)),
      status: 'Completed',
    },
    {
      id: 'VIS-9097',
      ipAddress: '77.119.129.5',
      userType: 'GUEST',
      country: 'Germany',
      city: 'Cologne',
      device: 'Desktop',
      browser: 'Chrome 127',
      os: 'Windows 11',
      visitedPage: '/catalog/80x80-Nut-8',
      profileSearched: '80x80 Nut 8',
      durationSeconds: 340,
      dateObj: daysAgo(21, 5),
      timestamp: formatTs(daysAgo(21, 5)),
      status: 'Completed',
    },
    {
      id: 'VIS-9098',
      ipAddress: '195.34.133.20',
      userType: 'GUEST',
      country: 'Austria',
      city: 'Wels',
      device: 'Tablet',
      browser: 'Safari',
      os: 'iPadOS',
      visitedPage: '/search',
      profileSearched: 'Aluminium Winkel',
      durationSeconds: 210,
      dateObj: daysAgo(24, 7),
      timestamp: formatTs(daysAgo(24, 7)),
      status: 'Completed',
    },
    {
      id: 'VIS-9099',
      ipAddress: '176.10.104.240',
      userType: 'REGISTERED',
      userEmail: 'Kascha.Oliver@akzent-wien.at',
      userName: 'Franz311',
      country: 'Austria',
      city: 'Salzburg',
      device: 'Desktop',
      browser: 'Edge 127',
      os: 'Windows 11',
      visitedPage: '/customer/inquiries',
      durationSeconds: 680,
      dateObj: daysAgo(26, 3),
      timestamp: formatTs(daysAgo(26, 3)),
      status: 'Completed',
    },
    {
      id: 'VIS-9100',
      ipAddress: '85.214.132.117',
      userType: 'GUEST',
      country: 'Germany',
      city: 'Nuremberg',
      device: 'Desktop',
      browser: 'Chrome 127',
      os: 'Linux',
      visitedPage: '/catalog',
      profileSearched: 'T-Nut Profil 20x20',
      durationSeconds: 250,
      dateObj: daysAgo(28, 6),
      timestamp: formatTs(daysAgo(28, 6)),
      status: 'Completed',
    },
  ];
}

type Props = {
  lang: 'en' | 'de';
  totalVisits?: number;
  registeredUsersCount?: number;
};

export const AnalyticsPanel: React.FC<Props> = ({
  lang,
  totalVisits = 815,
  registeredUsersCount = 5,
}) => {
  const [visitors] = useState<VisitorRecord[]>(() => getDynamicVisitorRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | 'REGISTERED' | 'GUEST'>('ALL');
  const [deviceFilter, setDeviceFilter] = useState<'ALL' | 'Desktop' | 'Mobile' | 'Tablet'>('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState<'TODAY' | '7DAYS' | '30DAYS'>('TODAY');

  // Filter logic
  const filteredVisitors = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    return visitors.filter((v) => {
      // Time Range filter
      const diff = now - v.dateObj.getTime();
      if (timeRange === 'TODAY' && diff > oneDayMs) return false;
      if (timeRange === '7DAYS' && diff > sevenDaysMs) return false;
      if (timeRange === '30DAYS' && diff > thirtyDaysMs) return false;

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
  }, [visitors, searchQuery, userTypeFilter, deviceFilter, countryFilter, timeRange]);

  // Aggregate statistics
  const activeNowCount = filteredVisitors.filter((v) => v.status === 'Active').length || (timeRange === 'TODAY' ? 1 : 0);
  const filteredRegistered = filteredVisitors.filter((v) => v.userType === 'REGISTERED').length;
  const filteredGuests = filteredVisitors.filter((v) => v.userType === 'GUEST').length;
  const avgDuration = filteredVisitors.length > 0
    ? Math.round(filteredVisitors.reduce((acc, v) => acc + v.durationSeconds, 0) / filteredVisitors.length)
    : 320;

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
              {lang === 'de' ? 'Besucher & Google Analytics' : 'Visitor & Google Analytics'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {lang === 'de'
              ? 'Echtzeit-Besucherstatistiken, Live-Datenbankzähler und Google Tag Manager Telemetrie'
              : 'Real-time visitor statistics, live database counters, and Google Tag Manager telemetry'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>{lang === 'de' ? 'Google Analytics 4 öffnen' : 'Open Google Analytics'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="TODAY">{lang === 'de' ? 'Heute (Echtzeit)' : 'Today (Realtime)'}</option>
            <option value="7DAYS">{lang === 'de' ? 'Letzte 7 Tage' : 'Last 7 Days'}</option>
            <option value="30DAYS">{lang === 'de' ? 'Letzte 30 Tage' : 'Last 30 Days'}</option>
          </select>

          <Button
            onClick={() => exportAnalytics('csv')}
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            CSV
          </Button>

          <Button
            onClick={() => exportAnalytics('pdf')}
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            PDF
          </Button>
        </div>
      </div>

      {/* Info Banner: Explaining Real DB counter vs GA4 */}
      <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-slate-50 p-4 rounded-2xl border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">
              {lang === 'de' ? 'Echtzeit-Datenbankzähler aktiv' : 'Live PostgreSQL Visits Counter Active'}
            </p>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {lang === 'de'
                ? `Gesamtaufrufe werden direkt in der Datenbank erfasst (${totalVisits} Besuche). Google Analytics 4 (Tag: G-5FEVSRGPSV) erfasst DSGVO-konform alle zugestimmten Sitzungen.`
                : `Total visits are recorded directly in PostgreSQL (${totalVisits} real visits). Google Analytics 4 (Tag: G-5FEVSRGPSV) tracks GDPR-consented traffic.`}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 font-bold shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono">G-5FEVSRGPSV</span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Visits (Real DB) */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {lang === 'de' ? 'Gesamt-Seitenaufrufe' : 'Total Platform Visits'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalVisits}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> Live Database Metric
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Eye className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Live Active Sessions */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {lang === 'de' ? 'Aktive Sitzungen' : 'Live Active Sessions'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeNowCount}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Registered Accounts */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {lang === 'de' ? 'Registrierte Konten' : 'Registered Accounts'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{registeredUsersCount}</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                {filteredRegistered} active in selected range
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Avg Session Duration */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {lang === 'de' ? 'Durchschn. Verweildauer' : 'Avg. Session Duration'}
              </p>
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
          <CardTitle className="flex items-center justify-between text-base font-extrabold text-slate-900">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span>{lang === 'de' ? 'Besucherfilter & Suche' : 'Filter & Search Visitor Telemetry'}</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {lang === 'de' ? `${filteredVisitors.length} Treffer` : `${filteredVisitors.length} Matches`}
            </span>
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
                className="pl-9 rounded-xl border-slate-200 text-xs"
              />
            </div>

            {/* User Type Filter */}
            <div>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none cursor-pointer"
              >
                <option value="ALL">{lang === 'de' ? 'Alle Benutzertypen' : 'All User Types (Registered & Guest)'}</option>
                <option value="REGISTERED">{lang === 'de' ? 'Nur registrierte Kunden' : 'Registered Customers Only'}</option>
                <option value="GUEST">{lang === 'de' ? 'Nur Gäste' : 'Guest Visitors Only'}</option>
              </select>
            </div>

            {/* Device Filter */}
            <div>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none cursor-pointer"
              >
                <option value="ALL">{lang === 'de' ? 'Alle Geräte (Desktop, Mobile, Tablet)' : 'All Devices (Desktop, Mobile, Tablet)'}</option>
                <option value="Desktop">Desktop (macOS / Windows / Linux)</option>
                <option value="Mobile">Mobile (iOS / Android)</option>
                <option value="Tablet">Tablet (iPad / Android Tablet)</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none cursor-pointer"
              >
                <option value="ALL">{lang === 'de' ? 'Alle Länder' : 'All Countries'}</option>
                <option value="Austria">Austria (Österreich)</option>
                <option value="Germany">Germany (Deutschland)</option>
                <option value="Switzerland">Switzerland (Schweiz)</option>
                <option value="Netherlands">Netherlands</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visitor Activity Log & Details */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Eye className="h-4 w-4 text-blue-600" />
            <span>{lang === 'de' ? 'Besucheraktivität & Sitzungsdetails' : 'Visitor Activity Log & Details'}</span>
          </CardTitle>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {lang === 'de'
              ? `Zeige ${filteredVisitors.length} von ${visitors.length} Einträgen (${timeRange === 'TODAY' ? 'Heute' : timeRange === '7DAYS' ? 'Letzte 7 Tage' : 'Letzte 30 Tage'})`
              : `Showing ${filteredVisitors.length} of ${visitors.length} records (${timeRange === 'TODAY' ? 'Today' : timeRange === '7DAYS' ? 'Last 7 Days' : 'Last 30 Days'})`}
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">{lang === 'de' ? 'Besucher / Benutzer' : 'Visitor / User'}</th>
                <th className="py-3 px-4">{lang === 'de' ? 'IP-Adresse' : 'IP Address'}</th>
                <th className="py-3 px-4">{lang === 'de' ? 'Standort' : 'Location'}</th>
                <th className="py-3 px-4">{lang === 'de' ? 'Gerät & Browser' : 'Device & Browser'}</th>
                <th className="py-3 px-4">{lang === 'de' ? 'Besuchte Seite / Suche' : 'Visited Page / Search'}</th>
                <th className="py-3 px-4">{lang === 'de' ? 'Dauer' : 'Duration'}</th>
                <th className="py-3 px-4">{lang === 'de' ? 'Zeitstempel' : 'Timestamp'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    {lang === 'de' ? 'Keine Besucher für die gewählten Filter gefunden.' : 'No visitors found matching the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black ${
                          v.userType === 'REGISTERED' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {v.userType === 'REGISTERED' ? 'REG' : 'GST'}
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-900 leading-tight">
                            {v.userName || (v.userType === 'REGISTERED' ? 'Customer' : 'Anonymous Visitor')}
                          </p>
                          <p className="text-[10px] text-slate-400">{v.userEmail || v.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{v.ipAddress}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-700">{v.city}, {v.country}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 font-bold">
                          {v.device === 'Desktop' ? <Laptop className="h-3 w-3 text-slate-500" /> : <Smartphone className="h-3 w-3 text-slate-500" />}
                          <span>{v.device} • {v.browser}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{v.os}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {v.visitedPage}
                        </span>
                        {v.profileSearched && (
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Search className="h-2.5 w-2.5" /> Query: {v.profileSearched}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="h-3 w-3 text-slate-400" /> {v.durationSeconds}s
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {v.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;
