/**
 * Utility functions for text formatting and cleanup
 */

/**
 * Enhanced markdown formatting that preserves meaningful formatting
 * @param text - The text to clean
 * @returns Text with improved formatting for mobile readability
 */
export function enhanceMarkdownFormatting(text: string): string {
  if (!text) return text;

  let enhancedText = text;
  
  // Normalize bold formatting (convert __text__ to **text**)
  enhancedText = enhancedText.replace(/__(.*?)__/g, '**$1**');
  
  // Normalize italic formatting (convert _text_ to *text*)
  enhancedText = enhancedText.replace(/_(.*?)_/g, '*$1*');
  
  // Remove strikethrough formatting (~~text~~)
  enhancedText = enhancedText.replace(/~~(.*?)~~/g, '$1');
  
  // Remove inline code formatting (`text`)
  enhancedText = enhancedText.replace(/`([^`]+)`/g, '$1');
  
  // Clean up any double spaces that might result from formatting removal
  enhancedText = enhancedText.replace(/\s+/g, ' ').trim();
  
  return enhancedText;
}

/**
 * Enhanced Bible verse formatting for better readability
 * @param text - The text potentially containing Bible verses
 * @returns Text with improved Bible verse formatting
 */
export function formatBibleVerses(text: string): string {
  if (!text) return text;

  let formattedText = text;
  
  // Enhanced Bible verse formatting with better spacing and emphasis
  // Match patterns like "John 3:16" or "1 Corinthians 13:4-7"
  // Only format Bible verses that are not already formatted
  formattedText = formattedText.replace(
    /(?<!\*\*)([A-Z][a-z]+(?:\s+\d+)?)\s*(\d+:\d+(?:-\d+)?)(?!\*\*)/g,
    '**$1 $2**'
  );
  
  // Format common Bible verse patterns with quotes
  formattedText = formattedText.replace(
    /"([^"]+)"\s*\(([A-Z][a-z]+(?:\s+\d+)?\s*\d+:\d+(?:-\d+)?)\)/g,
    '"$1" (**$2**)'
  );
  
  return formattedText;
}

/**
 * Improves paragraph structure and spacing for mobile readability
 * @param text - The text to format
 * @returns Text with improved paragraph structure
 */
export function improveParagraphStructure(text: string): string {
  if (!text) return text;

  let formattedText = text;
  
  // Ensure proper paragraph spacing (at least 2 newlines between paragraphs)
  formattedText = formattedText.replace(/\n\s*\n/g, '\n\n');
  
  // Add spacing after periods that aren't followed by a newline
  formattedText = formattedText.replace(/\.([A-Z])/g, '. $1');
  
  // Ensure proper spacing around verses and important content
  formattedText = formattedText.replace(/(\*\*.*?\*\*)/g, ' $1 ');
  
  return formattedText.trim();
}

/**
 * Enhanced AI chat response formatting
 * @param text - The raw AI response text
 * @returns Cleaned and formatted text with preserved meaningful formatting
 */
export function cleanAIResponse(text: string): string {
  if (!text) return text;

  // First enhance markdown formatting (preserve meaningful formatting)
  let cleanedText = enhanceMarkdownFormatting(text);
  
  // Then format Bible verses with emphasis
  cleanedText = formatBibleVerses(cleanedText);
  
  // Improve paragraph structure for mobile readability
  cleanedText = improveParagraphStructure(cleanedText);
  
  return cleanedText;
}

/**
 * Simple markdown to React Native Text formatting converter
 * @param text - Text with simple markdown formatting
 * @returns Array of text elements with proper styling
 */
export function parseSimpleMarkdown(text: string): Array<{text: string, style?: any}> {
  if (!text) return [{text: ''}];
  
  const elements: Array<{text: string, style?: any}> = [];
  let remainingText = text;
  
  // Simple parser for **bold** and *italic* text
  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /\*(.*?)\*/g;
  
  let lastIndex = 0;
  let match;
  
  // Process bold text first
  while ((match = boldRegex.exec(remainingText)) !== null) {
    // Add text before the bold section
    if (match.index > lastIndex) {
      elements.push({
        text: remainingText.substring(lastIndex, match.index)
      });
    }
    
    // Add bold text
    elements.push({
      text: match[1],
      style: {fontWeight: 'bold'}
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < remainingText.length) {
    elements.push({
      text: remainingText.substring(lastIndex)
    });
  }
  
  return elements;
}