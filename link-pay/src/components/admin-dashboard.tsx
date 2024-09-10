"use client"

import { useState } from "react"
import { RefreshCw, CreditCard, DollarSign, Users, Percent, Plus, Minus, Trash2, ClipboardList, Menu, ChevronRight, MoreVertical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
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

// Add this type definition
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

  const SidebarContent = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-black">Admin Dashboard</h2>
      <nav className="space-y-2">
        <button
          className={`flex items-center space-x-2 w-full p-2 rounded transition-colors duration-200 ease-in-out text-black ${
            activeTab === "users" ? "bg-primary/10" : "hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={20} className="text-black" />
          <span>Users</span>
        </button>
        <button
          className={`flex items-center space-x-2 w-full p-2 rounded transition-colors duration-200 ease-in-out text-black ${
            activeTab === "transactions" ? "bg-primary/10" : "hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          <CreditCard size={20} className="text-black" />
          <span>Transactions</span>
        </button>
        <button
          className={`flex items-center space-x-2 w-full p-2 rounded transition-colors duration-200 ease-in-out text-black ${
            activeTab === "logs" ? "bg-primary/10" : "hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("logs")}
        >
          <ClipboardList size={20} className="text-black" />
          <span>Admin Logs</span>
        </button>
      </nav>
    </div>
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      <aside className="hidden lg:block w-64 bg-white shadow-md overflow-y-auto">
        <div className="p-6">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center w-full">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden text-gray-500" >
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white">
              <SheetHeader>
                <SheetDescription>
                  <SidebarContent />
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold text-black">Dashboard Overview</h1>
          <Button variant="outline" size="icon" className="rounded-full">
            <RefreshCw size={20} className="text-gray-500" />
            <span className="sr-only">Refresh</span>
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 w-full">
          <ScrollArea className="h-full w-full">
            <div className="space-y-6 w-full">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTransactions}</div>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${averageTransaction.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalFeesCollected.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="users" className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-500 data-[state=active]:bg-white">Users</TabsTrigger>
                  <TabsTrigger value="transactions" className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-500 data-[state=active]:bg-white">Transactions</TabsTrigger>
                  <TabsTrigger value="logs" className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-500 data-[state=active]:bg-white">Admin Logs</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="space-y-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Users and Balances</CardTitle>
                      <CardDescription>A list of all users and their current account balances.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Username</th>
                              <th className="px-4 py-2 text-left hidden sm:table-cell">Business Name</th>
                              <th className="px-4 py-2 text-left">Balance</th>
                              <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id} className="border-b">
                                <td className="px-4 py-2">{user.username}</td>
                                <td className="px-4 py-2 hidden sm:table-cell">{user.businessName}</td>
                                <td className="px-4 py-2">${user.balance.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onSelect={() => setSelectedUser(user)}>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="ghost">Adjust Balance</Button>
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
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onSelect={() => handleDeleteAccount(user.id)}>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost">Delete Account</Button>
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
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="transactions" className="space-y-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>A list of all transactions on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left hidden sm:table-cell">Date</th>
                              <th className="px-4 py-2 text-left">From</th>
                              <th className="px-4 py-2 text-left">To</th>
                              <th className="px-4 py-2 text-left">Amount</th>
                              <th className="px-4 py-2 text-left hidden sm:table-cell">Type</th>
                              <th className="px-4 py-2 text-left hidden sm:table-cell">Fee</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="border-b">
                                <td className="px-4 py-2 hidden sm:table-cell">{formatDate(tx.date)}</td>
                                <td className="px-4 py-2">{tx.from}</td>
                                <td className="px-4 py-2">{tx.to}</td>
                                <td className="px-4 py-2">${tx.amount.toFixed(2)}</td>
                                <td className="px-4 py-2 hidden sm:table-cell">{tx.type}</td>
                                <td className="px-4 py-2 hidden sm:table-cell">${tx.type === "transfer" ? (tx.amount * 0.01).toFixed(2) : "0.00"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="logs" className="space-y-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Admin Logs</CardTitle>
                      <CardDescription>A list of all admin actions and system events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Timestamp</th>
                              <th className="px-4 py-2 text-left">Action Type</th>
                              <th className="px-4 py-2 text-left hidden sm:table-cell">Description</th>
                              <th className="px-4 py-2 text-left hidden sm:table-cell">Admin ID</th>
                              <th className="px-4 py-2 text-left hidden sm:table-cell">Affected User ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.map((log) => (
                              <tr key={log.id} className="border-b">
                                <td className="px-4 py-2">{formatDate(log.timestamp)}</td>
                                <td className="px-4 py-2">{log.action_type}</td>
                                <td className="px-4 py-2 hidden sm:table-cell">{log.action_description}</td>
                                <td className="px-4 py-2 hidden sm:table-cell">{log.admin_id || '-'}</td>
                                <td className="px-4 py-2 hidden sm:table-cell">{log.affected_user_id || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}