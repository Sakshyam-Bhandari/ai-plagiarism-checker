import React, { useState, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker. This is essential for it to work in the browser.
// We provide the full, static URL to the worker script to avoid URL construction errors.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@^4.4.168/build/pdf.worker.mjs`;


const WORD_LIMIT = 15000;

interface InputControllerProps {
    onCheck: (text: string) => void;
    isLoading: boolean;
}

const countWords = (text: string): number => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const InputController: React.FC<InputControllerProps> = ({ onCheck, isLoading }) => {
    const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const wordCount = useMemo(() => countWords(text), [text]);
    const isOverLimit = wordCount > WORD_LIMIT;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (fileName) setFileName(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        setFileName(null);
        setText('');
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) { // 20MB limit
                setFileError("File is too large. Please upload files under 20MB.");
                return;
            }
            
            const supportedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            const isSupported = supportedTypes.some(type => file.type.startsWith(type)) || ['txt', 'md', 'pdf'].includes(fileExtension || '');

            if (!isSupported) {
                 setFileError("Unsupported file type. Please upload a .txt, .md, or .pdf file.");
                 return;
            }

            setFileName(file.name);
            
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                 try {
                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
                    const pdf = await loadingTask.promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                        fullText += pageText + '\n';
                    }
                    setText(fullText);
                } catch (pdfError) {
                    console.error("Error parsing PDF:", pdfError);
                    setFileError("Could not process the PDF file. It may be corrupted or protected.");
                }
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const fileContent = event.target?.result as string;
                    setText(fileContent);
                };
                reader.onerror = () => {
                    setFileError("Error reading the file.");
                }
                reader.readAsText(file);
            }
        }
    };
    
    const handleSubmit = () => {
        if (!isLoading && !isOverLimit && text.trim()) {
            onCheck(text);
        }
    }
    
    const tabClass = (tabName: 'text' | 'file') => 
        `px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors ${
            activeTab === tabName 
            ? 'bg-cyan-500 text-white' 
            : 'text-slate-300 hover:bg-slate-700'
        }`;
    
    const wordCountColor = isOverLimit ? 'text-red-500' : 'text-slate-400';

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl">
            <div className="flex space-x-2 border-b border-slate-700 mb-4 pb-4">
                <button onClick={() => setActiveTab('text')} className={tabClass('text')}>Paste Text</button>
                <button onClick={() => setActiveTab('file')} className={tabClass('file')}>Upload File</button>
            </div>

            {activeTab === 'text' && (
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Paste your text here to check for plagiarism..."
                    className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    disabled={isLoading}
                />
            )}
            
            {activeTab === 'file' && (
                <div className="w-full h-64 flex flex-col justify-center items-center bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg">
                    <label htmlFor="file-upload" className="cursor-pointer text-center p-4">
                        <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-cyan-400 font-semibold">Click to upload a file</p>
                        <p className="text-xs text-slate-500">.txt, .md, or .pdf files up to 20MB</p>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf" />
                    </label>
                    {fileName && !fileError && <p className="mt-2 text-sm text-green-400">File loaded: {fileName}</p>}
                    {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
                </div>
            )}
            
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
                <div className={`text-sm font-medium ${wordCountColor}`}>
                    Word Count: {wordCount} / {WORD_LIMIT}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || isOverLimit || !text.trim()}
                    className="w-full sm:w-auto mt-4 sm:mt-0 px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105"
                >
                    {isLoading ? 'Checking...' : 'Check Plagiarism'}
                </button>
            </div>
        </div>
    );
};

export default InputController;