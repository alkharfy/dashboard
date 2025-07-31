"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const roleTranslations = {
        'Admin': t('admin'),
        'Designer': t('designer'),
        'Reviewer': t('reviewer'),
        'Manager': t('manager'),
      };

    const formSchema = z.object({
        name: z.string().min(2),
        workplace: z.string().optional(),
        status: z.enum(["Available", "Busy", "On Leave"]),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            workplace: "CV Assistant Team",
            status: "Available",
        },
    });

    if (!user) return null;

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        // Save profile changes
    }

    return (
        <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-1">
                <CardHeader className="items-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
                    <CardDescription>{roleTranslations[user.role]}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" variant="outline">Change Picture</Button>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline">{t('myProfile')}</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>{t('name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl><Input value={user.email} disabled /></FormControl>
                        </FormItem>

                        <FormItem>
                            <FormLabel>{t('role')}</FormLabel>
                            <FormControl><Input value={roleTranslations[user.role]} disabled /></FormControl>
                        </FormItem>

                        <FormField control={form.control} name="workplace" render={({ field }) => (
                            <FormItem><FormLabel>{t('workplace')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('currentStatus')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Available">{t('available')}</SelectItem>
                                        <SelectItem value="Busy">{t('busy')}</SelectItem>
                                        <SelectItem value="On Leave">{t('onLeave')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end">
                            <Button type="submit">{t('saveChanges')}</Button>
                        </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
    );
}
