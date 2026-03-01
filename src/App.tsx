/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Key, 
  Copy, 
  Trash2, 
  Download, 
  Settings, 
  Film, 
  Music, 
  Volume2, 
  Camera, 
  Sun, 
  MessageSquare, 
  Type, 
  User, 
  MapPin, 
  Lightbulb, 
  Heart, 
  Youtube, 
  Facebook, 
  Send, 
  Globe, 
  Twitter, 
  Music2,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { translations } from './translations';

type Language = 'en' | 'kh';

interface Character {
  id: string;
  name: string;
  description: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('kh');
  const t = translations[lang];

  // Form State
  const [storyType, setStoryType] = useState('cartoon');
  const [coreIdea, setCoreIdea] = useState('');
  const [storySettings, setStorySettings] = useState('');
  const [theme, setTheme] = useState('friendship');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [moral, setMoral] = useState('');
  const [location, setLocation] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  
  // Technical State
  const [animType, setAnimType] = useState('2D Animation');
  const [renderStyle, setRenderStyle] = useState('Traditional');
  const [duration, setDuration] = useState('2');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [outputLang, setOutputLang] = useState('Khmer');
  const [frameRate, setFrameRate] = useState('Auto');
  
  const [elements, setElements] = useState({
    narrator: true,
    sfx: true,
    title: false,
    camera: true,
    bgm: true,
    styleMood: true,
    lighting: true,
    dialogue: true,
  });

  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleElement = (key: keyof typeof elements) => {
    setElements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addCharacter = () => {
    const newChar: Character = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: ''
    };
    setCharacters([...characters, newChar]);
  };

