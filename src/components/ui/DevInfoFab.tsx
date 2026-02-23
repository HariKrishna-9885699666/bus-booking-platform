"use client";

import { useState } from "react";
import { Code2, X, Github, Linkedin, Globe, Mail, Phone, MapPin, GraduationCap, ExternalLink, BookOpen } from "lucide-react";

export function DevInfoFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-110 transition-all flex items-center justify-center group"
        aria-label="Developer Info"
      >
        <Code2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-500 via-rose-500 to-red-600 p-6 pb-8 rounded-t-3xl">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold">
                  HK
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">Hari Krishna Anem</h2>
                  <p className="text-white/80 text-sm mt-0.5">Full Stack Developer</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm">B.Tech (CSIT)</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm">Hyderabad, India</span>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <a href="tel:+919885699666" className="flex items-center gap-3 text-gray-700 hover:text-red-500 transition group">
                    <Phone className="w-4 h-4 text-gray-400 group-hover:text-red-500 shrink-0 transition" />
                    <span className="text-sm">+91 9885699666</span>
                  </a>
                  <a href="mailto:anemharikrishna@gmail.com" className="flex items-center gap-3 text-gray-700 hover:text-red-500 transition group">
                    <Mail className="w-4 h-4 text-gray-400 group-hover:text-red-500 shrink-0 transition" />
                    <span className="text-sm">anemharikrishna@gmail.com</span>
                  </a>
                </div>
              </section>

              {/* Social Links */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Social & Professional Links</h3>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://github.com/HariKrishna-9885699666"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-700 transition-all group text-sm"
                  >
                    <Github className="w-4 h-4 shrink-0" />
                    <span className="truncate">GitHub</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </a>
                  <a
                    href="https://linkedin.com/in/anemharikrishna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 transition-all group text-sm"
                  >
                    <Linkedin className="w-4 h-4 shrink-0" />
                    <span className="truncate">LinkedIn</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </a>
                  <a
                    href="https://hashnode.com/@HariKrishna-9885699666"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-500 hover:text-white text-gray-700 transition-all group text-sm"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="truncate">Blog</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </a>
                  <a
                    href="https://harikrishna.is-a-good.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-red-500 hover:text-white text-gray-700 transition-all group text-sm"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate">Portfolio</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </a>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Built with Next.js 16 &middot; React 19 &middot; Three.js
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
