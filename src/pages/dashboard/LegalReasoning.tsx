import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ThumbsUp, ThumbsDown, Copy, Share2, Trash2, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { sampleChatMessages, suggestedQuestions, ChatMessage } from '@/data/sampleData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const iracResponse = {
  issue: "What formalities must be observed for a valid transfer of immovable property in Sri Lanka?",
  rule: "Under Section 2 of the Prevention of Frauds Ordinance (Cap. 70), no sale, purchase, transfer, or assignment of land shall be of force or avail in law unless it is in writing, signed by the party making the same or by some person lawfully authorized by him, in the presence of a licensed Notary Public and two or more witnesses.",
  application: `The transfer must comply with the following requirements:

1. **Written Form**: The deed must be in writing - oral agreements for land transfers are not enforceable.

2. **Notarial Attestation**: The deed must be attested by a Notary Public duly licensed to practice in the area where the land is situated.

3. **Signatures**: The deed must be signed by:
   - The transferor (vendor/donor)
   - Two or more witnesses who are present at the time of signing
   - The Notary Public

4. **Registration**: Under the Registration of Documents Ordinance (Cap. 117), the deed must be registered at the appropriate Land Registry within 3 months of execution.

5. **Stamp Duty**: Proper stamp duty must be paid as per the Stamp Duty Act.`,
  conclusion: "A sale deed is valid only if it strictly complies with all statutory formalities prescribed under the Prevention of Frauds Ordinance and related legislation. Non-compliance renders the transfer void and unenforceable.",
  citations: [
    "Prevention of Frauds Ordinance (Cap. 70), Section 2",
    "Registration of Documents Ordinance (Cap. 117)",
    "Notaries Ordinance (Cap. 49)",
    "Stamp Duty Act No. 43 of 1982",
    "De Silva v. Perera [1985] 1 SLR 145"
  ]
};

const LegalReasoning = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(sampleChatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: `**Issue**
${iracResponse.issue}

**Rule**
${iracResponse.rule}

**Application**
${iracResponse.application}

**Conclusion**
${iracResponse.conclusion}`,
      timestamp: new Date().toISOString(),
      citations: iracResponse.citations
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Response copied to clipboard.",
    });
  };

  const handleClearChat = () => {
    setMessages(sampleChatMessages);
    toast({
      title: "Chat cleared",
      description: "Conversation has been reset.",
    });
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          const text = line.slice(2, -2);
          return (
            <h4 key={i} className="font-semibold text-primary mt-4 mb-2 first:mt-0">
              {text}
            </h4>
          );
        }
        if (line.startsWith('- ') || line.match(/^\d+\./)) {
          return (
            <p key={i} className="ml-4 mb-1">
              {line}
            </p>
          );
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="mb-2">{line}</p>;
      });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Legal Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered Sri Lankan Property Law guidance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleClearChat}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-slide-up",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted rounded-tl-sm"
              )}>
                <div className={cn(
                  "text-sm",
                  message.role === 'assistant' && "text-foreground"
                )}>
                  {message.role === 'assistant' 
                    ? formatMessage(message.content)
                    : message.content
                  }
                </div>
                
                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      📚 Citations:
                    </p>
                    <ul className="space-y-1">
                      {message.citations.map((citation, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          • {citation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Actions for assistant messages */}
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(message.content)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-secondary-foreground">You</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 4).map((question, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type your legal question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-[44px] max-h-[120px] resize-none pr-12"
                rows={1}
              />
            </div>
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LegalReasoning;
