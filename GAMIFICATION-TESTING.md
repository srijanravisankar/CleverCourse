# 🎮 Gamification Engine Testing Guide

Welcome to the CleverCourse gamification engine! This guide will help you test all the new interactive features designed to make learning more engaging and ADHD-friendly.

## 🚀 Quick Start

1. **Start the development server:**

   ```bash
   pnpm dev
   ```

2. **Open the app:** Navigate to `http://localhost:3000`

3. **Create or select a course** from the sidebar

4. **Select a section** to view its content

---

## 🎯 Features to Test

### 1. 📖 Article Pages - "Mark Complete" Button

**Location:** Article View (when viewing course content)

**How to test:**

1. Navigate to any section with article content
2. Scroll through the article pages using the navigation
3. Look for the **"✨ Mark Complete"** button at the bottom of each page
4. Click it to mark the page as complete

**Expected behavior:**

- ✅ Button turns green with "Completed!" text
- ✅ **Confetti animation** appears on screen 🎉
- ✅ **XP popup** shows "+10 XP" with a sparkle animation
- ✅ Button becomes disabled (can't claim XP twice)
- ✅ Badge shows how many pages you've completed

**XP Awarded:** 10 XP per page

---

### 2. 🧠 Mind Map - "I Understand This!" Button

**Location:** Mind Map View (visual concept map)

**How to test:**

1. Switch to the "Mind Map" view from the section navigation
2. Explore the interactive mind map visualization
3. Click the **"🧠 I Understand This!"** button at the top

**Expected behavior:**

- ✅ Button transforms to show "Mastered! 🌟"
- ✅ **Large confetti burst** celebrates your understanding
- ✅ **XP badge** appears with "+20 XP"
- ✅ Green success styling indicates completion
- ✅ Can only claim XP once per mind map

**XP Awarded:** 20 XP per mind map

---

### 3. 🗃️ Flashcards - "Got It!" Per Card

**Location:** Flashcards View

**How to test:**

1. Switch to the "Flashcards" view
2. Click on a flashcard to flip it and reveal the answer
3. Click the **"Got It! ✓"** button on cards you've learned
4. Complete all flashcards in the deck

**Expected behavior:**

- ✅ Each card shows a **green checkmark badge** when marked as learned
- ✅ XP popup shows "+5 XP" for each card
- ✅ Progress counter updates (e.g., "3/10 cards learned")
- ✅ When ALL cards are learned: **Big confetti celebration!** 🎊
- ✅ "Deck Complete!" message appears

**XP Awarded:** 5 XP per flashcard

---

### 4. 📝 Multiple Choice Quiz - Correct Answers

**Location:** MCQ Quiz View

**How to test:**

1. Switch to the "MCQ" (Multiple Choice) view
2. Read the question and select your answer
3. Click "Check Answer" to submit
4. Answer correctly to earn XP!

**Expected behavior:**

- ✅ Correct answers trigger **green confetti** 🎉
- ✅ **XP badge** appears at top-right: "+10 XP"
- ✅ Answer option turns green with a checkmark
- ✅ Wrong answers show the correct answer highlighted
- ✅ "Continue" button appears to move to next question

**XP Awarded:** 15 XP per correct answer

---

### 5. ✅ True/False Quiz - Correct Answers

**Location:** True/False Quiz View

**How to test:**

1. Switch to the "T/F" view
2. Read the statement and choose TRUE or FALSE
3. Click "Check Answer"
4. Answer correctly to earn XP!

**Expected behavior:**

- ✅ Correct answers trigger **amber/yellow confetti**
- ✅ **XP badge** shows "+15 XP" with star animation
- ✅ Selected answer turns green if correct
- ✅ Explanation appears with "🎉 Well Done! +15 XP" header
- ✅ Wrong answers show learning opportunity message

**XP Awarded:** 15 XP per correct answer

---

### 6. ✏️ Fill in the Blanks - Correct Answers

**Location:** Fill in the Blanks View

**How to test:**

1. Switch to the "Fill" view
2. Read the sentence with a blank
3. Type your answer in the input field
4. Click "Check Word"

**Expected behavior:**

- ✅ Correct answers trigger **purple/pink confetti**
- ✅ **XP badge** shows "+15 XP" with zap animation
- ✅ Input field turns green with correct answer
- ✅ "Spot on!" message with star icon appears
- ✅ Wrong answers show the correct word above the input

**XP Awarded:** 15 XP per correct answer

---

## 🎨 Visual Feedback Summary

| Action                  | Animation                  | XP      |
| ----------------------- | -------------------------- | ------- |
| Complete article page   | Confetti + floating XP     | +10     |
| Understand mind map     | Large confetti + badge     | +20     |
| Learn flashcard         | Checkmark + small XP popup | +5      |
| Complete flashcard deck | Big celebration confetti   | (bonus) |
| Correct MCQ answer      | Green confetti + XP badge  | +15     |
| Correct T/F answer      | Amber confetti + XP badge  | +15     |
| Correct Fill answer     | Purple confetti + XP badge | +15     |

---

## 🎮 ADHD-Friendly Design Notes

The gamification engine is specifically designed to support learners with ADHD:

1. **Instant Visual Feedback** - Every action has immediate, satisfying visual feedback
2. **Variable Rewards** - XP amounts can include random bonuses (keeps it exciting!)
3. **Micro-accomplishments** - Break learning into small, rewarding chunks
4. **Confetti Celebrations** - Dopamine hits for completing tasks
5. **Progress Badges** - Visual indicators of advancement
6. **Color-coded Feedback** - Green for success, amber/purple for variety

---

## 🔧 Troubleshooting

### Confetti not appearing?

- Make sure `canvas-confetti` is installed: `pnpm add canvas-confetti`
- Check browser console for any JavaScript errors

### XP not being recorded?

- Server actions require authentication
- Check if user is logged in
- Verify database connection is working

### Animations not smooth?

- Enable hardware acceleration in browser
- Check if `framer-motion` is properly installed

---

## 📱 Testing Checklist

- [ ] Article page completion works
- [ ] Mind map understanding button works
- [ ] Flashcard "Got It" button works per card
- [ ] Flashcard deck completion celebration works
- [ ] MCQ correct answers trigger rewards
- [ ] True/False correct answers trigger rewards
- [ ] Fill-in-the-blank correct answers trigger rewards
- [ ] XP badges appear and animate correctly
- [ ] Confetti appears in different colors for different actions
- [ ] All animations are smooth and not jarring

---

**Happy Learning! 🚀✨**
