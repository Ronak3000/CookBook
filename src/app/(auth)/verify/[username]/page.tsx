"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { verifySchema } from "@/schemas/verifySchema"

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
import { useParams, useRouter } from "next/navigation"

const Page = () => {
  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  })
  const params = useParams()
  const username = params.username as string

  const router = useRouter()
  const { toast } = useToast()

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post(`/api/verify-code`, {
        username,
        code: data.code,
      })
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        })
        router.replace("/sign-in")
      } else {
        toast({
          title: "Verification Failed",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log(error)
      
        toast({
          title: "Verification Failed",
          description: "Failed to verify code",
          variant: "destructive",
        })
      
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-md">
        <h1 className="text-xl font-bold text-center text-gray-800">
          Verify Your Account
        </h1>
        <p className="text-sm text-center text-gray-600">
          Enter the verification code sent to your email.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter code"
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
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Page
