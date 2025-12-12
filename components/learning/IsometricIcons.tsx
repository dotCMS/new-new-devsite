import React from 'react';

// Blogs - Newspaper/Article Stack with speech bubbles
export const IsometricBlog = () => (
  <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shadow */}
    <ellipse cx="80" cy="125" rx="45" ry="10" fill="#000000" opacity="0.08"/>
    
    {/* Bottom newspaper */}
    <path d="M35 85 L80 60 L125 85 L80 110 Z" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M35 85 L35 90 L80 115 L80 110 Z" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M80 110 L80 115 L125 90 L125 85 Z" fill="#ddd6fe" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Middle newspaper */}
    <path d="M38 75 L80 52 L122 75 L80 98 Z" fill="#f5f3ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M38 75 L38 79 L80 102 L80 98 Z" fill="#ede9fe" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M80 98 L80 102 L122 79 L122 75 Z" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Top newspaper/article */}
    <path d="M42 63 L80 42 L118 63 L80 84 Z" fill="#ffffff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M42 63 L42 67 L80 88 L80 84 Z" fill="#f5f3ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M80 84 L80 88 L118 67 L118 63 Z" fill="#ede9fe" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Text lines on top article */}
    <line x1="55" y1="56" x2="75" y2="66" stroke="#a855f7" strokeWidth="2" opacity="0.6"/>
    <line x1="58" y1="60" x2="72" y2="68" stroke="#a855f7" strokeWidth="1.5" opacity="0.4"/>
    <line x1="85" y1="66" x2="102" y2="56" stroke="#a855f7" strokeWidth="1.5" opacity="0.4"/>
    
    {/* Speech bubble */}
    <path d="M95 25 C95 18 105 15 115 15 C125 15 130 22 130 30 C130 38 125 42 115 42 L105 42 L100 50 L102 42 C97 40 95 35 95 25 Z" fill="#a855f7" opacity="0.8"/>
    <circle cx="108" cy="28" r="2.5" fill="white"/>
    <circle cx="115" cy="28" r="2.5" fill="white"/>
    <circle cx="122" cy="28" r="2.5" fill="white"/>
  </svg>
);

// Guides/How-tos - Open book with numbered steps and checkmarks
export const IsometricGuide = () => (
  <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shadow */}
    <ellipse cx="80" cy="125" rx="45" ry="10" fill="#000000" opacity="0.08"/>
    
    {/* Book spine */}
    <path d="M80 45 L80 115" stroke="#a855f7" strokeWidth="3"/>
    
    {/* Left page */}
    <path d="M25 55 L80 45 L80 115 L25 105 Z" fill="#ffffff" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Right page */}
    <path d="M80 45 L135 55 L135 105 L80 115 Z" fill="#f5f3ff" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Left page numbered steps */}
    <circle cx="38" cy="62" r="6" fill="#a855f7" opacity="0.8"/>
    <text x="35" y="66" fill="white" fontSize="10" fontWeight="bold">1</text>
    <line x1="48" y1="62" x2="70" y2="58" stroke="#a855f7" strokeWidth="1.5" opacity="0.5"/>
    
    <circle cx="40" cy="78" r="6" fill="#a855f7" opacity="0.6"/>
    <text x="37" y="82" fill="white" fontSize="10" fontWeight="bold">2</text>
    <line x1="50" y1="78" x2="72" y2="74" stroke="#a855f7" strokeWidth="1.5" opacity="0.5"/>
    
    <circle cx="42" cy="94" r="6" fill="#a855f7" opacity="0.4"/>
    <text x="39" y="98" fill="white" fontSize="10" fontWeight="bold">3</text>
    <line x1="52" y1="94" x2="74" y2="90" stroke="#a855f7" strokeWidth="1.5" opacity="0.5"/>
    
    {/* Right page with checkmarks */}
    <path d="M95 58 L100 63 L110 53" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <line x1="115" y1="58" x2="128" y2="60" stroke="#a855f7" strokeWidth="1.5" opacity="0.5"/>
    
    <path d="M97 74 L102 79 L112 69" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <line x1="117" y1="74" x2="130" y2="76" stroke="#a855f7" strokeWidth="1.5" opacity="0.5"/>
    
    <rect x="95" y="88" width="12" height="12" rx="2" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <line x1="115" y1="94" x2="128" y2="96" stroke="#a855f7" strokeWidth="1.5" opacity="0.5"/>
    
    {/* Bookmark ribbon */}
    <path d="M75 45 L75 25 L70 30 L65 25 L65 45" fill="#a855f7" opacity="0.8"/>
  </svg>
);

