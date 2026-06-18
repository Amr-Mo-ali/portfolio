import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Github, Linkedin, Mail, ExternalLink, MessageCircle, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

// Project data
const projects = [
  {
    title: "Arabic RAG Chatbot",
    description: "LangChain + ChromaDB + Groq LLaMA pipeline for Arabic books. Solved Arabic PDF extraction challenges with PyMuPDF and RTL text normalization.",
    tags: ["RAG", "Arabic NLP", "LangChain", "Deployed"],
    github: "https://github.com/Amr-Mo-ali/Arabic-RAG-Chatbot-",
    demo: null,
  },
  {
    title: "مُعلِّم — Arabic AI Voice Tutor",
    description: "Production voice pipeline for Egyptian Arabic tutoring — Whisper-large-v3 for STT, LLaMA 3.3 70B for pedagogical responses, ElevenLabs TTS for Arabic voice output.",
    tags: ["Voice AI", "Arabic NLP", "LLM", "Production"],
    github: "https://github.com/Amr-Mo-ali/-Muallim-AI-Voice-Tutor",
    demo: null,
    isArabic: true,
  },
  {
    title: "Arabic News Credibility Analyzer",
    description: "Fine-tuned AraBERT v2 on 6,267 Arabic news articles — achieved 98.8% accuracy on fake news detection. Published model to HuggingFace Hub with 111+ downloads/month.",
    tags: ["Arabic NLP", "Deep Learning", "Deployed", "HuggingFace"],
    github: "https://github.com/Amr-Mo-ali/Arabic-News-Credibility-Analyzer",
    demo: "https://huggingface.co/AmrMohamed21",
  },
  {
    title: "Arabic Sentiment Analysis API",
    description: "Fine-tuned AraBERT on Arabic sentiment classification — 72% accuracy. Containerized with Docker and deployed as a live REST API on HuggingFace Spaces.",
    tags: ["Arabic NLP", "HuggingFace Spaces", "Deployed"],
    github: "https://github.com/Amr-Mo-ali/arabic-sentiment-api",
    demo: "https://huggingface.co/spaces/AmrMohamed21/arabic-sentiment-api",
  },
  {
    title: "Credit Risk Prediction",
    description: "End-to-end ML pipeline on 150K+ records — feature engineering, class imbalance handling, model benchmarking with GridSearchCV tuning, AUC-ROC evaluation.",
    tags: ["ML", "Production", "scikit-learn"],
    github: "https://github.com/Amr-Mo-ali",
    demo: null,
  },
  {
    title: "CBRO — AI Outfit Recommendation",
    description: "Graduation project: AI outfit recommendation system for visually impaired users using ResNet transfer learning for garment classification and K-Means clustering for style matching.",
    tags: ["AI", "Computer Vision", "Graduation Project"],
    github: "https://github.com/Amr-Mo-ali",
    demo: null,
  },
];

