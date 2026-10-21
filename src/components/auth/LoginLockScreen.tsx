"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Workspace } from "@/types";
import {
  Lock,
  Unlock,
  Delete,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginLockScreenProps {
  currentWorkspace: Workspace;
  onUnlock: () => void;
}

export const LoginLockScreen: React.FC<LoginLockScreenProps> = ({
  currentWorkspace,
  onUnlock,
}) => {
  const [pin, setPin] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const DEFAULT_PIN = "1234";

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSuccessUnlock = useCallback(() => {
    setIsSuccess(true);
    const timer = setTimeout(() => {
      onUnlock();
    }, 450);
    return () => clearTimeout(timer);
  }, [onUnlock]);

  const handleKeyPress = useCallback(
    (num: string) => {
      if (isSuccess || pin.length >= 4) return;
      setIsError(false);
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        if (newPin === DEFAULT_PIN) {
          handleSuccessUnlock();
        } else {
          setIsError(true);
          setErrorMessage("Incorrect Passcode. Try 1234.");
          setTimeout(() => {
            setPin("");
            setIsError(false);
          }, 800);
        }
      }
    },
    [handleSuccessUnlock, isSuccess, pin]
  );

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setIsError(false);
    }
  }, [pin]);

  const handleClear = useCallback(() => {
    setPin("");
    setIsError(false);
  }, []);

  const handleQuickDemoPin = useCallback(() => {
    setPin(DEFAULT_PIN);
    handleSuccessUnlock();
  }, [handleSuccessUnlock]);

  // Physical keyboard support (0-9, Backspace, Escape, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "Enter" && pin === DEFAULT_PIN) {
        e.preventDefault();
        handleSuccessUnlock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDelete, handleClear, handleKeyPress, handleSuccessUnlock, isSuccess, pin]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-3xl selection:bg-blue-600/20 overflow-y-auto"
    >
      {/* Ambient background illumination */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-slate-50/95 to-slate-100/90 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-gradient-to-br from-blue-500/12 via-indigo-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Clock & Lock Status */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center pt-2 sm:pt-4 pb-2 sm:pb-3 text-center">
        <motion.div
          animate={{ scale: isSuccess ? 1.08 : 1 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-xs mb-3"
        >
          {isSuccess ? (
            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>{isSuccess ? "Identity Verified" : "OmniSocial Security Lock"}</span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
          {currentTime || "09:41 AM"}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          {currentDate || "Monday, October 19"}
        </p>
      </div>

      {/* Center Authentication Card */}
      <motion.div
        layout
        className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/10"
      >
        {/* User Identity Avatar */}
        <div className="relative mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              currentWorkspace.team[0]?.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80"
            }
            alt="User avatar"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-4 ring-blue-500/15"
          />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
          </span>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            {currentWorkspace.team[0]?.name || "Sarah Jenkins"}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
              {currentWorkspace.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Enter Passcode
          </p>
        </div>

        {/* =================== PIN KEYPAD =================== */}
        <div className="w-full flex flex-col items-center space-y-4">
          {/* 4-Dot Passcode Display */}
          <motion.div
            animate={isError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4 py-2"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <motion.div
                  key={idx}
                  animate={
                    isFilled
                      ? { scale: [1, 1.25, 1.1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "w-3.5 h-3.5 rounded-full transition-all duration-150",
                    isError
                      ? "bg-rose-500 border-2 border-rose-600"
                      : isSuccess
                      ? "bg-emerald-500 border-2 border-emerald-600 shadow-md shadow-emerald-500/40"
                      : isFilled
                      ? "bg-blue-600 border-2 border-blue-700 shadow-sm shadow-blue-500/30"
                      : "border-2 border-slate-300 bg-slate-100"
                  )}
                />
              );
            })}
          </motion.div>

          {isError && (
            <p className="text-[11px] font-bold text-rose-600 animate-in fade-in">
              {errorMessage}
            </p>
          )}

          {/* Numeric Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
            {[
              { num: "1", sub: "" },
              { num: "2", sub: "ABC" },
              { num: "3", sub: "DEF" },
              { num: "4", sub: "GHI" },
              { num: "5", sub: "JKL" },
              { num: "6", sub: "MNO" },
              { num: "7", sub: "PQRS" },
              { num: "8", sub: "TUV" },
              { num: "9", sub: "WXYZ" },
            ].map((item) => (
              <motion.button
                key={item.num}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleKeyPress(item.num)}
                className="tap-press min-h-[52px] rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border border-slate-200/90 text-slate-900 flex flex-col items-center justify-center font-bold text-lg font-mono transition-colors shadow-2xs cursor-pointer"
              >
                <span>{item.num}</span>
                {item.sub && (
                  <span className="text-[8px] font-medium tracking-widest text-slate-400 -mt-0.5">
                    {item.sub}
                  </span>
                )}
              </motion.button>
            ))}

            {/* Bottom Row: Clear, 0, Delete */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleClear}
              aria-label="Clear Passcode"
              className="tap-press min-h-[52px] rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-center shadow-2xs cursor-pointer gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress("0")}
              className="tap-press min-h-[52px] rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border border-slate-200/90 text-slate-900 flex flex-col items-center justify-center font-bold text-lg font-mono transition-colors shadow-2xs cursor-pointer"
            >
              <span>0</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleDelete}
              aria-label="Delete last digit"
              className="tap-press min-h-[52px] rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shadow-2xs cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Default PIN quick-fill helper */}
          <button
            onClick={handleQuickDemoPin}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 font-mono pt-1 cursor-pointer"
          >
            <span>Demo PIN: <strong>1234</strong></span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* Footer Branding & Compliance Info */}
      <div className="relative z-10 w-full max-w-sm flex items-center justify-between text-[11px] font-mono text-slate-500 pb-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>FIPS 140-2 Level 3</span>
        </span>
        <button
          onClick={handleQuickDemoPin}
          className="text-blue-600 hover:underline font-semibold cursor-pointer"
        >
          Quick Unlock
        </button>
      </div>
    </motion.div>
  );
};
