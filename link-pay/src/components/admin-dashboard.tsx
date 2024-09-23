'use client'

import { useState, useEffect } from "react"
import { RefreshCw, CreditCard, DollarSign, Users, Menu, Building2, ClipboardList, LogOut, Trash2, Edit3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.1.10:80';

// Define types for our data
type User = {
  id: number;
  username: string;
  transactionCount: number;
  balance: number;
}

type Business = {
  id: number;
  name: string;
  transactionCount: number;
  revenue: number;
}

type Transaction = {
  id: number;
  from: string;
  to: string;
  amount: number;
  date: Date;
  type: string;
}

type AdminLog = {
  id: number;
  action_description: string;
  action_type: string;
  timestamp: string;
}

// Mock data
const initialUsers: User[] = [
  { id: 1, username: "alice_j", transactionCount: 5, balance: 1250.75 },
  { id: 2, username: "bob_smith", transactionCount: 3, balance: 850.50 },
  { id: 3, username: "charlie_b", transactionCount: 7, balance: 3000.25 },
]

const initialBusinesses: Business[] = [
  { id: 1, name: "Alice's Accessories", transactionCount: 15, revenue: 5000.00 },
  { id: 2, name: "Bob's Bakery", transactionCount: 8, revenue: 3500.00 },
  { id: 3, name: "Charlie's Chocolates", transactionCount: 20, revenue: 7500.00 },
]

const initialTransactions: Transaction[] = [
  { id: 1, from: "alice_j", to: "bob_smith", amount: 50.00, date: new Date("2023-06-01T14:30:00"), type: "transfer" },
  { id: 2, from: "charlie_b", to: "bob_smith", amount: 25.50, date: new Date("2023-06-02T09:15:00"), type: "transfer" },
  { id: 3, from: "bob_smith", to: "alice_j", amount: 30.00, date: new Date("2023-06-03T18:45:00"), type: "transfer" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
  const [transactions] = useState<Transaction[]>(initialTransactions)
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [modifyBalanceDialogOpen, setModifyBalanceDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<User | Business | null>(null)
  const [newBalance, setNewBalance] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    numberOfBusinesses: 0,
    numberOfUsers: 0,
    totalTransactions: 0,
    averageTransaction: 0
  })


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch admin status
        const profileResponse = await fetch(`${BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await profileResponse.json();

        if (!userData.is_admin) {
          throw new Error('User is not an admin');
        }

        // Fetch stats
        const statsResponse = await fetch(`${BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch admin stats');
        }

        const statsData = await statsResponse.json();

        setStats({
          numberOfBusinesses: statsData.business_count,
          numberOfUsers: statsData.user_count,
          totalTransactions: statsData.transaction_count,
          averageTransaction: statsData.average_transaction_size
        });

        // Fetch admin logs
        const logsResponse = await fetch(`${BASE_URL}/admin/action-logs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!logsResponse.ok) {
          throw new Error('Failed to fetch admin logs');
        }

        const logsData = await logsResponse.json();
        setAdminLogs(logsData.logs);

        setIsLoading(false);
      } catch (error: unknown) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleError = (error: unknown) => {
    console.error('Error:', error);
    setError(error instanceof Error ? error.message : 'An unknown error occurred');
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMM d'th', h:mma").toLowerCase()
  }

  const handleLogout = () => {
    // Delete all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Redirect to home page
    window.location.href = '/';
  }


  const handleDelete = () => {
    if (selectedItem) {
      if (activeTab === "users") {
        setUsers(users.filter(user => user.id !== selectedItem.id))
      } else if (activeTab === "businesses") {
        setBusinesses(businesses.filter(business => business.id !== selectedItem.id))
      }
    }
    setDeleteDialogOpen(false)
  }

  const handleModifyBalance = () => {
    if (selectedItem) {
      if (activeTab === "users" && 'balance' in selectedItem) {
        setUsers(users.map(user => 
          user.id === selectedItem.id ? { ...user, balance: parseFloat(newBalance) } : user
        ))
      } else if (activeTab === "businesses" && 'revenue' in selectedItem) {
        setBusinesses(businesses.map(business => 
          business.id === selectedItem.id ? { ...business, revenue: parseFloat(newBalance) } : business
        ))
      }
    }
    setModifyBalanceDialogOpen(false)
  }

  const SidebarContent = () => (
    <div className="space-y-4">
      <nav className="space-y-2">
        {["users", "businesses", "transactions", "admin-logs"].map((tab) => (
          <button
            key={tab}
            className={`flex items-center space-x-2 w-full p-2 rounded transition-colors duration-200 ease-in-out ${
              activeTab === tab ? "bg-primary/10" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "users" ? <Users size={20} color="black" /> : 
             tab === "businesses" ? <Building2 size={20} color="black" /> : 
             tab === "transactions" ? <CreditCard size={20} color="black" /> :
             <ClipboardList size={20} color="black" />}
            <span style={{ color: "black" }}>{tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
          </button>
        ))}
      </nav>
    </div>
  )

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center w-full">
        <div className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu size={24} color="black" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white">
              <SheetHeader>
                <SidebarContent />
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <RefreshCw size={20} color="black" />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={handleLogout}>
            <LogOut size={20} color="black" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-64 bg-white shadow-md overflow-y-auto">
          <div className="p-6">
            <SidebarContent />
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4 w-full">
          <ScrollArea className="h-full w-full">
            <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Number of Businesses", value: stats.numberOfBusinesses, icon: Building2 },
                  { title: "Number of Users", value: stats.numberOfUsers, icon: Users },
                  { title: "Total Transactions", value: stats.totalTransactions, icon: CreditCard },
                  { title: "Average Transaction", value: `$${stats.averageTransaction.toFixed(2)}`, icon: DollarSign },
                ].map((item, index) => (
                  <Card key={index} className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
                  <TabsTrigger value="users" className="px-4 py-2 bg-gray-100 data-[state=active]:bg-white">Users</TabsTrigger>
                  <TabsTrigger value="businesses" className="px-4 py-2 bg-gray-100 data-[state=active]:bg-white">Businesses</TabsTrigger>
                  <TabsTrigger value="transactions" className="px-4 py-2 bg-gray-100 data-[state=active]:bg-white">Transactions</TabsTrigger>
                  <TabsTrigger value="admin-logs" className="px-4 py-2 bg-gray-100 data-[state=active]:bg-white">Admin Logs</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="space-y-4 pt-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Users and Balances</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left w-1/4">Username</th>
                              <th className="px-4 py-2 text-left w-1/4">Transactions</th>
                              <th className="px-4 py-2 text-left w-1/4">Balance</th>
                              <th className="px-4 py-2 text-left w-1/4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id} className="border-b">
                                <td className="px-4 py-2">{user.username}</td>
                                <td className="px-4 py-2">{user.transactionCount}</td>
                                <td className="px-4 py-2">${user.balance.toFixed(2)}</td>
                                <td className="px-4 py-2">
                                  <div className="flex space-x-2">
                                    <Dialog open={modifyBalanceDialogOpen} onOpenChange={setModifyBalanceDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedItem(user)}>
                                          <Edit3 className="h-4 w-4 mr-2" />
                                          Modify
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Modify User Balance</DialogTitle>
                                          <DialogDescription>
                                            Enter the new balance for {selectedItem && 'username' in selectedItem ? selectedItem.username : ''}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="balance" className="text-right">
                                              Balance
                                            </Label>
                                            <Input
                                              id="balance"
                                              value={newBalance}
                                              onChange={(e) => setNewBalance(e.target.value)}
                                              className="col-span-3"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="default" onClick={() => setModifyBalanceDialogOpen(false)}>
                                            Cancel
                                          </Button>
                                          <Button variant="outline" type="submit" onClick={handleModifyBalance}>
                                            Save changes
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="destructive" size="sm" onClick={() => setSelectedItem(user)}>
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Confirm Deletion</DialogTitle>
                                          <DialogDescription>
                                            Are you sure you want to delete the user {selectedItem && 'username' in selectedItem ? selectedItem.username : ''}? This action cannot be undone.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                          <Button variant="default" onClick={() => setDeleteDialogOpen(false)}>
                                            Cancel
                                            </Button>
                                          <Button variant="outline" onClick={handleDelete}>
                                            Delete
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="businesses" className="space-y-4 pt-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Businesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left w-1/4">Business Name</th>
                              <th className="px-4 py-2 text-left w-1/4">Transactions</th>
                              <th className="px-4 py-2 text-left w-1/4">Revenue</th>
                              <th className="px-4 py-2 text-left w-1/4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {businesses.map((business) => (
                              <tr key={business.id} className="border-b">
                                <td className="px-4 py-2">{business.name}</td>
                                <td className="px-4 py-2">{business.transactionCount}</td>
                                <td className="px-4 py-2">${business.revenue.toFixed(2)}</td>
                                <td className="px-4 py-2">
                                  <div className="flex space-x-2">
                                    <Dialog open={modifyBalanceDialogOpen} onOpenChange={setModifyBalanceDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedItem(business)}>
                                          <Edit3 className="h-4 w-4 mr-2" />
                                          Modify
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Modify Business Revenue</DialogTitle>
                                          <DialogDescription>
                                            Enter the new revenue for {selectedItem && 'name' in selectedItem ? selectedItem.name : ''}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="revenue" className="text-right">
                                              Revenue
                                            </Label>
                                            <Input
                                              id="revenue"
                                              value={newBalance}
                                              onChange={(e) => setNewBalance(e.target.value)}
                                              className="col-span-3"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="default" onClick={() => setModifyBalanceDialogOpen(false)}>
                                            Cancel
                                          </Button>
                                          <Button variant="outline" type="submit" onClick={handleModifyBalance}>
                                            Save changes
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="destructive" size="sm" onClick={() => setSelectedItem(business)}>
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Confirm Deletion</DialogTitle>
                                          <DialogDescription>
                                            Are you sure you want to delete the business {selectedItem && 'name' in selectedItem ? selectedItem.name : ''}? This action cannot be undone.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                          <Button variant="default" onClick={() => setDeleteDialogOpen(false)}>
                                            Cancel
                                          </Button>
                                          <Button variant="outline" onClick={handleDelete}>
                                            Delete
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="transactions" className="space-y-4 pt-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left w-1/4">Date</th>
                              <th className="px-4 py-2 text-left w-1/4">From</th>
                              <th className="px-4 py-2 text-left w-1/4">To</th>
                              <th className="px-4 py-2 text-left w-1/4">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="border-b">
                                <td className="px-4 py-2">{formatDate(tx.date)}</td>
                                <td className="px-4 py-2">{tx.from}</td>
                                <td className="px-4 py-2">{tx.to}</td>
                                <td className="px-4 py-2">${tx.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="admin-logs" className="space-y-4 pt-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Admin Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-3 text-left w-1/3">Timestamp</th>
                              <th className="px-4 py-3 text-left w-1/3">Action Type</th>
                              <th className="px-4 py-3 text-left w-1/3">Action Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminLogs.map((log) => (
                              <tr key={log.id} className="border-b">
                                <td className="px-4 py-4">{formatDate(log.timestamp)}</td>
                                <td className="px-4 py-4">{log.action_type}</td>
                                <td className="px-4 py-4">{log.action_description}</td>
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