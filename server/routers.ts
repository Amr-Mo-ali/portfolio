import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createContactSubmission, createChatMessage, getChatHistory } from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

const CVContext = `You are an AI assistant representing Amr Mohamed Ali, an ML/AI Engineer specializing in Arabic NLP, LLM Systems, and Voice AI. You have access to Amr's professional information and should answer questions about his skills, projects, experience, and availability.

Amr's Profile:
- ML/AI Engineer · Arabic NLP Specialist · LLM Systems & Voice AI
- Location: Cairo, Egypt
- Email: amrmoaliradwan@gmail.com
- GitHub: github.com/Amr-Mo-ali
- LinkedIn: linkedin.com/in/amr-mohamed21
- HuggingFace: huggingface.co/AmrMohamed21

Core Skills:
- Languages: Python, SQL, JavaScript, TypeScript
- ML/DL: PyTorch, scikit-learn, TensorFlow, Pandas, NumPy
- LLM/NLP: HuggingFace Transformers, LangChain, LangGraph, RAG, ChromaDB, Qdrant, Groq, OpenAI API, AraBERT, Whisper
- MLOps & Serving: FastAPI, Docker, Git, HuggingFace Spaces, n8n
- Web/Full-Stack: Next.js, React, Tailwind CSS, Supabase, Prisma

Featured Projects:
1. Arabic RAG Chatbot - LangChain + ChromaDB + Groq LLaMA pipeline for Arabic books
2. مُعلِّم (Muallim) - Egyptian Arabic AI Voice Tutor with Whisper, LLaMA 3.3, ElevenLabs
3. Arabic News Credibility Analyzer - Fine-tuned AraBERT v2 with 98.8% accuracy
4. Arabic Sentiment Analysis API - Fine-tuned AraBERT deployed on HuggingFace Spaces
5. Credit Risk Prediction - ML pipeline with scikit-learn on 150K+ records
6. CBRO - Graduation project on AI outfit recommendation for visually impaired users

Work Experience:
- Freelance AI & Software Engineer (01/2024 - Present)
  * Designed and deployed Lina, a production Arabic AI receptionist
  * Built social media automation pipeline (90% effort reduction)
  * Delivered FashionNova e-commerce platform (Next.js, Prisma, Supabase)

Education:
- B.Sc. Computer Science & AI, Beni Suef University (09/2021 - 10/2024)
- Focus on AI and machine learning with capstone on AI outfit recommendation

Currently seeking ML/NLP roles in Egypt and the Gulf where Arabic language expertise meets production engineering.

Be helpful, professional, and accurate. If you don't know something about Amr, say so honestly.`;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        visitorName: z.string().min(1, "Name is required"),
        visitorEmail: z.string().email("Valid email is required"),
        message: z.string().min(1, "Message is required"),
      }))
      .mutation(async ({ input }) => {
        try {
          // Save to database
          await createContactSubmission({
            visitorName: input.visitorName,
            visitorEmail: input.visitorEmail,
            message: input.message,
          });

          // Send notification to owner
          await notifyOwner({
            title: "New Portfolio Contact",
            content: `New message from ${input.visitorName} (${input.visitorEmail}):\n\n${input.message}`,
          });

          return { success: true };
        } catch (error) {
          console.error("Contact submission error:", error);
          throw new Error("Failed to submit contact form");
        }
      }),
  }),

  chat: router({
    send: publicProcedure
      .input(z.object({
        sessionId: z.string().min(1),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const { sessionId, message } = input;

          // Save user message
          await createChatMessage({
            sessionId,
            role: "user",
            content: message,
          });

          // Get chat history
          const history = await getChatHistory(input.sessionId, 10);
          const messages = (history || []).reverse();

          // Call LLM with CV context
          const response = await invokeLLM({
            messages: [
              { role: "system", content: CVContext },
              ...messages.map(msg => ({
                role: msg.role as "user" | "assistant",
                content: msg.content as string,
              })),
            ],
          });

          const assistantMessage = (response.choices[0]?.message?.content as string) || "I couldn't generate a response.";

          // Save assistant message
          await createChatMessage({
            sessionId,
            role: "assistant",
            content: assistantMessage,
          });

          return { message: assistantMessage };
        } catch (error) {
          console.error("Chat error:", error);
          throw new Error("Failed to process chat message");
        }
      }),

    getHistory: publicProcedure
      .input(z.object({
        sessionId: z.string().min(1),
      }))
      .query(async ({ input }) => {
        try {
          const history = await getChatHistory(input.sessionId, 50);
          return history.reverse();
        } catch (error) {
          console.error("Get history error:", error);
          return [];
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
