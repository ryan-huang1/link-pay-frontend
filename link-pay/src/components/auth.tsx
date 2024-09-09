"use client"

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, EyeOffIcon, RefreshCwIcon } from "lucide-react";
import { setCookie } from 'cookies-next';

export default function Component() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [generatedUsername, setGeneratedUsername] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:5000';

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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

    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    setGeneratedUsername(`${randomAdj}${randomNoun}`);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      setCookie('token', data.token, { maxAge: 3600, path: '/' }); // Expires in 1 hour
      setCookie('user_id', data.user_id.toString(), { maxAge: 3600, path: '/' });
      setCookie('is_admin', data.is_admin.toString(), { maxAge: 3600, path: '/' });

      console.log('Login successful');
      if (data.is_admin) {
        window.location.href = 'https://bank.ryanhuang.xyz/admin'; // Redirect admin to YouTube
      } else {
        window.location.href = 'https://bank.ryanhuang.xyz/profile'; // Redirect regular user to Google
      }
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!generatedUsername) {
      setError("Please generate a username first.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: generatedUsername, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      setCookie('token', data.token, { maxAge: 3600, path: '/' }); // Expires in 1 hour
      setCookie('user_id', data.user_id.toString(), { maxAge: 3600, path: '/' });
      setCookie('is_admin', 'false', { maxAge: 3600, path: '/' }); // New users are not admins

      console.log('Registration successful');
      window.location.href = 'https://bank.ryanhuang.xyz/profile'; // Redirect to user route
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

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
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="johndoe123"
                      required
                      value={username}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full">Login</Button>
                </CardFooter>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
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
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full">Create Account</Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}