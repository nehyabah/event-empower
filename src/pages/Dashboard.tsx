
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  CheckSquare, 
  Users, 
  Settings, 
  Plus, 
  Heart, 
  UserCircle2
} from "lucide-react";

// This is a placeholder Dashboard that will be expanded in future iterations
const Dashboard = () => {
  const [progress, setProgress] = useState(65);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-24">
        <header className="bg-primary/10 py-8">
          <div className="container">
            <h1 className="text-3xl font-serif mb-2">Welcome back, Chioma & Emeka</h1>
            <p className="text-muted-foreground">
              Your wedding is in <span className="font-semibold text-primary">72 days</span>. You're on track with your planning!
            </p>
          </div>
        </header>
        
        <main className="container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <section className="glass rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-serif">Wedding Progress</h2>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2.5 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <span className="block text-lg font-medium">18/25</span>
                    <span className="text-sm text-muted-foreground">Tasks</span>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <span className="block text-lg font-medium">8/12</span>
                    <span className="text-sm text-muted-foreground">Vendors</span>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <span className="block text-lg font-medium">₦3.2M</span>
                    <span className="text-sm text-muted-foreground">Budget</span>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <span className="block text-lg font-medium">120</span>
                    <span className="text-sm text-muted-foreground">Guests</span>
                  </div>
                </div>
              </section>
              
              <section className="glass rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-serif">Upcoming Tasks</h2>
                  <Button variant="ghost" size="sm">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-wedding-gold/10 text-wedding-gold flex items-center justify-center mr-4">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Book Traditional Ceremony Venue</p>
                      <p className="text-sm text-muted-foreground">Due in 7 days</p>
                    </div>
                    <Button variant="outline" size="sm">Complete</Button>
                  </div>
                  <div className="flex items-center p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-wedding-sage/10 text-wedding-sage flex items-center justify-center mr-4">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Finalize Guest List</p>
                      <p className="text-sm text-muted-foreground">Due in 14 days</p>
                    </div>
                    <Button variant="outline" size="sm">Complete</Button>
                  </div>
                  <div className="flex items-center p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-wedding-burgundy/10 text-wedding-burgundy flex items-center justify-center mr-4">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Schedule Food Tasting</p>
                      <p className="text-sm text-muted-foreground">Due in 21 days</p>
                    </div>
                    <Button variant="outline" size="sm">Complete</Button>
                  </div>
                </div>
              </section>
              
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-serif">Booked Vendors</h2>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 mr-3" />
                      <div>
                        <p className="font-medium">Sunset Photography</p>
                        <p className="text-sm text-muted-foreground">Photography & Video</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 mr-3" />
                      <div>
                        <p className="font-medium">Divine Catering</p>
                        <p className="text-sm text-muted-foreground">Catering</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 mr-3" />
                      <div>
                        <p className="font-medium">Elegance Hall</p>
                        <p className="text-sm text-muted-foreground">Venue</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-serif">Wedding Website</h2>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border mb-4">
                    <div className="flex flex-col items-center text-center">
                      <Heart className="w-12 h-12 text-wedding-gold mb-2" />
                      <h3 className="font-serif text-lg">Chioma & Emeka</h3>
                      <p className="text-sm text-muted-foreground">August 15, 2023 • Lagos, Nigeria</p>
                      <div className="grid grid-cols-4 gap-2 mt-4 w-full">
                        <div className="bg-secondary p-2 rounded">
                          <div className="text-lg font-medium">72</div>
                          <div className="text-xs text-muted-foreground">Days</div>
                        </div>
                        <div className="bg-secondary p-2 rounded">
                          <div className="text-lg font-medium">12</div>
                          <div className="text-xs text-muted-foreground">Hours</div>
                        </div>
                        <div className="bg-secondary p-2 rounded">
                          <div className="text-lg font-medium">45</div>
                          <div className="text-xs text-muted-foreground">Mins</div>
                        </div>
                        <div className="bg-secondary p-2 rounded">
                          <div className="text-lg font-medium">30</div>
                          <div className="text-xs text-muted-foreground">Secs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">chioma-emeka.eventpower.com</span>
                    <span className="text-sm text-primary font-medium">32 Visitors</span>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <section className="glass rounded-xl p-5">
                <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                  <UserCircle2 className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Chioma & Emeka</p>
                    <p className="text-sm text-muted-foreground">Traditional & White Wedding</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">August 15, 2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">Lagos, Nigeria</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <p className="font-medium">₦5,000,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Guests</p>
                    <p className="font-medium">250 estimated</p>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Event Details
                  </Button>
                </div>
              </section>
              
              <section className="glass rounded-xl p-5">
                <h3 className="font-serif text-lg mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-wedding-gold mt-2" />
                    <div>
                      <p className="text-sm">You added a new vendor: <span className="font-medium">Divine Catering</span></p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-wedding-gold mt-2" />
                    <div>
                      <p className="text-sm">You completed <span className="font-medium">Book Makeup Artist</span> task</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-wedding-gold mt-2" />
                    <div>
                      <p className="text-sm">You updated your guest count to <span className="font-medium">250</span></p>
                      <p className="text-xs text-muted-foreground">5 days ago</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
