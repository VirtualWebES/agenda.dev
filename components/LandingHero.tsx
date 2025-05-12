"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Check, ChevronDown, MessageSquare, User, Clock, Slack, Github, Users, PanelRight, BarChart, ArrowRight, CalendarDays, LineChart, ArrowUpRight } from "lucide-react"
import type { Todo, Comment } from "@/lib/types"

// Simplified types for preview todos
interface PreviewTodo {
  id: string
  title: string
  completed: boolean
  dueDate: string
  urgency: number
  comments: PreviewComment[]
}

interface PreviewComment {
  id: string
  text: string
  createdAt: Date
  user?: {
    name: string
    image?: string | null
  }
}

// Example todos for demonstration
const exampleTodos: PreviewTodo[] = [
  {
    id: "example-1",
    title: "Meet with investors",
    completed: false,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    urgency: 5.0,
    comments: [
      {
        id: "comment-1",
        text: "Don't forget to prepare the pitch deck",
        createdAt: new Date(),
        user: { name: "You" }
      }
    ]
  },
  {
    id: "example-2",
    title: "Turn in AP exam",
    completed: false,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    urgency: 5.0,
    comments: []
  },
  {
    id: "example-3",
    title: "Submit final paper",
    completed: false,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    urgency: 2.0,
    comments: []
  },
  {
    id: "example-4",
    title: "Review quarterly results",
    completed: false,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    urgency: 4.0,
    comments: []
  },
  {
    id: "example-5",
    title: "Prepare team presentation",
    completed: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    urgency: 3.5,
    comments: []
  }
]

const formatDate = (dateStr: string) => {
  const dueDate = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const month = dueDate.toLocaleString('default', { month: 'short' })
  const day = dueDate.getDate()

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `${diffDays} days`
  return `${month} ${day}`
}

const getTimeColor = (dateStr: string) => {
  const dueDate = new Date(dateStr)
  const now = new Date()
  const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours <= 6) {
    return "text-yellow-600 dark:text-yellow-400" // Very soon
  } else if (diffHours <= 24) {
    return "text-yellow-500 dark:text-yellow-300" // Within 24 hours
  } else if (diffHours <= 72) {
    return "text-green-500 dark:text-green-400" // Within 3 days
  } else {
    return "text-green-600 dark:text-green-500" // More than 3 days
  }
}

const getStatusStyle = (dateStr: string) => {
  const dueDate = new Date(dateStr)
  const now = new Date()
  const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours <= 6) {
    return "bg-gradient-to-r from-yellow-500/10 to-transparent dark:from-yellow-900/30 dark:to-transparent border-l-2 border-yellow-500/40 dark:border-yellow-500/30"
  } else if (diffHours <= 24) {
    return "bg-gradient-to-r from-yellow-400/10 to-transparent dark:from-yellow-800/30 dark:to-transparent border-l-2 border-yellow-400/40 dark:border-yellow-400/20"
  } else if (diffHours <= 72) {
    return "bg-gradient-to-r from-green-400/10 to-transparent dark:from-green-900/30 dark:to-transparent border-l-2 border-green-400/40 dark:border-green-400/20"
  } else {
    return "bg-gradient-to-r from-green-500/10 to-transparent dark:from-green-950/30 dark:to-transparent border-l-2 border-green-500/30 dark:border-green-500/20"
  }
}

