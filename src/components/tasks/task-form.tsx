"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from 'firebase/functions';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  birthdate: z.date().optional(),
  contactInfo: z.object({
      phone: z.string().optional(),
      email: z.string().email("Invalid email format").optional(),
  }),
  address: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  education: z.string().min(1, "Education is required"),
  experienceYears: z.coerce.number().min(0),
  skills: z.string().min(1, "Please list at least one skill."),
  services: z.array(z.string()).min(1, "Please select at least one service."),
  designerNotes: z.string().optional(),
  reviewerNotes: z.string().optional(),
  paymentMethod: z.enum(["instapay", "paysky", "other"]),
  paymentStatus: z.enum(["paid", "unpaid", "pending"]),
  attachments: z.any().optional(), // File uploads handled separately
});

const services = [
    { labelKey: 'cvWriting', value: 'CV Writing' },
    { labelKey: 'coverLetter', value: 'Cover Letter' },
    { labelKey: 'linkedInProfile', value: 'LinkedIn Profile' },
] as const;

export function TaskForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const serviceOptions = services.map(s => ({label: t(s.labelKey), value: s.value}));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      contactInfo: { phone: "", email: "" },
      address: "",
      jobTitle: "",
      education: "",
      experienceYears: 0,
      skills: "",
      services: [],
      designerNotes: "",
      reviewerNotes: "",
      paymentMethod: "instapay",
      paymentStatus: "unpaid",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create a task.",
        });
        return;
    }
    setIsSubmitting(true);

    try {
      const createTask = httpsCallable(functions, 'createTask');
      // The skills are a comma-separated string, let's turn them into an array
      const payload = {
          ...values,
          skills: values.skills.split(',').map(s => s.trim()).filter(Boolean),
          birthdate: values.birthdate ? values.birthdate.toISOString() : null, // Send as ISO string
      };
      
      const result = await createTask(payload);

      toast({
          title: "Task Created",
          description: "The new task has been added successfully.",
      });

      router.push('/all-tasks');
    } catch (error: any) {
        console.error("Error creating task: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "There was a problem creating the task.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t('clientInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="clientName" render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('clientName')}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="birthdate" render={({ field }) => (
                         <FormItem className="flex flex-col">
                         <FormLabel>{t('birthdate')}</FormLabel>
                         <Popover>
                           <PopoverTrigger asChild>
                             <FormControl>
                               <Button
                                 variant={"outline"}
                                 className={cn(
                                   "w-full justify-start text-left font-normal",
                                   !field.value && "text-muted-foreground"
                                 )}
                               >
                                 <CalendarIcon className="me-2 h-4 w-4" />
                                 {field.value ? (
                                   format(field.value, "PPP")
                                 ) : (
                                   <span>{t('selectDate')}</span>
                                 )}
                               </Button>
                             </FormControl>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0" align="start">
                             <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                           </PopoverContent>
                         </Popover>
                         <FormMessage />
                       </FormItem>
                    )} />
                     <FormField control={form.control} name="contactInfo.email" render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl><Input placeholder="client@example.com" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="contactInfo.phone" render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('phone')}</FormLabel>
                        <FormControl><Input placeholder="+123456789" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t('professionalDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="jobTitle" render={({ field }) => (
                        <FormItem><FormLabel>{t('jobTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="education" render={({ field }) => (
                        <FormItem><FormLabel>{t('education')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="experienceYears" render={({ field }) => (
                        <FormItem><FormLabel>{t('yearsOfExperience')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="skills" render={({ field }) => (
                        <FormItem><FormLabel>{t('skills')}</FormLabel><FormControl><Input placeholder={t('skillsPlaceholder')} {...field} /></FormControl><FormDescription>Enter skills separated by commas.</FormDescription><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{t('servicesAndRequirements')}</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('requiredServices')}</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {field.value?.length > 0
                                    ? field.value.map(v => serviceOptions.find(s => s.value === v)?.label).join(', ')
                                    : t('selectServices')}
                                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                <CommandInput placeholder={t('search')} />
                                <CommandList>
                                <CommandEmpty>{t('noData')}</CommandEmpty>
                                <CommandGroup>
                                    {serviceOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            const currentValues = field.value || [];
                                            const newValue = currentValues.includes(option.value)
                                            ? currentValues.filter((v) => v !== option.value)
                                            : [...currentValues, option.value];
                                            field.onChange(newValue);
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "me-2 h-4 w-4",
                                            field.value?.includes(option.value)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                                </Command>
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="designerNotes" render={({ field }) => (
                        <FormItem><FormLabel>{t('notesForDesigner')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="reviewerNotes" render={({ field }) => (
                        <FormItem><FormLabel>{t('notesForReviewer')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="space-y-4">
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('paymentMethod')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="instapay">Instapay</SelectItem>
                                    <SelectItem value="paysky">PaySky</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('paymentStatus')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="paid">{t('paid')}</SelectItem>
                                    <SelectItem value="unpaid">{t('unpaid')}</SelectItem>
                                    <SelectItem value="pending">{t('pending')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="attachments" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('attachments')}</FormLabel>
                            <FormControl>
                                <Input type="file" multiple {...form.register('attachments')} />
                            </FormControl>
                             <FormDescription>
                                You can upload attachments after creating the task.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('saving') : t('addTask')}</Button>
        </div>
      </form>
    </Form>
  );
}
