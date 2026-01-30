import { useState } from "react";
import {
  FileText,
  Download,
  Sparkles,
  Shield,
  Lock,
} from "lucide-react";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { motion } from "motion/react";

export default function App() {
  const [pdfChecked, setPdfChecked] = useState(true);
  const [docxChecked, setDocxChecked] = useState(false);
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      setContent(
        "Resume generated successfully! This is a sample output.\n\nYour professional resume has been created with the latest AI technology.\n\nFormat: " +
          (pdfChecked ? "PDF" : "") +
          (docxChecked ? " DOCX" : ""),
      );
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl text-white">
              AI Resume Generator
            </h1>
          </div>
          <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Secure & Professional Document Creation
            <Lock className="w-4 h-4 text-cyan-400" />
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/50 overflow-hidden"
        >
          {/* Gradient top border */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

          <div className="p-8">
            {/* Format Selection */}
            <div className="mb-6">
              <Label className="text-slate-300 mb-4 block text-sm uppercase tracking-wider">
                Output Format
              </Label>
              <div className="flex gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all cursor-pointer ${
                    pdfChecked
                      ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  }`}
                  onClick={() => setPdfChecked(!pdfChecked)}
                >
                  <Checkbox
                    id="pdf"
                    checked={pdfChecked}
                    onCheckedChange={setPdfChecked}
                    className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <Label
                    htmlFor="pdf"
                    className={`cursor-pointer text-base ${
                      pdfChecked
                        ? "text-cyan-300"
                        : "text-slate-400"
                    }`}
                  >
                    PDF
                  </Label>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all cursor-pointer ${
                    docxChecked
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  }`}
                  onClick={() => setDocxChecked(!docxChecked)}
                >
                  <Checkbox
                    id="docx"
                    checked={docxChecked}
                    onCheckedChange={setDocxChecked}
                    className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor="docx"
                    className={`cursor-pointer text-base ${
                      docxChecked
                        ? "text-blue-300"
                        : "text-slate-400"
                    }`}
                  >
                    DOCX
                  </Label>
                </motion.div>
              </div>
            </div>

            {/* Generate Button */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mb-6"
            >
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating || (!pdfChecked && !docxChecked)
                }
                className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg shadow-lg shadow-cyan-500/20 border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isGenerating ? (
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Generating Resume...
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    Generate Resume
                    <Download className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Output Area */}
            <div className="relative">
              <Label className="text-slate-300 mb-3 block text-sm uppercase tracking-wider">
                Output Preview
              </Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Generated resume will appear here..."
                className="min-h-[300px] bg-slate-950/50 border-slate-700 text-slate-300 placeholder:text-slate-600 rounded-xl resize-none focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              />

              {/* Corner accent */}
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl rounded-full pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6 text-slate-500 text-sm flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Your data is encrypted and secure
        </motion.div>
      </div>
    </div>
  );
}