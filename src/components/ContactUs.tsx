import { useState, FormEvent } from "react";
import { Mail, Send, CheckCircle, MessageSquare, AlertCircle, ThumbsUp, Sparkles, ExternalLink, RefreshCw } from "lucide-react";

export function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const recipientEmail = "innfriend1@gmail.com";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSending(true);

    // Simulate sending time
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);

      // Construct a mailto link to open the email client as specified by the user
      const subject = encodeURIComponent(form.subject || `Inquiry from ${form.name}`);
      const body = encodeURIComponent(
        `Hello CorePick Architect Team,\n\n${form.message}\n\nBest regards,\n${form.name}\nContact: ${form.email}`
      );
      
      const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      
      // Attempt to open the mail client
      window.location.href = mailtoUrl;
    }, 800);
  };

  const handleReset = () => {
    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER SECTION */}
      <div className="text-center space-y-3 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs font-mono text-indigo-300 font-bold">
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          GET IN TOUCH WITH THE ARCHITECT
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Contact Us & Provide Feedback
        </h2>
        <p className="text-sm text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed">
          Have ideas to make CorePick Architect better? Suggest features, flag issues, 
          or ask questions. Submit your inquiry directly through the form below to reach us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INFORMATION & QUICK LINKS */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Why Share Feedback?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                CorePick Architect is developed as a free simulator sandbox to help enthusiasts, students, and engineers understand the end-to-end silicon engineering lifecycle.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-2.5 items-start">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    <strong>Iterative Learning:</strong> Propose additional metrics or calculators you want to see!
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    <strong>Community Driven:</strong> Direct feedback helps us prioritize next-gen simulations like NoC modeling or power density maps.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider">
                Submission Guidelines
              </h3>
              <div className="space-y-3 font-mono text-xs text-slate-400">
                <p className="leading-relaxed">
                  Provide as much detail as possible about your hardware design questions or feature ideas to help us investigate properly.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                  <span>Response Time:</span>
                  <span className="text-slate-300 font-semibold">1-2 Business Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Format:</span>
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px]">Client Draft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT FORM */}
        <div className="md:col-span-7">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Enter email subject (optional)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="What would you like to share, inquire, or propose?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 disabled:opacity-55"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      GENERATING MAILTO PROTOCOL...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      SUBMIT FEEDBACK
                    </>
                  )}
                </button>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono justify-center">
                  <AlertCircle className="w-3 h-3 text-indigo-400" />
                  <span>Submitting will automatically compose a draft in your primary email client.</span>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold font-mono text-emerald-400">
                    Draft Composed Successfully!
                  </h4>
                  <p className="text-xs text-slate-300 font-mono max-w-md mx-auto leading-relaxed">
                    We have initialized your system email client to send the inquiry. Please review and hit send in your email application to deliver the message.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left font-mono text-[11px] max-w-md mx-auto space-y-1.5">
                  <div className="text-slate-500"><span className="text-indigo-400 font-bold">Subject:</span> {form.subject || "(No Subject)"}</div>
                  <div className="text-slate-300 mt-2 whitespace-pre-line border-t border-slate-900 pt-2 text-slate-400">
                    {form.message}
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold py-2 px-4 rounded-lg text-xs transition-all"
                  >
                    Send Another Feedback
                  </button>
                  <a
                    href={`mailto:${recipientEmail}?subject=${encodeURIComponent(form.subject || `Inquiry from ${form.name}`)}&body=${encodeURIComponent(form.message)}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold py-2 px-4 rounded-lg text-xs transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Client Again
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
