import React from 'react';
import { TimeBlock } from '../types';

const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6:00 - 21:00

function getDayStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toTimeLabel(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const base = h % 12 === 0 ? 12 : h % 12;
  return `${base} ${ampm}`;
}

function generateTimeOptions(): Array<{ label: string; minutes: number }>{
  const options: Array<{ label: string; minutes: number }> = [];
  for (let h = 6; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const base = h % 12 === 0 ? 12 : h % 12;
      const label = `${base}:${m.toString().padStart(2, '0')} ${ampm}`;
      options.push({ label, minutes: (h - 6) * 60 + m });
    }
  }
  return options;
}

const rowHeightPx = 80; // each hour row height (doubled)

type Category = 'priority' | 'task' | 'habit' | 'connect' | 'custom';

const getCategoryStyles = (category: Category, isDarkMode: boolean): string => {
  if (isDarkMode) {
    const darkStyles: Record<Category, string> = {
      priority: 'bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-200 border border-purple-600',
      task: 'bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 text-indigo-200 border border-indigo-600',
      habit: 'bg-gradient-to-r from-teal-900/50 to-teal-800/50 text-teal-200 border border-teal-600',
      connect: 'bg-gradient-to-r from-orange-900/50 to-orange-800/50 text-orange-200 border border-orange-600',
      custom: 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 text-gray-200 border border-gray-600',
    };
    return darkStyles[category];
  } else {
    const lightStyles: Record<Category, string> = {
      priority: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 border border-purple-300',
      task: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-900 border border-indigo-300',
      habit: 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-900 border border-teal-300',
      connect: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-900 border border-orange-300',
      custom: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-300',
    };
    return lightStyles[category];
  }
};

