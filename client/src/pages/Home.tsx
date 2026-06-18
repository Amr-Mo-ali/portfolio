import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Github, Linkedin, Mail, ExternalLink, MessageCircle, X, Sun, Moon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();
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
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Amr Mohamed Ali
          </div>
          <div className="flex gap-6 items-center">
            <a href="#about" className="hover:text-primary transition-colors text-sm md:text-base">About</a>
            <a href="#skills" className="hover:text-primary transition-colors text-sm md:text-base">Skills</a>
            <a href="#projects" className="hover:text-primary transition-colors text-sm md:text-base">Projects</a>
            <a href="#contact" className="hover:text-primary transition-colors text-sm md:text-base">Contact</a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-blue-950/20 via-background to-background overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto max-w-5xl text-center space-y-8 relative z-10">
          {/* Profile Image */}
          <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-glow"></div>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663774084633/NdGxozidUqETPjT9gxcfp5/amr_profile-GmFapwuSEPVnTSZgjqnPEV.webp"
                alt="Amr Mohamed Ali"
                className="relative w-48 h-48 rounded-full object-cover border-4 border-primary shadow-2xl"
              />
            </div>
          </div>

          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              Amr Mohamed Ali
            </h1>
            <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ML/AI Engineer · Arabic NLP Specialist · LLM Systems & Voice AI
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              I build AI systems that actually ship — from fine-tuning Arabic transformers to wiring together voice pipelines with LLMs and RAG. My work sits at the intersection of Arabic NLP, LLM engineering, and production deployment.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-4 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="https://github.com/Amr-Mo-ali"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent text-card-foreground rounded-lg transition-all border border-border hover:border-primary hover:shadow-lg hover:scale-105"
            >
              <Github size={20} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/amr-mohamed21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent text-card-foreground rounded-lg transition-all border border-border hover:border-primary hover:shadow-lg hover:scale-105"
            >
              <Linkedin size={20} />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a
              href="https://huggingface.co/AmrMohamed21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent text-card-foreground rounded-lg transition-all border border-border hover:border-primary hover:shadow-lg hover:scale-105"
            >
              <ExternalLink size={20} />
              <span className="hidden sm:inline">HuggingFace</span>
            </a>
            <a
              href="mailto:amrmoaliradwan@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all hover:shadow-lg hover:scale-105 font-medium"
            >
              <Mail size={20} />
              <span className="hidden sm:inline">Email</span>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-card/50 animate-fade-in-up">
        <div className="container mx-auto max-w-4xl space-y-12">
          <h2 className="text-4xl font-bold">About</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 animate-slide-in-right">
              <h3 className="text-2xl font-semibold">Professional Summary</h3>
              <p className="text-muted-foreground leading-relaxed">
                I understand language models from the inside out: I've studied transformer architecture at the implementation level — attention mechanisms, tokenization, training loops — and applied that depth in real projects. I care about systems that work in the real world, not just notebooks.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Currently seeking ML/NLP roles in Egypt and the Gulf where Arabic language expertise meets production engineering.
              </p>
            </div>
            <div className="space-y-4 animate-slide-in-right" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-2xl font-semibold">Education</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-primary">B.Sc. Computer Science & AI</p>
                  <p className="text-muted-foreground">Beni Suef University</p>
                  <p className="text-sm text-muted-foreground">09/2021 - 10/2024</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Graduated with focus on AI and machine learning. Capstone project: AI outfit recommendation system for visually impaired users using transfer learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 bg-background animate-fade-in-up">
        <div className="container mx-auto max-w-4xl space-y-12">
          <h2 className="text-4xl font-bold">Skills & Expertise</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(skills).map(([category, skillList], idx) => (
              <div key={category} className="space-y-4 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <h3 className="text-xl font-semibold text-primary">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-all cursor-default hover:scale-110"
                    >
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
      <section className="py-20 px-4 bg-card/50 animate-fade-in-up">
        <div className="container mx-auto max-w-4xl space-y-12">
          <h2 className="text-4xl font-bold">Work Experience</h2>
          
          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-6 space-y-3 hover:pl-8 transition-all">
              <h3 className="text-2xl font-semibold">AI & Software Engineer</h3>
              <p className="text-muted-foreground">Freelance • Cairo, Egypt</p>
              <p className="text-sm text-muted-foreground">01/2024 - Present</p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Designed and deployed Line, a production Arabic AI receptionist — appointment booking, customer queries, Telegram integration using LLM, LangChain, and OpenAI API. Live with real users.</li>
                <li>Built a social media automation pipeline (Telegram — multi-platform cutting manual publishing effort by 90% using APScheduler and Telegram Bot API.</li>
                <li>Delivered FashionNook, a full-stack e-commerce platform — Next.js, Prisma, Supabase, NestAuth. Deployed on Vercel.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-20 px-4 bg-background animate-fade-in-up">
        <div className="container mx-auto max-w-5xl space-y-12">
          <h2 className="text-4xl font-bold">Featured Projects</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <Card
                key={idx}
                className="p-6 border border-border hover:border-primary hover:shadow-2xl transition-all hover:scale-105 flex flex-col group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors" dir={project.isArabic ? "rtl" : "ltr"}>
                    {project.title}
                  </h3>
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
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
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
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
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
      <section id="contact" className="py-20 px-4 bg-card/50 animate-fade-in-up">
        <div className="container mx-auto max-w-2xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Get In Touch</h2>
            <p className="text-muted-foreground">Have a question or want to work together? Feel free to reach out.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 transition-all hover:shadow-lg"
              disabled={contactMutation.isPending}
            >
              {contactMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
            {contactSubmitted && (
              <p className="text-center text-green-500 font-medium animate-fade-in">
                ✓ Message sent successfully!
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-background border-t border-border text-center text-muted-foreground">
        <p>© 2025 Amr Mohamed Ali. All rights reserved.</p>
      </footer>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-30 animate-bounce"
      >
        {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* AI Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-full sm:w-96 h-[500px] max-h-[70vh] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-40 mx-2 sm:mx-0 animate-fade-in-up">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Chat with Amr's AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask about my skills, projects, and experience</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-muted-foreground">
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
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border flex gap-2">
            <Input
              placeholder="Ask something..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
              disabled={chatSendMutation.isPending}
            />
            <Button
              onClick={handleChatSend}
              disabled={chatSendMutation.isPending || !chatInput.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
