"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpRight, ArrowDownLeft, ChevronDown, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for initial transactions
const initialTransactions = [
  { id: 1, type: "sent", amount: 50, to: "theRealAlice", date: "2023-04-15" },
  { id: 2, type: "received", amount: 30, from: "BobTheBuilder", date: "2023-04-14" },
  { id: 3, type: "sent", amount: 20, to: "CharlieInCharge", date: "2023-04-13" },
  { id: 4, type: "received", amount: 40, from: "DaringDavid", date: "2023-04-12" },
  { id: 5, type: "sent", amount: 15, to: "EveTheExplorer", date: "2023-04-11" },
]

const suggestedUsers = [
  { value: "theRealAlice", label: "theRealAlice" },
  { value: "BobTheBuilder", label: "BobTheBuilder" },
  { value: "CharlieInCharge", label: "CharlieInCharge" },
  { value: "DaringDavid", label: "DaringDavid" },
  { value: "EveTheExplorer", label: "EveTheExplorer" },
]

export function VenmoInterface() {
  const [balance, setBalance] = useState(500)
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [userName] = useState("@dictator_link")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState(suggestedUsers)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [transactionStatus, setTransactionStatus] = useState<"success" | "failure" | null>(null)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [errorMessage, setErrorMessage] = useState("")

  const handleSendMoney = () => {
    if (amount && recipient) {
      const sendAmount = parseFloat(amount)
      if (sendAmount < 0) {
        setTransactionStatus("failure")
        setErrorMessage("Transaction failed. Amount cannot be negative.")
      } else if (sendAmount === 0) {
        setTransactionStatus("failure")
        setErrorMessage("Transaction failed. Amount must be greater than zero.")
      } else if (sendAmount > balance) {
        setTransactionStatus("failure")
        setErrorMessage("Transaction failed. Insufficient balance.")
      } else {
        setBalance(balance - sendAmount)
        setTransactionStatus("success")
        
        // Add the new transaction to the history
        const newTransaction = {
          id: transactions.length + 1,
          type: "sent",
          amount: sendAmount,
          to: recipient,
          date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
        }
        setTransactions([newTransaction, ...transactions])

        setTimeout(() => {
          setIsOpen(false)
          setAmount("")
          setRecipient("")
          setTransactionStatus(null)
          setErrorMessage("")
        }, 2000)
      }
    }
  }

  const handleRecipientChange = (value: string) => {
    setRecipient(value)
    setFilteredUsers(
      suggestedUsers.filter((user) =>
        user.label.toLowerCase().includes(value.toLowerCase())
      )
    )
    setTransactionStatus(null)
    setErrorMessage("")
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    setTransactionStatus(null)
    setErrorMessage("")
  }

  const handleSelectUser = (user: { value: string; label: string }) => {
    setRecipient(user.label)
    setIsDropdownOpen(false)
    setTransactionStatus(null)
    setErrorMessage("")
  }

  const generateRandomPayment = () => {
    const randomAmount = Math.floor(Math.random() * 100) + 1 // Random amount between 1 and 100
    const randomUser = suggestedUsers[Math.floor(Math.random() * suggestedUsers.length)]
    return {
      id: transactions.length + 1,
      type: "received",
      amount: randomAmount,
      from: randomUser.label,
      date: new Date().toISOString().split('T')[0]
    }
  }

  const refreshTransactions = () => {
    const newPayment = generateRandomPayment()
    setTransactions([newPayment, ...transactions])
    setBalance(balance + newPayment.amount)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Your Balance</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{userName}</span>
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
            disabled={!amount || !recipient}
            className={`${
              !amount || !recipient
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
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <Button
              variant="outline"
              size="icon"
              onClick={refreshTransactions}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-start flex-1 pr-4">
                  {transaction.type === "sent" ? (
                    <ArrowUpRight className="mr-2 mt-1 text-red-500 flex-shrink-0" />
                  ) : (
                    <ArrowDownLeft className="mr-2 mt-1 text-green-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium break-words text-sm ${
                      transaction.type === "sent" ? "text-red-500" : "text-green-600"
                    }`}>
                      {transaction.type === "sent"
                        ? `Sent to ${transaction.to}`
                        : `Received from ${transaction.from}`}
                    </p>
                    <p className="text-sm text-gray-500 text-sm">{transaction.date}</p>
                  </div>
                </div>
                <p
                  className={`font-medium whitespace-nowrap text-sm ${
                    transaction.type === "sent" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {transaction.type === "sent" ? "-" : "+"}$
                  {transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}