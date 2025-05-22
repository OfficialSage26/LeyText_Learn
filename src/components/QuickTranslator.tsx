
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Languages, Loader2, Mic, Volume2, X } from 'lucide-react';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';
import { translateText } from '@/ai/flows/translate-text-flow';
import { useToast } from "@/hooks/use-toast";
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';

// Web Speech API interfaces (simplified)
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition | undefined;
    webkitSpeechRecognition: typeof SpeechRecognition | undefined;
  }
}

const languageToBcp47 = (lang: Language): string => {
  switch (lang) {
    case "English": return "en-US";
    case "Tagalog": return "tl-PH";
    case "Bisaya": return "ceb-PH"; // Cebuano for Bisaya
    case "Waray-Waray": return "war-PH"; // Waray (Philippines)
    default: return "en-US";
  }
};

export default function QuickTranslator() {
  const {
    sourceLanguage: globalSourceLanguage,
    setSourceLanguage: setGlobalSourceLanguage,
    targetLanguage: globalTargetLanguage,
    setTargetLanguage: setGlobalTargetLanguage,
  } = useGlobalAppContext();
  const { toast } = useToast();
  const mounted = useMounted();

  // Local state for UI display, initialized to server-consistent defaults
  const [currentSourceLang, setCurrentSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [currentTargetLang, setCurrentTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[1]);

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speech API states
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<typeof window.speechSynthesis | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);

  // Sync local UI languages with global context after mount and on global changes
  useEffect(() => {
    if (mounted) {
      setCurrentSourceLang(globalSourceLanguage);
      setCurrentTargetLang(globalTargetLanguage);

      // Initialize Speech API
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI() as SpeechRecognition;
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;

        recognitionInstance.onstart = () => {
          setIsListening(true);
          setSttError(null);
        };

        recognitionInstance.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            } else {
              // Could use interim results for real-time feedback if desired
            }
          }
          if (transcript) {
            setInputText(prev => prev + transcript); // Append or replace based on preference
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSttError("Microphone access denied. Please enable it in your browser settings.");
          } else if (event.error === 'network') {
            setSttError("Network error with speech recognition. Please check your internet connection.");
          } else if (event.error === 'audio-capture') {
            setSttError("Audio capture error. Please ensure your microphone is working and not in use by another app.");
          }
           else {
            setSttError(`Speech recognition error: ${event.error}. Please ensure microphone access is allowed.`);
          }
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        setSpeechRecognition(recognitionInstance);
      } else {
        console.warn("Speech Recognition API not supported by this browser.");
        setSttError("Speech recognition is not supported by this browser.");
      }

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setSpeechSynthesis(window.speechSynthesis);
      } else {
        console.warn("Speech Synthesis API not supported by this browser.");
      }
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage]);


  // Effect to ensure global source and target languages are different
  useEffect(() => {
    if (mounted) {
      if (globalSourceLanguage === globalTargetLanguage) {
        const newTarget = SUPPORTED_LANGUAGES.find(l => l !== globalSourceLanguage) ||
                           (globalSourceLanguage === SUPPORTED_LANGUAGES[0] ? SUPPORTED_LANGUAGES[1] : SUPPORTED_LANGUAGES[0]) ||
                           SUPPORTED_LANGUAGES[1]; // Absolute fallback
        if (newTarget && newTarget !== globalTargetLanguage) {
          setGlobalTargetLanguage(newTarget);
        }
      }
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage, setGlobalTargetLanguage]);


  const handleSwapLanguages = () => {
    setGlobalSourceLanguage(currentTargetLang); // Update global context
    setGlobalTargetLanguage(currentSourceLang); // Update global context

    if (outputText.trim() !== '') {
        setInputText(outputText);
        setOutputText(inputText);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }
    // Use global languages for the actual translation logic
    if (globalSourceLanguage === globalTargetLanguage) {
      setOutputText(inputText);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage: globalSourceLanguage, // Use global context for API
        targetLanguage: globalTargetLanguage, // Use global context for API
      });
      setOutputText(result.translatedText);
    } catch (e) {
      console.error("Translation error:", e);
      setError("Failed to translate text. Please try again.");
      toast({
        title: "Translation Error",
        description: "Could not translate the text. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string, lang: Language) => {
    if (!speechSynthesis || !text.trim()) return;
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageToBcp47(lang);
      utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error", event);
        toast({ 
          title: "Speech Error", 
          description: `Could not speak text for ${lang}. Voice quality and availability depend on your browser and OS.`, 
          variant: "destructive" 
        });
      };
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Error in handleSpeak:", e);
      toast({ 
        title: "Speech Error", 
        description: "An unexpected error occurred while trying to speak. Voice quality and availability depend on your browser and OS.", 
        variant: "destructive" 
      });
    }
  };

  const handleToggleListen = () => {
    if (!speechRecognition) {
      setSttError("Speech recognition is not supported or enabled in your browser.");
      return;
    }
    if (isListening) {
      speechRecognition.stop();
    } else {
      try {
        speechRecognition.lang = languageToBcp47(currentSourceLang);
        speechRecognition.start();
      } catch (e) {
         console.error("Error starting speech recognition:", e);
         setSttError("Could not start voice input. Please check microphone permissions and ensure no other app is using it.");
         setIsListening(false);
      }
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Languages className="inline-block mr-2 h-7 w-7 text-primary" />
          Quick Translator
        </CardTitle>
        <CardDescription>
          Instantly translate text. Use the mic for voice input or the speaker icons for text-to-speech.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Label htmlFor="quick-source-language" className="mb-1 block text-sm font-medium">From</Label>
            <Select
              value={currentSourceLang} // Use local state for display
              onValueChange={(value) => { if (mounted) setGlobalSourceLanguage(value as Language)}} // Update global context
              disabled={!mounted}
            >
              <SelectTrigger id="quick-source-language" className="w-full">
                <SelectValue placeholder="Select source language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={`quick-source-${lang}`} value={lang} disabled={lang === currentTargetLang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="self-center pt-0 sm:pt-5">
            <Button variant="ghost" size="icon" onClick={handleSwapLanguages} aria-label="Swap languages" disabled={!mounted}>
              <ArrowRightLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 w-full">
            <Label htmlFor="quick-target-language" className="mb-1 block text-sm font-medium">To</Label>
            <Select
              value={currentTargetLang} // Use local state for display
              onValueChange={(value) => { if (mounted) setGlobalTargetLanguage(value as Language)}} // Update global context
              disabled={!mounted}
            >
              <SelectTrigger id="quick-target-language" className="w-full">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={`quick-target-${lang}`} value={lang} disabled={lang === currentSourceLang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder={`Enter text in ${currentSourceLang}... (or use microphone)`} // Use local display state
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="resize-none text-base p-3 rounded-md shadow-sm focus:ring-primary focus:border-primary pr-20" // Added pr-20 for button space
            aria-label={`Input text in ${currentSourceLang}`} // Use local display state
            disabled={!mounted || isLoading}
          />
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleToggleListen} 
              disabled={!mounted || !speechRecognition || isLoading}
              className={cn("h-8 w-8 p-1.5", isListening ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "hover:bg-accent")}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleSpeak(inputText, currentSourceLang)}
              disabled={!mounted || !speechSynthesis || !inputText.trim() || isLoading}
              className="h-8 w-8 p-1.5 hover:bg-accent"
              aria-label={`Speak input text in ${currentSourceLang}`}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
         {sttError && <p className="text-xs text-destructive text-center mt-1">{sttError}</p>}


        <div className="relative">
            <Textarea
            placeholder={`Translation in ${currentTargetLang} will appear here...`} // Use local display state
            value={outputText}
            readOnly
            rows={4}
            className="bg-muted/30 resize-none text-base p-3 rounded-md shadow-sm border-dashed pr-10" // Added pr-10 for button space
            aria-label={`Output text in ${currentTargetLang}`} // Use local display state
            />
            <div className="absolute top-2 right-2">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleSpeak(outputText, currentTargetLang)}
                disabled={!mounted || !speechSynthesis || !outputText.trim() || isLoading}
                className="h-8 w-8 p-1.5 hover:bg-accent"
                aria-label={`Speak translated text in ${currentTargetLang}`}
            >
                <Volume2 className="h-4 w-4" />
            </Button>
            </div>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim() || !mounted}
          className="w-full py-2.5 text-base font-semibold"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Languages className="mr-2 h-5 w-5" />
          )}
          Translate
        </Button>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}

    
