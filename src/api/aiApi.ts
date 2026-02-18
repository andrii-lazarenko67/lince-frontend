import axiosInstance from './axiosInstance';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiContext {
  page?: string;
  systemType?: string;
  data?: Record<string, unknown>;
}

export interface AiChatRequest {
  message: string;
  conversationHistory?: AiChatMessage[];
  context?: AiContext;
  language?: string;
}

export interface AiChatResponse {
  success: boolean;
  data: {
    message: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
    };
  };
}

export interface WaterQualityAnalysisRequest {
  measurements: Array<{
    parameter: string;
    value: number;
    unit: string;
    isOutOfRange?: boolean;
  }>;
  systemType?: string;
  language?: string;
}

export interface SetupSuggestionsRequest {
  systemType: string;
  capacity?: string | number;
  usage?: string;
  language?: string;
}

export interface ContextualHelpRequest {
  page: string;
  feature?: string;
  language?: string;
}

export interface AlertInterpretationRequest {
  alert: {
    parameter: string;
    value: number;
    unit: string;
    limit: number;
    severity: string;
  };
  systemType?: string;
  language?: string;
}

/**
 * AI Assistant API
 */
export const aiApi = {
  /**
   * Chat with AI assistant
   */
  async chat(request: AiChatRequest): Promise<AiChatResponse> {
    const response = await axiosInstance.post<AiChatResponse>('/ai/chat', request);
    return response.data;
  },

  /**
   * Analyze water quality data
   */
  async analyzeWaterQuality(request: WaterQualityAnalysisRequest) {
    const response = await axiosInstance.post('/ai/analyze-water-quality', request);
    return response.data;
  },

  /**
   * Get setup suggestions for a new system
   */
  async getSetupSuggestions(request: SetupSuggestionsRequest) {
    const response = await axiosInstance.post('/ai/setup-suggestions', request);
    return response.data;
  },

  /**
   * Get contextual help for current page
   */
  async getContextualHelp(request: ContextualHelpRequest) {
    const response = await axiosInstance.post('/ai/contextual-help', request);
    return response.data;
  },

  /**
   * Interpret an alert and get recommendations
   */
  async interpretAlert(request: AlertInterpretationRequest) {
    const response = await axiosInstance.post('/ai/interpret-alert', request);
    return response.data;
  },

  /**
   * Check AI service status
   */
  async getStatus() {
    const response = await axiosInstance.get('/ai/status');
    return response.data;
  }
};

export default aiApi;
