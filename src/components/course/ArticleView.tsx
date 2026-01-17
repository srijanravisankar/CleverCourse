"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ArticlePage {
  pageTitle: string
  content: string
}

interface ArticleViewProps {
  pages: ArticlePage[]
}

export function ArticleView({ pages }: ArticleViewProps) {
  const [currentPage, setCurrentPage] = React.useState(0)
  const totalPages = pages.length
  const activePage = pages[currentPage]

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0))

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-8 px-4">
      <Card className="min-h-[600px] flex flex-col shadow-sm border-none bg-background">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {activePage.pageTitle}
            </CardTitle>
            <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pt-8 prose prose-slate dark:prose-invert max-w-none">
          {/* Using react-markdown to render the content */}
          <ReactMarkdown
            components={{
              h3: ({ ...props }) => <h3 className="text-xl font-semibold mt-6 mb-4" {...props} />,
              p: ({ ...props }) => <p className="leading-7 mb-4 text-foreground/90" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
              code: ({ ...props }) => (
                <code className="bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm" {...props} />
              ),
              pre: ({ ...props }) => (
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto my-6" {...props} />
              ),
            }}
          >
            {activePage.content}
          </ReactMarkdown>
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