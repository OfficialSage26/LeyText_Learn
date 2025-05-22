
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
import { synthesizeSpeech } from '@/ai/flows/synthesize-speech-flow';
import { useToast } from "@/hooks/use-toast";
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';

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
    case "Bisaya": return "ceb-PH"; // Cebuano is a common Bisayan language
    case "Waray-Waray": return "war-PH";
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
    // Directly update global context for immediate effect
    const oldSource = globalSourceLanguage;
    const oldTarget = globalTargetLanguage;
    setGlobalSourceLanguage(oldTarget); 
    setGlobalTargetLanguage(oldSource);

    // Local display state will be updated by its own useEffect hook listening to global changes
    // Swap text fields if output has content
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
    // Use current display languages for the actual translation logic, which are synced with global
    if (currentSourceLang === currentTargetLang) {
      setOutputText(inputText);
      return;
    }

    setIsLoadingTranslation(true);
    setTranslationError(null);
    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage: currentSourceLang, // Use current display state for API
        targetLanguage: currentTargetLang, // Use current display state for API
      });
      setOutputText(result.translatedText);
    } catch (e) {
      console.error("Translation error:", e);
      setTranslationError("Failed to translate text. Please try again.");
      toast({
        title: "Translation Error",
        description: "Could not translate the text. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  const playBase64Audio = (base64Audio: string, type: 'input' | 'output') => {
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    const currentSpeakingSetter = type === 'input' ? setIsSpeakingInput : setIsSpeakingOutput;
    
    audio.onended = () => currentSpeakingSetter(false);
    audio.onerror = (err) => {
      console.error("Error playing base64 audio:", err);
      toast({ title: "Audio Playback Error", description: "Could not play synthesized audio.", variant: "destructive" });
      currentSpeakingSetter(false);
    };
    
    audio.play().catch(err => {
        console.error("Error initiating base64 audio playback:", err);
        toast({ title: "Audio Playback Error", description: "Could not play synthesized audio.", variant: "destructive" });
        currentSpeakingSetter(false);
    });
  };

  const speakWithBrowserTTS = (text: string, lang: Language, type: 'input' | 'output') => {
    if (!browserSupportsBrowserTTS || !window.speechSynthesis) {
      toast({ title: "TTS Not Available", description: "Browser-based speech synthesis is not supported.", variant: "destructive" });
      if (type === 'input') setIsSpeakingInput(false); else setIsSpeakingOutput(false);
      return;
    }
    
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageToBcp47(lang);
    
    // Attempt to find a voice specific to the language code
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
      toast({ title: "Browser Speech Error", description: `Could not speak text. Voice quality/availability for ${lang} depends on your browser/OS.`, variant: "destructive" });
      if (type === 'input') setIsSpeakingInput(false); else setIsSpeakingOutput(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeak = async (text: string, lang: Language, type: 'input' | 'output') => {
    if (!text.trim()) return;
    
    const currentSpeakingState = type === 'input' ? isSpeakingInput : isSpeakingOutput;
    const currentSpeakingSetter = type === 'input' ? setIsSpeakingInput : setIsSpeakingOutput;

    if (currentSpeakingState) { 
      window.speechSynthesis.cancel(); // Stop browser TTS if it's speaking
      currentSpeakingSetter(false); 
      return; 
    }

    currentSpeakingSetter(true);

    try {
      const { audioBase64, source: ttsSource } = await synthesizeSpeech({ text, language: lang });

      if (audioBase64) {
        playBase64Audio(audioBase64, type);
      } else if (ttsSource === 'browser' || ttsSource === 'none') {
        let toastMessage = `Using browser's default voice for ${lang}. Quality may vary.`;
        if (lang === "Tagalog" && ttsSource === 'browser') { // Only show this specific Tagalog message if explicitly told it's a browser fallback
          toastMessage = `Premium Filipino voice not available or configured, using browser's default voice for Tagalog. Quality may vary.`;
        }
        toast({
          title: "TTS Notice",
          description: toastMessage,
          variant: "default" 
        });
        speakWithBrowserTTS(text, lang, type);
      } else {
        // Should not happen if flow returns 'browser' or 'none' when audioBase64 is null
        toast({ title: "TTS Error", description: `Could not get audio for ${lang}.`, variant: "destructive" });
        currentSpeakingSetter(false);
      }
    } catch (error) {
      console.error("Error calling synthesizeSpeech flow or playing audio:", error);
      toast({ title: "Speech Error", description: `Could not synthesize or play speech for ${lang}. Falling back to browser TTS.`, variant: "destructive" });
      speakWithBrowserTTS(text, lang, type); // Fallback
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
      } catch (e: any) {
         console.error("Error starting speech recognition:", e);
         setSttError(`Could not start voice input: ${e.message || "Check microphone permissions."}`);
         setIsListening(false);
      }
    }
  };

  const sourcePlaceholder = mounted ? `Enter text in ${currentSourceLang}... (or use microphone)` : "Loading languages...";
  const targetPlaceholder = mounted ? `Translation in ${currentTargetLang} will appear here...` : "Loading languages...";
  const sourceAriaLabel = mounted ? `Input text in ${currentSourceLang}` : "Input text area";
  const targetAriaLabel = mounted ? `Output text in ${currentTargetLang}` : "Output text area";

  // Effect to update local language states if global context changes
  useEffect(() => {
    if (mounted) {
      setCurrentSourceLang(globalSourceLanguage);
      setCurrentTargetLang(globalTargetLanguage);
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage]);


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Languages className="inline-block mr-2 h-7 w-7 text-primary" />
          Quick Translator
        </CardTitle>
        <CardDescription>
          Translate text. Use mic for voice input, speaker for text-to-speech.
          <span className="block text-xs mt-1 text-muted-foreground">Speech quality depends on API configuration, browser/OS, or cloud service availability.</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Label htmlFor="quick-source-language" className="mb-1 block text-sm font-medium">From</Label>
            <Select
              value={currentSourceLang} // Use local state for display
              onValueChange={(value) => { if (mounted) setGlobalSourceLanguage(value as Language)}} // Update global context
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
              value={currentTargetLang} // Use local state for display
              onValueChange={(value) => { if (mounted) setGlobalTargetLanguage(value as Language)}} // Update global context
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
            placeholder={sourcePlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="resize-none text-base p-3 rounded-md shadow-sm focus:ring-primary focus:border-primary pr-20"
            aria-label={sourceAriaLabel}
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
              disabled={!mounted || !inputText.trim() || isLoadingTranslation || isSpeakingOutput || isListening }
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
            placeholder={targetPlaceholder}
            value={outputText}
            readOnly
            rows={4}
            className="bg-muted/30 resize-none text-base p-3 rounded-md shadow-sm border-dashed pr-10"
            aria-label={targetAriaLabel}
            />
            <div className="absolute top-2 right-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSpeak(outputText, currentTargetLang, 'output')}
                disabled={!mounted || !outputText.trim() || isLoadingTranslation || isSpeakingInput || isListening }
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
