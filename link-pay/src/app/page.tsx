import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="text-2xl">Create Payment Link</CardTitle>
          <CardDescription>Generate a new payment link for your customer</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" placeholder="Enter amount" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" placeholder="Enter currency (e.g., USD)" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter payment description" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Generate Payment Link</Button>
        </CardFooter>
      </Card>
    </main>
  )
}