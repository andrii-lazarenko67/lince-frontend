import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Tooltip,
  Fab,
  Badge,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Psychology as AiIcon,
  Delete as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../../api/aiApi';
import type { AiChatMessage, AiContext } from '../../api/aiApi';

interface AiChatSidebarProps {
  open: boolean;
  onClose: () => void;
  context?: AiContext;
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ open, onClose, context }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage: AiChatMessage = {
        role: 'assistant',
        content: t('ai.chat.welcome')
      };
      setMessages([welcomeMessage]);
    }
  }, [open, messages.length, t]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: AiChatMessage = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.chat({
        message: userMessage.content,
        conversationHistory: messages,
        context,
        language: i18n.language
      });

      const assistantMessage: AiChatMessage = {
        role: 'assistant',
        content: response.data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('AI Chat Error:', err);
      setError(t('ai.chat.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    // Re-add welcome message
    const welcomeMessage: AiChatMessage = {
      role: 'assistant',
      content: t('ai.chat.welcome')
    };
    setMessages([welcomeMessage]);
  };

  const getContextChip = () => {
    if (!context?.page) return null;
    return (
      <Chip
        size="small"
        label={t(`ai.context.${context.page}`, context.page)}
        color="primary"
        variant="outlined"
        sx={{ mb: 1 }}
      />
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AiIcon sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              {t('ai.chat.title')}
            </Typography>
          </Box>
          <Box>
            <Tooltip title={t('ai.chat.clearHistory')}>
              <IconButton onClick={handleClear} size="small" sx={{ color: 'white', mr: 1 }}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.close')}>
              <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Context indicator */}
        {getContextChip() && (
          <Box sx={{ p: 1, bgcolor: 'background.default' }}>
            {getContextChip()}
          </Box>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: 'background.default'
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2,
                  ...(message.role === 'assistant' && {
                    borderTopLeftRadius: 0
                  }),
                  ...(message.role === 'user' && {
                    borderTopRightRadius: 0
                  })
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <CircularProgress size={20} />
              </Paper>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 0,
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={t('ai.chat.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              variant="outlined"
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {t('ai.chat.hint')}
          </Typography>
        </Paper>
      </Box>
    </Drawer>
  );
};

interface AiChatButtonProps {
  onClick: () => void;
  hasContext?: boolean;
}

export const AiChatButton: React.FC<AiChatButtonProps> = ({ onClick, hasContext }) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('ai.chat.openAssistant')} placement="left">
      <Fab
        color="secondary"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
          }
        }}
      >
        <Badge
          variant="dot"
          color="error"
          invisible={!hasContext}
          sx={{
            '& .MuiBadge-badge': {
              animation: 'pulse 2s infinite'
            },
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1.2)',
                opacity: 0.7
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1
              }
            }
          }}
        >
          <AiIcon />
        </Badge>
      </Fab>
    </Tooltip>
  );
};

export default AiChatSidebar;
