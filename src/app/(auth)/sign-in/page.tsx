"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { signInSchema } from "@/schemas/signInSchema"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

const Page = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    // zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

    const onSubmit = async(data: z.infer<typeof signInSchema>) => {
      setIsSubmitting(true)
        const result = await signIn("credentials", {
          redirect: false,
          identifier: data.identifier,
          password: data.password
        })
        if(result?.error){
          toast({
              title: 'Login failed',
              description: "Incorrect username or password",
              variant:'destructive'
          })
        }
        setIsSubmitting(false)

        if(result?.url){
          console.log("dashboard");
            router.replace('/dashboard')
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Sign In</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Username/Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username or email"
                      className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </Form>
        <p className="text-sm text-center text-muted-foreground">
        Don't have an account yet?{" "}
        <a
          href="/sign-up"
          className="text-primary underline hover:text-primary-dark transition-colors"
        >
          Sign up
        </a>

      </p>
      </div>
    </div>
  )
}

export default Page
