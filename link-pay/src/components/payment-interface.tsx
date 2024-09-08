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

interface Transaction {
  transaction_id: number;
  type: 'sent' | 'received';
  counterparty: string;
  amount: number;
  description: string;
  timestamp: string;
}

interface User {
  value: string;
  label: string;
}

const suggestedUsers: User[] = [
  { value: "funnyBunny", label: "funnyBunny" },
  { value: "builderBeaver", label: "builderBeaver" },
  { value: "chargeMaster", label: "chargeMaster" },
  { value: "daringDolphin", label: "daringDolphin" },
  { value: "exploringEagle", label: "exploringEagle" },
];

export function PaymentInterface() {
  const [balance, setBalance] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(suggestedUsers);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/user/profile', {
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setBalance(data.balance);
      setUserName(data.username);
    } catch (error) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/transaction/history', {
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`,
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
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchUserProfile(), fetchTransactions()]);
    setIsLoading(false);
  }, [fetchTransactions]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const handleSendMoney = async () => {
    if (amount && recipient && description) {
      try {
        const response = await fetch('http://127.0.0.1:5000/transactions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`,
          },
          body: JSON.stringify({
            recipient_username: recipient,
            amount: parseFloat(amount),
            description: description,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setTransactionStatus("success");
          setBalance(prevBalance => prevBalance - parseFloat(amount));
          await fetchTransactions();
        } else {
          setTransactionStatus("failure");
          setErrorMessage(data.error || "Transaction failed");
        }
      } catch (error) {
        setTransactionStatus("failure");
        setErrorMessage("An error occurred while processing the transaction");
        console.error('Error sending money:', error);
      }

      setTimeout(() => {
        setIsOpen(false);
        setAmount("");
        setRecipient("");
        setDescription("");
        setTransactionStatus(null);
        setErrorMessage("");
      }, 2000);
    }
  };

  // ... (other handler functions remain the same)

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

      {/* ... (Send Money Dialog remains the same) */}

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
              onClick={fetchTransactions}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
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
                      <p className="text-sm text-gray-500">{transaction.description}</p>
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
    </div>
  );
}