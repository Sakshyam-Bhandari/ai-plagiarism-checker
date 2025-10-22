import React from 'react';
import { PlagiarismResult, PlagiarismSource } from '../types';
import ScoreIndicator from './ScoreIndicator';

interface ResultDisplayProps {
  result: PlagiarismResult;
}

const SourceCard: React.FC<{ source: PlagiarismSource }> = ({ source }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-400/50 transition-colors">
        <blockquote className="border-l-4 border-cyan-400 pl-4 text-slate-300 italic">
            "{source.sourceText}"
        </blockquote>
        <div className="mt-3 flex justify-between items-center">
            {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm truncate pr-4">
                    {source.url}
                </a>
            ) : <span className="text-slate-500 text-sm">Source URL not available</span>}
            <div className="text-sm font-semibold text-white bg-slate-700 px-2 py-1 rounded">
                {source.similarity}% Match
            </div>
        </div>
    </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div id="results" className="w-full max-w-4xl mx-auto mt-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">Analysis Report</h2>
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 mb-6 p-4 border-b border-slate-700">
            <ScoreIndicator score={result.plagiarismScore} />
            <div className="flex-1 text-center md:text-left">
                <p className="text-lg font-semibold text-slate-200">Overall Plagiarism Score</p>
                <p className="text-slate-400 mt-2">{result.summary}</p>
            </div>
        </div>
        
        {result.potentialSources.length > 0 ? (
            <div>
                <h3 className="text-xl font-semibold text-slate-200 mb-4">Potential Sources Found</h3>
                <div className="space-y-4">
                    {result.potentialSources.map((source, index) => (
                       <SourceCard key={index} source={source} />
                    ))}
                </div>
            </div>
        ) : (
             <div className="text-center p-6 bg-slate-800/30 rounded-lg">
                <p className="text-green-400 font-semibold">No significant plagiarism detected.</p>
                <p className="text-slate-400 mt-1">The submitted text appears to be original.</p>
             </div>
        )}
    </div>
  );
};

export default ResultDisplay;