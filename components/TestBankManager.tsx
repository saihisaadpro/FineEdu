import React, { useState } from 'react';
import { Edit2, FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Module, Question, Topic } from '../types';
import { Button } from './Button';

interface TestBankManagerProps {
  topic: Topic;
  module: Module;
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
}

export const TestBankManager: React.FC<TestBankManagerProps> = ({
  topic,
  module,
  questions,
  onUpdateQuestions,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});

  const handleAddManual = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: `Add a new scenario for ${topic.title}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 0,
      explanation: 'Explain why the selected answer is the strongest choice.',
      difficulty: 'medium',
      type: 'bank',
      isCustom: true,
    };

    onUpdateQuestions([newQuestion, ...questions]);
    setEditingId(newQuestion.id);
    setEditForm(newQuestion);
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditForm({ ...question });
  };

  const handleSave = () => {
    if (!editingId) {
      return;
    }

    const updated = questions.map((question) =>
      question.id === editingId ? ({ ...question, ...editForm } as Question) : question,
    );

    onUpdateQuestions(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    onUpdateQuestions(questions.filter((question) => question.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditForm({});
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Test Bank Management</h3>
          <p className="text-sm text-slate-500 mt-1">
            Edit the local scenario set for <span className="font-semibold text-slate-700">{topic.title}</span> in {module.title}.
          </p>
        </div>
        <Button onClick={handleAddManual} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-slate-900 font-medium mb-1">No questions yet</p>
          <p className="text-sm text-slate-500 mb-5">Add a local question to build the topic assessment.</p>
          <Button onClick={handleAddManual}>Create First Question</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => {
            const isEditing = editingId === question.id;

            return (
              <div
                key={question.id}
                className={clsx(
                  'rounded-xl border p-5 transition-all',
                  isEditing ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50/60',
                )}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Question</label>
                      <textarea
                        value={editForm.text}
                        onChange={(event) => setEditForm({ ...editForm, text: event.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Difficulty</label>
                      <select
                        value={editForm.difficulty}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            difficulty: event.target.value as Question['difficulty'],
                          })
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {editForm.options?.map((option, optionIndex) => (
                        <div key={`${question.id}-option-${optionIndex}`} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="radio"
                              checked={editForm.correctAnswerIndex === optionIndex}
                              onChange={() => setEditForm({ ...editForm, correctAnswerIndex: optionIndex })}
                            />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                              Option {String.fromCharCode(65 + optionIndex)}
                            </span>
                          </div>
                          <input
                            value={option}
                            onChange={(event) => {
                              const nextOptions = [...(editForm.options || [])];
                              nextOptions[optionIndex] = event.target.value;
                              setEditForm({ ...editForm, options: nextOptions });
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Explanation</label>
                      <textarea
                        value={editForm.explanation}
                        onChange={(event) => setEditForm({ ...editForm, explanation: event.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button type="button" size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={clsx(
                                'text-[10px] font-bold uppercase px-2 py-0.5 rounded border',
                                question.difficulty === 'easy'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : question.difficulty === 'medium'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-red-50 text-red-700 border-red-200',
                              )}
                            >
                              {question.difficulty}
                            </span>
                            {question.isCustom && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-900">{question.text}</p>
                          <p className="text-sm text-slate-500 mt-2">Best answer: {question.options[question.correctAnswerIndex]}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEdit(question)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(question.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
