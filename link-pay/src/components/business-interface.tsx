"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, LogOut } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.1.10:80';
console.log('BASE_URL:', BASE_URL); // Debug log

interface Transaction {
  transaction_id: number;
  type: 'sent' | 'received';
  counterparty: string;
  amount: number;
  description: string;
  timestamp: string;
  item_count: number;
}

export function BusinessInterface() {
  const [balance, setBalance] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const refreshIconRef = useRef<SVGSVGElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBusinessAccount, setIsBusinessAccount] = useState<boolean | null>(null);

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const redirectToBank = useCallback(() => {
    window.location.href = '/';
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        redirectToBank();
        return false;
      }
      console.log('Token:', token); // Debug log
      const response = await fetch(`${BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      
      if (!data.is_business || data.is_admin) {
        setIsBusinessAccount(false);
        redirectToBank();
        return false;
      }
      
      setIsBusinessAccount(true);
      setBalance(data.balance);
      setUserName(data.username);
      return true;
    } catch (error) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', error);
      return false;
    }
  }, [redirectToBank]);

  const fetchTransactions = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        redirectToBank();
        return false;
      }
      const response = await fetch(`${BASE_URL}/transaction/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data.transactions);
      setLastUpdated(new Date());
      return true;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      return false;
    }
  }, [redirectToBank]);

  const initializeData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    const profileSuccess = await fetchUserProfile();
    if (!profileSuccess) {
      setIsLoading(false);
      return;
    }
    
    const transactionsSuccess = await fetchTransactions();

    if (!transactionsSuccess) {
      setError("Failed to load transactions. Please refresh the page.");
    }

    setIsLoading(false);
    setIsInitialized(true);
  }, [fetchUserProfile, fetchTransactions]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (!isInitialized || !isBusinessAccount) return;

    const transactionRefreshInterval = setInterval(fetchTransactions, 20000);

    return () => {
      clearInterval(transactionRefreshInterval);
    };
  }, [isInitialized, isBusinessAccount, fetchTransactions]);

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      fetchTransactions().finally(() => {
        setTimeout(() => setIsRefreshing(false), 1000);
      });
    }
  }, [isRefreshing, fetchTransactions]);

  useEffect(() => {
    if (isRefreshing && refreshIconRef.current) {
      refreshIconRef.current.style.animation = 'spin 1s linear infinite';
    } else if (!isRefreshing && refreshIconRef.current) {
      refreshIconRef.current.style.animation = 'spin-back 0.5s linear forwards';
    }
  }, [isRefreshing]);

  // Logout Handler
  const handleLogout = () => {
    // Function to delete a cookie by name
    const deleteCookie = (name: string) => {
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    };

    // Get all cookies
    const cookies = document.cookie.split("; ");

    // Delete each cookie
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      deleteCookie(name);
    });

    // Redirect to home page
    redirectToBank();
  };

  if (isLoading || !isInitialized || isBusinessAccount === null) {
    return <div>Loading...</div>;
  }

  if (!isBusinessAccount) {
    return null;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Business Account</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-sm text-gray-700 bg-gray-100"
        >
          <LogOut className="mr-2 h-4 w-4 text-gray-700" />
          Logout
        </Button>
      </div>

      <Card className="mt-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Your Balance</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">@{userName}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="mr-4">Transactions</CardTitle>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500">
              Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            </p>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshClick}
              className="h-8 w-8"
              disabled={isRefreshing}
            >
              <RefreshCw className="h-4 w-4" ref={refreshIconRef} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            {transactions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No transactions yet.</p>
                <p className="text-gray-500">Send some money to get started!</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="flex items-start justify-between py-2 border-b last:border-b-0"
                >
                  <div className="flex items-start flex-1 pr-4">
                    {transaction.type === 'sent' ? (
                      <ArrowUpRight className="mr-2 mt-1 text-red-500 flex-shrink-0" />
                    ) : (
                      <ArrowDownLeft className="mr-2 mt-1 text-green-600 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium break-words text-sm ${
                        transaction.type === 'sent' ? "text-red-500" : "text-green-600"
                      }`}>
                        {transaction.type === 'sent'
                          ? `Sent to ${transaction.counterparty}`
                          : `Received from ${transaction.counterparty}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.description} 
                      </p>
                      <p className="text-sm text-gray-500">{new Date(transaction.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <p
                    className={`font-medium whitespace-nowrap text-sm ${
                      transaction.type === 'sent' ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {transaction.type === 'sent' ? "-" : "+"}$
                    {transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-back {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}