// AI configuration and utility functions

// Check if Groq API key is available
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY
}

// Get the default model to use
export function getDefaultModel(): string {
  if (isGroqConfigured()) {
    return "llama3-70b-8192"
  }

  // Fallback if no AI provider is configured
  return "fallback"
}

// Log AI configuration for debugging
export function logAIConfig(): void {
  console.log("AI Configuration:")
  console.log("- Groq configured:", isGroqConfigured())
  console.log("- Default model:", getDefaultModel())
}
