'use client';

import { useMemo, useState } from 'react';
import { FaCheck, FaCopy, FaSearch, FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { toast } from 'react-toastify';

import {
  CHANNEL_COLORS,
  MESSAGE_TEMPLATES,
  type MessageTemplate,
  type TemplateChannel,
} from '@/data/messageTemplates';

const CHANNELS: TemplateChannel[] = ['WhatsApp', 'Email', 'Internal', 'WhatsApp/Email'];

function ChannelBadge({ channel }: { channel: TemplateChannel }) {
  const c = CHANNEL_COLORS[channel];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}
    >
      {(channel === 'WhatsApp' || channel === 'WhatsApp/Email') && (
        <FaWhatsapp className="text-[11px]" />
      )}
      {channel === 'Email' && <MdEmail className="text-[11px]" />}
      {channel}
    </span>
  );
}

function TemplateCard({ tpl }: { tpl: MessageTemplate }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(tpl.message);
    setCopied(true);
    toast.success(`"${tpl.name}" copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(tpl.message)}`;
  const isWhatsApp  = tpl.channel === 'WhatsApp' || tpl.channel === 'WhatsApp/Email';

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-50 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate font-bold text-gray-900">{tpl.name}</p>
          <p className="mt-0.5 text-xs text-gray-400">{tpl.whenToUse}</p>
        </div>
        <ChannelBadge channel={tpl.channel} />
      </div>

      {/* Message body */}
      <div className="flex-1 px-5 py-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{tpl.message}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-50 px-5 py-3">
        <button
          type="button"
          onClick={() => void copy()}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-opsh-primary/30 hover:bg-opsh-primary/5 hover:text-opsh-primary'
          }`}
        >
          {copied ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>

        {isWhatsApp && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <FaWhatsapp />
            Send
          </a>
        )}
      </div>
    </div>
  );
}

export default function MessageTemplatesView() {
  const [search, setSearch]           = useState('');
  const [channelFilter, setChannel]   = useState<TemplateChannel | ''>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return MESSAGE_TEMPLATES.filter((t) => {
      if (channelFilter && t.channel !== channelFilter) return false;
      if (!term) return true;
      return (
        t.name.toLowerCase().includes(term) ||
        t.whenToUse.toLowerCase().includes(term) ||
        t.message.toLowerCase().includes(term)
      );
    });
  }, [search, channelFilter]);

  const inputClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Templates',  value: MESSAGE_TEMPLATES.length,                                     cls: 'border-opsh-primary/20 bg-opsh-primary/5 text-opsh-primary' },
          { label: 'WhatsApp',         value: MESSAGE_TEMPLATES.filter((t) => t.channel.includes('WhatsApp')).length, cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
          { label: 'WhatsApp / Email', value: MESSAGE_TEMPLATES.filter((t) => t.channel === 'WhatsApp/Email').length, cls: 'border-purple-200 bg-purple-50 text-purple-700' },
          { label: 'Internal',         value: MESSAGE_TEMPLATES.filter((t) => t.channel === 'Internal').length,       cls: 'border-slate-200 bg-slate-100 text-slate-600' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border px-4 py-3 ${c.cls}`}>
            <p className="text-xs font-medium opacity-75">{c.label}</p>
            <p className="mt-1 text-2xl font-black">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} w-full pl-9`}
          />
        </div>

        <select
          value={channelFilter}
          onChange={(e) => setChannel(e.target.value as TemplateChannel | '')}
          className={inputClass}
        >
          <option value="">All Channels</option>
          {CHANNELS.map((ch) => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">
        Showing <strong>{filtered.length}</strong> of <strong>{MESSAGE_TEMPLATES.length}</strong> templates
      </p>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400">
          No templates match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} />
          ))}
        </div>
      )}
    </div>
  );
}
