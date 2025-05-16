"use server"

import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

// Update the GeneratedIdea interface to include the new fields
export interface GeneratedIdea {
  title: string
  description: string
  skills_required: string[]
  target_market: string
  startup_costs: string
  potential_challenges: string[]
  success_factors: string[]
  // New fields for enhanced analysis
  market_trends: string[]
  success_rate_estimate: string
  estimated_roi: string
  economic_data: {
    growth_potential: string
    market_saturation: string
    competition_level: string
  }
}

// Enhanced validation function
function validateIdeaResponse(idea: any): boolean {
  const requiredFields = {
    title: "string",
    description: "string",
    skills_required: "array",
    target_market: "string",
    startup_costs: "string",
    potential_challenges: "array",
    success_factors: "array",
    market_trends: "array",
    success_rate_estimate: "string",
    estimated_roi: "string",
    economic_data: "object"
  }

  // Check if all required fields exist and have correct types
  for (const [field, type] of Object.entries(requiredFields)) {
    if (!idea[field]) return false
    if (type === "array" && !Array.isArray(idea[field])) return false
    if (type === "object" && typeof idea[field] !== "object") return false
    if (type === "string" && typeof idea[field] !== "string") return false
  }

  // Validate economic data structure
  const requiredEconomicFields = ["growth_potential", "market_saturation", "competition_level"]
  for (const field of requiredEconomicFields) {
    if (!idea.economic_data[field] || typeof idea.economic_data[field] !== "string") return false
  }

  // Additional validation for content quality
  if (idea.description.length < 50) return false // Ensure description is detailed enough
  if (idea.skills_required.length < 3) return false // Ensure enough skills are listed
  if (idea.potential_challenges.length < 2) return false // Ensure enough challenges are listed
  if (idea.success_factors.length < 2) return false // Ensure enough success factors are listed

  return true
}

// Function to sanitize JSON text
function sanitizeJsonText(text: string): string {
  try {
    // First, try to find the JSON array in the text
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s)
    if (!jsonMatch) {
      console.log("No JSON array found in text")
      return text
    }

    let jsonText = jsonMatch[0]
    console.log("Found JSON array:", jsonText)

    // Fix common JSON formatting issues
    jsonText = jsonText
      // Fix property names without quotes
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
      // Fix values without quotes
      .replace(/:\s*([a-zA-Z0-9_]+)(\s*[,}])/g, ':"$1"$2')
      // Fix trailing commas
      .replace(/,(\s*[\]}])/g, "$1")
      // Fix missing commas between objects
      .replace(/}(\s*){/g, "},$1{")
      // Fix unescaped quotes in strings
      .replace(/(:\s*"[^"]*)"([^"]*")/g, '$1\\"$2')
      // Remove any non-JSON text
      .replace(/[^\x20-\x7E]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()

    console.log("Sanitized JSON:", jsonText)
    return jsonText
  } catch (error) {
    console.error("Error during JSON sanitization:", error)
    return text
  }
}

// Function to extract ideas from text
function extractIdeasFromText(text: string): GeneratedIdea[] {
  const ideas: GeneratedIdea[] = []
  
  // First try to find complete JSON objects
  const jsonObjects = text.match(/\{\s*"title"\s*:\s*"[^"]+"[^}]*\}/g) || []
  console.log("Found", jsonObjects.length, "complete JSON objects")

  // Process each complete JSON object
  for (const obj of jsonObjects) {
    try {
      // Extract title
      const titleMatch = obj.match(/"title"\s*:\s*"([^"]+)"/)
      if (!titleMatch) continue

      // Extract description
      const descMatch = obj.match(/"description"\s*:\s*"([^"]+)"/)
      if (!descMatch) continue

      // Extract skills
      const skillsMatch = obj.match(/"skills_required"\s*:\s*\[(.*?)\]/s)
      const skills = skillsMatch
        ? skillsMatch[1]
            .split(',')
            .map(s => s.trim().replace(/^"|"$/g, ''))
            .filter(s => s.length > 0)
        : []

      // Extract target market
      const targetMatch = obj.match(/"target_market"\s*:\s*"([^"]+)"/)
      if (!targetMatch) continue

      // Extract startup costs
      const costsMatch = obj.match(/"startup_costs"\s*:\s*"([^"]+)"/)
      if (!costsMatch) continue

      // Extract challenges
      const challengesMatch = obj.match(/"potential_challenges"\s*:\s*\[(.*?)\]/s)
      const challenges = challengesMatch
        ? challengesMatch[1]
            .split(',')
            .map(s => s.trim().replace(/^"|"$/g, ''))
            .filter(s => s.length > 0)
        : []

      // Extract success factors
      const factorsMatch = obj.match(/"success_factors"\s*:\s*\[(.*?)\]/s)
      const factors = factorsMatch
        ? factorsMatch[1]
            .split(',')
            .map(s => s.trim().replace(/^"|"$/g, ''))
            .filter(s => s.length > 0)
        : []

      // Extract market trends
      const trendsMatch = obj.match(/"market_trends"\s*:\s*\[(.*?)\]/s)
      const trends = trendsMatch
        ? trendsMatch[1]
            .split(',')
            .map(s => s.trim().replace(/^"|"$/g, ''))
            .filter(s => s.length > 0)
        : []

      // Extract success rate
      const rateMatch = obj.match(/"success_rate_estimate"\s*:\s*"([^"]+)"/)
      if (!rateMatch) continue

      // Extract ROI
      const roiMatch = obj.match(/"estimated_roi"\s*:\s*"([^"]+)"/)
      if (!roiMatch) continue

      // Extract economic data
      const growthMatch = obj.match(/"growth_potential"\s*:\s*"([^"]+)"/)
      const saturationMatch = obj.match(/"market_saturation"\s*:\s*"([^"]+)"/)
      const competitionMatch = obj.match(/"competition_level"\s*:\s*"([^"]+)"/)

      if (!growthMatch || !saturationMatch || !competitionMatch) continue

      // Clean up the extracted data
      const cleanTitle = titleMatch[1].trim().replace(/^"|"$/g, '')
      const cleanDescription = descMatch[1].trim().replace(/^"|"$/g, '')
      const cleanTargetMarket = targetMatch[1].trim().replace(/^"|"$/g, '')
      const cleanStartupCosts = costsMatch[1].trim().replace(/^"|"$/g, '')
      const cleanSuccessRate = rateMatch[1].trim().replace(/^"|"$/g, '')
      const cleanROI = roiMatch[1].trim().replace(/^"|"$/g, '')

      ideas.push({
        title: cleanTitle,
        description: cleanDescription,
        skills_required: skills,
        target_market: cleanTargetMarket,
        startup_costs: cleanStartupCosts,
        potential_challenges: challenges,
        success_factors: factors,
        market_trends: trends,
        success_rate_estimate: cleanSuccessRate,
        estimated_roi: cleanROI,
        economic_data: {
          growth_potential: growthMatch[1].trim().replace(/^"|"$/g, ''),
          market_saturation: saturationMatch[1].trim().replace(/^"|"$/g, ''),
          competition_level: competitionMatch[1].trim().replace(/^"|"$/g, '')
        }
      })
    } catch (error) {
      console.error("Error extracting idea from JSON object:", error)
      continue
    }
  }

  console.log("Successfully extracted", ideas.length, "valid ideas")
  return ideas
}

function fixMalformedResponse(text: string): string {
  try {
    // First, try to find the JSON array
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s)
    if (!jsonMatch) return text

    let jsonText = jsonMatch[0]

    // Fix common issues in the response
    jsonText = jsonText
      // Fix missing title field in first object
      .replace(/\{\s*"([^"]+)"\s*,/g, '{"title": "$1",')
      // Fix missing colons after property names
      .replace(/"([^"]+)"\s*"([^"]+)"/g, '"$1": "$2"')
      // Fix missing quotes around property names
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
      // Fix missing quotes around values
      .replace(/:\s*([a-zA-Z0-9_]+)(\s*[,}])/g, ':"$1"$2')
      // Fix trailing commas
      .replace(/,(\s*[\]}])/g, "$1")
      // Fix missing commas between objects
      .replace(/}(\s*){/g, "},$1{")
      // Fix unescaped quotes in strings
      .replace(/(:\s*"[^"]*)"([^"]*")/g, '$1\\"$2')
      // Remove any non-JSON text
      .replace(/[^\x20-\x7E]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()

    // Additional fixes for the specific case we're seeing
    jsonText = jsonText
      // Fix missing property names in arrays
      .replace(/\{\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,/g, '{"title": "$1", "description": "$2",')
      // Fix missing property names in nested objects
      .replace(/\{\s*"([^"]+)"\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*:\s*"([^"]+)"\s*\}/g, 
        '{"$1": "$2", "$3": "$4", "$5": "$6"}')
      // Fix missing property names in arrays of strings
      .replace(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g, 
        '["$1", "$2", "$3"]')

    return jsonText
  } catch (error) {
    console.error("Error fixing malformed response:", error)
    return text
  }
}

