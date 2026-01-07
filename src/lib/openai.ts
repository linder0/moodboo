import OpenAI from 'openai'

// Lazy initialization for OpenAI client
let openaiInstance: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable')
    }

    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

// For backwards compatibility and convenience
export const openai = {
  get client() {
    return getOpenAI()
  }
}