// Videos - Monitor/Screen with play button
export const IsometricVideo = () => (
  <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shadow */}
    <ellipse cx="80" cy="130" rx="50" ry="8" fill="#000000" opacity="0.08"/>
    
    {/* Monitor stand base */}
    <path d="M55 120 L80 110 L105 120 L80 130 Z" fill="#ddd6fe" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Monitor stand neck */}
    <path d="M75 95 L75 110 L85 105 L85 90 Z" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Monitor back */}
    <path d="M30 45 L30 95 L80 75 L80 25 Z" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M80 25 L80 75 L130 95 L130 45 Z" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Monitor top */}
    <path d="M30 45 L80 25 L130 45 L80 65 Z" fill="#f5f3ff" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Screen area (darker) */}
    <path d="M38 50 L80 32 L122 50 L80 68 Z" fill="#1e1b4b" opacity="0.9"/>
    
    {/* Play button circle */}
    <ellipse cx="80" cy="50" rx="15" ry="10" fill="#a855f7" opacity="0.9"/>
    
    {/* Play triangle */}
    <path d="M75 46 L75 54 L85 50 Z" fill="white"/>
    
    {/* Progress bar */}
    <path d="M45 72 L80 62 L115 72" stroke="#a855f7" strokeWidth="2" opacity="0.5"/>
    <path d="M45 72 L65 67" stroke="#a855f7" strokeWidth="3" opacity="0.8"/>
    <circle cx="65" cy="67" r="3" fill="#a855f7"/>
  </svg>
);

// Training & Courses - Graduation cap on books with certificate
export const IsometricTraining = () => (
  <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shadow */}
    <ellipse cx="80" cy="128" rx="50" ry="10" fill="#000000" opacity="0.08"/>
    
    {/* Bottom book */}
    <path d="M30 100 L80 75 L130 100 L80 125 Z" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M30 100 L30 107 L80 132 L80 125 Z" fill="#ddd6fe" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M80 125 L80 132 L130 107 L130 100 Z" fill="#c4b5fd" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Middle book */}
    <path d="M35 88 L80 65 L125 88 L80 111 Z" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M35 88 L35 94 L80 117 L80 111 Z" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M80 111 L80 117 L125 94 L125 88 Z" fill="#ddd6fe" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Top book */}
    <path d="M40 76 L80 55 L120 76 L80 97 Z" fill="#f5f3ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M40 76 L40 81 L80 102 L80 97 Z" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M80 97 L80 102 L120 81 L120 76 Z" fill="#ede9fe" stroke="#a855f7" strokeWidth="1.5"/>
    
    {/* Graduation cap - top diamond */}
    <path d="M55 45 L80 32 L105 45 L80 58 Z" fill="#a855f7" opacity="0.9"/>
    
    {/* Cap button on top */}
    <circle cx="80" cy="40" r="4" fill="#7c3aed"/>
    
    {/* Tassel */}
    <line x1="80" y1="44" x2="100" y2="55" stroke="#7c3aed" strokeWidth="2"/>
    <path d="M100 55 L100 70 L103 70 L103 55 Z" fill="#7c3aed"/>
    <ellipse cx="101.5" cy="72" rx="4" ry="3" fill="#a855f7"/>
    
    {/* Certificate/Diploma */}
    <rect x="108" y="85" width="28" height="22" rx="2" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
    <line x1="113" y1="92" x2="131" y2="92" stroke="#f59e0b" strokeWidth="1" opacity="0.6"/>
    <line x1="113" y1="97" x2="128" y2="97" stroke="#f59e0b" strokeWidth="1" opacity="0.4"/>
    <ellipse cx="122" cy="103" rx="5" ry="3" fill="#f59e0b" opacity="0.6"/>
  </svg>
);
