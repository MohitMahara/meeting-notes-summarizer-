'use client';

import { useState } from 'react';
import ReactMarkdown from "react-markdown";


export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [summary, setSummary] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('raw');


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTranscript(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .txt file');
    }
  };

  const generateSummary = async () => {
    if (!transcript.trim()) {
      alert('Please upload a transcript file');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          customInstruction: customInstruction || 'Summarize the key points from this meeting',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!summary.trim()) {
      alert('Please generate a summary first');
      return;
    }

    if (!recipientEmails.trim()) {
      alert('Please enter recipient email addresses');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          recipients: recipientEmails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5 bg-white shadow-md rounded-lg my-6">
      <h1 className="text-3xl text-sky-950 font-bold mb-8 text-center">Meeting Notes Summarizer</h1>

      <div className="mb-5">
        <label>
          <strong>Upload Meeting Transcript (.txt file):</strong>
          <br />
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="mt-2"
          />
        </label>
      </div>

      <div className="mb-5">
        <label>
          <strong>Custom Instruction (optional):</strong>
          <br />
          <textarea
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder="e.g., Summarize in bullet points, Extract action items, etc."
            rows={3}
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          />
        </label>
      </div>

      <div className="mb-5">
        <button
          onClick={generateSummary}
          disabled={isGenerating || !transcript}
          className={`px-5 py-2 rounded text-white ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isGenerating ? 'Generating Summary...' : 'Generate Summary'}
        </button>
      </div>

      <div className="mb-5">
        <label>
          <strong>Generated Summary:</strong>
        </label>

        <div className="flex space-x-2 my-4">
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded ${viewMode === 'raw' ? 'bg-sky-950 text-white' : 'bg-gray-200'
              }`}
          >
            Raw
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded ${viewMode === 'preview' ? 'bg-sky-950 text-white' : 'bg-gray-200'
              }`}
          >
            Preview
          </button>
        </div>

        {viewMode === 'raw' ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Generated summary will appear here..."
            rows={10}
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          />
        ) : (
          <div className="prose border border-gray-300 rounded p-3 bg-gray-50">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="mb-5">
        <label>
          <strong>Recipient Email Addresses (comma separated):</strong>
          <br />
          <input
            type="text"
            value={recipientEmails}
            onChange={(e) => setRecipientEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          />
        </label>
      </div>

      <div>
        <button
          onClick={sendEmail}
          disabled={isSending || !summary || !recipientEmails}
          className={`px-5 py-2 rounded text-white ${isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {isSending ? 'Sending Email...' : 'Send Email'}
        </button>
      </div>
    </div>
  );
}
