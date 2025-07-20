import * as React from "react"

/**
 * use-mobile.tsx
 *
 * Custom React hook to detect mobile viewport.
 * - Returns true if window width is below MOBILE_BREAKPOINT
 * - Listens for viewport changes and updates state
 *
 * Dependencies:
 * - React: useState, useEffect
 *
 * NOTE: Used for responsive UI logic throughout the app.
 * TODO: Make breakpoint configurable via context or props.
 */

// Mobile breakpoint in pixels (default: 768px)
const MOBILE_BREAKPOINT = 768;

// Additional breakpoints for better responsive design
const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1280;

/**
 * useIsMobile
 * @returns {boolean} True if viewport is mobile-sized
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Always return a boolean
  return !!isMobile
}

/**
 * useViewportSize
 * @returns {object} Viewport size information
 */
export function useViewportSize() {
  const [viewportSize, setViewportSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  React.useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setViewportSize({
        width,
        height,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= DESKTOP_BREAKPOINT
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    window.addEventListener('orientationchange', updateSize)
    
    return () => {
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('orientationchange', updateSize)
    }
  }, [])

  return viewportSize
}
