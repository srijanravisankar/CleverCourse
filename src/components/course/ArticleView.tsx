"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Highlighter,
  HighlighterIcon,
  Square
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ArticlePage {
  pageTitle: string
  content: string
}

interface ArticleViewProps {
  pages: ArticlePage[]
}

// Helper to extract plain text from markdown (for TTS)
function extractPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Remove images
    .replace(/[-*+]\s/g, "") // Remove list markers
    .replace(/\d+\.\s/g, "") // Remove numbered list markers
    .replace(/>\s/g, "") // Remove blockquote markers
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim()
}

// Check if a block is a code block
function isCodeBlock(block: string): boolean {
  const trimmed = block.trim()
  // Fenced code blocks
  if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
    return true
  }
  // Indented code blocks (4 spaces or 1 tab at start of every line)
  const lines = trimmed.split('\n')
  if (lines.length > 0 && lines.every(line => line === '' || line.startsWith('    ') || line.startsWith('\t'))) {
    return true
  }
  return false
}

// Split MARKDOWN into sentences while preserving formatting
// Returns array of { markdown: string, plainText: string, isCode: boolean }
function splitMarkdownIntoSentences(markdown: string): Array<{ markdown: string; plainText: string; isCode: boolean }> {
  const results: Array<{ markdown: string; plainText: string; isCode: boolean }> = []
  
  // First, split out code blocks to preserve them
  // Match fenced code blocks (``` or ~~~)
  const codeBlockRegex = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g
  const parts: Array<{ content: string; isCode: boolean }> = []
  
  let lastIndex = 0
  let match
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({ content: markdown.slice(lastIndex, match.index), isCode: false })
    }
    // Add code block
    parts.push({ content: match[0], isCode: true })
    lastIndex = match.index + match[0].length
  }
  // Add remaining text
  if (lastIndex < markdown.length) {
    parts.push({ content: markdown.slice(lastIndex), isCode: false })
  }
  
  // Process each part
  for (const part of parts) {
    if (part.isCode) {
      // Code blocks are kept as single units, not read aloud
      results.push({
        markdown: part.content,
        plainText: '', // Empty so it won't be spoken
        isCode: true
      })
      continue
    }
    
    // Split non-code content by paragraphs
    const blocks = part.content.split(/\n\n+/)
    
    for (const block of blocks) {
      const trimmedBlock = block.trim()
      if (!trimmedBlock) continue
      
      // Check if it's a header - treat as single sentence
      if (/^#{1,6}\s/.test(trimmedBlock)) {
        results.push({
          markdown: trimmedBlock,
          plainText: extractPlainText(trimmedBlock),
          isCode: false
        })
        continue
      }
      
      // Check if it's a list item
      if (/^[-*+]\s|^\d+\.\s/.test(trimmedBlock)) {
        // Split list into items
        const items = trimmedBlock.split(/\n(?=[-*+]\s|\d+\.\s)/)
        for (const item of items) {
          if (item.trim()) {
            results.push({
              markdown: item.trim(),
              plainText: extractPlainText(item),
              isCode: false
            })
          }
        }
        continue
      }
      
      // For regular paragraphs, split by sentence-ending punctuation
      let remaining = trimmedBlock
      const sentenceRegex = /^([\s\S]*?[.!?])(?:\s|$)/
      
      while (remaining.trim()) {
        const match = remaining.match(sentenceRegex)
        if (match) {
          const sentence = match[1].trim()
          if (sentence) {
            results.push({
              markdown: sentence,
              plainText: extractPlainText(sentence),
              isCode: false
            })
          }
          remaining = remaining.slice(match[0].length)
        } else {
          // No more sentence endings, take the rest
          if (remaining.trim()) {
            results.push({
              markdown: remaining.trim(),
              plainText: extractPlainText(remaining.trim()),
              isCode: false
            })
          }
          break
        }
      }
    }
  }
  
  // Filter out entries with no plain text, but KEEP code blocks
  return results.filter(s => s.plainText.length > 0 || s.isCode)
}

