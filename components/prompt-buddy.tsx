"use client"

import { useState } from "react"
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import MDEditor from "@uiw/react-md-editor";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Sparkles } from "lucide-react";

const challengeAreas = [
  "Design a system architecture",
  "Database Optimization",
  "Debugging a complex technical issue",
  "Backend Architecture",
  "Cross Team Collaboration",
  "Conflict Resolution",
  "Problem Solving",
  "Decision Making",
  "Productivity",
]

// Add a light blue theme style
const lightBlueTheme = {
    backgroundColor: '#6495ED', // Light blue background
    color: '#00796b', // Darker blue text
};

// Apply the theme to your components
export function PromptBuddyComponent() {
  const [selectedArea, setSelectedArea] = useState("")
  const [specificChallenge, setSpecificChallenge] = useState("")
  const [generatedPrompts, setGeneratedPrompts] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
  });

  const handlePromptGeneration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const prompt = `You are an expert prompt engineer.
       I would like you to generate 2 prompts for a software engineer facing a challenge in ${selectedArea}. 
       The specific challenge is: ${specificChallenge}.
       Please provide the prompts in a markdown format, and make sure the prompts are specific to the challenge.
       `

    try {
      const response = await generateText({
        model: groq('llama3-groq-70b-8192-tool-use-preview'),
        /*model: groq('llama3-8b-8192'),*/
        messages: [
          {role: "system", content: "You are a helpful assistant with meta-prompting capabilities"}, 
          { role: "user", content: prompt }],
      });

      setGeneratedPrompts(response.text)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={lightBlueTheme} className="max-w-3xl mx-auto p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">
      <Sparkles className="inline-block ml-2" /> Prompt Buddy for Software Engineers<Sparkles className="inline-block ml-2" />
      </h1>
      <form onSubmit={handlePromptGeneration} className="space-y-4">
        <div>
          <label htmlFor="area" className="block text-base font-bold text-gray-300">
            Challenge Area
          </label>
          <Select onValueChange={setSelectedArea} value={selectedArea}>
            <SelectTrigger className="w-full text-gray-200">
              <SelectValue placeholder="Select a challenge area" />
            </SelectTrigger>
            <SelectContent>
              {challengeAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="challenge" className="block text-base font-bold text-gray-300">
            Specific Challenge
          </label>
          <Textarea
            id="challenge"
            rows={6}
            value={specificChallenge}
            onChange={(e) => setSpecificChallenge(e.target.value)}
            placeholder="Describe your specific challenge here..."
            className="mt-1  text-gray-200"
          />
        </div>
        <Button type="submit" 
                className="w-full w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105" 
                disabled={isLoading}
        >
          {isLoading ? 'Generating Prompts...' : 'Generate Prompts'}
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {generatedPrompts && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Generated Prompts:</h2>
          <div className="border rounded-md p-1">
            <MDEditor.Markdown source={generatedPrompts} className="mt-1 text-gray-700" />
          </div>
        </div>
      )}
    </div>
  )
}