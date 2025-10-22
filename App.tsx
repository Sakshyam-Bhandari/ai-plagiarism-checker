import React, { useState, useCallback } from 'react';
import { checkPlagiarism } from './services/geminiService';
import { PlagiarismResult } from './types';
import Header from './components/Header';
import InputController from './components/InputController';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PlagiarismResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheckPlagiarism = useCallback(async (text: string) => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const plagiarismResult = await checkPlagiarism(text);
            setResult(plagiarismResult);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-6 lg:p-8">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/40 opacity-50 -z-10"></div>
            <main className="container mx-auto">
                <Header />
                <InputController onCheck={handleCheckPlagiarism} isLoading={isLoading} />

                <div className="mt-8">
                    {isLoading && <Loader />}
                    
                    {error && (
                        <div className="max-w-4xl mx-auto p-4 bg-red-900/50 border border-red-700 rounded-lg text-center text-red-300">
                            <p><strong>Error:</strong> {error}</p>
                        </div>
                    )}

                    {result && !isLoading && <ResultDisplay result={result} />}
                </div>

                <footer className="text-center mt-12 py-6 text-slate-500 text-sm">
                    <p>Powered by Google Gemini. This is an AI-powered tool and may not be 100% accurate. Always verify sources.</p>
                </footer>
            </main>
        </div>
    );
};

export default App;