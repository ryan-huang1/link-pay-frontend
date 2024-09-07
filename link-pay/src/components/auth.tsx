"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, EyeOffIcon, RefreshCwIcon } from "lucide-react"

export default function Component() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [generatedUsername, setGeneratedUsername] = useState("")

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const generateUsername = () => {
    const adjectives = [
      "Sparkling", "Lucky", "Glowing", "Clever", "Smooth", "Brave", "Airy", "Lively", "Mystic", "Stubborn",
      "Playful", "Tough", "Dreamy", "Fleeting", "Eager", "Bubbly", "Moody", "Witty", "Hopeful", "Daring",
      "Endless", "Joyful", "Silky", "Hazy", "Bright", "Twisty", "Magical", "Perfect", "Common", "Fiery",
      "Fading", "Shiny", "Melodic", "Fizzy", "Cloudy", "Smart", "Light", "Secret", "Changing", "Musical",
      "Hidden", "Swift", "Starry", "Ideal", "Radiant", "Angelic", "Shadowy", "Bouncy", "Cozy", "Snowy",
      "Sunny", "Rainy", "Windy", "Icy", "Misty", "Foggy", "Frosty", "Breezy", "Stormy", "Chilly",
      "Warm", "Hot", "Cool", "Mild", "Balmy", "Sticky", "Humid", "Dry", "Crisp", "Fresh",
      "Sweet", "Sour", "Bitter", "Spicy", "Tangy", "Zesty", "Juicy", "Tasty", "Yummy", "Savory",
      "Soft", "Hard", "Fluffy", "Fuzzy", "Woolly", "Furry", "Hairy", "Spiky", "Bumpy", "Lumpy",
      "Slimy", "Gooey", "Sticky", "Slippery", "Rough", "Smooth", "Flat", "Round", "Square", "Pointy",
      "Zigzag", "Curvy", "Wavy", "Crooked", "Straight", "Wobbly", "Wiggly", "Loopy", "Swirly", "Dotted",
      "Striped", "Spotted", "Checkered", "Plaid", "Floral", "Paisley", "Solid", "Sheer", "Opaque", "Glossy",
      "Matte", "Shimmery", "Glittery", "Pearly", "Rusty", "Faded", "Vibrant", "Neon", "Pastel", "Earthy",
      "Metallic", "Wooden", "Plastic", "Rubber", "Leather", "Silky", "Velvety", "Lacy", "Knitted", "Woven",
      "Braided", "Tangled", "Knotted", "Twisted", "Folded", "Crumpled", "Smooth", "Wrinkled", "Pleated", "Ruffled",
      "Bouncy", "Jiggly", "Wiggly", "Wobbly", "Shaky", "Steady", "Stable", "Tipsy", "Tilted", "Lopsided",
      "Balanced", "Centered", "Aligned", "Crooked", "Askew", "Symmetrical", "Asymmetrical", "Proportional", "Distorted", "Warped",
      "Stretched", "Squished", "Inflated", "Deflated", "Expanded", "Compressed", "Hollow", "Solid", "Dense", "Airy",
      "Porous", "Absorbent", "Repellent", "Magnetic", "Electric", "Solar", "Lunar", "Cosmic", "Earthly", "Heavenly",
      "Divine", "Mortal", "Eternal", "Ephemeral", "Ancient", "Modern", "Futuristic", "Retro", "Vintage", "Timeless"
  ];
  
  const nouns = [
      "Dragon", "Eagle", "Whale", "Tiger", "Wolf", "Snake", "Horse", "Bull", "Shark", "Lion",
      "Giant", "Owl", "Hound", "Ghost", "Fairy", "Spirit", "Statue", "Mermaid", "Monster", "Unicorn",
      "Genie", "Cobra", "Fox", "Yeti", "Falcon", "Serpent", "Bird", "Warrior", "Mammoth", "Rabbit",
      "Seal", "Pony", "Vampire", "Rooster", "Lizard", "Cat", "Raven", "Parrot", "Witch", "Hawk",
      "Devil", "Elf", "Zombie", "Troll", "Demon", "Pixie", "Giant", "Mermaid", "Goblin", "Nymph",
      "Bear", "Deer", "Moose", "Elk", "Bison", "Goat", "Sheep", "Cow", "Pig", "Dog",
      "Dolphin", "Whale", "Shark", "Fish", "Crab", "Lobster", "Shrimp", "Octopus", "Squid", "Jellyfish",
      "Ant", "Bee", "Wasp", "Fly", "Moth", "Butterfly", "Spider", "Scorpion", "Centipede", "Millipede",
      "Tree", "Flower", "Bush", "Grass", "Moss", "Fern", "Vine", "Cactus", "Palm", "Pine",
      "Rock", "Mountain", "Hill", "Valley", "Canyon", "Cave", "River", "Lake", "Ocean", "Island",
      "Book", "Pen", "Pencil", "Brush", "Canvas", "Easel", "Palette", "Violin", "Piano", "Drum",
      "Guitar", "Flute", "Trumpet", "Harp", "Banjo", "Saxophone", "Clarinet", "Trombone", "Harmonica", "Accordion",
      "Camera", "Phone", "Computer", "Tablet", "Watch", "Clock", "Compass", "Map", "Globe", "Atlas",
      "Telescope", "Microscope", "Binoculars", "Magnifier", "Prism", "Mirror", "Lens", "Filter", "Projector", "Screen",
      "Chair", "Table", "Desk", "Bed", "Couch", "Shelf", "Cabinet", "Dresser", "Wardrobe", "Closet",
      "Lamp", "Candle", "Lantern", "Torch", "Flashlight", "Beacon", "Spotlight", "Chandelier", "Sconce", "Nightlight",
      "Plate", "Bowl", "Cup", "Mug", "Glass", "Spoon", "Fork", "Knife", "Chopsticks", "Straw",
      "Pot", "Pan", "Kettle", "Oven", "Stove", "Fridge", "Freezer", "Toaster", "Blender", "Mixer",
      "Shirt", "Pants", "Dress", "Skirt", "Jacket", "Coat", "Sweater", "Socks", "Shoes", "Boots",
      "Hat", "Cap", "Scarf", "Gloves", "Mittens", "Belt", "Tie", "Bowtie", "Necklace", "Bracelet"
  ];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    setGeneratedUsername(`${randomAdj}${randomNoun}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to LinkPay</CardTitle>
          <CardDescription className="text-center">Login or create a new account to start using LinkPay.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="johndoe123" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Generated Username</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="register-username"
                        value={generatedUsername}
                        readOnly
                        placeholder="Click generate to get a username"
                        className="flex-grow cursor-not-allowed"
                      />
                      <Button
                        type="button"
                        onClick={generateUsername}
                        aria-label="Generate username"
                      >
                        <RefreshCwIcon className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="w-full">{activeTab === "login" ? "Login" : "Create Account"}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}