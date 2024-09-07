"use client"

import { useState } from "react"
import { Bell, CreditCard, DollarSign, Users, Percent, Plus, Minus, Trash2, ClipboardList } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { format } from "date-fns"

// Mock data
const initialUsers = [
  { id: 1, username: "alice_j", businessName: "Alice's Accessories", balance: 1250.75 },
  { id: 2, username: "bob_smith", businessName: "Bob's Bakery", balance: 850.50 },
  { id: 3, username: "charlie_b", businessName: "Charlie's Chocolates", balance: 3000.25 },
  { id: 4, username: "diana_p", businessName: "Diana's Deli", balance: 500.00 },
]

const initialTransactions = [
  { id: 1, from: "alice_j", to: "bob_smith", amount: 50.00, date: new Date("2023-06-01T14:30:00"), type: "transfer" },
  { id: 2, from: "charlie_b", to: "diana_p", amount: 25.50, date: new Date("2023-06-02T09:15:00"), type: "transfer" },
  { id: 3, from: "bob_smith", to: "alice_j", amount: 30.00, date: new Date("2023-06-03T18:45:00"), type: "transfer" },
  { id: 4, from: "diana_p", to: "charlie_b", amount: 100.00, date: new Date("2023-06-04T11:20:00"), type: "transfer" },
]

const initialLogs = [
  {
    action_description: "New user registered: ryan",
    action_type: "USER_REGISTRATION",
    admin_id: null,
    affected_user_id: 1,
    id: 1,
    timestamp: "2024-09-07T14:55:43"
  },
  {
    action_description: "User logged in: ryan",
    action_type: "USER_LOGIN",
    admin_id: null,
    affected_user_id: 1,
    id: 2,
    timestamp: "2024-09-07T14:56:00"
  },
  {
    action_description: "Created new admin user admin",
    action_type: "ADMIN_CREATE",
    admin_id: null,
    affected_user_id: null,
    id: 3,
    timestamp: "2024-09-07T14:56:10"
  },
  {
    action_description: "User logged in: admin",
    action_type: "USER_LOGIN",
    admin_id: null,
    affected_user_id: 2,
    id: 4,
    timestamp: "2024-09-07T14:56:16"
  },
  {
    action_description: "Marked user ryan as deleted",
    action_type: "USER_DELETE",
    admin_id: 2,
    affected_user_id: 1,
    id: 5,
    timestamp: "2024-09-07T14:56:25"
  }
]

// Add this type definition at the top of your file
type User = {
  id: number;
  username: string;
  businessName: string;
  balance: number;
};

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState(initialUsers)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [logs, setLogs] = useState(initialLogs)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState("")

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0)
  const totalTransactions = transactions.length
  const averageTransaction = transactions.reduce((sum, tx) => sum + tx.amount, 0) / totalTransactions
  const totalFeesCollected = transactions.reduce((sum, tx) => sum + (tx.type === "transfer" ? tx.amount * 0.01 : 0), 0)

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "yyyy-MM-dd HH:mm:ss")
  }

  const handleBalanceAdjustment = (type: 'add' | 'subtract') => {
    if (!selectedUser || !adjustmentAmount) return

    const amount = parseFloat(adjustmentAmount)
    if (isNaN(amount)) return

    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          balance: type === 'add' ? user.balance + amount : user.balance - amount
        }
      }
      return user
    })

    const newTransaction = {
      id: transactions.length + 1,
      from: type === 'add' ? 'Admin' : selectedUser.username,
      to: type === 'add' ? selectedUser.username : 'Admin',
      amount: amount,
      date: new Date(),
      type: 'adjustment'
    }

    setUsers(updatedUsers)
    setTransactions([...transactions, newTransaction])
    setSelectedUser(null)
    setAdjustmentAmount("")
  }

  const handleDeleteAccount = (userId: number) => {
    const updatedUsers = users.filter(user => user.id !== userId)
    setUsers(updatedUsers)

    const newTransaction = {
      id: transactions.length + 1,
      from: 'Admin',
      to: 'System',
      amount: 0,
      date: new Date(),
      type: 'account_deletion'
    }
    setTransactions([...transactions, newTransaction])
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-black">Admin Dashboard</h2>
        <nav>
          <button
            className={`flex items-center space-x-2 mb-4 p-2 w-full text-left rounded transition-colors duration-200 ease-in-out text-black ${
              activeTab === "users" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={20} />
            <span>Users</span>
          </button>
          <button
            className={`flex items-center space-x-2 mb-4 p-2 w-full text-left rounded transition-colors duration-200 ease-in-out text-black ${
              activeTab === "transactions" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            <CreditCard size={20} />
            <span>Transactions</span>
          </button>
          <button
            className={`flex items-center space-x-2 mb-4 p-2 w-full text-left rounded transition-colors duration-200 ease-in-out text-black ${
              activeTab === "logs" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            <ClipboardList size={20} />
            <span>Admin Logs</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Dashboard Overview</h1>
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell size={24} />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageTransaction.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalFeesCollected.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
  <TabsTrigger 
    value="users" 
    className="text-black focus:bg-white data-[state=active]:bg-white"
  >
    Users
  </TabsTrigger>
  <TabsTrigger 
    value="transactions" 
    className="text-black focus:bg-white data-[state=active]:bg-white"
  >
    Transactions
  </TabsTrigger>
  <TabsTrigger 
    value="logs" 
    className="text-black focus:bg-white data-[state=active]:bg-white"
  >
    Admin Logs
  </TabsTrigger>
</TabsList>
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Users and Balances</CardTitle>
                <CardDescription>A list of all users and their current account balances.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.businessName}</TableCell>
                        <TableCell>${user.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setSelectedUser(user)}>Adjust Balance</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Adjust Balance for {user.username}</DialogTitle>
                                  <DialogDescription>
                                    Please enter the amount you want to add or subtract from the user&apos;s balance.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Input
                                      id="amount"
                                      type="number"
                                      placeholder="Amount"
                                      value={adjustmentAmount}
                                      onChange={(e) => setAdjustmentAmount(e.target.value)}
                                      className="col-span-4"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" /> Add Funds
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Balance Adjustment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to add ${adjustmentAmount} to {user.username}&apos;s balance?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-primary text-primary-foreground hover:bg-primary/90">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleBalanceAdjustment('add')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                          Confirm
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline">
                                        <Minus className="mr-2 h-4 w-4" /> Subtract Funds
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Balance Adjustment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to subtract ${adjustmentAmount} from {user.username}&apos;s balance?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-primary text-primary-foreground hover:bg-primary/90">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleBalanceAdjustment('subtract')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                          Confirm
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete Account</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete {user.username}&apos;s account
                                    and remove all associated data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-primary text-primary-foreground hover:bg-primary/90">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteAccount(user.id)} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                    Delete Account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A list of all transactions on the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell>{tx.from}</TableCell>
                        <TableCell>{tx.to}</TableCell>
                        <TableCell>${tx.amount.toFixed(2)}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell>${tx.type === "transfer" ? (tx.amount * 0.01).toFixed(2) : "0.00"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Logs</CardTitle>
                <CardDescription>A list of all admin actions and system events.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Admin ID</TableHead>
                      <TableHead>Affected User ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                        <TableCell>{log.action_type}</TableCell>
                        <TableCell>{log.action_description}</TableCell>
                        <TableCell>{log.admin_id || '-'}</TableCell>
                        <TableCell>{log.affected_user_id || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}