// Preview Todo Item component (simplified version of todo-item.tsx)
const PreviewTodoItem = ({ todo, expanded = false, className = "" }: { todo: PreviewTodo; expanded?: boolean; className?: string }) => {
  return (
    <div
      id={`preview-todo-${todo.id}`}
      className={`backdrop-blur-sm bg-white/95 dark:bg-[#131316]/95 rounded-[14px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_40px_rgba(0,0,0,0.35)] border border-black/[0.04] dark:border-white/[0.06] backdrop-filter overflow-hidden transition-colors duration-200 relative
      before:absolute before:inset-0 before:rounded-[14px] before:border before:border-white/[0.12] dark:before:border-white/[0.04] before:z-[-1]
      after:absolute after:inset-0 after:rounded-[14px] after:bg-[url('/noise-light.png')] after:opacity-[0.03] after:z-[-1] dark:after:opacity-[0.07] ${className}`}
    >
      <div className="flex flex-col relative">
        <div className={todo.dueDate ? getStatusStyle(todo.dueDate) : ""}>
          <div className="p-4 cursor-pointer">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border border-gray-300/70 dark:border-white/30 bg-white/80 dark:bg-white/5 flex items-center justify-center transition-all">
                {todo.completed && (
                  <Check className="w-3 h-3 text-[#7c5aff]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center w-[85%]">
                    <p className="text-[15px] font-normal text-gray-900 dark:text-white">
                      {todo.title}
                    </p>

                    {todo.comments.length > 0 && (
                      <div className="ml-2 flex items-center text-gray-400 dark:text-white/50">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="ml-1 text-xs">{todo.comments.length}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/50" />
                  </div>
                </div>

                <div className="flex items-center mt-1 text-[13px] space-x-1">
                  {todo.dueDate && (
                    <span className={`${getTimeColor(todo.dueDate)} font-medium`}>
                      {formatDate(todo.dueDate)}
                    </span>
                  )}

                  <div className="flex items-center">
                    <span className="mr-1 text-gray-400 dark:text-white/50">Urgency:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-400 dark:text-white/50">{todo.urgency.toFixed(1)}</span>
                      <div className="w-8 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#7c5aff] to-[#6c47ff] shadow-[0_0_8px_rgba(124,90,255,0.4)]"
                          style={{ width: `${(todo.urgency / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show comments section for the first example todo */}
        {expanded && todo.comments.length > 0 && (
          <div className="border-t border-gray-200/70 dark:border-white/10 p-4">
            <div className="space-y-2">
              {todo.comments.map((comment: PreviewComment) => (
                <div key={comment.id} className="group">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-gray-400 dark:text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-white/90">{comment.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-gray-400 dark:text-white/40">
                              {comment.user?.name || 'Local User'}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-white/40">•</div>
                            <div className="text-xs text-gray-400 dark:text-white/40">
                              Just now
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Metrics Card component
const MetricsCard = ({ icon, title, value, subtitle }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}) => {
  return (
    <div className="bg-white/90 dark:bg-[#131316]/90 backdrop-blur-md rounded-2xl p-4 shadow-md border border-gray-100 dark:border-white/[0.06]">
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-full p-2 bg-[#7c5aff]/10">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {subtitle && <span className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>}
      </div>
    </div>
  )
}

// Feature Card component
const FeatureCard = ({ icon, title, description, planned = false }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  planned?: boolean;
}) => {
  return (
    <div className="flex flex-col items-start p-6 rounded-2xl bg-white/90 dark:bg-[#131316]/90 backdrop-blur-md border border-gray-100 dark:border-white/[0.06] shadow-md">
      <div className="mb-4 flex items-center justify-between w-full">
        <div className="w-12 h-12 rounded-full bg-[#7c5aff]/10 flex items-center justify-center">
          {icon}
        </div>
        {planned && (
          <span className="text-xs font-medium bg-[#7c5aff]/10 text-[#7c5aff] px-2 py-1 rounded-full">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

export default function LandingHero({ usersCount, todosCount }: { usersCount: number, todosCount: number }) {
  const openAuthDialog = () => {
    const loginButton = document.querySelector('button[aria-label="Sign In"]') as HTMLButtonElement
    if (loginButton) {
      loginButton.click()
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[800px] h-[800px] -top-[300px] -right-[200px] rounded-full bg-gradient-to-b from-purple-100 to-transparent dark:from-purple-900/10 dark:to-transparent opacity-50 dark:opacity-20 blur-3xl" />
        <div className="absolute w-[600px] h-[600px] top-[60%] -left-[200px] rounded-full bg-gradient-to-r from-blue-100 to-transparent dark:from-blue-900/5 dark:to-transparent opacity-40 dark:opacity-10 blur-3xl" />
      </div>

      {/* Hero section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                contextually smart todos <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c5aff] to-[#6c47ff]">for everyone</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-light max-w-2xl">
                The world's first intelligent todo list that helps you stay organized, focused, and productive. Just tell agenda what you need to do and it will <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c5aff] to-[#6c47ff]">pull details and context</span> from your email, calendar, and more.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={openAuthDialog}
                className="bg-[#7c5aff] hover:bg-[#6c47ff] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium px-3 py-3 rounded-xl text-md md:text-lg"
              >
                <span>join {usersCount} others working smarter (its free)</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Right side - Interactive demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-video lg:aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl border border-gray-200/50 dark:border-white/[0.05]">
              {/* Main showcase background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#1A1A1F] dark:to-[#131316]">
                {/* Dashboard visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Dashboard container */}
                  <div className="w-full h-full p-6 flex flex-col">
                    {/* Metrics row */}
                    <div className="hidden md:grid grid-cols-3 gap-4 mb-6">
                      <MetricsCard
                        icon={<BarChart className="w-5 h-5 text-[#7c5aff]" />}
                        title="Productivity Score"
                        value="94%"
                        subtitle="Up 12% from last week"
                      />
                      <MetricsCard
                        icon={<Check className="w-5 h-5 text-[#7c5aff]" />}
                        title="Tasks Completed"
                        value="28"
                        subtitle="This week"
                      />
                      <MetricsCard
                        icon={<CalendarDays className="w-5 h-5 text-[#7c5aff]" />}
                        title="Next Deadline"
                        value="Tomorrow"
                        subtitle="2 urgent tasks"
                      />
                    </div>

                    {/* Tasks container */}
                    <div className="flex-1 rounded-2xl bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/[0.03] p-4 backdrop-blur-sm shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-800 dark:text-white">Today's Priority Tasks</h3>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#7c5aff]"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <PreviewTodoItem todo={exampleTodos[0]} expanded={true} />
                        <PreviewTodoItem todo={exampleTodos[4]} />
                        <PreviewTodoItem todo={exampleTodos[2]} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats indicators around the dashboard */}
            <div className="hidden lg:flex absolute -top-4 -right-4 bg-white dark:bg-[#131316] rounded-xl p-3 shadow-lg border border-gray-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#7c5aff]" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">85%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completion rate</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex absolute -bottom-4 -left-4 bg-white dark:bg-[#131316] rounded-xl p-3 shadow-lg border border-gray-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#7c5aff]" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">2.3h</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Time saved per week</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features section */}
      <div className="relative z-10 bg-white/70 dark:bg-[#131316]/70 backdrop-blur-md py-20 border-t border-gray-200/50 dark:border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Agenda?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Over {todosCount} todos created by {usersCount} users, and counting, and the features sell themselves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#7c5aff]" />}
              title="Workspace Collaboration"
              description="Add team members to workspaces and collaborate on shared todo lists in real-time."
            />

            <FeatureCard
              icon={<PanelRight className="w-6 h-6 text-[#7c5aff]" />}
              title="MCP Support"
              description="Full integration with MCP for enhanced workspace management and features."
            />

            <FeatureCard
              icon={<Slack className="w-6 h-6 text-[#7c5aff]" />}
              title="Chat Integration"
              description="@agenda in Slack or Discord to create tasks directly from conversation context."
              planned={true}
            />

            <FeatureCard
              icon={<Github className="w-6 h-6 text-[#7c5aff]" />}
              title="Issue Tracking"
              description="Auto-create todos from GitHub issues and Linear tickets in dedicated workspaces."
              planned={true}
            />

            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#7c5aff]"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>}
              title="Desktop App"
              description="Access your todos from a native desktop experience with offline support and notifications."
              planned={true}
            />

            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#7c5aff]"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>}
              title="Mobile App"
              description="Take your todos on the go with our native iOS and Android apps for seamless experience across devices."
              planned={true}
            />

            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#7c5aff]"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>}
              title="Command View"
              description="Power user interface with keyboard shortcuts and command palette for lightning-fast task management."
              planned={true}
            />

            <FeatureCard
              icon={<ArrowUpRight className="w-6 h-6 text-[#7c5aff]" />}
              title="Shipping Constant Updates"
              description={`We're constantly working on new features and improvements to make your experience even better. Last Vercel Deployment: ${Math.floor(Math.random() * 21) + 20} minutes ago`}
              planned={true}
            />
          </div>
        </div>
      </div>

      {/* Pricing section */}
      <div className="relative z-10 bg-white/50 dark:bg-[#131316]/50 backdrop-blur-md py-20 border-t border-gray-200/50 dark:border-white/[0.03]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-[#1A1A1F] rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-white/[0.06] transform transition-all duration-300 hover:scale-105">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                  <p className="text-gray-600 dark:text-gray-400">Perfect for personal use</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Up to 3 workspaces</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Add 1 collaborator per workspace</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Basic AI model with limited context</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Unlimited todos</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  onClick={openAuthDialog}
                  variant="outline"
                  className="w-full rounded-xl py-6 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                >
                  Get Started Free
                </Button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-b from-[#7c5aff]/5 to-[#6c47ff]/5 rounded-2xl p-8 shadow-xl border border-[#7c5aff]/20 dark:border-[#7c5aff]/30 transform transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="absolute -top-4 right-8 bg-[#7c5aff] text-white text-sm font-medium px-4 py-1 rounded-full shadow-lg">
                Popular
              </div>

              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
                  <p className="text-gray-600 dark:text-gray-400">Enhanced features for teams</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-[#7c5aff]">$7</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start">
                    <span className="text-[#7c5aff] mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Up to 5 workspaces</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#7c5aff] mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Add up to 5 users per workspace</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#7c5aff] mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Advanced AI models with better context understanding</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#7c5aff] mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#7c5aff] mr-2.5 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Early access to new features</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  onClick={openAuthDialog}
                  className="w-full rounded-xl py-6 bg-[#7c5aff] hover:bg-[#6c47ff] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 