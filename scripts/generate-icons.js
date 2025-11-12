#!/usr/bin/env node
/**
 * Generate Android launcher icons from SVG
 * This script creates PNG icons for different DPI densities
 */

const fs = require('fs');
const path = require('path');

// SVG icon content
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="100" cy="100" r="90" fill="url(#gradient)" />

  <!-- Flow waves -->
  <path d="M 40 80 Q 60 70, 80 80 T 120 80 T 160 80" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.4" />
  <path d="M 40 100 Q 60 90, 80 100 T 120 100 T 160 100" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6" />
  <path d="M 40 120 Q 60 110, 80 120 T 120 120 T 160 120" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />

  <!-- Trending up arrow -->
  <g transform="translate(130, 60)">
    <path d="M 0 30 L 30 0" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 30 0 L 30 15 M 30 0 L 15 0" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Currency symbol (Ft) -->
  <text x="50" y="70" fill="white" font-size="32" font-weight="bold" font-family="Arial, sans-serif">Ft</text>
</svg>`;

// Icon sizes for different DPI
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Base directory
const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Create directories and write SVG files
Object.entries(sizes).forEach(([folder, size]) => {
  const dir = path.join(androidResDir, folder);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write SVG file (Android can use SVG for launcher icons on Android 8.0+)
  const svgPath = path.join(dir, 'ic_launcher.xml');
  const androidVector = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${size}dp"
    android:height="${size}dp"
    android:viewportWidth="200"
    android:viewportHeight="200">

    <!-- Background circle with gradient -->
    <path
        android:pathData="M100,10a90,90 0 1,0 0,180a90,90 0 1,0 0,-180"
        android:fillColor="#6366f1"/>

    <!-- Flow waves -->
    <path
        android:pathData="M 40 80 Q 60 70, 80 80 T 120 80 T 160 80"
        android:strokeColor="#ffffff"
        android:strokeWidth="6"
        android:strokeLineCap="round"
        android:fillColor="#00000000"
        android:strokeAlpha="0.4"/>

    <path
        android:pathData="M 40 100 Q 60 90, 80 100 T 120 100 T 160 100"
        android:strokeColor="#ffffff"
        android:strokeWidth="6"
        android:strokeLineCap="round"
        android:fillColor="#00000000"
        android:strokeAlpha="0.6"/>

    <path
        android:pathData="M 40 120 Q 60 110, 80 120 T 120 120 T 160 120"
        android:strokeColor="#ffffff"
        android:strokeWidth="6"
        android:strokeLineCap="round"
        android:fillColor="#00000000"
        android:strokeAlpha="0.8"/>

    <!-- Trending up arrow -->
    <path
        android:pathData="M 130 90 L 160 60 L 160 75 M 160 60 L 145 60"
        android:strokeColor="#ffffff"
        android:strokeWidth="8"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:fillColor="#00000000"/>
</vector>`;

  fs.writeFileSync(svgPath, androidVector);
  console.log(`✅ Created ${folder}/ic_launcher.xml`);
});

console.log('\n🎨 Android launcher icons generated successfully!');
console.log('📱 Icons created for all DPI densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)');
