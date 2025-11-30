
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, CheckCircle, Gift, IndianRupee, MapPin, Milestone, Sparkles, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase/provider";


type User = {
    id: string;
    name: string;
    email: string;
    points: number;
    pin: string;
};

type Job = {
    id: string;
    name: string;
    points: number;
};

const rewards = [
    { points: 50, name: "Free Local Service", description: "Redeem for one free local service booking." },
    { points: 100, name: "Skill-Building Workshop", description: "Access to an exclusive online workshop." },
    { points: 200, name: "Mentorship Session", description: "A one-on-one session with an industry expert." },
];

const timeOptions = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

export default function VasaWalletPage() {
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [user, setUser] = useState<User | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [pin, setPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [userPin, setUserPin] = useState('');
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    
    const [redeemLocation, setRedeemLocation] = useState('');
    const [fromDate, setFromDate] = useState<Date>();
    const [toDate, setToDate] = useState<Date>();
    const [fromTime, setFromTime] = useState('');
    const [toTime, setToTime] = useState('');
    const [selectedReward, setSelectedReward] = useState<{points: number, name: string} | null>(null);
    const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
    const [showSetPin, setShowSetPin] = useState(false);
    const [paymentInitiatedFromPostPage, setPaymentInitiatedFromPostPage] = useState(false);
    
    useEffect(() => {
        try {
            const email = localStorage.getItem('userEmail');
            if (email) {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const currentUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
                if (currentUser) {
                    setUser(currentUser);
                    setUserPin(currentUser.pin || '');
                } else {
                    // Create a default user if not found
                    const defaultUser = {
                        id: 'user-1',
                        name: localStorage.getItem('userName') || 'Vasa User',
                        email: email,
                        points: 125, // Default points
                        pin: ''
                    };
                    users.push(defaultUser);
                    localStorage.setItem('users', JSON.stringify(users));
                    setUser(defaultUser);
                }
            }
        } catch (error) {
            console.error("Failed to load user data:", error);
            toast({ title: "Error", description: "Could not load your wallet data." });
        }

        const mockJobs = [
            { id: 'job-1', name: 'House Cleaning', points: 50 },
            { id: 'job-2', name: 'Elderly Care', points: 75 },
            { id: 'job-3', name: 'Child Care', points: 60 },
        ];
        setJobs(mockJobs);
        
        if (searchParams.get('payment_success') === 'true') {
            const paymentAmount = searchParams.get('amount');
            const points = searchParams.get('points');
            toast({
                title: "Payment Successful!",
                description: `You have successfully paid ₹${paymentAmount} and earned ${points} points.`,
                className: "bg-green-100 text-green-800",
            });
            
            // Update points
            if (user && points) {
                const updatedUser = { ...user, points: user.points + parseInt(points, 10) };
                updateUserInLocalStorage(updatedUser);
            }
        }
        if (searchParams.get('openPayment') === 'true' && searchParams.get('jobId')) {
            setSelectedJob(searchParams.get('jobId')!);
            setPaymentInitiatedFromPostPage(true);
            setIsPaymentDialogOpen(true);
        }

    }, []);
    
    const updateUserInLocalStorage = (updatedUser: User) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === updatedUser.email.toLowerCase());
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
            setUser(updatedUser);
        }
    };

    const handleSetPin = () => {
        if (newPin.length === 4 && user) {
            const updatedUser = { ...user, pin: newPin };
            updateUserInLocalStorage(updatedUser);
            setUserPin(newPin);
            setShowSetPin(false);
            setNewPin('');
            toast({ title: "Success", description: "Your PIN has been set." });
        } else {
            toast({ title: "Error", description: "PIN must be 4 digits." });
        }
    };

    const handlePayment = () => {
        const job = jobs.find(j => j.id === selectedJob);
        if (job && pin === userPin) {
            const updatedUser = { ...user!, points: user!.points - job.points };
            updateUserInLocalStorage(updatedUser);

            setIsPaymentDialogOpen(false);
            setPin('');
            toast({
                title: "Payment Successful",
                description: `You have paid ${job.points} points for ${job.name}.`,
            });
            if(paymentInitiatedFromPostPage){
                router.push("/dashboard/rebook?success=true");
            }
        } else {
            toast({ title: "Payment Failed", description: "Invalid PIN or job selection." });
        }
    };
    
    const handleRedeem = (reward: { points: number, name: string }) => {
        if (user && user.points >= reward.points) {
            setSelectedReward(reward);
            setIsRedeemDialogOpen(true);
        } else {
            toast({ title: "Not enough points", description: "You don't have enough points to redeem this reward." });
        }
    };

    const handleConfirmRedemption = () => {
        if(selectedReward && fromDate && fromTime && redeemLocation){
            const updatedUser = { ...user!, points: user!.points - selectedReward.points };
            updateUserInLocalStorage(updatedUser);

            setIsRedeemDialogOpen(false);
            toast({
                title: "Reward Redeemed!",
                description: `You have successfully redeemed "${selectedReward.name}". We will contact you shortly with details.`,
            });
            // Reset redemption form
            setSelectedReward(null);
            setFromDate(undefined);
            setToDate(undefined);
            setFromTime('');
            setToTime('');
            setRedeemLocation('');
        } else {
            toast({ title: "Missing Information", description: "Please fill in all required fields to redeem your reward." });
        }
    };

    const toTimeOptions = fromTime ? timeOptions.filter(t => {
        const [fromHour, fromMinute] = fromTime.split(/:| /);
        const [toHour, toMinute] = t.split(/:| /);
        if (parseInt(fromHour) === parseInt(toHour)) {
            return parseInt(toMinute) > parseInt(fromMinute);
        }
        return parseInt(toHour) > parseInt(fromHour);
    }) : [];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (!user) {
        return <div className="p-8">Loading wallet...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Vasa Wallet</h1>
                    <p className="text-muted-foreground">Your points, rewards, and transaction history.</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold">Welcome, {user.name}</p>
                    <div className="flex items-center justify-end gap-2 text-2xl font-bold text-primary">
                        <Sparkles className="h-6 w-6" />
                        <span>{user.points} Points</span>
                    </div>
                </div>
            </div>

            {!userPin ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Set Your Secure PIN</CardTitle>
                        <CardDescription>Create a 4-digit PIN to authorize payments from your wallet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input 
                            type="password"
                            maxLength={4}
                            placeholder="Enter 4-digit PIN"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                        />
                        <Button onClick={handleSetPin}>Set PIN</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-right">
                     <Button variant="outline" onClick={() => setShowSetPin(!showSetPin)}>
                        {showSetPin ? 'Cancel' : 'Change PIN'}
                    </Button>
                </div>
            )}
            
            {showSetPin && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Change Your Secure PIN</CardTitle>
                        <CardDescription>Create a 4-digit PIN to authorize payments from your wallet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input 
                            type="password"
                            maxLength={4}
                            placeholder="Enter 4-digit PIN"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                        />
                        <Button onClick={handleSetPin}>Set PIN</Button>
                    </CardContent>
                </Card>
            )}

            {/* Redeem Points Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Redeem Your Points</CardTitle>
                    <CardDescription>Use your points to claim exciting rewards.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rewards.map(reward => (
                        <Card key={reward.name} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift className="h-6 w-6 text-accent" />
                                    {reward.name}
                                </CardTitle>
                                <CardDescription>{reward.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button 
                                    className="w-full"
                                    onClick={() => handleRedeem(reward)}
                                    disabled={user.points < reward.points}
                                >
                                    Redeem for {reward.points} Points
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            {/* Payment Dialog for Rebook */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Enter your PIN to complete the payment for the selected service.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="job">Service</Label>
                            <Select value={selectedJob} onValueChange={setSelectedJob} disabled={paymentInitiatedFromPostPage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobs.map(job => (
                                        <SelectItem key={job.id} value={job.id}>
                                            {job.name} ({job.points} points)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pin">PIN</Label>
                            <Input
                                id="pin"
                                type="password"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handlePayment}>Confirm Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Redeem Dialog */}
            <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Redeem: {selectedReward?.name}</DialogTitle>
                        <DialogDescription>
                            Please provide the details for your service booking.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="redeem-location">Service Location</Label>
                             <div className="relative">
                                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                 <Input
                                     id="redeem-location"
                                     placeholder="Enter a location, e.g., 'Koramangala, Bengaluru'"
                                     className="pl-10"
                                     value={redeemLocation}
                                     onChange={(e) => setRedeemLocation(e.target.value)}
                                 />
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="from-date">From Date</Label>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !fromDate && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={fromDate}
                                        onSelect={setFromDate}
                                        disabled={{ before: tomorrow }}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="from-time">From Time</Label>
                                    <Select value={fromTime} onValueChange={setFromTime}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeOptions.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="to-date">To Date (Optional)</Label>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !toDate && "text-muted-foreground"
                                        )}
                                        disabled={!fromDate}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={toDate}
                                        onSelect={setToDate}
                                        disabled={fromDate ? { before: fromDate } : undefined}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to-time">To Time (Optional)</Label>
                                    <Select value={toTime} onValueChange={setToTime} disabled={!fromTime}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {toTimeOptions.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRedeemDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmRedemption}>Confirm Redemption</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* Transaction History Section */}
             <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>A log of your recent points activity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        <li className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                    <p className="font-semibold">Points Earned: Job Referral</p>
                                    <p className="text-sm text-muted-foreground">November 28, 2023</p>
                                </div>
                            </div>
                            <p className="font-semibold text-green-600">+50 Points</p>
                        </li>
                        <li className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <XCircle className="h-6 w-6 text-red-500" />
                                <div>
                                    <p className="font-semibold">Paid for: House Cleaning</p>
                                    <p className="text-sm text-muted-foreground">November 25, 2023</p>
                                </div>
                            </div>
                            <p className="font-semibold text-red-600">-50 Points</p>
                        </li>
                         <li className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                    <p className="font-semibold">Points Earned: Profile Completion</p>
                                    <p className="text-sm text-muted-foreground">November 20, 2023</p>
                                </div>
                            </div>
                            <p className="font-semibold text-green-600">+100 Points</p>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