// Enhanced prompt with local context
export async function generateAIBusinessIdeas(
  skills: string[],
  interests: string[],
  budget: string,
  location: string,
): Promise<GeneratedIdea[]> {
  try {
    // Format the budget range for better context
    let budgetRange = ""
    switch (budget) {
      case "0-10000":
        budgetRange = "5,000 - 10,000 KES (low budget)"
        break
      case "10000-50000":
        budgetRange = "10,000 - 50,000 KES (medium-low budget)"
        break
      case "50000-100000":
        budgetRange = "50,000 - 100,000 KES (medium budget)"
        break
      case "100000+":
        budgetRange = "100,000+ KES (higher budget)"
        break
      default:
        budgetRange = "various budget levels"
    }

    // Add a timestamp and random seed to ensure different results each time
    const timestamp = new Date().toISOString()
    const randomSeed = Math.floor(Math.random() * 10000)

    // Enhanced prompt with local context and specific requirements
    const prompt = `
You are a business consultant specializing in entrepreneurship in Kenya. 
Generate 3 unique, practical business ideas for an entrepreneur with the following profile:

Skills: ${skills.join(", ")}
Interests: ${interests.join(", ")}
Budget: ${budgetRange}
Location: ${location || "Kenya"}

Current timestamp: ${timestamp}
Random seed: ${randomSeed}

IMPORTANT: Consider these key factors when generating ideas:

1. Local Market Context:
   - Current economic conditions in ${location}
   - Local regulations and requirements
   - Cultural considerations
   - Infrastructure availability
   - Local consumer behavior and preferences
   - Specific market gaps and opportunities in ${location}

2. Sustainability Factors:
   - Environmental impact
   - Social responsibility
   - Long-term viability
   - Resource availability
   - Local sustainability initiatives

3. Technology Integration:
   - Digital transformation opportunities
   - Mobile-first considerations
   - E-commerce potential
   - Local tech adoption rates
   - Specific tech solutions needed

4. Risk Assessment:
   - Political stability impact
   - Currency fluctuation risks
   - Market entry barriers
   - Local competition
   - Regulatory compliance requirements

5. Growth Strategy:
   - Scalability potential
   - Franchising opportunities
   - Export possibilities
   - Local market expansion
   - Partnership opportunities

CRITICAL FORMATTING REQUIREMENTS:
1. Your response MUST be a valid JSON array containing exactly 3 business ideas
2. Each idea MUST follow this EXACT structure:
{
  "title": "Business Title",
  "description": "Detailed description text",
  "skills_required": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "target_market": "Detailed target market description",
  "startup_costs": "Detailed cost breakdown in KES",
  "potential_challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
  "success_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "market_trends": ["Trend 1", "Trend 2", "Trend 3"],
  "success_rate_estimate": "Medium - detailed explanation here",
  "estimated_roi": "X% within Y months/years with assumptions",
  "economic_data": {
    "growth_potential": "High - specific metrics and explanation",
    "market_saturation": "Low - detailed analysis",
    "competition_level": "Medium - specific assessment"
  }
}

3. DO NOT use any other format or structure
4. DO NOT include any text before or after the JSON array
5. DO NOT use single quotes or unescaped quotes within strings
6. DO NOT include trailing commas
7. DO NOT use any other field names than those specified above

For each business idea, provide:
1. A concise title (max 10 words)
2. A detailed description (3-4 sentences) that includes:
   - Specific problem being solved
   - Target customer pain points
   - Unique value proposition
   - How it differs from existing solutions
3. A list of 5-7 required skills, including:
   - Technical skills specific to the business
   - Soft skills needed for success
   - Industry-specific knowledge
   - Digital skills required
4. Target market description with:
   - Specific demographics
   - Geographic focus
   - Customer segments
   - Market size estimate
5. Startup costs estimate in KES, broken down by:
   - Initial equipment/inventory
   - Operating expenses
   - Marketing budget
   - Contingency fund
6. 3-4 potential challenges specific to:
   - Market entry
   - Operations
   - Competition
   - Regulatory compliance
7. 3-4 success factors including:
   - Key performance indicators
   - Critical success factors
   - Competitive advantages
   - Growth metrics
8. 3-4 current market trends relevant to this business:
   - Industry-specific trends
   - Consumer behavior changes
   - Technology adoption
   - Regulatory changes
9. Success rate estimate (Low/Medium/High) with detailed explanation of:
   - Market conditions
   - Competition level
   - Required resources
   - Risk factors
10. Estimated ROI (Return on Investment) with:
    - Specific percentage range
    - Timeframe
    - Key assumptions
    - Break-even analysis
11. Economic data including:
    - Growth potential with specific metrics
    - Market saturation analysis
    - Competition level assessment
    - Local economic indicators

IMPORTANT: Your response MUST be a valid JSON array with exactly this format:
[
  {
    "title": "Business Title 1",
    "description": "Detailed description text",
    "skills_required": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "target_market": "Detailed target market description",
    "startup_costs": "Detailed cost breakdown in KES",
    "potential_challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "success_factors": ["Factor 1", "Factor 2", "Factor 3"],
    "market_trends": ["Trend 1", "Trend 2", "Trend 3"],
    "success_rate_estimate": "Medium - detailed explanation here",
    "estimated_roi": "X% within Y months/years with assumptions",
    "economic_data": {
      "growth_potential": "High - specific metrics and explanation",
      "market_saturation": "Low - detailed analysis",
      "competition_level": "Medium - specific assessment"
    }
  }
]

CRITICAL: Ensure your JSON is valid. Every property name must be in double quotes and followed by a colon. Do not use single quotes, unescaped quotes within strings, or trailing commas. Do not include any text before or after the JSON array.
`

    console.log("Calling Groq API with prompt...")

    // Call Groq API using AI SDK with randomized temperature for more variety
    const temperature = 0.5 + Math.random() * 0.3 // Random temperature between 0.5 and 0.8

    const { text } = await generateText({
      model: groq("mistral-saba-24b"), //"llama3-70b-8192
      prompt: prompt,
      temperature: temperature,
      maxTokens: 2000,
    })

    // Try multiple parsing approaches
    let ideas: GeneratedIdea[] = []

    // First attempt: Direct JSON parsing
    try {
      console.log("Attempting direct JSON parsing")
      ideas = JSON.parse(text)
      if (Array.isArray(ideas) && ideas.length > 0) {
      const validIdeas = ideas.filter(validateIdeaResponse)
      if (validIdeas.length > 0) {
          console.log(`Successfully parsed ${validIdeas.length} valid ideas`)
        return validIdeas.slice(0, 3)
      }
      }
    } catch (error) {
      console.log("Direct parsing failed:", error.message)
    }

    // Second attempt: Fix malformed response and parse
      try {
      console.log("Attempting to fix malformed response")
      const fixedText = fixMalformedResponse(text)
      ideas = JSON.parse(fixedText)
      if (Array.isArray(ideas) && ideas.length > 0) {
            const validIdeas = ideas.filter(validateIdeaResponse)
            if (validIdeas.length > 0) {
          console.log(`Successfully parsed ${validIdeas.length} valid ideas after fixing`)
              return validIdeas.slice(0, 3)
            }
          }
    } catch (error) {
      console.log("Fixed parsing failed:", error.message)
        }

    // Third attempt: Sanitize and parse
    try {
      console.log("Attempting sanitization")
        const sanitizedText = sanitizeJsonText(text)
      ideas = JSON.parse(sanitizedText)
      if (Array.isArray(ideas) && ideas.length > 0) {
          const validIdeas = ideas.filter(validateIdeaResponse)
          if (validIdeas.length > 0) {
          console.log(`Successfully parsed ${validIdeas.length} valid ideas after sanitization`)
            return validIdeas.slice(0, 3)
          }
      }
    } catch (error) {
      console.log("Sanitized parsing failed:", error.message)
    }

    // Fourth attempt: Extract ideas from text
    try {
      console.log("Attempting text extraction")
      ideas = extractIdeasFromText(text)
      if (ideas.length > 0) {
            const validIdeas = ideas.filter(validateIdeaResponse)
            if (validIdeas.length > 0) {
          console.log(`Successfully extracted ${validIdeas.length} valid ideas`)
              return validIdeas.slice(0, 3)
            }
      }
    } catch (error) {
      console.log("Extraction failed:", error.message)
          }

    // Only use fallback ideas if we couldn't extract any valid ideas
    if (ideas.length === 0) {
      console.log("No valid ideas could be extracted, using fallback ideas")
      return getFallbackIdeas(skills, interests, budget, location)
    }

    // Return whatever valid ideas we found
    console.log(`Returning ${ideas.length} valid ideas`)
    return ideas.slice(0, 3)
  } catch (error) {
    console.error("Error generating ideas:", error)
    return getFallbackIdeas(skills, interests, budget, location)
  }
}

