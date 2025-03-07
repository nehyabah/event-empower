
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { useTodo } from "@/context/TodoContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useWishlist } from "@/context/useWishlist";

const bankDetailSchema = z.object({
  bankName: z.string().min(2, {
    message: "Bank name must be at least 2 characters.",
  }),
  accountName: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  accountNumber: z.string().min(8, {
    message: "Account number must be at least 8 characters.",
  }),
  sortCode: z.string().min(6, {
    message: "Sort code must be at least 6 characters.",
  }),
  description: z.string().optional(),
});

const CoupleStory = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  const { wishlistItems, bankDetails, addWishlistItem, addBankDetail, markItemAsPurchased, removeItemPurchaser, removeBankDetail } = useWishlist();
  const { todos, addTodo } = useTodo();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast.error("Please log in to view the couple's story");
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, don't render the page content
  if (!isAuthenticated) {
    return null;
  }

  const form = useForm<z.infer<typeof bankDetailSchema>>({
    resolver: zodResolver(bankDetailSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      sortCode: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof bankDetailSchema>) => {
    // Ensure all required fields are present for BankDetail type
    addBankDetail({
      bankName: values.bankName,
      accountName: values.accountName,
      accountNumber: values.accountNumber,
      sortCode: values.sortCode,
      description: values.description,
    });
    form.reset();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container pt-24 flex-grow">
        <Tabs defaultValue="wishlist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wishlist">Our Wishlist</TabsTrigger>
            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          </TabsList>
          <TabsContent value="wishlist" className="space-y-4">
            <Card>
              <CardContent className="space-y-2">
                {wishlistItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    isPreviewMode={false}
                    isPublicView={false}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bank-details">
            <Card>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="GTBank" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="0123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sortCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Code</FormLabel>
                          <FormControl>
                            <Input placeholder="123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Wedding gift contributions"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Add Bank Detail</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2">
                {bankDetails.map((detail, index) => (
                  <BankDetailCard
                    key={index}
                    detail={detail}
                    onRemove={() => removeBankDetail(index)}
                    index={index}
                    isEditable={true}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CoupleStory;
