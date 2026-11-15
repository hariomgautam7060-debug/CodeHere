import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Code2,
  Play,
  Send,
  Loader2,
  Copy,
  Check,
  Bot,
  User,
  MessageSquare,
  Trash2,
  X
} from 'lucide-react';

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [copied, setCopied] = useState(false);

  // ✅ Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/problem/${id}`, {
          withCredentials: true
        });
        const data = response.data.problem;
        setProblem(data);
        
        if (data.starterCode) {
          setCode(data.starterCode.javascript || '// Write your solution here');
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
        alert('Failed to fetch problem');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id, navigate]);

  // ✅ Load chat when opened
  useEffect(() => {
    if (showChat && id) {
      fetchChat();
    }
  }, [showChat, id]);

  // ✅ Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ✅ Fetch chat history
  const fetchChat = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/chat/${id}`, {
        withCredentials: true
      });
      setChatMessages(response.data.chat?.messages || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  // ✅ Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3000/chat/${id}`,
        { message: userMsg },
        { withCredentials: true }
      );

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.reply 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Failed to get response. Please try again.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ✅ Clear chat
  const handleClearChat = async () => {
    if (!confirm('Clear all chat messages?')) return;
    try {
      await axios.delete(`http://localhost:3000/chat/${id}`, {
        withCredentials: true
      });
      setChatMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (problem?.starterCode) {
      setCode(problem.starterCode[lang] || `// Write your solution in ${lang}`);
    }
  };

  // Handle code change
  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setSubmitting(true);
    setOutput(null);

    try {
      const response = await axios.post(
        'http://localhost:3000/submission',
        {
          problemId: id,
          language: language,
          code: code
        },
        { withCredentials: true }
      );

      const data = response.data;
      
      let status = '❌ Error';
      let outputText = '';
      let passed = 0;
      let total = 0;

      if (data.verdict === 'Accepted') {
        status = '✅ Accepted';
        passed = data.results?.filter(r => r.passed).length || 0;
        total = data.results?.length || 0;
        outputText = 'All test cases passed! 🎉';
        
        if (!problem.solvedByUser) {
          setProblem(prev => ({ ...prev, solvedByUser: true }));
          
          const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
          if (!solvedProblems.includes(id)) {
            solvedProblems.push(id);
            localStorage.setItem('solvedProblems', JSON.stringify(solvedProblems));
            window.dispatchEvent(new Event('problemSolved'));
          }
        }
        
      } else if (data.verdict === 'Wrong Answer') {
        status = '❌ Wrong Answer';
        const failed = data.results?.find(r => !r.passed);
        outputText = `Test Case ${data.testCase || failed?.testCase || ''} failed\n`;
        outputText += `Expected: ${failed?.expectedOutput || ''}\n`;
        outputText += `Got: ${failed?.actualOutput || ''}`;
        passed = data.results?.filter(r => r.passed).length || 0;
        total = data.results?.length || 0;
      } else if (data.verdict === 'Runtime Error') {
        status = '❌ Runtime Error';
        outputText = data.error || 'Execution failed';
        passed = 0;
        total = 0;
      } else {
        status = '❌ Error';
        outputText = data.message || 'Something went wrong';
      }

      setOutput({
        status: status,
        output: outputText,
        testCasesPassed: passed,
        totalTestCases: total || data.results?.length || 0,
        time: '0ms'
      });

    } catch (error) {
      console.error('Error submitting code:', error);
      setOutput({
        status: '❌ Error',
        output: error.response?.data?.message || 'Something went wrong',
        testCasesPassed: 0,
        totalTestCases: 0,
        time: '0ms'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle run code
  const handleRun = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setSubmitting(true);
    setOutput(null);

    try {
      const response = await axios.post(
        'http://localhost:3000/submission/run',
        {
          problemId: id,
          language: language,
          code: code
        },
        { withCredentials: true }
      );

      const data = response.data;
      
      let status = '❌ Error';
      let outputText = '';
      let passed = 0;
      let total = 0;

      if (data.verdict === 'Passed') {
        status = '✅ Passed';
        passed = data.results?.filter(r => r.passed).length || 0;
        total = data.results?.length || 0;
        outputText = 'All public test cases passed!';
      } else if (data.verdict === 'Wrong Answer') {
        status = '❌ Wrong Answer';
        const failed = data.results?.find(r => !r.passed);
        outputText = `Test Case ${data.testCase || failed?.testCase || ''} failed\n`;
        outputText += `Input: ${failed?.input || ''}\n`;
        outputText += `Expected: ${failed?.expectedOutput || ''}\n`;
        outputText += `Got: ${failed?.actualOutput || ''}`;
        passed = data.results?.filter(r => r.passed).length || 0;
        total = data.results?.length || 0;
      } else if (data.verdict === 'Runtime Error') {
        status = '❌ Runtime Error';
        outputText = data.error || 'Execution failed';
      } else {
        status = '❌ Error';
        outputText = data.message || 'Something went wrong';
      }

      setOutput({
        status: status,
        output: outputText,
        testCasesPassed: passed,
        totalTestCases: total || data.results?.length || 0,
        time: '0ms'
      });
    } catch (error) {
      console.error('Error running code:', error);
      setOutput({
        status: '❌ Error',
        output: error.response?.data?.message || 'Something went wrong',
        testCasesPassed: 0,
        totalTestCases: 0,
        time: '0ms'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Copy code
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-gray-400">Problem not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-800 bg-[#0f0f23] px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <span className="text-lg font-semibold truncate max-w-xs">
              {problem.title}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full ${
              problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
              problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {problem.difficulty}
            </span>
            {problem.solvedByUser && (
              <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Solved
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showChat 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-[#1a1a3e] text-gray-300 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </button>
            <Code2 className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Main content */}
        <div className={`flex flex-col lg:flex-row transition-all duration-300 ${showChat ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Left Panel - Description */}
          <div className="lg:w-1/2 overflow-y-auto p-4 md:p-6 border-r border-gray-800">
            <div className="flex gap-4 mb-4 border-b border-gray-800 pb-2">
              <button
                onClick={() => setActiveTab('description')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'description' ? 'text-white border-b-2 border-blue-500 pb-2' : 'text-gray-400 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('solution')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'solution' ? 'text-white border-b-2 border-blue-500 pb-2' : 'text-gray-400 hover:text-white'
                }`}
              >
                Solution
              </button>
            </div>

            {activeTab === 'description' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">{problem.title}</h2>
                  <p className="text-gray-300 whitespace-pre-wrap">{problem.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Input Format</h3>
                  <p className="text-gray-300 text-sm">{problem.inputFormat}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Output Format</h3>
                  <p className="text-gray-300 text-sm">{problem.outputFormat}</p>
                </div>

                {problem.constraints && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Constraints</h3>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{problem.constraints}</p>
                  </div>
                )}

                {problem.examples && problem.examples.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Examples</h3>
                    {problem.examples.map((ex, idx) => (
                      <div key={idx} className="bg-[#1a1a3e] p-3 rounded-lg mb-2">
                        <p className="text-sm text-gray-400">Input:</p>
                        <p className="text-sm font-mono text-white mb-2">{ex.input}</p>
                        <p className="text-sm text-gray-400">Output:</p>
                        <p className="text-sm font-mono text-white">{ex.output}</p>
                        {ex.explanation && (
                          <p className="text-sm text-gray-400 mt-2">Explanation: {ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Official solution will be shown here after solving.</p>
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="lg:w-1/2 flex flex-col bg-[#0f0f23]">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#1a1a3e] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyCode}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="w-full h-full bg-[#0a0a1a] text-gray-300 font-mono text-sm p-4 focus:outline-none resize-none"
                style={{ minHeight: '300px' }}
                spellCheck={false}
              />
            </div>

            {/* Output Panel */}
            {output && (
              <div className="border-t border-gray-800 bg-[#1a1a3e]">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-gray-400">Output</span>
                  <span className={`text-sm font-medium ${
                    output.status.includes('Accepted') || output.status.includes('Passed') 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {output.status}
                  </span>
                </div>
                <div className="p-4 pt-0 max-h-48 overflow-y-auto">
                  <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                    {output.output}
                  </pre>
                  {output.testCasesPassed !== undefined && (
                    <p className="text-xs text-gray-400 mt-2">
                      Passed {output.testCasesPassed}/{output.totalTestCases} test cases | Time: {output.time}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3 p-3 border-t border-gray-800 bg-[#0f0f23]">
              <button
                onClick={handleRun}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-80 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Chat Panel */}
        {showChat && (
          <div className="w-full lg:w-1/3 flex flex-col bg-[#0f0f23] border-l border-gray-800">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors lg:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-purple-400/50" />
                  <p>Hi! I'm your AI coding assistant.</p>
                  <p className="text-xs mt-2">Ask me anything about this problem!</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-500/20 text-white'
                        : 'bg-[#1a1a3e] text-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="bg-[#1a1a3e] rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about this problem..."
                  className="flex-1 bg-[#1a1a3e] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {chatLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;