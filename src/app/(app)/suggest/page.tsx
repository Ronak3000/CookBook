'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { suggetionSchema } from '@/schemas/suggestionSchema';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Page = () => {
  const [suggestion, setSuggestion] = useState<{
    title: string;
    preparationSteps: string[];
    cookingInstructions: string[];
    servingSuggestions: string[];
  }>()
   
  ;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof suggetionSchema>>({
    resolver: zodResolver(suggetionSchema),
    defaultValues: {
      ingredients: [],
      cuisine: '',
      people: "1",
    },
  });



  const ingredientOptions = [
    'Chicken', 'Beef', 'Fish', 'Pork', 'Lamb', 'Shrimp', 'Crab', 'Tofu', 'Eggs',
    'Tomatoes', 'Onions', 'Garlic', 'Bell Peppers', 'Carrots', 'Spinach', 'Broccoli',
    'Potatoes', 'Zucchini', 'Mushrooms', 'Kale', 'Corn',
    'Apples', 'Bananas', 'Lemons', 'Limes', 'Oranges', 'Mangoes', 'Avocados',
    'Pineapple', 'Grapes',
    'Rice', 'Pasta', 'Quinoa', 'Barley', 'Lentils', 'Chickpeas', 'Black Beans', 'Oats',
    'Milk', 'Cheese', 'Yogurt', 'Cream', 'Butter',
    'Basil', 'Cilantro', 'Parsley', 'Dill', 'Rosemary', 'Thyme', 'Ginger', 'Chili',
    'Turmeric', 'Paprika',
    'Olive Oil', 'Bread', 'Vinegar', 'Soy Sauce', 'Honey', 'Sugar','Kesar','besan','Jaggery'
  ];

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'French', 'Greek',
    'Thai', 'Mediterranean', 'Middle Eastern', 'Korean', 'Spanish', 'Vietnamese',
    'American', 'African', 'Caribbean',
  ];

  const onSubmit = async (data: z.infer<typeof suggetionSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/suggest-recipies', data);
      if (response.data.success) {
        
        setSuggestion(response.data.data);
        toast({
          title: 'Success',
          description: 'Recipe suggestion fetched successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch a recipe suggestion.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong while fetching the recipe.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
    <header>
    <Navbar />
    </header>
    
    <main className="flex-grow pt-16 pb-16 bg-gray-100">
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Recipe Suggestion</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Ingredients */}
          <FormField
            control={form.control}
            name="ingredients"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Ingredients</FormLabel>
                <FormControl>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full">
                        {field.value && field.value.length > 0
                            ? field.value.join(', ')
                            : 'Select ingredients'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full">
                        <Command>
                        <CommandInput placeholder="Search ingredients..." />
                        <CommandList>
                            <CommandGroup>
                            {ingredientOptions.map((ingredient) => (
                                <div key={ingredient} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={field.value?.includes(ingredient)}
                                    onCheckedChange={(checked) => {
                                    field.onChange(
                                        checked
                                        ? [...field.value, ingredient]
                                        : field.value?.filter((value) => value !== ingredient)
                                    );
                                    }}
                                    id={ingredient}
                                />
                                <label htmlFor={ingredient} className="text-sm">
                                    {ingredient}
                                </label>
                                </div>
                            ))}
                            </CommandGroup>
                        </CommandList>
                        </Command>
                    </PopoverContent>
                    </Popover>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />


          {/* Cuisine */}
          <FormField
            control={form.control}
            name="cuisine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full">
                        {field.value ? field.value : 'Select cuisine'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full">
                      <Command>
                        <CommandInput placeholder="Search cuisine..." />
                        <CommandList>
                          <CommandGroup>
                            {cuisineOptions.map((cuisine) => (
                              <CommandItem
                                key={cuisine}
                                onSelect={() => field.onChange(cuisine)}
                              >
                                {cuisine}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Number of People */}
          <FormField
            control={form.control}
            name="people"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of People</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter number of people"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" disabled={loading}>
            {loading ? 'Fetching...' : 'Get Recipe Suggestion'}
          </Button>
        </form>
      </Form>

      {/* Recipe Suggestion */}
      {suggestion && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md shadow">
          <h2 className="text-xl font-bold">{suggestion.title}</h2>
          <h3 className="mt-4 font-semibold">Preparation Steps:</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {suggestion["preparationSteps"].map((step,index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          <h3 className="mt-4 font-semibold">Cooking Instructions:</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {suggestion["cookingInstructions"].map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
          <h3 className="mt-4 font-semibold">Serving Suggestions:</h3>
          <p className="text-gray-700">{suggestion["servingSuggestions"].join(', ')}</p>
        </div>
      )}
      
    </div>
    </main>
    <footer>
      <Footer />
    </footer>
    
    </>
    
  );
};

export default Page;
