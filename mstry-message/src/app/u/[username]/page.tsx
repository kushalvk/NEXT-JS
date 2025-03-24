"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {acceptMessageSchema} from "@/schemas/acceptMessageSchema";
import * as z from "zod";
import {toast} from "sonner";
import axios from "axios";
import {useParams} from "next/navigation";

const page = () => {
    const params = useParams<{ username: string }>();

    // zod implementation
    const form = useForm<z.infer<typeof acceptMessageSchema>>({
        resolver: zodResolver(acceptMessageSchema),
        defaultValues: {
            acceptMessages: '',
        }
    })

    const onSubmit = async (data: z.infer<typeof acceptMessageSchema>) => {
        try {
            const response = await axios.post(`/api/send-message`, { username: params.username,content: data.acceptMessages})
            if (response.status === 201) {
                toast.error("User is not accepting the message");
            } else {
                toast.success(response.data.message);
            }
            form.reset();
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        }
    }

    return (
        <div className={"mx-[15vw]"}>
            <h1 className={"flex justify-center mt-4 text-4xl font-bold tracking-tight lg:text-5xl mb-6"}>Public Profile Link</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                    <FormField
                        control={form.control}
                        name="acceptMessages"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send Anonymous Message to @{params.username && params.username}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write your anonymous message here"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    You can <span>@mention</span> other users and organizations.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    )
}

export default page