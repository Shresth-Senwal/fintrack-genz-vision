/**
 * card.tsx
 *
 * UI Card component primitives for Fintrack GenZ Vision.
 * - Provides Card, CardHeader, CardTitle, CardDescription, CardContent, and CardFooter components.
 * - Used for consistent, accessible, and responsive card layouts throughout the app.
 *
 * Dependencies:
 * - React: forwardRef for ref forwarding and composition
 * - cn (className utility): for merging Tailwind and custom classes
 *
 * Design Decisions:
 * - All components forward refs for maximum composability.
 * - Class names use Tailwind CSS for styling and theming.
 * - Card primitives are stateless and purely presentational.
 *
 * Edge Cases & Limitations:
 * - Accepts any valid HTML attributes for flexibility.
 * - Custom className can override default styles; use with caution.
 *
 * TODO: Add ARIA roles and accessibility testing.
 */
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card
 * Root card container component.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Card props and className
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * @returns {JSX.Element} Card container
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader
 * Card header section for titles and actions.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Header props and className
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * @returns {JSX.Element} Card header
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle
 * Card title text, styled for prominence.
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - Title props and className
 * @param {React.Ref<HTMLParagraphElement>} ref - Forwarded ref
 * @returns {JSX.Element} Card title
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription
 * Card description text, styled for secondary info.
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Description props and className
 * @param {React.Ref<HTMLParagraphElement>} ref - Forwarded ref
 * @returns {JSX.Element} Card description
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent
 * Main card content area.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Content props and className
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * @returns {JSX.Element} Card content
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter
 * Card footer section for actions and summary info.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Footer props and className
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * @returns {JSX.Element} Card footer
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
