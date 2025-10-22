import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center my-8 md:my-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
                AI Plagiarism Checker
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Leverage the power of Gemini to analyze your text for originality. Paste your content or upload a file to get a detailed report.
            </p>
        </header>
    );
};

export default Header;