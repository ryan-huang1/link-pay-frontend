"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, ChevronDown, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type TransactionStatus = "success" | "failure" | null;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.1.10:80';
console.log('BASE_URL:', BASE_URL); // Debug log

interface Transaction {
  transaction_id: number;
  type: 'sent' | 'received';
  counterparty: string;
  amount: number;
  description: string;
  timestamp: string;
  item_count: number;  // New field
}

interface User {
  value: string;
  label: string;
}

export function BusinessInterface() {
  const [balance, setBalance] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemCount, setItemCount] = useState<string>("1");  // New state
  const [userName, setUserName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const refreshIconRef = useRef<SVGSVGElement>(null);
  const [availableUsernames, setAvailableUsernames] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const redirectToBank = () => {
    window.location.href = '/';
  };

  const fetchUserProfile = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        redirectToBank();
        return;
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
      
      // Check if the user is a business account but not an admin
      if (!data.is_business || data.is_admin) {
        redirectToBank();
        return;
      }
      
      setBalance(data.balance);
      setUserName(data.username);
    } catch (error) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTransactions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = getCookie('token');
      if (!token) {
        redirectToBank();
        return;
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
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  }, []);

  const fetchUsernames = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        redirectToBank();
        return;
      }
      const response = await fetch(`${BASE_URL}/user/usernames`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch usernames');
      }
      const data = await response.json();
      setAvailableUsernames(data.usernames);
      setFilteredUsers(data.usernames.map((username: string) => ({ value: username, label: username })));
    } catch (error) {
      console.error('Error fetching usernames:', error);
      setError('Failed to load usernames');
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchUserProfile(), fetchTransactions(), fetchUsernames()]);
    setIsLoading(false);
  }, [fetchTransactions, fetchUsernames]);

  useEffect(() => {
    const initializeData = async () => {
      await refreshData();
      setIsInitialized(true);
    };

    initializeData();
  }, [refreshData]);

  useEffect(() => {
    if (!isInitialized) return;

    const usernameRefreshInterval = setInterval(fetchUsernames, 60000);
    const transactionRefreshInterval = setInterval(fetchTransactions, 20000);

    return () => {
      clearInterval(usernameRefreshInterval);
      clearInterval(transactionRefreshInterval);
    };
  }, [isInitialized, fetchUsernames, fetchTransactions]);

  const handleRefreshClick = () => {
    if (!isRefreshing) {
      fetchTransactions();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isRefreshing && refreshIconRef.current) {
      refreshIconRef.current.style.animation = 'spin 1s linear infinite';
    } else if (!isRefreshing && refreshIconRef.current) {
      refreshIconRef.current.style.animation = 'spin-back 0.5s linear forwards';
    }
  }, [isRefreshing]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Card>
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

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-back {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}