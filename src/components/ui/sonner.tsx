import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

type Theme = "light" | "dark"

const getThemeFromDOM = (): Theme =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark")
    ? "dark"
    : "light"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

const ThemeAwareToaster = (props: ToasterProps) => {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    setTheme(getThemeFromDOM())
    const handleThemeChange = (e: CustomEvent<{ theme: Theme }>) => {
      setTheme(e.detail.theme)
    }
    window.addEventListener(
      "themechange",
      handleThemeChange as EventListener
    )
    return () => {
      window.removeEventListener(
        "themechange",
        handleThemeChange as EventListener
      )
    }
  }, [])

  return <Toaster theme={theme} {...props} />
}

export { Toaster, ThemeAwareToaster }
