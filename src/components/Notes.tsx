import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Trash2, Edit2, Check, X, Palette } from 'lucide-react';

interface NotesProps {
  notes: Note[];
  onAdd: (text: string, color: string) => void;
  onUpdate: (id: string, text: string, color: string) => void;
  onDelete: (id: string) => void;
  isDarkMode?: boolean;
}

const COLORS = [
  { name: 'Yellow', className: 'bg-yellow-200', text: 'text-yellow-900' },
  { name: 'Pink', className: 'bg-pink-200', text: 'text-pink-900' },
  { name: 'Blue', className: 'bg-blue-200', text: 'text-blue-900' },
  { name: 'Green', className: 'bg-green-200', text: 'text-green-900' },
  { name: 'Purple', className: 'bg-purple-200', text: 'text-purple-900' },
  { name: 'Orange', className: 'bg-orange-200', text: 'text-orange-900' },
];

const defaultColor = COLORS[0].className;

const Notes: React.FC<NotesProps> = ({ notes, onAdd, onUpdate, onDelete, isDarkMode = false }) => {
  const [newText, setNewText] = useState('');
  const [newColor, setNewColor] = useState<string>(defaultColor);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState<string>(defaultColor);

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
    setEditColor(note.color || defaultColor);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditColor(defaultColor);
  };

  const submitNew = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim(), newColor);
    setNewText('');
    setNewColor(defaultColor);
    setCreating(false);
  };

  const submitEdit = () => {
    if (!editingId) return;
    onUpdate(editingId, editText.trim(), editColor);
    cancelEdit();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className={`rounded-2xl p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notes</h1>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
          >
            <Plus size={16} /> New Note
          </button>
        </div>
      </div>

      {/* Create Note Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New Note</h2>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Write a quick note..."
                className={`w-full p-3 rounded-xl resize-none h-32 focus:outline-none ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'}`}
              />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.className}
                        onClick={() => setNewColor(c.className)}
                        className={`w-7 h-7 rounded ring-2 ${newColor === c.className ? 'ring-blue-500' : 'ring-transparent'} ${c.className}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCreating(false)} className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><X size={14} className="mr-1 inline"/> Cancel</button>
                  <button onClick={submitNew} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500"><Check size={14} className="mr-1 inline"/> Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Note</h2>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className={`w-full p-3 rounded-xl resize-none h-32 focus:outline-none ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'}`}
              />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.className}
                        onClick={() => setEditColor(c.className)}
                        className={`w-7 h-7 rounded ring-2 ${editColor === c.className ? 'ring-blue-500' : 'ring-transparent'} ${c.className}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={cancelEdit} className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><X size={14} className="mr-1 inline"/> Cancel</button>
                  <button onClick={submitEdit} className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-500"><Check size={14} className="mr-1 inline"/> Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => {
          const color = COLORS.find(c => c.className === note.color) || COLORS[0];
          return (
            <div key={note.id} className={`rounded-xl p-4 shadow border ${color.className} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`whitespace-pre-wrap flex-1 ${color.text}`}>{note.text}</p>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button onClick={() => startEdit(note)} title="Edit" className={`${isDarkMode ? 'text-gray-800' : 'text-gray-700'} hover:opacity-80`}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(note.id)} title="Delete" className={`${isDarkMode ? 'text-gray-800' : 'text-gray-700'} hover:opacity-80`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notes;
