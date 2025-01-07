"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import axios from "axios"
import { signUpSchema } from "@/schemas/signUpSchema"
import { useToast } from "@/hooks/use-toast"

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
import { useDebounceCallback } from "usehooks-ts"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const page = () => {
  const [username, setUsername] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameMessage, setUsernameMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const debounced = useDebounceCallback(setUsername, 500)
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true)
        setUsernameMessage("")
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${encodeURIComponent(username)}`
          )
          setUsernameMessage(response.data.message)
        } catch (error: any) {
          if (error.response && error.response.data && error.response.data.message) {
            setUsernameMessage(error.response.data.message)
          } else {
            setUsernameMessage("Error checking username. Please try again.")
          }
          console.error("Error checking username:", error)
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post(`/api/sign-up`, data)
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        })
        router.replace(`/verify/${username}`)
      } else {
        toast({
          title: "Sign-up Failed",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("Error signing up:", error)
      toast({
        title: "Sign-up Failed",
        description: error as string,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white shadow-lg rounded-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Sign Up</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600 mt-1" />
                  )}
                  <p
                    className={`text-sm mt-1 ${
                      usernameMessage === "Username is unique"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {usernameMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
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
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
        <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <a
          href="/sign-in"
          className="text-primary underline hover:text-primary-dark transition-colors"
        >
          Sign in
        </a>

      </p>
      </div>
    </div>
  )
}

export default page