const Timeblocking: React.FC<{
  isDarkMode: boolean;
  todaysDate?: Date;
  timeBlocks: TimeBlock[];
  onSaveBlocks: (blocks: TimeBlock[]) => void;
  presetIntent?: { label: string; category: Category } | null;
  onConsumeIntent?: () => void;
}> = ({ isDarkMode, todaysDate = new Date(), timeBlocks, onSaveBlocks, presetIntent, onConsumeIntent }) => {
  const [blocks, setBlocks] = React.useState<TimeBlock[]>(timeBlocks || []);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | undefined>(undefined);
  const [label, setLabel] = React.useState('');
  const [category, setCategory] = React.useState<Category>('task');
  const [startMin, setStartMin] = React.useState(0);
  const [endMin, setEndMin] = React.useState(30);

  const timeOptions = React.useMemo(() => generateTimeOptions(), []);
  React.useEffect(() => { setBlocks(timeBlocks || []); }, [timeBlocks]);

  const dayStart = getDayStart(todaysDate);

  const openAddModal = (preset?: { label?: string; category?: Category }) => {
    const now = new Date();
    const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();
    let s = Math.max(0, Math.min(hours.length * 60 - 15, minutesFromMidnight - 6 * 60));
    s = Math.round(s / 15) * 15;
    const e = Math.min(hours.length * 60, s + 30);
    setEditingId(undefined);
    setLabel(preset?.label ?? '');
    setCategory(preset?.category ?? 'task');
    setStartMin(s);
    setEndMin(e);
    setModalOpen(true);
  };

  React.useEffect(() => {
    if (presetIntent && !modalOpen && !editingId) {
      const existing = blocks.find(b => b.label === presetIntent.label);
      if (existing) {
        openEditModal(existing);
      } else {
        openAddModal({ label: presetIntent.label, category: presetIntent.category });
      }
      onConsumeIntent && onConsumeIntent();
    }
  }, [presetIntent, onConsumeIntent, modalOpen, editingId]);

  const openEditModal = (blk: TimeBlock) => {
    const s = new Date(blk.start);
    const e = new Date(blk.end);
    setEditingId(blk.id);
    setLabel(blk.label);
    setCategory((blk.category as Category) || 'task');
    setStartMin((s.getHours() - 6) * 60 + s.getMinutes());
    setEndMin((e.getHours() - 6) * 60 + e.getMinutes());
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveModal = () => {
    const start = new Date(dayStart);
    start.setHours(6, 0, 0, 0);
    start.setMinutes(start.getMinutes() + startMin);
    const end = new Date(dayStart);
    end.setHours(6, 0, 0, 0);
    end.setMinutes(end.getMinutes() + endMin);

    if (editingId) {
      const updated = blocks.map(b => b.id === editingId ? { ...b, start: start.toISOString(), end: end.toISOString(), category, label } : b);
      setBlocks(updated);
      onSaveBlocks(updated);
    } else {
      const newId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : `blk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newBlock: TimeBlock = { id: newId, start: start.toISOString(), end: end.toISOString(), category, label: label || 'Block' };
      const next = [...blocks, newBlock];
      setBlocks(next);
      onSaveBlocks(next);
    }
    closeModal();
  };

  const deleteModal = () => {
    if (!editingId) return;
    const next = blocks.filter(b => b.id !== editingId);
    setBlocks(next);
    onSaveBlocks(next);
    closeModal();
  };

  const renderBlock = (blk: TimeBlock) => {
    const s = new Date(blk.start);
    const e = new Date(blk.end);
    const startHour = s.getHours() + s.getMinutes() / 60;
    const endHour = e.getHours() + e.getMinutes() / 60;
    const top = (startHour - 6) * rowHeightPx;
    const height = Math.max(20, (endHour - startHour) * rowHeightPx);
    return (
      <div
        key={blk.id}
        className={`absolute left-12 right-2 rounded-md px-2 py-1 text-xs overflow-hidden cursor-pointer ${getCategoryStyles(blk.category as Category, isDarkMode)}`}
        style={{ top, height }}
        onClick={() => openEditModal(blk)}
      >
        <div className="font-medium truncate">{blk.label}</div>
        <div className="opacity-75 truncate">
          {s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className={`backdrop-blur-sm rounded-2xl p-4 shadow-lg border flex items-center justify-between ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'
      }`}>
        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {todaysDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <button onClick={() => openAddModal()} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Add time block</button>
      </div>

      <div className={`rounded-2xl shadow-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className={`p-3 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Today</div>
        <div className="relative" style={{ minHeight: hours.length * rowHeightPx }}>
          {hours.map(h => (
            <div key={h} className={`${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'}`} style={{ position: 'relative', height: rowHeightPx }}>
              <span className={`absolute left-2 top-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{toTimeLabel(h)}</span>
            </div>
          ))}
          {blocks.map(renderBlock)}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-xl border p-5 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editingId ? 'Edit time block' : 'Add time block'}</h3>
            <div className="space-y-3">
              <div>
                <label className={`text-sm mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                <input value={label} onChange={e => setLabel(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="e.g., Priority task" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-sm mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start</label>
                  <select value={startMin} onChange={e => setStartMin(Number(e.target.value))} className={`w-full px-2 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                    {timeOptions.map(opt => (
                      <option key={`s-${opt.minutes}`} value={opt.minutes}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-sm mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End</label>
                  <select value={endMin} onChange={e => setEndMin(Number(e.target.value))} className={`w-full px-2 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                    {timeOptions.map(opt => (
                      <option key={`e-${opt.minutes}`} value={opt.minutes}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={`text-sm mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                <div className="flex items-center flex-wrap gap-2">
                  {(['priority','task','habit','connect','custom'] as Category[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${category === cat ? 'ring-2 ring-offset-1 ring-blue-400' : ''} ${
                        cat === 'priority' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                        cat === 'task' ? 'bg-indigo-100 text-indigo-900 border-indigo-200' :
                        cat === 'habit' ? 'bg-teal-100 text-teal-900 border-teal-200' :
                        cat === 'connect' ? 'bg-orange-100 text-orange-900 border-orange-200' :
                        'bg-gray-100 text-gray-900 border-gray-200'
                      }`}
                    >{cat}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              {editingId && (
                <button onClick={deleteModal} className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/30 text-red-200 hover:bg-red-900/40' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>Delete</button>
              )}
              <button onClick={closeModal} className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
              <button onClick={saveModal} className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeblocking;
