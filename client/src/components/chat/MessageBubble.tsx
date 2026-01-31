import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, User, Bot } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

const FunctionDisplay = ({ toolCall }: { toolCall: any }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try {
            return typeof results === 'string' ? JSON.parse(results) : results;
        } catch {
            return results;
        }
    })();
    
    const isError = results && (
        (typeof results === 'string' && /error|failed/i.test(results)) ||
        (parsedResults?.success === false)
    );
    
    const statusConfig: Record<string, any> = {
        pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
        running: { icon: Loader2, color: 'text-blue-500', text: 'Running...', spin: true },
        in_progress: { icon: Loader2, color: 'text-blue-500', text: 'Running...', spin: true },
        completed: isError ? 
            { icon: AlertCircle, color: 'text-rose-500', text: 'Failed' } : 
            { icon: CheckCircle2, color: 'text-emerald-600', text: 'Success' },
        success: { icon: CheckCircle2, color: 'text-emerald-600', text: 'Success' },
        failed: { icon: AlertCircle, color: 'text-rose-500', text: 'Failed' },
        error: { icon: AlertCircle, color: 'text-rose-500', text: 'Failed' }
    };
    
    const config = statusConfig[status] || { icon: Zap, color: 'text-slate-500', text: '' };
    const Icon = config.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                    "hover:bg-slate-50",
                    expanded ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100"
                )}
            >
                <Icon className={cn("h-3.5 w-3.5", config.color, config.spin && "animate-spin")} />
                <span className="text-slate-700 font-medium">{formattedName}</span>
                {config.text && (
                    <span className={cn("text-slate-500", isError && "text-rose-600")}>
                        • {config.text}
                    </span>
                )}
                {!config.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-slate-400 transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !config.spin && (
                <div className="mt-2 ml-3 pl-3 border-l-2 border-slate-100 space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-xs text-slate-500 mb-1 font-medium">Parameters:</div>
                            <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs whitespace-pre-wrap overflow-auto max-h-32">
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                                    } catch {
                                        return toolCall.arguments_string;
                                    }
                                })()}
                            </pre>
                        </div>
                    )}
                    {parsedResults && (
                        <div>
                            <div className="text-xs text-slate-500 mb-1 font-medium">Result:</div>
                            <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs whitespace-pre-wrap max-h-32 overflow-auto">
                                {typeof parsedResults === 'object' ? 
                                    JSON.stringify(parsedResults, null, 2) : parsedResults}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface Message {
  role: string;
  content: string;
  tool_calls?: any[];
}

export default function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    
    return (
        <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                    <Bot className="h-5 w-5 text-white" />
                </div>
            )}
            <div className={cn("max-w-[80%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-5 py-3",
                        isUser 
                          ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg" 
                          : "bg-white border border-slate-100 shadow-sm"
                    )}>
                        {isUser ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                components={{
                                    code: ({ inline, className, children, ...props }: any) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="relative group/code">
                                                <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto my-2">
                                                    <code className={className} {...props}>{children}</code>
                                                </pre>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 bg-slate-800 hover:bg-slate-700"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                        toast.success('Code copied');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3 text-slate-400" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: ({ children, ...props }: any) => (
                                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">{children}</a>
                                    ),
                                    p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-slate-700">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-lg font-bold my-3 text-slate-900">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-bold my-2 text-slate-900">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-bold my-2 text-slate-900">{children}</h3>,
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-3 border-blue-400 pl-4 my-2 text-slate-600 italic">
                                            {children}
                                        </blockquote>
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
                
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1 mt-2">
                        {message.tool_calls.map((toolCall, idx) => (
                            <FunctionDisplay key={idx} toolCall={toolCall} />
                        ))}
                    </div>
                )}
            </div>
            {isUser && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="h-5 w-5 text-white" />
                </div>
            )}
        </div>
    );
}