'use client';

import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/contexts/DataContext';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import {
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  Loader2,
} from 'lucide-react';
import { Unit } from '@/components/expenses-list';

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const router = useRouter();

  type MonthlyReport = {
    id: number;
    month: number;
    year: number;
    unitId: number;
    monthlyDues: number;
    utilityBills: number;
    expenses: number;
    createdAt: string;
  };

  type Tenant = {
    id: number;
    lastName: string;
    firstName: string;
    middleInitial: string;
    unit: number;
    email: string;
    phoneNumber: string;
  };

  // type Unit = {
  //   id: number;
  //   unitNumber: string;
  //   occupied: number;
  // };

  type Payment = {
    id: number;
    unitId: number;
    modeOfPayment: string;
    amount: number;
    dueDate: string;
    monthOfStart: string;
    monthOfEnd: string;
    isPaid: boolean;
    paidAt: string;
  };

  type Utility = {
    id: number;
    type: string;
    previousReading: number;
    currentReading: number;
    totalMeter: number;
    totalAmount: number;
    dueDate: string;
    monthOfStart: string;
    monthOfEnd: string;
    isPaid: boolean;
    paidAt: string;
    unitId: number;
    rateId: number;
  };

  type Expense = {
    id: number;
    unitId: number;
    amount: number;
    modeOfPayment: string;
    reason: string;
    date: string;
  };

  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; 
  const currentYear = currentDate.getFullYear();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/admin-portal/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Handle browser back button to prevent unauthorized access
  useEffect(() => {
    const handlePopState = () => {
      if (!isLoggedIn) {
        router.replace('/admin-portal/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLoggedIn, router]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [monthlyResponse, tenantsResponse, unitsResponse, paymentsResponse, utilitiesResponse, expensesResponse] = await Promise.all([
          api.get('/api/monthlyreports'),
          api.get('/api/tenants'),
          api.get('/api/units'),
          api.get('/api/payments'),
          api.get('/api/utilities'),
          api.get('/api/expenses'),
        ]);

        if (!monthlyResponse.ok) {
          throw new Error(`Monthly reports API error: ${monthlyResponse.status}`);
        }
        if (!tenantsResponse.ok) {
          throw new Error(`Tenants API error: ${tenantsResponse.status}`);
        }
        if (!unitsResponse.ok) {
          throw new Error(`Units API error: ${unitsResponse.status}`);
        }
        if (!paymentsResponse.ok) {
          throw new Error(`Payments API error: ${paymentsResponse.status}`);
        }
        if (!utilitiesResponse.ok) {
          throw new Error(`Utilities API error: ${utilitiesResponse.status}`);
        }
        if (!expensesResponse.ok) {
          throw new Error(`Expenses API error: ${expensesResponse.status}`);
        }

        const [monthlyData, tenantsData, unitsData, paymentsData, utilitiesData, expensesData] = await Promise.all([
          monthlyResponse.json(),
          tenantsResponse.json(),
          unitsResponse.json(),
          paymentsResponse.json(),
          utilitiesResponse.json(),
          expensesResponse.json()
        ]);

        setMonthlyReports(monthlyData);
        setTenants(tenantsData);
        setUnits(unitsData);
        setPayments(paymentsData);
        setUtilities(utilitiesData);
        setExpenses(expensesData);

      } catch (error: unknown) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if user is logged in
    if (isLoggedIn && !isLoading) {
      fetchAllData();
    }
  }, [isLoggedIn, isLoading, refreshTrigger]);

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render if user is not logged in (prevents flash)
  if (!isLoggedIn) {
    return null;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Redirecting...</div>
        </div>
      </div>
    );
  }

  const getCurrentMonthReport = () => {
    return monthlyReports.filter(report => 
      report.month === currentMonth && report.year === currentYear
    );
  };

  const getPreviousMonthReport = () => {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    return monthlyReports.filter(report => 
      report.month === prevMonth && report.year === prevYear
    );
  };

  const calculatePercentChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderPercentChange = (percentChange: number) => {
    const isPositive = percentChange > 0;
    const isNegative = percentChange < 0;
    
    return (
      <span className={`${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
        {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
      </span>
    );
  };

  const renderExpensePercentChange = (percentChange: number) => {
    const isPositive = percentChange > 0;
    const isNegative = percentChange < 0;
    
    return (
      <span className={`${isPositive ? 'text-red-600' : isNegative ? 'text-green-600' : 'text-gray-600'}`}>
        {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
      </span>
    );
  };

  const getMonthlyStats = () => {
    // Calculate revenue from actual payments (real-time data)
    const currentMonthPayments = payments.filter(payment => {
      if (!payment.isPaid || !payment.paidAt) return false;
      const paidDate = new Date(payment.paidAt);
      return paidDate.getMonth() + 1 === currentMonth && paidDate.getFullYear() === currentYear;
    });

    const previousMonthPayments = payments.filter(payment => {
      if (!payment.isPaid || !payment.paidAt) return false;
      const paidDate = new Date(payment.paidAt);
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return paidDate.getMonth() + 1 === prevMonth && paidDate.getFullYear() === prevYear;
    });

    // Calculate utility costs that owners have paid (reduces revenue)
    const currentMonthPaidUtilities = utilities.filter(utility => {
      if (!utility.isPaid || !utility.paidAt) return false;
      const paidDate = new Date(utility.paidAt);
      return paidDate.getMonth() + 1 === currentMonth && paidDate.getFullYear() === currentYear;
    });

    const previousMonthPaidUtilities = utilities.filter(utility => {
      if (!utility.isPaid || !utility.paidAt) return false;
      const paidDate = new Date(utility.paidAt);
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return paidDate.getMonth() + 1 === prevMonth && paidDate.getFullYear() === prevYear;
    });

    const currentUtilityCosts = currentMonthPaidUtilities.reduce((sum, utility) => sum + utility.totalAmount, 0);
    const previousUtilityCosts = previousMonthPaidUtilities.reduce((sum, utility) => sum + utility.totalAmount, 0);

    // Calculate direct expenses from current month
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const previousMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return expenseDate.getMonth() + 1 === prevMonth && expenseDate.getFullYear() === prevYear;
    });

    const currentDirectExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousDirectExpenses = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Total earnings from payments minus utility costs paid by owners
    const currentTotalEarnings = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0) - currentUtilityCosts;
    const previousTotalEarnings = previousMonthPayments.reduce((sum, payment) => sum + payment.amount, 0) - previousUtilityCosts;

    // Calculate expenses from monthly reports plus paid utility costs plus direct expenses
    const currentReports = getCurrentMonthReport();
    const previousReports = getPreviousMonthReport();

    const currentTotalExpenses = currentReports.reduce((sum, report) => 
      sum + (report.utilityBills || 0) + (report.expenses || 0), 0) + currentUtilityCosts + currentDirectExpenses;
    const previousTotalExpenses = previousReports.reduce((sum, report) => 
      sum + (report.utilityBills || 0) + (report.expenses || 0), 0) + previousUtilityCosts + previousDirectExpenses;

    const currentNetIncome = currentTotalEarnings - (currentReports.reduce((sum, report) => 
      sum + (report.utilityBills || 0) + (report.expenses || 0), 0) + currentDirectExpenses);
    const previousNetIncome = previousTotalEarnings - (previousReports.reduce((sum, report) => 
      sum + (report.utilityBills || 0) + (report.expenses || 0), 0) + previousDirectExpenses);

    return {
      monthRevenue: currentTotalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      monthRevenuePercentChange: calculatePercentChange(
        currentTotalEarnings, 
        previousTotalEarnings
      ),
      monthExpenses: currentTotalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      monthExpensesPercentChange: calculatePercentChange(
        currentTotalExpenses, 
        previousTotalExpenses
      ),
      netIncome: currentNetIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      netIncomePercentChange: calculatePercentChange(
        currentNetIncome, 
        previousNetIncome
      )
    };
  };

  const monthlyStats = getMonthlyStats();

  const formatWithPesoSignAndTwoDecimals = (value: number) =>
    value.toLocaleString('en-US', {
      currency: 'PHP',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
  });

  const getChartData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const fullYearData = monthNames.map((monthName, index) => {
      const monthNumber = index + 1;
      
      // Calculate revenue from actual payments for this month
      const paymentsForMonth = payments.filter(payment => {
        if (!payment.isPaid || !payment.paidAt) return false;
        const paidDate = new Date(payment.paidAt);
        return paidDate.getMonth() + 1 === monthNumber && paidDate.getFullYear() === currentYear;
      });

      // Calculate utility costs that owners paid for this month
      const utilitiesForMonth = utilities.filter(utility => {
        if (!utility.isPaid || !utility.paidAt) return false;
        const paidDate = new Date(utility.paidAt);
        return paidDate.getMonth() + 1 === monthNumber && paidDate.getFullYear() === currentYear;
      });

      const utilityCosts = utilitiesForMonth.reduce((sum, utility) => sum + utility.totalAmount, 0);
      
      // Calculate direct expenses for this month
      const expensesForMonth = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === monthNumber && expenseDate.getFullYear() === currentYear;
      });
      
      const directExpensesAmount = expensesForMonth.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Total revenue minus utility costs paid by owners
      const totalRevenue = paymentsForMonth.reduce((sum, payment) => sum + payment.amount, 0) - utilityCosts;
      
      // Calculate expenses from monthly reports plus paid utility costs plus direct expenses
      const reportsForMonth = monthlyReports.filter(report => 
        report.month === monthNumber && report.year === currentYear
      );
      
      const totalExpenses = reportsForMonth.reduce((sum, report) => 
        sum + (report.utilityBills || 0) + (report.expenses || 0), 0) + utilityCosts + directExpensesAmount;
      const netIncome = totalRevenue - (reportsForMonth.reduce((sum, report) => 
        sum + (report.utilityBills || 0) + (report.expenses || 0), 0) + directExpensesAmount);
      
      return {
        month: monthName,
        revenue: totalRevenue,
        expenses: totalExpenses,
        netIncome: netIncome,
      };
    });
    
    return fullYearData;
  };

  const chartData = getChartData();

  const getOccupiedUnitsCount = () => {
    return units.filter(unit => unit.numOccupants > 0).length;
  }

  const getTotalTenantsCount = () => {
    return tenants.length || 0;
  }

  const getAvailableUnitsCount = () => {
    return units.filter(unit => unit.numOccupants == 0).length;
  }

  const getTotalUnitsCount = () => {
    return units.length || 0;
  }

  const totalOccupiedUnits = getOccupiedUnitsCount();
  const totalTenants = getTotalTenantsCount();
  const totalAvailableUnits = getAvailableUnitsCount();
  const totalUnitsCount = getTotalUnitsCount();


  if (loading) {
    return (
      <div className="h-full flex-1 space-y-4 overflow-auto p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex-1 space-y-4 overflow-auto p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-red-600 mb-4">Error: {error}</div>
              <div className="text-sm text-gray-600">
                <p>Debug info:</p>
                <p>Using API route: /api/monthlyreports</p>
                <p>Backend URL: http://localhost:8080/api/monthlyreports</p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex-1 space-y-4 overflow-auto p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        
        <Card className="card-shadow border-1 border-stroke col-span-4 border p-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0">
            <CardTitle className="text-md font-medium">Apartment Details</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex w-full items-center justify-between py-1">
              <div className="text-center flex-1">
                <div className="text-xl font-bold">{totalUnitsCount}</div>
                <p className="text-text-primary text-xl leading-tight">Total Apartments</p>
              </div>
              <div className="mx-1 h-10 border-2 border-gray-300"></div>
              <div className="text-center flex-1">
                <div className="text-xl font-bold">{totalTenants}</div>
                <p className="text-text-primary text-xl leading-tight">Total Tenants</p>
              </div>
              <div className="mx-1 h-10 border-2 border-gray-300"></div>
              <div className="text-center flex-1">
                <div className="text-xl font-bold">{totalOccupiedUnits}</div>
                <p className="text-text-primary text-xl leading-tight">Occupied Apartments</p>
              </div>
              <div className="mx-1 h-10 border-2 border-gray-300"></div>
              <div className="text-center flex-1">
                <div className="text-xl font-bold">{totalAvailableUnits}</div>
                <p className="text-text-primary text-xl leading-tight">Available Apartments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full space-y-2 lg:w-2/3">
            <Card className="card-shadow border-1 border-stroke col-span-4 border px-5 py-3">
              <CardHeader className="px-0 pb-4 pt-2">
                <CardTitle className="text-base">Revenue</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveContainer height={450} width="100%">
                  <LineChart
                    data={chartData}
                    layout="horizontal"
                    margin={{ left: 45, right: 40 }}
                  >
                    <XAxis dataKey="month" stroke="#888888" />
                    <YAxis stroke="#888888" tickFormatter={formatWithPesoSignAndTwoDecimals} />
                    <Tooltip
                      formatter={(value: number) => (
                        <span style={{ color: 'black' }}>
                          {formatWithPesoSignAndTwoDecimals(value)}
                        </span>
                      )}
                      itemStyle={{ color: '#637381' }}
                    />
                    <CartesianGrid stroke="#ccc" vertical={false} />
                    <Line
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#FFD700"
                      strokeWidth={2}
                      type="linear"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>

          <div className="space-y-4 w-full lg:w-1/3">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month&apos;s Revenue</CardTitle>
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{monthlyStats.monthRevenue}</div>
                  <p className="text-xs text-muted-foreground">
                    {renderPercentChange(monthlyStats.monthRevenuePercentChange)} from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month&apos;s Expenses</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{monthlyStats.monthExpenses}</div>
                  <p className="text-xs text-muted-foreground">
                    {renderExpensePercentChange(monthlyStats.monthExpensesPercentChange)} from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{monthlyStats.netIncome}</div>
                  <p className="text-xs text-muted-foreground">
                    {renderPercentChange(monthlyStats.netIncomePercentChange)} from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}