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
  'Transitioning from monolithic to microservices architecture',
  'Resolving merge conflicts in Git',
  'Optimize database query performance in PostgreSQL for handling large datasets',
  'Steps can we take to ensure smooth handoffs between development and QA teams',
  'Team members have different priorities or competing demands for limited resources'
];

// https://tailwindcss.com/docs/background-color

// Add a light blue theme style
const lightBlueTheme = {
    backgroundColor: '#6495ED', // Light blue background
    color: '#5dade2 ', // lighter blue text
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

  const systemPrompt = `
You are an AI assistant with expertise in meta-prompting and a deep understanding of the software engineering domain. Your task is to assist software engineers—from beginners to advanced—in formulating effective and exploratory user prompts based on their specific challenges.

When provided with a high-level context and a challenge (technical or non-technical), generate **2 prompts** in markdown format. Each prompt should be structured into the following sections:

- **Problem Statement:** Clearly restate the challenge in general terms.
- **Guiding Questions:** Pose questions that encourage the user to analyze and dissect the challenge without directly providing the solution.
- **Exploratory Strategies and Discussion Points:** Offer insights, strategies, and examples (e.g., code snippets, architecture diagrams) relevant to areas such as system design, programming, debugging, team collaboration, performance optimization, security, and project management.

**Important Guidelines:**
- **Tailor your responses** to the expertise level of the user (beginner, intermediate, or advanced) when such context is provided.
- **Emphasize the process over direct answers,** promoting a step-by-step approach to problem-solving.
- **Include relevant details or examples** wherever applicable to help illuminate the path to the solution.
- **Adjust the depth and focus** of your guidance based on whether the challenge is primarily technical or non-technical.

Your goal is to guide software engineers toward a deeper understanding of their challenges by fostering critical thinking and self-guided discovery.
`

  const systemPrompt1 = `You are an AI assistant with expertise in meta-prompting capabilities. 
  You are tasked with providing assistance to software engineers to formulate effective user prompts based on their specific 
  challenges in software engineering domain. 
  When given a high-level context and a challenge, generate 2 prompts in markdown format. 
  When generating prompts, decompose the problem into smaller, actionable questions that guide engineers to isolate root causes, evaluate tradeoffs, or prioritize subsystems
  The prompts should guide software engineers through the problem-solving process, offering insights, strategies, and explanations that illuminate the path to the solution.
  The prompts should focus on facilitating a step-by-step analysis without revealing the complete solution, encouraging exploratory questioning.
  Focus on clarity, relevance, and promoting a deeper understanding of the issue without providing direct answers.
  Include references or examples related to system design, programming, debugging, team collaboration, etc., when relevant.
  Adapt the depth of your guidance based on whether the challenge is technical (e.g., performance optimization, security) or non-technical (e.g., project management, team collaboration).
  Ensure your prompts cover relevant topics such as system design, programming, debugging, team collaboration, performance optimization, 
  security, and project management. Make the prompts are in markdown format
  `
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
       The context of the challenge in ${selectedArea} area.
       The specific challenge is about ${specificChallenge}.
       Generate 2 prompts in markdown format, with the expected outpcomes.
       `
  

    try {
      const response = await generateText({
        model: groq('llama-3.3-70b-versatile'),
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
            <SelectTrigger className="w-full bg-slate-100 p-1 text-indigo-900 text-sm">
              <SelectValue placeholder="Select a challenge area"  />
            </SelectTrigger>
            <SelectContent className="bg-slate-300">
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
          <select value={selectedOption} onChange={handleDropdownChange} 
            className="w-full p-2 bg-slate-100 text-indigo-900 rounded text-sm">
            <option value="">Select an option</option>
            {dropdownOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
          <Textarea
            id="challenge"
            rows={3}
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
            <MDEditor.Markdown source={generatedPrompts} className="mt-1 text-gray-700 bg-slate-300" />
          </div>
        </div>
      )}
    </div>
  )
}