export function ArticleView({ pages }: ArticleViewProps) {
  const [currentPage, setCurrentPage] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isSlideshowActive, setIsSlideshowActive] = React.useState(false) // Tracks if slideshow started (even if paused)
  const [isSpeaking, setIsSpeaking] = React.useState(false)
  const [enableTTS, setEnableTTS] = React.useState(true)
  const [enableHighlight, setEnableHighlight] = React.useState(true)
  const [currentSentenceIndex, setCurrentSentenceIndex] = React.useState(-1)
  const [sentenceData, setSentenceData] = React.useState<Array<{ markdown: string; plainText: string; isCode: boolean }>>([])
  const [restartKey, setRestartKey] = React.useState(0) // Used to force slideshow restart on navigation
  
  const speechRef = React.useRef<SpeechSynthesisUtterance | null>(null)
  const totalPages = pages.length
  const activePage = pages[currentPage]

  // Extract sentences when page changes - now with markdown preserved
  React.useEffect(() => {
    const data = splitMarkdownIntoSentences(activePage.content)
    setSentenceData(data)
    setCurrentSentenceIndex(-1)
  }, [activePage.content])

  // Cleanup speech on unmount
  React.useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  // Handle speaking a sentence (uses plain text for TTS)
  // Skips code blocks automatically (they have empty plainText)
  const speakSentence = React.useCallback((sentenceIndex: number) => {
    if (!enableTTS || sentenceIndex >= sentenceData.length) {
      return Promise.resolve()
    }

    const sentence = sentenceData[sentenceIndex]
    
    // Skip code blocks - they have empty plainText
    if (sentence.isCode || !sentence.plainText) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      window.speechSynthesis.cancel()
      
      // Use plain text for speech
      const utterance = new SpeechSynthesisUtterance(sentence.plainText)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      
      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      
      utterance.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }

      speechRef.current = utterance
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    })
  }, [enableTTS, sentenceData])

  // Use a ref to track the resume position (persists across re-renders)
  const resumeIndexRef = React.useRef(0)

  // Main slideshow loop
  React.useEffect(() => {
    if (!isPlaying) return

    let cancelled = false

    const runSlideshow = async () => {
      // Start from the resume position
      const startIndex = resumeIndexRef.current
      
      for (let i = startIndex; i < sentenceData.length; i++) {
        if (cancelled) break

        setCurrentSentenceIndex(i)
        resumeIndexRef.current = i // Update resume position
        
        const sentence = sentenceData[i]
        
        // Skip code blocks quickly without reading
        if (sentence.isCode) {
          await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause to show it
          continue
        }
        
        if (enableTTS) {
          await speakSentence(i)
        } else {
          // If TTS disabled, just pause for reading time based on sentence length
          const readingTime = Math.max(2000, sentence.plainText.length * 50)
          await new Promise(resolve => setTimeout(resolve, readingTime))
        }

        if (cancelled) break
      }

      if (cancelled) return

      // Move to next page if available
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1)
        resumeIndexRef.current = 0 // Reset for new page
        setCurrentSentenceIndex(-1)
      } else {
        // End of slideshow
        setIsPlaying(false)
        resumeIndexRef.current = 0
        setCurrentSentenceIndex(-1)
      }
    }

    runSlideshow()

    return () => {
      cancelled = true
      window.speechSynthesis?.cancel()
    }
  }, [isPlaying, currentPage, sentenceData.length, enableTTS, speakSentence, totalPages, restartKey])

  // Reset sentence index only when PAGE changes (not when play/pause)
  const prevPageRef = React.useRef(currentPage)
  React.useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage
      resumeIndexRef.current = 0 // Reset resume position for new page
      setCurrentSentenceIndex(0)
    }
  }, [currentPage])

  const handlePlay = React.useCallback(() => {
    if (isPlaying) {
      // Pause - keep position for resume (resumeIndexRef already has current position)
      setIsPlaying(false)
      window.speechSynthesis?.cancel()
      // Keep isSlideshowActive true so controls stay visible
    } else {
      // Resume/Start
      setIsPlaying(true)
      setIsSlideshowActive(true) // Mark slideshow as active
      // If no sentence selected yet, start from beginning
      if (currentSentenceIndex < 0) {
        resumeIndexRef.current = 0
        setCurrentSentenceIndex(0)
      }
      // Otherwise resumeIndexRef already has the correct position
    }
  }, [isPlaying, currentSentenceIndex])

  const handleStop = () => {
    setIsPlaying(false)
    setIsSlideshowActive(false) // Only stop hides the controls
    window.speechSynthesis?.cancel()
    resumeIndexRef.current = 0 // Reset resume position
    setCurrentSentenceIndex(-1)
  }

  // Navigate to previous sentence
  const handlePrevSentence = React.useCallback(() => {
    if (!isSlideshowActive || sentenceData.length === 0) return
    
    window.speechSynthesis?.cancel()
    
    // Find previous non-code sentence
    let prevIndex = currentSentenceIndex - 1 
    while (prevIndex >= 0 && sentenceData[prevIndex].isCode) {
      prevIndex--
    }
    
    if (prevIndex >= 0) {
      resumeIndexRef.current = prevIndex
      setCurrentSentenceIndex(prevIndex)
      // Restart slideshow from new position (keeps playing)
      setRestartKey(k => k + 1)
    }
  }, [isSlideshowActive, currentSentenceIndex, sentenceData])

  // Navigate to next sentence
  const handleNextSentence = React.useCallback(() => {
    if (!isSlideshowActive || sentenceData.length === 0) return
    
    window.speechSynthesis?.cancel()
    
    // Find next non-code sentence
    let nextIndex = currentSentenceIndex + 1
    while (nextIndex < sentenceData.length && sentenceData[nextIndex].isCode) {
      nextIndex++
    }
    
    if (nextIndex < sentenceData.length) {
      resumeIndexRef.current = nextIndex
      setCurrentSentenceIndex(nextIndex)
      // Restart slideshow from new position (keeps playing)
      setRestartKey(k => k + 1)
    }
  }, [isSlideshowActive, currentSentenceIndex, sentenceData])

  // Keyboard navigation for sentences
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSlideshowActive) return
      
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextSentence()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevSentence()
      } else if (e.key === ' ') {
        // Space bar to play/pause
        e.preventDefault()
        handlePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSlideshowActive, handleNextSentence, handlePrevSentence, handlePlay])

  const handleNext = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel()
    }
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
    setCurrentSentenceIndex(-1)
  }

  const handlePrev = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel()
    }
    setCurrentPage((prev) => Math.max(prev - 1, 0))
    setCurrentSentenceIndex(-1)
  }

  // Base markdown components
  const baseComponents = {
    h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-xl font-semibold mt-6 mb-4" {...props} />
    ),
    p: ({ ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="leading-7 mb-4 text-foreground/90" {...props} />
    ),
    ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
    ),
    li: ({ ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="leading-7" {...props} />
    ),
    code: ({ ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code className="bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm" {...props} />
    ),
    pre: ({ ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto my-6" {...props} />
    ),
  }

  // Render content with sentence-level highlighting
  // Each sentence is rendered as its own ReactMarkdown, wrapped in a span for highlighting
  const HighlightedContent = React.useMemo(() => {
    // When not in slideshow mode with highlighting, render markdown normally
    if (!isSlideshowActive || !enableHighlight || currentSentenceIndex < 0 || sentenceData.length === 0) {
      return (
        <ReactMarkdown components={baseComponents} rehypePlugins={[rehypeRaw]}>
          {activePage.content}
        </ReactMarkdown>
      )
    }

    // During slideshow with highlighting (playing or paused), render each sentence separately
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {sentenceData.map((sentence, idx) => {
          const isCurrentSentence = idx === currentSentenceIndex && !sentence.isCode
          const isHeader = sentence.markdown.startsWith('#')
          const isList = /^[-*+]\s|^\d+\.\s/.test(sentence.markdown)
          const isCode = sentence.isCode
          
          // Code blocks are rendered without highlighting wrapper
          if (isCode) {
            return (
              <div key={idx} className="my-4">
                <ReactMarkdown 
                  components={baseComponents}
                  rehypePlugins={[rehypeRaw]}
                >
                  {sentence.markdown}
                </ReactMarkdown>
              </div>
            )
          }
          
          // Wrap each sentence's markdown in a span with conditional highlighting
          return (
            <span
              key={idx}
              className={`transition-all duration-200 ${
                isCurrentSentence 
                  ? 'bg-yellow-300 dark:bg-yellow-500 rounded px-1 py-0.5' 
                  : ''
              }`}
              style={{ display: isHeader || isList ? 'block' : 'inline' }}
            >
              <ReactMarkdown 
                components={{
                  ...baseComponents,
                  // Override p to use inline span for continuous text flow
                  p: ({ children }) => <>{children}{' '}</>,
                  h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
                    <h3 className="text-xl font-semibold mt-6 mb-4 inline" {...props} />
                  ),
                }}
                rehypePlugins={[rehypeRaw]}
              >
                {sentence.markdown}
              </ReactMarkdown>
            </span>
          )
        })}
      </div>
    )
  }, [activePage.content, isSlideshowActive, enableHighlight, currentSentenceIndex, sentenceData])

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-8 px-4">
      <Card className="min-h-[600px] flex flex-col shadow-sm border-none bg-background">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {activePage.pageTitle}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Slideshow Controls */}
              <TooltipProvider>
                <div className="flex items-center gap-1 mr-4 bg-secondary rounded-full p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isPlaying ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={handlePlay}
                      >
                        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isPlaying ? "Pause slideshow" : (isSlideshowActive ? "Resume slideshow" : "Start slideshow")}
                    </TooltipContent>
                  </Tooltip>

                  {isSlideshowActive && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={handleStop}
                        >
                          <Square className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Stop slideshow</TooltipContent>
                    </Tooltip>
                  )}

                  {isSlideshowActive && (
                    <>
                      <div className="w-px h-5 bg-border mx-1" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={enableTTS}
                            onPressedChange={setEnableTTS}
                            size="sm"
                            className="h-8 w-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            {enableTTS ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          {enableTTS ? "Disable voice" : "Enable voice"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={enableHighlight}
                            onPressedChange={setEnableHighlight}
                            size="sm"
                            className="h-8 w-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            <Highlighter className="size-4" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          {enableHighlight ? "Disable highlight" : "Enable highlight"}
                        </TooltipContent>
                      </Tooltip>

                      <div className="w-px h-5 bg-border mx-1" />
                      
                      {/* Sentence Navigation */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handlePrevSentence}
                            disabled={currentSentenceIndex <= 0}
                          >
                            <ChevronLeft className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Previous sentence (←)</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleNextSentence}
                            disabled={currentSentenceIndex >= sentenceData.length - 1}
                          >
                            <ChevronRight className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Next sentence (→)</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </TooltipProvider>

              <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>
          </div>

          {/* Progress indicator during slideshow */}
          {isSlideshowActive && sentenceData.length > 0 && (
            <div className="mt-4">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentSentenceIndex + 1) / sentenceData.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sentence {currentSentenceIndex + 1} of {sentenceData.length}
                {!isPlaying && " (paused)"}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 pt-8 prose prose-slate dark:prose-invert max-w-none">
          {HighlightedContent}
        </CardContent>

        <CardFooter className="border-t pt-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          {/* Pagination Indicators */}
          <div className="flex gap-2">
            {pages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  idx === currentPage ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}