// Skills data
const skills = {
  "Core Languages": ["Python", "SQL", "JavaScript", "TypeScript"],
  "ML / DL": ["PyTorch", "scikit-learn", "TensorFlow", "Pandas", "NumPy"],
  "LLM / NLP": ["HuggingFace Transformers", "LangChain", "LangGraph", "RAG", "ChromaDB", "Qdrant", "Groq", "OpenAI API", "AraBERT", "Whisper"],
  "MLOps & Serving": ["FastAPI", "Docker", "Git", "HuggingFace Spaces", "n8n"],
  "Web / Full-Stack": ["Next.js", "React", "Tailwind CSS", "Supabase", "Prisma"],
};

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [chatOpen, setChatOpen] = useState(false);
  const [sessionId] = useState(() => nanoid());
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // tRPC mutations and queries
  const contactMutation = trpc.contact.submit.useMutation();
  const chatSendMutation = trpc.chat.send.useMutation();
  const chatHistoryQuery = trpc.chat.getHistory.useQuery({ sessionId });

  // Load chat history on mount
  useEffect(() => {
    if (chatHistoryQuery.data) {
      setChatMessages(chatHistoryQuery.data);
    }
  }, [chatHistoryQuery.data]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactMutation.mutateAsync({
        visitorName: contactForm.name,
        visitorEmail: contactForm.email,
        message: contactForm.message,
      });
      setContactForm({ name: "", email: "", message: "" });
      setContactSubmitted(true);
      setTimeout(() => setContactSubmitted(false), 5000);
    } catch (error) {
      console.error("Contact form error:", error);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await chatSendMutation.mutateAsync({
        sessionId,
        message: userMessage,
      });
      setChatMessages(prev => [...prev, { role: "assistant", content: response.message }]);
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Amr Mohamed Ali
          </div>
          <div className="flex gap-6 items-center">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#skills" className="hover:text-primary transition-colors">Skills</a>
            <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-blue-50 to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Amr Mohamed Ali
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-muted-foreground">
              ML/AI Engineer · Arabic NLP Specialist · LLM Systems & Voice AI
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              I build AI systems that actually ship — from fine-tuning Arabic transformers to wiring together voice pipelines with LLMs and RAG. My work sits at the intersection of Arabic NLP, LLM engineering, and production deployment.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 pt-4">
            <a
              href="https://github.com/Amr-Mo-ali"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent text-card-foreground rounded-lg transition-colors border border-border"
            >
              <Github size={20} />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/amr-mohamed21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent text-card-foreground rounded-lg transition-colors border border-border"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
            <a
              href="https://huggingface.co/AmrMohamed21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent text-card-foreground rounded-lg transition-colors border border-border"
            >
              <ExternalLink size={20} />
              HuggingFace
            </a>
            <a
              href="mailto:amrmoaliradwan@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Mail size={20} />
              Email
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl space-y-8">
          <h2 className="text-4xl font-bold">About</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Professional Summary</h3>
              <p className="text-muted-foreground leading-relaxed">
                I understand language models from the inside out: I've studied transformer architecture at the implementation level — attention mechanisms, tokenization, training loops — and applied that depth in real projects. I care about systems that work in the real world, not just notebooks.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Currently seeking ML/NLP roles in Egypt and the Gulf where Arabic language expertise meets production engineering.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Education</h3>
              <Card className="p-4 border border-border">
                <div className="space-y-2">
                  <p className="font-semibold">B.Sc. Computer Science & AI</p>
                  <p className="text-sm text-muted-foreground">Beni Suef University</p>
                  <p className="text-sm text-muted-foreground">09/2021 – 10/2024</p>
                  <p className="text-sm pt-2">Graduated with focus on AI and machine learning. Capstone project: AI outfit recommendation system for visually impaired users using computer vision and transfer learning.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-8">
          <h2 className="text-4xl font-bold">Skills</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-lg">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl space-y-8">
          <h2 className="text-4xl font-bold">Work Experience</h2>
          
          <Card className="p-6 border border-border">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">AI & Software Engineer</h3>
                <p className="text-sm text-muted-foreground">Freelance • Cairo, Egypt</p>
                <p className="text-sm text-muted-foreground">01/2024 – Present</p>
              </div>
              
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Designed and deployed Lina, a production Arabic AI receptionist — appointment booking, customer queries, Telegram integration using n8n, LangChain, and OpenAI API. Live with real users.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Built a social media automation pipeline (Telegram → multi-platform) cutting manual publishing effort by 90% using APScheduler and Telegram Bot API.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Delivered FashionNova, a full-stack e-commerce platform — Next.js, Prisma, Supabase, NextAuth, Cloudinary, WhatsApp notifications. Deployed on Vercel.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <h2 className="text-4xl font-bold">Featured Projects</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <Card key={idx} className="p-6 border border-border hover:shadow-lg transition-shadow flex flex-col">
                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-semibold" dir={project.isArabic ? "rtl" : "ltr"}>{project.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 mt-4 border-t border-border">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Github size={16} />
                      Code
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink size={16} />
                      Demo
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold">Get In Touch</h2>
            <p className="text-muted-foreground">Have a question or want to work together? Feel free to reach out.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                placeholder="Your message..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                rows={5}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={contactMutation.isPending}
            >
              {contactMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>

            {contactSubmitted && (
              <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm">
                ✓ Message sent successfully! I'll get back to you soon.
              </div>
            )}

            {contactMutation.isError && (
              <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
                ✗ Error sending message. Please try again.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* AI Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
      >
        {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* AI Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-full sm:w-96 h-[500px] max-h-[70vh] bg-card border border-border rounded-lg shadow-xl flex flex-col z-40 mx-2 sm:mx-0">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Chat with Amr's AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask about my skills, projects, and experience</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p>Hi! Ask me anything about Amr's skills, projects, or experience.</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                dir={msg.content.match(/[\u0600-\u06FF]/) ? "rtl" : "ltr"}
              >
                <Streamdown className="text-sm">{msg.content}</Streamdown>
              </div>
            </div>
            ))}
            {chatSendMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleChatSend}
              disabled={chatSendMutation.isPending || !chatInput.trim()}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t border-border text-center text-muted-foreground text-sm">
        <p>© 2026 Amr Mohamed Ali. All rights reserved.</p>
      </footer>
    </div>
  );
}
