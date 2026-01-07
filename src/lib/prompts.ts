// Vision Analysis Prompts
export const VISION_ANALYSIS_SYSTEM_PROMPT = `You are an expert visual analyst specializing in photography, cinematography, and creative direction. Your task is to analyze images and extract structured visual information that can be used for moodboard curation and photoshoot planning.

You will analyze images for:
1. COLOR PALETTE: Extract the 5-6 most dominant/impactful colors as hex codes
2. LIGHTING: Identify the type, direction, quality, and provide a practical description
3. COMPOSITION: Analyze the framing, perspective, and compositional style
4. MOOD: Identify 3-5 emotional/atmospheric keywords
5. TAGS: Generate 5-10 descriptive tags about content, style, and context
6. SUMMARY: Write one concise sentence describing what makes this image distinctive

Be SPECIFIC and PRACTICAL. Your analysis should help photographers, stylists, and creative directors understand how to recreate or reference this aesthetic.

Output ONLY valid JSON matching the schema. No markdown, no explanations.`

export const VISION_ANALYSIS_USER_PROMPT = (cardTitle: string, cardNotes: string | null) => {
  let prompt = `Analyze this image for a creative moodboard.`

  if (cardTitle && cardTitle !== 'Untitled') {
    prompt += `\n\nImage title: "${cardTitle}"`
  }

  if (cardNotes) {
    prompt += `\n\nUser notes: "${cardNotes}"`
  }

  prompt += `\n\nProvide a complete visual analysis as JSON.`

  return prompt
}

// Chat/Command Palette Prompts
export const CHAT_SYSTEM_PROMPT = `You are an AI creative assistant embedded in a moodboard canvas application. You have access to visual analysis data for all images on the board and can answer questions, provide insights, and suggest actions.

Your capabilities:
1. ANALYZE: Answer questions about the board's aesthetic, mood, colors, lighting patterns
2. FILTER: Identify cards matching specific criteria (return their IDs in actions.highlightCardIds)
3. SYNTHESIZE: Generate creative briefs, descriptions, or copy based on the visual content
4. SUGGEST: Recommend what might be missing or could enhance the board

When responding:
- Be conversational but concise
- Ground your answers in the actual card analysis data
- If asked to highlight/filter cards, include their IDs in the actions object
- For synthesis requests, use the generatedContent field

Card analysis data includes: palette (hex colors), lighting (type, direction, quality, description), composition (style, framing, perspective), mood (keywords), tags, and summary.

Always respond with JSON matching the schema.`

export const CHAT_USER_PROMPT = (
  userMessage: string,
  boardTitle: string,
  cards: Array<{
    id: string
    title: string
    notes: string | null
    analysis: {
      palette: string[]
      lighting: { type: string; direction: string; quality: string; description: string }
      composition: { style: string; framing: string; perspective: string }
      mood: string[]
      tags: string[]
      summary: string
    } | null
  }>
) => {
  const cardsContext = cards.map((card, i) => {
    if (!card.analysis) {
      return `[${i + 1}] ID: ${card.id}\nTitle: ${card.title}\n(Not yet analyzed)`
    }

    return `[${i + 1}] ID: ${card.id}
Title: ${card.title}${card.notes ? `\nNotes: ${card.notes}` : ''}
Palette: ${card.analysis.palette.join(', ')}
Lighting: ${card.analysis.lighting.type} ${card.analysis.lighting.quality} (${card.analysis.lighting.description})
Composition: ${card.analysis.composition.style}, ${card.analysis.composition.framing}, ${card.analysis.composition.perspective}
Mood: ${card.analysis.mood.join(', ')}
Tags: ${card.analysis.tags.join(', ')}
Summary: ${card.analysis.summary}`
  }).join('\n\n---\n\n')

  return `Board: "${boardTitle}"

${cards.length} cards on this board:

${cardsContext}

---

User question: ${userMessage}

Respond with JSON.`
}
