
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Languages, Loader2, Mic, Volume2, X, AlertTriangle } from 'lucide-react';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';
import { translateText } from '@/ai/flows/translate-text-flow';
// Removed: import { synthesizeSpeech } from '@/ai/flows/synthesize-speech-flow';
import { useToast } from "@/hooks/use-toast";
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';

// Web Speech API interfaces (simplified) for STT
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

// BCP 47 language codes for Web Speech API (STT and TTS)
const languageToBcp47 = (lang: Language): string => {
  switch (lang) {
    case "English": return "en-US";
    case "Tagalog": return "tl-PH";
    case "Bisaya": return "ceb-PH"; // Cebuano for Bisaya
    case "Waray-Waray": return "war-PH"; // Waray (less common, browser support varies)
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

  const [currentSourceLang, setCurrentSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [currentTargetLang, setCurrentTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[1]);

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  
  const [isSpeakingInput, setIsSpeakingInput] = useState(false);
  const [isSpeakingOutput, setIsSpeakingOutput] = useState(false);
  
  const [browserSupportsSTT, setBrowserSupportsSTT] = useState(true);
  const [browserSupportsBrowserTTS, setBrowserSupportsBrowserTTS] = useState(true);


  useEffect(() => {
    if (mounted) {
      setCurrentSourceLang(globalSourceLanguage);
      setCurrentTargetLang(globalTargetLanguage);

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI() as SpeechRecognition;
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.onstart = () => setIsListening(true);
        recognitionInstance.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
          }
          if (transcript) setInputText(prev => prev + transcript);
        };
        recognitionInstance.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          let errorMsg = `Speech recognition error: ${event.error}. Please ensure microphone access is allowed.`;
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMsg = "Microphone access denied. Please enable it in your browser settings.";
          } else if (event.error === 'network') {
            errorMsg = "Network error with speech recognition. Please check your internet connection.";
          } else if (event.error === 'audio-capture') {
             errorMsg = "Audio capture error. Ensure your microphone is working and not in use by another app.";
          }
          setSttError(errorMsg);
          setIsListening(false);
        };
        recognitionInstance.onend = () => setIsListening(false);
        setSpeechRecognition(recognitionInstance);
        setBrowserSupportsSTT(true);
      } else {
        console.warn("Speech Recognition API not supported by this browser.");
        setSttError("Speech recognition (Mic icon) is not supported by this browser.");
        setBrowserSupportsSTT(false);
      }

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setBrowserSupportsBrowserTTS(true);
      } else {
        console.warn("Browser Speech Synthesis API not supported.");
        setBrowserSupportsBrowserTTS(false);
      }
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage]);

  useEffect(() => {
    if (mounted) {
      if (globalSourceLanguage === globalTargetLanguage) {
        const newTarget = SUPPORTED_LANGUAGES.find(l => l !== globalSourceLanguage) ||
                           (globalSourceLanguage === SUPPORTED_LANGUAGES[0] ? SUPPORTED_LANGUAGES[1] : SUPPORTED_LANGUAGES[0]) ||
                           SUPPORTED_LANGUAGES[1];
        if (newTarget && newTarget !== globalTargetLanguage) setGlobalTargetLanguage(newTarget);
      }
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage, setGlobalTargetLanguage]);

  const handleSwapLanguages = () => {
    setGlobalSourceLanguage(currentTargetLang);
    setGlobalTargetLanguage(currentSourceLang); // Use currentSourceLang (which is from global)
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
    if (globalSourceLanguage === globalTargetLanguage) {
      setOutputText(inputText);
      return;
    }
    setIsLoadingTranslation(true);
    setTranslationError(null);
    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage: globalSourceLanguage,
        targetLanguage: globalTargetLanguage,
      });
      setOutputText(result.translatedText);
    } catch (e) {
      console.error("Translation error:", e);
      setTranslationError("Failed to translate text. Please try again.");
      toast({ title: "Translation Error", description: "Could not translate text.", variant: "destructive" });
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  const handleSpeak = async (text: string, lang: Language, type: 'input' | 'output') => {
    if (!text.trim() || (type === 'input' && isSpeakingInput) || (type === 'output' && isSpeakingOutput)) return;

    if (!browserSupportsBrowserTTS || !window.speechSynthesis) {
      toast({ 
        title: "TTS Not Available", 
        description: "Browser-based speech synthesis is not supported on this device/browser.", 
        variant: "destructive" 
      });
      return;
    }

    if (type === 'input') setIsSpeakingInput(true); else setIsSpeakingOutput(true);

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageToBcp47(lang);
      
      // Attempt to find a voice that matches the language more closely if possible
      const voices = window.speechSynthesis.getVoices();
      const specificVoice = voices.find(voice => voice.lang === utterance.lang) || 
                            voices.find(voice => voice.lang.startsWith(utterance.lang.split('-')[0]));
      if (specificVoice) {
        utterance.voice = specificVoice;
      }

      utterance.onend = () => {
        if (type === 'input') setIsSpeakingInput(false); else setIsSpeakingOutput(false);
      };
      utterance.onerror = (event) => {
        console.error("Browser SpeechSynthesisUtterance error", event);
        toast({ 
          title: "Browser Speech Error", 
          description: `Could not speak text. Voice quality/availability for ${lang} depends on your browser/OS.`, 
          variant: "destructive" 
        });
        if (type === 'input') setIsSpeakingInput(false); else setIsSpeakingOutput(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Error in handleSpeak (Browser TTS):", e);
      toast({ title: "Speech Error", description: "An unexpected error occurred while trying to speak.", variant: "destructive" });
      if (type === 'input') setIsSpeakingInput(false); else setIsSpeakingOutput(false);
    }
  };

  const handleToggleListen = () => {
    if (!speechRecognition) {
       setSttError("Speech recognition (Mic icon) is not supported or enabled in your browser.");
      return;
    }
    if (isListening) {
      speechRecognition.stop();
    } else {
      try {
        speechRecognition.lang = languageToBcp47(currentSourceLang);
        speechRecognition.start();
        setSttError(null); 
      } catch (e) {
         console.error("Error starting speech recognition:", e);
         setSttError("Could not start voice input. Check microphone permissions.");
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
          Translate text. Use mic for voice input, speaker for text-to-speech.
          <span className="block text-xs mt-1 text-muted-foreground">Speech quality depends on your browser/OS.</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Label htmlFor="quick-source-language" className="mb-1 block text-sm font-medium">From</Label>
            <Select
              value={currentSourceLang}
              onValueChange={(value) => { if (mounted) setGlobalSourceLanguage(value as Language)}}
              disabled={!mounted || isLoadingTranslation || isSpeakingInput || isSpeakingOutput || isListening}
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
            <Button variant="ghost" size="icon" onClick={handleSwapLanguages} aria-label="Swap languages" disabled={!mounted || isLoadingTranslation || isSpeakingInput || isSpeakingOutput || isListening}>
              <ArrowRightLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 w-full">
            <Label htmlFor="quick-target-language" className="mb-1 block text-sm font-medium">To</Label>
            <Select
              value={currentTargetLang}
              onValueChange={(value) => { if (mounted) setGlobalTargetLanguage(value as Language)}}
              disabled={!mounted || isLoadingTranslation || isSpeakingInput || isSpeakingOutput || isListening}
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
            placeholder={`Enter text in ${currentSourceLang}... (or use microphone)`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="resize-none text-base p-3 rounded-md shadow-sm focus:ring-primary focus:border-primary pr-20"
            aria-label={`Input text in ${currentSourceLang}`}
            disabled={!mounted || isLoadingTranslation || isSpeakingInput || isSpeakingOutput || isListening}
          />
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleListen}
              disabled={!mounted || !browserSupportsSTT || isLoadingTranslation || isSpeakingInput || isSpeakingOutput}
              className={cn("h-8 w-8 p-1.5", isListening ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "hover:bg-accent")}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSpeak(inputText, currentSourceLang, 'input')}
              disabled={!mounted || !inputText.trim() || isLoadingTranslation || isSpeakingInput || isSpeakingOutput || isListening}
              className="h-8 w-8 p-1.5 hover:bg-accent"
              aria-label={`Speak input text in ${currentSourceLang}`}
            >
              {isSpeakingInput ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
         {sttError && <p className="text-xs text-destructive text-center mt-1 px-1 flex items-center justify-center gap-1"><AlertTriangle size={14}/> {sttError}</p>}
         {!browserSupportsSTT && mounted && <p className="text-xs text-amber-600 text-center mt-1 px-1 flex items-center justify-center gap-1"><AlertTriangle size={14}/> STT (Mic) not supported by this browser.</p>}


        <div className="relative">
            <Textarea
            placeholder={`Translation in ${currentTargetLang} will appear here...`}
            value={outputText}
            readOnly
            rows={4}
            className="bg-muted/30 resize-none text-base p-3 rounded-md shadow-sm border-dashed pr-10"
            aria-label={`Output text in ${currentTargetLang}`}
            />
            <div className="absolute top-2 right-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSpeak(outputText, currentTargetLang, 'output')}
                disabled={!mounted || !outputText.trim() || isLoadingTranslation || isSpeakingInput || isSpeakingOutput || isListening}
                className="h-8 w-8 p-1.5 hover:bg-accent"
                aria-label={`Speak translated text in ${currentTargetLang}`}
            >
                {isSpeakingOutput ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            </div>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={isLoadingTranslation || !inputText.trim() || !mounted || isSpeakingInput || isSpeakingOutput || isListening}
          className="w-full py-2.5 text-base font-semibold"
          size="lg"
        >
          {isLoadingTranslation ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Languages className="mr-2 h-5 w-5" />
          )}
          Translate
        </Button>

        {translationError && <p className="text-sm text-destructive text-center">{translationError}</p>}
        {!browserSupportsBrowserTTS && mounted && <p className="text-xs text-amber-600 text-center -mt-4 px-1 flex items-center justify-center gap-1"><AlertTriangle size={14}/> Browser TTS (Speaker icon) not supported.</p>}
      </CardContent>
    </Card>
  );
}