// Update the fallback ideas function to include the new fields
function getFallbackIdeas(skills: string[], interests: string[], budget: string, location: string): GeneratedIdea[] {
  console.log("Generating fallback ideas")

  // Add randomness to fallback ideas to ensure variety
  const randomPrefix = [
    "Innovative",
    "Modern",
    "Sustainable",
    "Digital",
    "Eco-friendly",
    "Premium",
    "Budget",
    "Local",
    "Global",
    "Specialized",
  ]

  const randomIndex1 = Math.floor(Math.random() * randomPrefix.length)
  const randomIndex2 = Math.floor(Math.random() * randomPrefix.length)
  const randomIndex3 = Math.floor(Math.random() * randomPrefix.length)

  const fallbackIdeas: GeneratedIdea[] = [
    {
      title: `${randomPrefix[randomIndex1]} ${skills[0] || "Local"} Services in ${location || "Kenya"}`,
      description: `A service business leveraging ${skills[0] || "local"} skills to serve the ${location || "Kenyan"} market. This business addresses local needs with minimal startup costs.`,
      skills_required: skills.length > 0 ? skills.slice(0, 3) : ["Communication", "Customer Service", "Marketing"],
      target_market: `Residents and businesses in ${location || "Kenya"} seeking ${skills[0] || "professional"} services`,
      startup_costs: getBudgetRange(budget),
      potential_challenges: ["Market competition", "Customer acquisition"],
      success_factors: ["Quality service delivery", "Strong local network"],
      // New fields
      market_trends: ["Increasing demand for specialized services", "Growth in mobile service delivery"],
      success_rate_estimate: "Medium - Service businesses have moderate success rates with proper execution",
      estimated_roi: "30-40% within 12-18 months",
      economic_data: {
        growth_potential: "Medium - Service sector is growing steadily in Kenya",
        market_saturation: "Medium - Varies by specific service type",
        competition_level: "Medium - Differentiation is key to success",
      },
    },
    {
      title: `${randomPrefix[randomIndex2]} ${interests[0] || "Digital"} Products Platform`,
      description: `An online platform offering ${interests[0] || "digital"} products to customers. This business can be operated remotely with flexible hours.`,
      skills_required:
        skills.length > 0 ? skills.slice(0, 3) : ["Digital Marketing", "Content Creation", "Basic Tech Skills"],
      target_market: `Online customers interested in ${interests[0] || "digital"} products and services`,
      startup_costs: getBudgetRange(budget),
      potential_challenges: ["Online visibility", "Payment processing"],
      success_factors: ["Unique product offering", "Effective digital marketing"],
      // New fields
      market_trends: ["Increasing internet penetration in Kenya", "Growing comfort with online purchases"],
      success_rate_estimate: "Medium-High - Digital businesses have lower overhead and wider reach",
      estimated_roi: "50-70% within 12-24 months",
      economic_data: {
        growth_potential: "High - Digital economy is rapidly expanding",
        market_saturation: "Low to Medium - Many niches still underserved",
        competition_level: "Medium - Varies by specific digital product category",
      },
    },
    {
      title: `${randomPrefix[randomIndex3]} ${interests[1] || "Local"} Retail Business`,
      description: `A retail business focusing on ${interests[1] || "local"} products for the ${location || "Kenyan"} market. This business combines physical and online presence for maximum reach.`,
      skills_required: skills.length > 1 ? skills.slice(1, 4) : ["Inventory Management", "Sales", "Customer Relations"],
      target_market: `Local consumers interested in ${interests[1] || "quality"} products`,
      startup_costs: getBudgetRange(budget),
      potential_challenges: ["Inventory management", "Cash flow"],
      success_factors: ["Strategic location", "Product differentiation"],
      // New fields
      market_trends: ["Growing middle class in urban areas", "Increasing preference for local products"],
      success_rate_estimate: "Medium - Retail requires careful planning and management",
      estimated_roi: "20-30% within 18-24 months",
      economic_data: {
        growth_potential: "Medium - Retail sector grows with the economy",
        market_saturation: "Medium to High - Depends on product category",
        competition_level: "High - Established retail chains present challenges",
      },
    },
  ]

  return fallbackIdeas
}

// Helper function to get budget range
function getBudgetRange(budget: string): string {
  switch (budget) {
    case "0-10000":
      return "5,000 - 10,000 KES"
    case "10000-50000":
      return "15,000 - 40,000 KES"
    case "50000-100000":
      return "60,000 - 90,000 KES"
    case "100000+":
      return "100,000+ KES"
    default:
      return "Various budget levels"
  }
}
