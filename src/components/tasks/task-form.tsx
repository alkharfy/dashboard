"use client";

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
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
  clientName: z.string().min(2),
  birthdate: z.date().optional(),
  contactInfo: z.string(),
  address: z.string().optional(),
  jobTitle: z.string(),
  education: z.string(),
  experience: z.coerce.number().min(0),
  skills: z.string(),
  services: z.array(z.string()).min(1),
  designerNotes: z.string().optional(),
  reviewerNotes: z.string().optional(),
  paymentStatus: z.enum(["Paid", "Unpaid", "Pending"]),
  attachments: z.any().optional(),
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

  const serviceOptions = services.map(s => ({label: t(s.labelKey), value: s.value}));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      contactInfo: "",
      address: "",
      jobTitle: "",
      education: "",
      experience: 0,
      skills: "",
      services: [],
      designerNotes: "",
      reviewerNotes: "",
      paymentStatus: "Unpaid",
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

    try {
        await addDoc(collection(db, 'tasks'), {
            ...values,
            birthdate: values.birthdate || null,
            status: 'Not Started',
            createdAt: serverTimestamp(),
            assignedDesignerUid: null, // Or assign a default designer
            assignedReviewerUid: null, // Or assign a default reviewer
            designerRating: null,
            designerFeedback: '',
            reviewerRating: null,
            reviewerFeedback: '',
            attachments: [], // Handle file uploads separately
        });

        toast({
            title: "Task Created",
            description: "The new task has been added successfully.",
        });

        router.push('/all-tasks');
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem creating the task.",
        });
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
                     <FormField control={form.control} name="contactInfo" render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('contactInfo')}</FormLabel>
                        <FormControl><Textarea placeholder={t('phoneEmail')} {...field} /></FormControl>
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
                    <FormField control={form.control} name="experience" render={({ field }) => (
                        <FormItem><FormLabel>{t('yearsOfExperience')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="skills" render={({ field }) => (
                        <FormItem><FormLabel>{t('skills')}</FormLabel><FormControl><Input placeholder={t('skillsPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('paymentStatus')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a payment status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Paid">{t('paid')}</SelectItem>
                                    <SelectItem value="Unpaid">{t('unpaid')}</SelectItem>
                                    <SelectItem value="Pending">{t('pending')}</SelectItem>
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
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit">{t('addTask')}</Button>
        </div>
      </form>
    </Form>
  );
}
