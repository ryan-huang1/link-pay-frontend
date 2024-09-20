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
  item_count: number;
}

interface User {
  value: string;
  label: string;
}

export function PaymentInterface() {
  const [balance, setBalance] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemCount, setItemCount] = useState<string>("1");
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
  const [isRegularUser, setIsRegularUser] = useState<boolean | null>(null);

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
      
      // Check if the user is not an admin and not a business
      if (data.is_admin || data.is_business) {
        setIsRegularUser(false);
        redirectToBank();
        return false;
      }
      
      setIsRegularUser(true);
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

  const fetchUsernames = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        redirectToBank();
        return false;
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
      return true;
    } catch (error) {
      console.error('Error fetching usernames:', error);
      setError('Failed to load usernames');
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
    
    const [transactionsSuccess, usernamesSuccess] = await Promise.all([
      fetchTransactions(),
      fetchUsernames()
    ]);

    if (!transactionsSuccess || !usernamesSuccess) {
      setError("Failed to load some data. Please refresh the page.");
    }

    setIsLoading(false);
    setIsInitialized(true);
  }, [fetchUserProfile, fetchTransactions, fetchUsernames]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (!isInitialized || !isRegularUser) return;

    const usernameRefreshInterval = setInterval(fetchUsernames, 60000);
    const transactionRefreshInterval = setInterval(fetchTransactions, 20000);

    return () => {
      clearInterval(usernameRefreshInterval);
      clearInterval(transactionRefreshInterval);
    };
  }, [isInitialized, isRegularUser, fetchUsernames, fetchTransactions]);

  const handleSendMoney = async () => {
    if (amount && recipient && description && itemCount) {
      try {
        const token = getCookie('token');
        if (!token) {
          redirectToBank();
          return;
        }
        const response = await fetch(`${BASE_URL}/transaction/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient_username: recipient,
            amount: parseFloat(amount),
            description: description,
            item_count: parseInt(itemCount),
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setTransactionStatus("success");
          setBalance(prevBalance => prevBalance - parseFloat(amount));
          await fetchTransactions();
          
          setTimeout(() => {
            setIsOpen(false);
            setAmount("");
            setRecipient("");
            setDescription("");
            setItemCount("1");
            setTransactionStatus(null);
            setErrorMessage("");
          }, 3000);
        } else {
          setTransactionStatus("failure");
          if (data.error === 'Amount must be at least $0.01') {
            setErrorMessage("Transaction amount must be at least $0.01");
          } else if (data.error === 'Missing required fields') {
            setErrorMessage("Please fill in all required fields");
          } else {
            setErrorMessage(data.error || "Transaction failed");
          }
        }
      } catch (error) {
        setTransactionStatus("failure");
        setErrorMessage("An error occurred while processing the transaction");
        console.error('Error sending money:', error);
      }
    } else {
      setTransactionStatus("failure");
      setErrorMessage("Please fill in all required fields");
    }
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    const filtered = availableUsernames.filter(username => 
      username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered.map(username => ({ value: username, label: username })));
    setIsDropdownOpen(true);
    setTransactionStatus(null);
    setErrorMessage("");
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setTransactionStatus(null);
    setErrorMessage("");
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setTransactionStatus(null);
    setErrorMessage("");
  };

  const handleItemCountChange = (value: string) => {
    setItemCount(value);
    setTransactionStatus(null);
    setErrorMessage("");
  };

  const handleSelectUser = (user: User) => {
    setRecipient(user.label);
    setIsDropdownOpen(false);
    setTransactionStatus(null);
    setErrorMessage("");
  };

  const handleRefreshClick = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      fetchTransactions().finally(() => {
        setTimeout(() => setIsRefreshing(false), 1000);
      });
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

  // Enhanced Logout Handler with Confirmation Prompt
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
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
    }
  };

  if (isLoading || !isInitialized || isRegularUser === null) {
    return <div>Loading...</div>;
  }

  if (!isRegularUser) {
    return null;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Logout Button */}
      <div className="flex justify-end">
        <div className="flex justify-end mb-1">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-800 pb-0"
          >
            Logout
          </Button>
        </div>
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Send Money</Button>
        </DialogTrigger>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Send Money</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right text-black">
                To
              </Label>
              <div className="col-span-3 relative" ref={dropdownRef}>
                <div className="flex items-center">
                  <Input
                    id="recipient"
                    value={recipient}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="pr-8 text-black"
                    placeholder="Type or select user"
                  />
                  <ChevronDown
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  />
                </div>
                {isDropdownOpen && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-auto">
                    {filteredUsers.map((user) => (
                      <li
                        key={user.value}
                        className="px-3 py-3 text-sm hover:bg-gray-100 cursor-pointer text-black"
                        onClick={() => handleSelectUser(user)}
                      >
                        {user.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-black">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="col-span-3 text-black"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-black">
                Description
              </Label>
              {/* Replace Input with Select Dropdown */}
              <select
                id="description"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="col-span-3 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="" disabled>Select description</option>
                <option value="Service">Service</option>
                <option value="Goods">Goods</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemCount" className="text-right text-black">
                Item Count
              </Label>
              <Input
                id="itemCount"
                type="number"
                value={itemCount}
                onChange={(e) => handleItemCountChange(e.target.value)}
                className="col-span-3 text-black"
                min="1"
              />
            </div>
          </div>
          {transactionStatus && (
            <Alert
              variant={transactionStatus === "success" ? "default" : "destructive"}
              className={`${
                transactionStatus === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {transactionStatus === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle className={transactionStatus === "success" ? "text-green-800" : "text-red-800"}>
                {transactionStatus === "success" ? "Success" : "Failed"}
              </AlertTitle>
              <AlertDescription className={transactionStatus === "success" ? "text-green-700" : "text-red-700"}>
                {transactionStatus === "success"
                  ? "Transaction completed successfully."
                  : errorMessage}
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleSendMoney}
            disabled={!amount || !recipient || !description || !itemCount}
            className={`${
              !amount || !recipient || !description || !itemCount
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Send
          </Button>
        </DialogContent>
      </Dialog>

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
