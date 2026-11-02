'use client';
import { useParams } from 'next/navigation';
import RecipeEditor from '@/components/RecipeEditor';
export default function EditRecipe() { const params = useParams<{ id: string }>(); return <RecipeEditor id={params.id}/>; }
