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
  "System Design",  
  "Debugging",
  "Database Optimization",
  "Team Collaboration",
  "Conflict Resolution"
]

const dropdownOptions = [
  'transitioning from monolithic to microservices architecture',
  'resolving merge conflicts in Git',
  'optimize database query performance in PostgreSQL for handling large datasets',
  'steps can we take to ensure smooth handoffs between development and QA teams',
  'team members have different priorities or competing demands for limited resources'
];

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

  const systemPrompt = `You are an AI assistant designed to help software engineers formulate effective user prompts based on their specific challenges across all areas of software engineering. When given a high-level context and challenge, generate a list of prompts that encourage critical thinking and guide the engineer toward finding their own solutions. Ensure your prompts cover relevant topics such as system design, programming, debugging, team collaboration, performance optimization, security, and project management. Focus on clarity, relevance, and promoting a deeper understanding of the issue without providing direct answers.`
  const systemPrompt2 = `You are a helpful assistant with meta-prompting capabilities`

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOption(value);
    setSpecificChallenge(value);
  };

  const [selectedOption, setSelectedOption] = useState('');


  const handlePromptGeneration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const prompt = `
       The context of the challenge is ${selectedArea}. 
       The specific challenge is: ${specificChallenge}.
       Generate 2 prompts in markdown format, with the expected outpcomes.
       `
    const prompt2 = `You are an expert prompt engineer.
       I would like you to generate 2 prompts for a software engineer facing a challenge in ${selectedArea}. 
       The specific challenge is about ${specificChallenge}.
       Please provide the prompts in a markdown format, and make sure the prompts are specific to the challenge.       
       `

    try {
      const response = await generateText({
        model: groq('llama3-groq-70b-8192-tool-use-preview'),
        /*model: groq('llama3-8b-8192'),*/
        messages: [
          {role: "system", content: systemPrompt}, 
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
            Topic
          </label>
          <Select onValueChange={setSelectedArea} value={selectedArea}>
            <SelectTrigger className="w-full bg-gray-200 p-1">
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
            Describe your challenge
          </label>
          <select value={selectedOption} onChange={handleDropdownChange} className="w-full p-1 text-md rounded bg-gray-200">
          <option value="">Select an option</option>
          {dropdownOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
          <Textarea
            id="challenge"
            rows={6}
            value={specificChallenge}
            onChange={(e) => setSpecificChallenge(e.target.value)}
            placeholder="Describe your specific challenge here..."
            className="mt-2 text-gray-200"
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
          <h2 className="mb-2 text-base font-bold text-gray-300">Generated Prompts:</h2>
          <div className="border rounded-md p-1">
            <MDEditor.Markdown source={generatedPrompts} className="mt-1 text-gray-700" />
          </div>
        </div>
      )}
    </div>
  )
}