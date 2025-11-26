import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import data from "@/data.json"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { app } = data
  const { login } = app

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically validate credentials
    // For demo purposes, we'll just call onLogin
    onLogin()
  }

  const handleForgotPassword = () => {
    // Handle forgot password logic
    console.log('Forgot password clicked')
  }

  return (
    <div className="min-h-screen flex ">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">EZ Medtech</h1>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl text-white mb-6 leading-tight">{app.taglines.loginHero}</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              {app.taglines.loginSubtext}
            </p>
          </div>

          <div className="flex justify-between items-center text-white/70 text-sm">
            <span>{app.copyright}</span>
            <span className="cursor-pointer hover:text-white/90">{app.login.privacyPolicy}</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background min-h-screen lg:min-h-0">
        <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8 p-6 sm:p-8 rounded-lg neumorphic-pressed">

          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl text-foreground font-semibold">{login.title}</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                {login.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  {login.emailLabel}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="neumorphic-inset border-0 focus:ring-0 shadow-none rounded-lg bg-background focus:border-0 transition-all duration-200"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  {login.passwordLabel}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-10 neumorphic-inset border-0 focus:ring-0 shadow-none rounded-lg bg-background focus:border-0 transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-2 w-2 text-muted-foreground" />
                    ) : (
                      <Eye className="h-2 w-2 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 cursor-pointer"
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    {login.rememberMeLabel}
                  </Label>
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm cursor-pointer text-primary"
                  onClick={handleForgotPassword}
                >
                  {login.forgotPasswordLabel}
                </Button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full text-sm font-medium neumorphic-pressed text-primary hover:text-primary-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2"
              >
                <span>{login.loginButton}</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
