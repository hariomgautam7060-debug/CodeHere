import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Code2
} from 'lucide-react';

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    tags: [],
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: {
      javascript: '',
      python: '',
      cpp: ''
    },
    solutionCode: {
      cpp: '',
      python: '',
      javascript: ''
    }
  });

  const [tagInput, setTagInput] = useState('');

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/problem/${id}`, {
          withCredentials: true
        });
        const data = response.data.problem;
        setFormData({
          title: data.title || '',
          description: data.description || '',
          difficulty: data.difficulty || 'Easy',
          inputFormat: data.inputFormat || '',
          outputFormat: data.outputFormat || '',
          constraints: data.constraints || '',
          tags: data.tags || [],
          examples: data.examples?.length > 0 ? data.examples : [{ input: '', output: '', explanation: '' }],
          testCases: data.testCases?.length > 0 ? data.testCases : [{ input: '', expectedOutput: '', isHidden: false }],
          starterCode: data.starterCode || { javascript: '', python: '', cpp: '' },
          solutionCode: data.solutionCode || { cpp: '', python: '', javascript: '' }
        });
      } catch (error) {
        console.error('Error fetching problem:', error);
        alert('Failed to fetch problem');
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStarterCodeChange = (language, value) => {
    setFormData(prev => ({
      ...prev,
      starterCode: { ...prev.starterCode, [language]: value }
    }));
  };

  const handleSolutionCodeChange = (language, value) => {
    setFormData(prev => ({
      ...prev,
      solutionCode: { ...prev.solutionCode, [language]: value }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const handleRemoveExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleExampleChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const handleAddTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const handleRemoveTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const cleanedData = {
        ...formData,
        examples: formData.examples.filter(ex => ex.input || ex.output),
        testCases: formData.testCases.filter(tc => tc.input && tc.expectedOutput)
      };

      await axios.put(`http://localhost:3000/problem/update/${id}`, cleanedData, {
        withCredentials: true
      });

      alert('✅ Problem updated successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating problem:', error);
      alert(error.response?.data?.message || '❌ Failed to update problem');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#0f0f23] px-4 md:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Edit Problem
            </span>
          </div>
          <Code2 className="w-8 h-8 text-yellow-400" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Problem Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty <span className="text-red-400">*</span>
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Input Format */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Input Format <span className="text-red-400">*</span>
            </label>
            <textarea
              name="inputFormat"
              value={formData.inputFormat}
              onChange={handleChange}
              required
              rows="2"
              className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Output Format <span className="text-red-400">*</span>
            </label>
            <textarea
              name="outputFormat"
              value={formData.outputFormat}
              onChange={handleChange}
              required
              rows="2"
              className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Constraints
            </label>
            <textarea
              name="constraints"
              value={formData.constraints}
              onChange={handleChange}
              rows="2"
              className="w-full bg-[#1a1a3e] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-[#1a1a3e] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Examples</label>
              <button type="button" onClick={handleAddExample} className="text-sm text-blue-400 hover:text-blue-300">
                + Add Example
              </button>
            </div>
            {formData.examples.map((example, index) => (
              <div key={index} className="bg-[#1a1a3e] p-4 rounded-lg mb-3 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">Example {index + 1}</span>
                  {formData.examples.length > 1 && (
                    <button type="button" onClick={() => handleRemoveExample(index)} className="text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="text" value={example.input} onChange={(e) => handleExampleChange(index, 'input', e.target.value)} className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Input" />
                  <input type="text" value={example.output} onChange={(e) => handleExampleChange(index, 'output', e.target.value)} className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Output" />
                  <input type="text" value={example.explanation} onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)} className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Explanation (optional)" />
                </div>
              </div>
            ))}
          </div>

          {/* Test Cases */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Test Cases <span className="text-red-400">*</span></label>
              <button type="button" onClick={handleAddTestCase} className="text-sm text-blue-400 hover:text-blue-300">
                + Add Test Case
              </button>
            </div>
            {formData.testCases.map((tc, index) => (
              <div key={index} className="bg-[#1a1a3e] p-4 rounded-lg mb-3 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">Test Case {index + 1}</span>
                  {formData.testCases.length > 1 && (
                    <button type="button" onClick={() => handleRemoveTestCase(index)} className="text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="text" value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Input" required />
                  <input type="text" value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)} className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Expected Output" required />
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)} className="accent-blue-500" />
                    Hidden Test Case
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Starter Code */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Starter Code</label>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">JavaScript</label>
                <textarea
                  value={formData.starterCode.javascript}
                  onChange={(e) => handleStarterCodeChange('javascript', e.target.value)}
                  rows="4"
                  className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Python</label>
                <textarea
                  value={formData.starterCode.python}
                  onChange={(e) => handleStarterCodeChange('python', e.target.value)}
                  rows="4"
                  className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">C++</label>
                <textarea
                  value={formData.starterCode.cpp}
                  onChange={(e) => handleStarterCodeChange('cpp', e.target.value)}
                  rows="4"
                  className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Official Solution */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Official Solution <span className="text-red-400">*</span>
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">C++ <span className="text-red-400">*</span></label>
                <textarea
                  value={formData.solutionCode.cpp}
                  onChange={(e) => handleSolutionCodeChange('cpp', e.target.value)}
                  rows="3"
                  className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Python</label>
                <textarea
                  value={formData.solutionCode.python}
                  onChange={(e) => handleSolutionCodeChange('python', e.target.value)}
                  rows="3"
                  className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">JavaScript</label>
                <textarea
                  value={formData.solutionCode.javascript}
                  onChange={(e) => handleSolutionCodeChange('javascript', e.target.value)}
                  rows="3"
                  className="w-full bg-[#0a0a1a] border border-gray-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Problem'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProblem;