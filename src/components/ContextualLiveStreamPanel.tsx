import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ActivityStreamRecord,
  DivisionRecord,
  GlobalRole,
  PinRecord,
  SpecialtyDepartment,
} from '../types/schema';
import { getDepartmentMeta } from '../data/initialDatabase';
import {
  Mic,
  Play,
  Pause,
  Send,
  Lock,
  Unlock,
  Edit3,
  MapPin,
  Square,
  MessageSquare,
} from 'lucide-react';

export type StreamCategoryTab = 'all' | 'revisi' | 'voice_note' | 'material';

interface ContextualLiveStreamPanelProps {
  activities: ActivityStreamRecord[];
  pins?: PinRecord[];
  divisions?: DivisionRecord[];
  activeAreaId: string;
  activeAreaName: string;
  activeDepartmentFilter: SpecialtyDepartment;
  selectedPin: PinRecord | undefined;
  activeRole: GlobalRole;
  activeUserName: string;
  canUserChat?: boolean;
  generalNote: string;
  onSaveGeneralNote: (nextNote: string) => void;
  chatLeaderOnly: boolean;
  onToggleChatLeaderOnly: (nextVal: boolean) => void;
  onSendTextMessage: (content: string, bindToSelectedPin: boolean) => void;
  onSendVoiceNote: (
    durationSec: number,
    transcriptSummary: string,
    bindToSelectedPin: boolean
  ) => void;
  onSelectPinFromStream: (pinId: string) => void;
  onQuickApprovePin?: (pin: PinRecord) => void;
  onQuickRejectPin?: (pin: PinRecord, reason: string) => void;
  onOpenPinVerification?: (pinId: string) => void;
  onOpenTeamPermissions?: () => void;
}

export const ContextualLiveStreamPanel: React.FC<
  ContextualLiveStreamPanelProps
> = ({
  activities,
  pins = [],
  divisions,
  activeAreaId,
  activeAreaName,
  activeDepartmentFilter,
  selectedPin,
  activeRole,
  canUserChat,
  generalNote,
  onSaveGeneralNote,
  chatLeaderOnly,
  onToggleChatLeaderOnly,
  onSendTextMessage,
  onSendVoiceNote,
  onSelectPinFromStream,
  onOpenTeamPermissions,
}) => {
  const isLeader = activeRole === 'owner' || activeRole === 'mandor';
  const activeDivisionMeta = getDepartmentMeta(
    activeDepartmentFilter === 'all' ? 'listrik' : activeDepartmentFilter,
    divisions
  );

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(generalNote);

  useEffect(() => {
    setDraftNote(generalNote);
  }, [generalNote]);

  const [bindMessageToPin, setBindMessageToPin] = useState<boolean>(true);
  const [textInput, setTextInput] = useState<string>('');

  // State Perekam Voice Note Maks 15s
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<number | null>(null);

  // State Pemutar Audio Voice Note
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [playbackElapsed, setPlaybackElapsed] = useState<number>(0);
  const playbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecordingVoice) {
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => (prev >= 15 ? 15 : prev + 1));
      }, 1000);
    } else if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleToggleVoiceRecord = () => {
    if (isRecordingVoice) {
      const finalSec = Math.max(2, recordingSeconds);
      setIsRecordingVoice(false);
      setRecordingSeconds(0);
      const pinLabel =
        bindMessageToPin && selectedPin
          ? `for pin ${selectedPin.pin_code}`
          : `in ${activeAreaName} (${activeDivisionMeta.shortLabel})`;
      onSendVoiceNote(
        finalSec,
        `Field voice note (${finalSec}s) ${pinLabel}.`,
        bindMessageToPin
      );
    } else {
      setRecordingSeconds(1);
      setIsRecordingVoice(true);
    }
  };

  const handlePlayVoiceMessage = (msg: ActivityStreamRecord) => {
    if (playingMessageId === msg.id) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setPlayingMessageId(null);
      setPlaybackElapsed(0);
      return;
    }

    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    const totalDur = msg.voice_duration_sec || 12;
    setPlayingMessageId(msg.id);
    setPlaybackElapsed(0);

    playbackTimerRef.current = window.setInterval(() => {
      setPlaybackElapsed((prev) => {
        if (prev + 1 >= totalDur) {
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          setPlayingMessageId(null);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Setiap area blueprint dan divisi yang sedang dibuka di layar memiliki Chat Room terfokus
  const areaChatMessages = useMemo(() => {
    const targetDept =
      activeDepartmentFilter === 'all' ? 'listrik' : activeDepartmentFilter;
    const filtered = activities.filter(
      (item) =>
        item.blueprint_id === activeAreaId &&
        (!item.department ||
          item.department === 'all' ||
          item.department === targetDept)
    );
    return [...filtered].reverse();
  }, [activities, activeAreaId, activeDepartmentFilter]);

  const canSendChat =
    isLeader || Boolean(canUserChat) || !chatLeaderOnly;

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !canSendChat) return;
    onSendTextMessage(textInput.trim(), bindMessageToPin);
    setTextInput('');
  };

  return (
    <div className="flex flex-col h-full justify-between text-[13px]">
      {/* 1. HEADER IDENTITAS CHAT ROOM AREA & DIVISI AKTIF */}
      <div className="p-3 border-b border-[#E2E6EC] dark:border-[#263346] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-[#1B365D] dark:text-[#D97706] shrink-0" />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-[#141619] dark:text-[#F8FAFC] truncate">
                Chat: {activeAreaName} ({activeDivisionMeta.shortLabel})
              </div>
              <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                Follows active floor plan division ({activeDivisionMeta.shortLabel})
              </div>
            </div>
          </div>

          {isLeader && (
            <button
              type="button"
              onClick={() => onToggleChatLeaderOnly(!chatLeaderOnly)}
              title="Change Chat access"
              className="h-7 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] flex items-center gap-1 shrink-0"
            >
              {chatLeaderOnly ? (
                <>
                  <Lock className="w-3 h-3 text-[#B45309]" />
                  <span>Owner &amp; Foreman</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-[#16A34A]" />
                  <span>All Members</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Catatan Arahan Area */}
        <div className="p-2 rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346]">
          {!isEditingNote ? (
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] text-[#475569] dark:text-[#94A3B8] line-clamp-2">
                <strong className="text-[#141619] dark:text-[#F8FAFC]">
                  Area note:
                </strong>{' '}
                {generalNote}
              </p>
              {isLeader && (
                <button
                  type="button"
                  onClick={() => setIsEditingNote(true)}
                  aria-label="Edit area note"
                  className="text-[#475569] hover:text-[#141619] dark:hover:text-[#F8FAFC] shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <textarea
                rows={2}
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                className="w-full p-1.5 rounded-[4px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="h-7 px-2 rounded-[4px] border border-[#E2E6EC] dark:border-[#263346] text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveGeneralNote(draftNote);
                    setIsEditingNote(false);
                  }}
                  className="h-7 px-2.5 rounded-[4px] bg-[#1B365D] text-white text-[11px] font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. RUANG PESAN CHAT ROOM PER AREA (WHATSAPP STYLE) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {areaChatMessages.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-[#475569] dark:text-[#94A3B8]">
            No messages in {activeAreaName} Chat yet.
          </div>
        ) : (
          areaChatMessages.map((msg) => {
            const linkedPin = pins.find((p) => p.id === msg.pin_id);
            const isPlaying = playingMessageId === msg.id;
            const totalDur = msg.voice_duration_sec || 12;
            const deptMeta =
              msg.department && msg.department !== 'all'
                ? getDepartmentMeta(msg.department, divisions)
                : null;

            return (
              <div
                key={msg.id}
                className="p-3 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4]/80 dark:bg-[#0F141C] shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-[#141619] dark:text-[#F8FAFC] truncate">
                      {msg.sender_name}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#1B365D]/10 dark:bg-white/10 text-[#1B365D] dark:text-[#D97706]">
                      {msg.sender_role === 'mandor' ? 'foreman' : msg.sender_role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {linkedPin && (
                      <button
                        type="button"
                        onClick={() => onSelectPinFromStream(linkedPin.id)}
                        className="font-mono font-bold text-[#1B365D] dark:text-[#D97706] hover:underline flex items-center gap-0.5"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{linkedPin.pin_code}</span>
                      </button>
                    )}
                    {deptMeta && (
                      <span className="font-mono uppercase text-[#475569] dark:text-[#94A3B8]">
                        {deptMeta.code}
                      </span>
                    )}
                  </div>
                </div>

                {msg.message_type === 'voice_note' ? (
                  <div className="p-2 rounded-[6px] bg-white dark:bg-[#161F2C] border border-[#E2E6EC] dark:border-[#263346] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayVoiceMessage(msg)}
                        aria-label="Play voice note"
                        className="w-7 h-7 rounded-full bg-[#1B365D] text-white flex items-center justify-center shrink-0"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 h-1.5 rounded-full bg-[#E2E6EC] dark:bg-[#263346] overflow-hidden">
                        <div
                          className="h-full bg-[#B45309] transition-all duration-200"
                          style={{
                            width: isPlaying
                              ? `${Math.min(100, (playbackElapsed / totalDur) * 100)}%`
                              : '35%',
                          }}
                        />
                      </div>

                      <span className="font-mono text-[11px] tabular-nums text-[#475569] dark:text-[#94A3B8]">
                        {isPlaying ? `${playbackElapsed}s` : `${totalDur}s`}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#141619] dark:text-[#F8FAFC] leading-snug">
                    {msg.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. BAR INPUT PESAN WHATSAPP STYLE: KETIK LAPORAN ATAU VOICE NOTE */}
      <div className="p-3 border-t border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] space-y-2">
        {selectedPin && (
          <label className="flex items-center gap-1.5 text-[11px] text-[#475569] dark:text-[#94A3B8] cursor-pointer">
            <input
              type="checkbox"
              checked={bindMessageToPin}
              onChange={(e) => setBindMessageToPin(e.target.checked)}
              className="rounded accent-[#1B365D]"
            />
            <span>
              Link message to pin{' '}
              <strong className="font-mono text-[#141619] dark:text-[#F8FAFC]">
                {selectedPin.pin_code}
              </strong>
            </span>
          </label>
        )}

        {!canSendChat && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[6px] bg-[#CA8A04]/10 border border-[#CA8A04]/30 text-[11px] text-[#B45309] dark:text-[#D97706]">
            <span>Chat restricted to Owner &amp; Foreman.</span>
            {onOpenTeamPermissions && (
              <button
                type="button"
                onClick={onOpenTeamPermissions}
                className="font-semibold underline shrink-0"
              >
                Manage in Project Team
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSendSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            disabled={!canSendChat}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              canSendChat
                ? `Type a note in ${activeAreaName}...`
                : 'Chat access disabled for this account'
            }
            className="flex-1 min-w-0 h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[13px] text-[#141619] dark:text-[#F8FAFC] placeholder:text-[#475569] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15 focus:border-[#1B365D]"
          />

          <button
            type="button"
            disabled={!canSendChat}
            onClick={handleToggleVoiceRecord}
            title="Record voice note (max 15s)"
            aria-label="Record voice note"
            className={`h-9 px-2.5 rounded-[6px] text-[12px] font-mono font-medium flex items-center gap-1 shrink-0 transition-colors ${
              isRecordingVoice
                ? 'bg-[#DC2626] text-white'
                : 'border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[#141619] dark:text-[#F8FAFC] hover:border-[#B45309] disabled:opacity-40'
            }`}
          >
            {isRecordingVoice ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>{recordingSeconds}s/15s</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-[#B45309] dark:text-[#D97706]" />
                <span>Voice</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={!canSendChat || !textInput.trim()}
            aria-label="Send message"
            className="h-9 w-9 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
