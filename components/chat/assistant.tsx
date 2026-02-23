"use client";
import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { myToolkit } from "./tools/toolkit";  
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";

const Assistantai = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  
  const aui = useAui({
    tools: Tools({ toolkit: myToolkit }),
  });

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Sidebar: LeadHaven Branding */}
        <div className="w-84 border-r border-slate-200 bg-white shadow-sm z-10">
          <div className="h-full flex flex-col">
            {/* Header: Rebranded for Trust */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Intelligence Portal</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                LeadHavenRealty AI
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Real Estate Lead Systems</p>
            </div>
            
            {/* Thread List: Minimalist */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Inquiries</div>
              <ThreadList />
            </div>

            {/* Admin/User Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>System Encryption</span>
                <span className="text-blue-600">Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative bg-white">
          {/* Top Bar: Clean & High-End */}
          <div className="h-20 border-b border-slate-100 bg-white px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 transform hover:scale-105 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Haven Concierge</h2>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-400 uppercase">Automated Expert</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Thread */}
          <div className="flex-1 overflow-hidden">
            <Thread />
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
};

export default Assistantai;
