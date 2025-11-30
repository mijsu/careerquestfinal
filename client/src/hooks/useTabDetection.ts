import { useEffect, useState, useCallback } from "react";

interface TabDetectionOptions {
  enabled: boolean;
  onTabSwitch?: () => void;
  warningMessage?: string;
}

export function useTabDetection({
  enabled = false,
  onTabSwitch,
  warningMessage = "Warning: Tab switching detected during assessment!",
}: TabDetectionOptions) {
  const [tabSwitched, setTabSwitched] = useState(false);
  const [switchCount, setSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const handleVisibilityChange = useCallback(() => {
    if (!enabled) return;

    if (document.hidden) {
      console.log("🚨 TAB SWITCH DETECTED - visibilitychange");
      setTabSwitched(true);
      setSwitchCount(prev => prev + 1);
      setShowWarning(true);
      onTabSwitch?.();

      // Hide warning after 3 seconds
      setTimeout(() => setShowWarning(false), 3000);
    }
  }, [enabled, onTabSwitch]);

  const handleBlur = useCallback(() => {
    if (!enabled) return;

    // IMPORTANT: Filter out false positives from UI interactions
    setTimeout(() => {
      // Ignore if iframe has focus
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        console.log("Ignoring blur - focus moved to iframe");
        return;
      }
      
      // Ignore if focus is still within the document (e.g., dropdown clicks)
      if (document.hasFocus()) {
        console.log("Ignoring blur - document still has focus (likely dropdown or button click)");
        return;
      }
      
      console.log("🚨 TAB SWITCH DETECTED - window blur");
      setTabSwitched(true);
      setSwitchCount(prev => prev + 1);
      setShowWarning(true);
      onTabSwitch?.();

      setTimeout(() => setShowWarning(false), 3000);
    }, 300); // Longer delay to properly check focus state
  }, [enabled, onTabSwitch]);

  const handleFocusOut = useCallback((e: FocusEvent) => {
    if (!enabled) return;
    
    // Only trigger if focus is moving completely outside the window (not just to another element)
    // This is much more restrictive to avoid false positives from dropdowns and buttons
    if (!e.relatedTarget) {
      // Add delay to check if this is a real tab switch or just UI interaction
      setTimeout(() => {
        if (!document.hasFocus() && document.hidden === false) {
          // Document lost focus but is still visible - likely a real issue
          console.log("🚨 TAB SWITCH DETECTED - focusout");
          setTabSwitched(true);
          setSwitchCount(prev => prev + 1);
          setShowWarning(true);
          onTabSwitch?.();
          
          setTimeout(() => setShowWarning(false), 3000);
        } else {
          console.log("Ignoring focusout - likely dropdown or UI interaction");
        }
      }, 300);
    }
  }, [enabled, onTabSwitch]);

  // Keyboard detection for Alt+Tab
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Detect Alt+Tab (or Cmd+Tab on Mac)
    if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
      console.log("🚨 TAB SWITCH DETECTED - keyboard shortcut");
      setTabSwitched(true);
      setSwitchCount(prev => prev + 1);
      setShowWarning(true);
      onTabSwitch?.();
      
      setTimeout(() => setShowWarning(false), 3000);
    }
  }, [enabled, onTabSwitch]);

  useEffect(() => {
    if (!enabled) {
      console.log("Tab detection is DISABLED");
      return;
    }

    console.log("🔒 Tab detection is NOW ACTIVE - switching tabs will terminate the assessment!");
    console.log("Listening for: visibilitychange, blur, focusout, keydown events");
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("focusout", handleFocusOut as EventListener);
    document.addEventListener("keydown", handleKeyDown as EventListener);

    // Test the detection
    console.log("Current document.hidden:", document.hidden);
    console.log("Current document.hasFocus():", document.hasFocus());

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("focusout", handleFocusOut as EventListener);
      document.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [enabled, handleVisibilityChange, handleBlur, handleFocusOut, handleKeyDown]);

  const reset = useCallback(() => {
    setTabSwitched(false);
    setSwitchCount(0);
    setShowWarning(false);
  }, []);

  // Manual simulation for testing purposes
  const simulateTabSwitch = useCallback(() => {
    console.log("🧪 TEST: Manually simulating tab switch");
    setTabSwitched(true);
    setSwitchCount(prev => prev + 1);
    setShowWarning(true);
    onTabSwitch?.();
    
    setTimeout(() => setShowWarning(false), 3000);
  }, [onTabSwitch]);

  return {
    tabSwitched,
    switchCount,
    showWarning,
    warningMessage,
    reset,
    simulateTabSwitch,
  };
}