  const updateCharacter = (id: string, field: keyof Character, value: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const handleReset = () => {
    if (confirm(t.reset + '?')) {
      setCoreIdea('');
      setStorySettings('');
      setCharacters([]);
      setProblem('');
      setSolution('');
      setMoral('');
      setLocation('');
      setDirectorNotes('');
      setOutput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  const generatePrompt = async () => {
    if (!coreIdea && !storySettings) {
      alert('Please enter some ideas first!');
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are an expert animation prompt engineer. Based on the following story details, generate a structured JSON prompt for an animation generation tool.
        
        STORY DETAILS:
        - Type: ${storyType}
        - Core Idea: ${coreIdea}
        - Full Story Context: ${storySettings}
        - Theme/Emotion: ${theme}
        - Characters: ${characters.map(c => `${c.name}: ${c.description}`).join(', ')}
        - Problem: ${problem}
        - Solution: ${solution}
        - Moral: ${moral}
        - Location: ${location}
        - Director's Notes: ${directorNotes}
        
        TECHNICAL SETTINGS:
        - Animation: ${animType}
        - Style: ${renderStyle}
        - Duration: ${duration} minutes
        - Aspect Ratio: ${aspectRatio}
        - Language: ${outputLang}
        - Frame Rate: ${frameRate}
        - Elements to include: ${Object.entries(elements).filter(([_, v]) => v).map(([k]) => k).join(', ')}
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON object containing:
        - title: String
        - synopsis: String
        - scenes: Array of { scene_number: Number, description: String, visual_prompt: String, audio_prompt: String, camera_angle: String }
        - technical_metadata: Object
        
        Ensure the visual prompts are highly descriptive and match the ${renderStyle} style.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      setOutput(response.text || '');
    } catch (error) {
      console.error(error);
      alert('Error generating prompt. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullStory = async () => {
    if (!coreIdea) {
      alert('Please enter a core idea first!');
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Based on the following core idea, generate a detailed story outline, including characters, problem, solution, and moral.
        CORE IDEA: ${coreIdea}
        THEME: ${theme}
        STORY TYPE: ${storyType}
        
        Return the response in JSON format with the following structure:
        {
          "full_story": "string",
          "characters": [{"name": "string", "description": "string"}],
          "problem": "string",
          "solution": "string",
          "moral": "string",
          "location": "string"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.full_story) setStorySettings(data.full_story);
      if (data.characters) setCharacters(data.characters.map((c: any) => ({ ...c, id: Math.random().toString(36).substr(2, 9) })));
      if (data.problem) setProblem(data.problem);
      if (data.solution) setSolution(data.solution);
      if (data.moral) setMoral(data.moral);
      if (data.location) setLocation(data.location);

    } catch (error) {
      console.error(error);
      alert('Error generating story.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-slate-700/50 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Film className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {t.appName} <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t.appSubtitle}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-full transition-all text-sm font-medium"
          >
            <Languages size={16} />
            {lang === 'en' ? 'English' : 'ភាសាខ្មែរ'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-7 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
          {/* Create Idea Section */}
          <section className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                <Lightbulb size={20} /> {t.createIdea}
              </h2>
              <button onClick={() => setCoreIdea('')} className="btn-primary text-xs py-1.5">
                <Sparkles size={14} /> {t.newIdea}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t.storyType}</label>
                <select 
                  value={storyType}
                  onChange={(e) => setStoryType(e.target.value)}
                  className="input-field"
                >
                  <option value="cartoon">{t.cartoon}</option>
                  <option value="anime">{t.anime}</option>
                  <option value="fairyTale">{t.fairyTale}</option>
                  <option value="legend">{t.legend}</option>
                  <option value="history">{t.history}</option>
                  <option value="sciFi">{t.sciFi}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">{t.coreIdea}</label>
              <textarea 
                value={coreIdea}
                onChange={(e) => setCoreIdea(e.target.value)}
                placeholder={t.coreIdeaPlaceholder}
                className="input-field min-h-[80px] resize-none"
              />
            </div>
          </section>

          {/* Story Settings */}
          <section className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <Type size={20} /> {t.storySettings}
              </h2>
              <button 
                onClick={generateFullStory}
                disabled={isGenerating}
                className="btn-success text-xs py-1.5 disabled:opacity-50"
              >
                <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} /> {t.generateFullStory}
              </button>
            </div>
            <textarea 
              value={storySettings}
              onChange={(e) => setStorySettings(e.target.value)}
              placeholder={t.storySettingsPlaceholder}
              className="input-field min-h-[100px] resize-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1">
                  <Heart size={12} className="text-rose-400" /> {t.themeEmotion}
                </label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="input-field"
                >
                  <option value="friendship">{t.friendship}</option>
                  <option value="adventure">{t.adventure}</option>
                  <option value="fantasy">{t.fantasy}</option>
                  <option value="education">{t.education}</option>
                </select>
              </div>
            </div>

            {/* Characters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="label flex items-center gap-1">
                  <User size={12} /> {t.characters}
                </label>
                <button 
                  onClick={addCharacter}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={14} /> {t.addCharacter}
                </button>
              </div>
              
              <div className="space-y-2">
                {characters.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">{t.noCharacters}</p>
                ) : (
                  characters.map(char => (
                    <div key={char.id} className="flex gap-2 items-start bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                      <div className="flex-1 space-y-2">
                        <input 
                          value={char.name}
                          onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                          placeholder="Name"
                          className="w-full bg-transparent border-b border-slate-600 text-sm focus:border-blue-500 outline-none"
                        />
                        <input 
                          value={char.description}
                          onChange={(e) => updateCharacter(char.id, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full bg-transparent text-xs text-slate-400 outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => removeCharacter(char.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t.storyProblem}</label>
                <input 
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder={t.storyProblemPlaceholder}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">{t.solution}</label>
                <input 
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder={t.solutionPlaceholder}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">{t.moral}</label>
              <input 
                value={moral}
                onChange={(e) => setMoral(e.target.value)}
                placeholder={t.moralPlaceholder}
                className="input-field"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1">
                <MapPin size={12} /> {t.location}
              </label>
              <input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">{t.directorNotes}</label>
              <textarea 
                value={directorNotes}
                onChange={(e) => setDirectorNotes(e.target.value)}
                placeholder={t.directorNotesPlaceholder}
                className="input-field min-h-[60px] resize-none"
              />
            </div>
          </section>

          {/* Technical Config */}
          <section className="card space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-400 border-b border-slate-700 pb-2">
              <Settings size={20} /> {t.technicalConfig}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label">{t.animationType}</label>
                <select value={animType} onChange={(e) => setAnimType(e.target.value)} className="input-field">
                  <option>2D Animation</option>
                  <option>3D Animation</option>
                  <option>Live Action</option>
                </select>
              </div>
              <div>
                <label className="label">{t.renderStyle}</label>
                <select value={renderStyle} onChange={(e) => setRenderStyle(e.target.value)} className="input-field">
                  <option>{t.traditional}</option>
                  <option>{t.modern}</option>
                  <option>{t.cinematic}</option>
                </select>
              </div>
              <div>
                <label className="label">{t.duration}</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">{t.aspectRatio}</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="input-field">
                  <option>16:9 (Landscape)</option>
                  <option>9:16 (Portrait)</option>
                  <option>1:1 (Square)</option>
                </select>
              </div>
              <div>
                <label className="label">{t.language}</label>
                <select value={outputLang} onChange={(e) => setOutputLang(e.target.value)} className="input-field">
                  <option>Khmer</option>
                  <option>English</option>
                  <option>Chinese</option>
                </select>
              </div>
              <div>
                <label className="label">{t.frameRate}</label>
                <select value={frameRate} onChange={(e) => setFrameRate(e.target.value)} className="input-field">
                  <option>Auto</option>
                  <option>24 FPS</option>
                  <option>30 FPS</option>
                  <option>60 FPS</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="label">{t.elements}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'narrator', label: t.narrator, icon: Volume2 },
                  { id: 'sfx', label: t.sfx, icon: Music2 },
                  { id: 'title', label: t.title, icon: Type },
                  { id: 'camera', label: t.camera, icon: Camera },
                  { id: 'bgm', label: t.bgm, icon: Music },
                  { id: 'styleMood', label: t.styleMood, icon: Sparkles },
                  { id: 'lighting', label: t.lighting, icon: Sun },
                  { id: 'dialogue', label: t.dialogue, icon: MessageSquare },
                ].map(el => (
                  <button
                    key={el.id}
                    onClick={() => toggleElement(el.id as keyof typeof elements)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      elements[el.id as keyof typeof elements] 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    <el.icon size={14} />
                    {el.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Footer Info */}
          <footer className="card bg-slate-900/50 border-none space-y-4">
            <div className="flex justify-center gap-6 text-slate-400">
              <Youtube size={20} className="hover:text-red-500 cursor-pointer transition-colors" />
              <Facebook size={20} className="hover:text-blue-500 cursor-pointer transition-colors" />
              <Send size={20} className="hover:text-sky-500 cursor-pointer transition-colors" />
              <Globe size={20} className="hover:text-emerald-500 cursor-pointer transition-colors" />
              <Twitter size={20} className="hover:text-blue-400 cursor-pointer transition-colors" />
              <Music2 size={20} className="hover:text-pink-500 cursor-pointer transition-colors" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-300">{t.footerText}</p>
              <p className="text-xs text-slate-500">{t.contact}</p>
            </div>
            <button className="w-full btn-primary justify-center py-2.5">
              <Key size={16} /> {t.solutionService}
            </button>
          </footer>
        </div>

        {/* Right Column - Actions & Output */}
        <div className="lg:col-span-5 space-y-6">
          <section className="card space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-400">
              {t.activity}
            </h2>
            
            <button 
              onClick={generatePrompt}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold shadow-lg transition-all ${
                isGenerating 
                  ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 hover:scale-[1.02]'
              }`}
            >
              <Sparkles className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? t.generating : t.generatePrompt}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button className="btn-primary justify-center">
                <Key size={16} /> {t.apiKey}
              </button>
              <button className="btn-success justify-center">
                <Save size={16} /> {t.saveProject}
              </button>
              <button className="btn-secondary justify-center">
                <FolderOpen size={16} /> {t.openProject}
              </button>
              <button onClick={handleReset} className="btn-danger justify-center">
                <RotateCcw size={16} /> {t.reset}
              </button>
            </div>
          </section>

          <section className="card flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                <Download size={20} /> {t.jsonPrompt}
              </h2>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors" title={t.copyAll}>
                  <Copy size={16} />
                </button>
                <button onClick={() => setOutput('')} className="p-2 bg-slate-800 hover:bg-rose-900/30 rounded-lg text-rose-400 transition-colors" title={t.clear}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-auto border border-slate-800">
              {output ? (
                <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    <Download size={24} />
                  </div>
                  <p>{t.outputPlaceholder}</p>
                </div>
              )}
            </div>
            
            <button className="mt-4 w-full btn-danger justify-center py-2">
              {t.clear}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
