/**
 * Database Seed Script
 *
 * This script populates the database with sample data for testing and development.
 * Run with: npx tsx src/db/seed.ts
 */

import { db } from "./index";
import {
  userRepository,
  courseRepository,
  sectionRepository,
  articleRepository,
  flashcardRepository,
  mindMapRepository,
  mcqRepository,
  trueFalseRepository,
  fillUpRepository,
} from "./repositories";
import type { MindMapData } from "./types";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // ============================================================================
  // CREATE TEST USER
  // ============================================================================
  console.log("Creating test user...");
  const user = await userRepository.create({
    email: "test@clevercourse.ai",
    name: "Test User",
    passwordHash: "$2a$10$dummyhashfortestingonly123456789", // bcrypt dummy hash
    avatar: null,
  });
  console.log(`✓ Created user: ${user.name} (${user.id})\n`);

  // ============================================================================
  // CREATE SAMPLE COURSE
  // ============================================================================
  console.log("Creating sample course...");
  const course = await courseRepository.create({
    userId: user.id,
    title: "Introduction to Machine Learning",
    description:
      "A comprehensive beginner's guide to understanding the fundamentals of Machine Learning, including supervised learning, neural networks, and practical applications.",
    topic: "Machine Learning",
    level: "beginner",
    goal: "Understand the core concepts of ML and be able to build simple models",
    tone: "professional",
    targetAudience: "Software developers new to ML",
    prerequisites: "Basic programming knowledge, high school math",
    sectionCount: 3,
    timeCommitment: 30,
    status: "active",
  });
  console.log(`✓ Created course: ${course.title} (${course.id})\n`);

  // ============================================================================
  // CREATE COURSE SECTIONS WITH CONTENT
  // ============================================================================
  const sectionsData = [
    {
      sectionNumber: 1,
      title: "What is Machine Learning?",
      article: {
        pages: [
          {
            pageTitle: "Introduction to Machine Learning",
            content: `# Introduction to Machine Learning

Machine Learning (ML) is a subset of artificial intelligence (AI) that enables systems to learn and improve from experience without being explicitly programmed.

## Key Concepts

### What Makes ML Different?

Traditional programming involves writing explicit rules for a computer to follow. In contrast, machine learning allows computers to **learn patterns from data** and make decisions based on those patterns.

### Types of Machine Learning

1. **Supervised Learning**: The algorithm learns from labeled training data
2. **Unsupervised Learning**: The algorithm finds patterns in unlabeled data
3. **Reinforcement Learning**: The algorithm learns through trial and error

## Real-World Applications

- **Email spam filtering**
- **Product recommendations**
- **Voice assistants**
- **Medical diagnosis**
- **Self-driving cars**

> Machine Learning is not just about algorithms; it's about finding patterns in data that humans might miss.
`,
          },
          {
            pageTitle: "The ML Workflow",
            content: `# The Machine Learning Workflow

Every ML project follows a similar workflow. Understanding this process is crucial for success.

## 1. Define the Problem

Before writing any code, clearly define:
- What problem are you solving?
- What data do you need?
- How will you measure success?

## 2. Collect and Prepare Data

\`\`\`
Raw Data → Clean Data → Feature Engineering → Train/Test Split
\`\`\`

Data preparation often takes **60-80% of a project's time**.

## 3. Choose and Train a Model

Select an appropriate algorithm based on:
- Problem type (classification, regression, clustering)
- Data size and complexity
- Interpretability requirements

## 4. Evaluate and Deploy

- Test on held-out data
- Monitor performance in production
- Iterate and improve
`,
          },
        ],
      },
      mindMap: {
        label: "Machine Learning",
        children: [
          {
            label: "Types",
            children: [
              { label: "Supervised Learning" },
              { label: "Unsupervised Learning" },
              { label: "Reinforcement Learning" },
            ],
          },
          {
            label: "Applications",
            children: [
              { label: "Image Recognition" },
              { label: "Natural Language Processing" },
              { label: "Recommendation Systems" },
            ],
          },
          {
            label: "Key Concepts",
            children: [
              { label: "Training Data" },
              { label: "Features" },
              { label: "Model" },
              { label: "Predictions" },
            ],
          },
        ],
      },
      flashcards: [
        {
          front: "What is Machine Learning?",
          back: "A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.",
        },
        {
          front: "What are the three main types of Machine Learning?",
          back: "1. Supervised Learning\n2. Unsupervised Learning\n3. Reinforcement Learning",
        },
        {
          front: "What is Supervised Learning?",
          back: "A type of ML where the algorithm learns from labeled training data to make predictions on new, unseen data.",
        },
        {
          front:
            "What percentage of an ML project is typically spent on data preparation?",
          back: "60-80% of a project's time is spent on data collection and preparation.",
        },
      ],
      mcqs: [
        {
          question: "Which of the following is NOT a type of Machine Learning?",
          options: [
            "Supervised Learning",
            "Unsupervised Learning",
            "Procedural Learning",
            "Reinforcement Learning",
          ],
          answer: "Procedural Learning",
        },
        {
          question: "What is the primary goal of Machine Learning?",
          options: [
            "To replace human programmers",
            "To learn patterns from data and make predictions",
            "To store large amounts of data",
            "To execute programs faster",
          ],
          answer: "To learn patterns from data and make predictions",
        },
      ],
      trueFalse: [
        {
          question:
            "Machine Learning requires explicitly programming all rules.",
          answer: false,
          explanation:
            "Machine Learning allows systems to learn patterns from data without explicit programming of rules.",
        },
        {
          question:
            "Data preparation typically takes the majority of time in an ML project.",
          answer: true,
          explanation:
            "Data collection and preparation often takes 60-80% of a project's time.",
        },
      ],
      fillUps: [
        {
          sentence: "Machine Learning is a subset of _______ intelligence.",
          missingWord: "artificial",
        },
        {
          sentence:
            "In _______ learning, the algorithm learns from labeled training data.",
          missingWord: "supervised",
        },
      ],
    },
    {
      sectionNumber: 2,
      title: "Supervised Learning Deep Dive",
      article: {
        pages: [
          {
            pageTitle: "Understanding Supervised Learning",
            content: `# Understanding Supervised Learning

Supervised learning is the most common type of machine learning. Let's explore it in depth.

## The Core Concept

In supervised learning, we train a model using **labeled examples**. Each example consists of:
- **Input features** (X): The data we use to make predictions
- **Output label** (y): The correct answer we want to predict

## Classification vs Regression

### Classification
Predicting a **category** or **class**:
- Email: Spam or Not Spam?
- Image: Cat or Dog?
- Tumor: Malignant or Benign?

### Regression
Predicting a **continuous value**:
- House price: $250,000
- Temperature: 72.5°F
- Stock price: $145.23

## Common Algorithms

| Algorithm | Type | Use Case |
|-----------|------|----------|
| Linear Regression | Regression | Price prediction |
| Logistic Regression | Classification | Binary classification |
| Decision Trees | Both | Explainable predictions |
| Random Forest | Both | Robust predictions |
| Neural Networks | Both | Complex patterns |
`,
          },
        ],
      },
      mindMap: {
        label: "Supervised Learning",
        children: [
          {
            label: "Classification",
            children: [{ label: "Binary" }, { label: "Multi-class" }],
          },
          {
            label: "Regression",
            children: [{ label: "Linear" }, { label: "Polynomial" }],
          },
          {
            label: "Algorithms",
            children: [
              { label: "Decision Trees" },
              { label: "Random Forest" },
              { label: "Neural Networks" },
            ],
          },
        ],
      },
      flashcards: [
        {
          front:
            "What is the difference between classification and regression?",
          back: "Classification predicts categories/classes, while regression predicts continuous numerical values.",
        },
        {
          front: "What are 'features' in machine learning?",
          back: "Features are the input variables (X) used to make predictions. They are the measurable properties of the data.",
        },
      ],
      mcqs: [
        {
          question: "Which type of problem is 'predicting house prices'?",
          options: [
            "Classification",
            "Regression",
            "Clustering",
            "Reinforcement",
          ],
          answer: "Regression",
        },
      ],
      trueFalse: [
        {
          question:
            "Logistic Regression is used for regression problems despite its name.",
          answer: false,
          explanation:
            "Despite its name, Logistic Regression is actually used for classification problems, not regression.",
        },
      ],
      fillUps: [
        {
          sentence: "_______ learning uses labeled data to train models.",
          missingWord: "Supervised",
        },
      ],
    },
    {
      sectionNumber: 3,
      title: "Building Your First Model",
      article: {
        pages: [
          {
            pageTitle: "Getting Started with Model Building",
            content: `# Building Your First ML Model

Let's walk through the process of building a simple machine learning model.

## Step 1: Import Libraries

\`\`\`python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
\`\`\`

## Step 2: Load and Explore Data

\`\`\`python
# Load dataset
data = pd.read_csv('dataset.csv')

# Explore
print(data.head())
print(data.describe())
\`\`\`

## Step 3: Prepare Data

\`\`\`python
# Split features and target
X = data.drop('target', axis=1)
y = data['target']

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
\`\`\`

## Step 4: Train and Evaluate

\`\`\`python
# Create and train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)

# Evaluate
accuracy = accuracy_score(y_test, predictions)
print(f'Accuracy: {accuracy:.2f}')
\`\`\`

## Key Takeaways

1. Always split your data into training and test sets
2. Start with simple models before complex ones
3. Evaluate on data the model hasn't seen
4. Iterate and improve based on results
`,
          },
        ],
      },
      mindMap: {
        label: "Model Building",
        children: [
          {
            label: "Data Prep",
            children: [
              { label: "Load Data" },
              { label: "Clean Data" },
              { label: "Split Data" },
            ],
          },
          {
            label: "Training",
            children: [{ label: "Choose Model" }, { label: "Fit Model" }],
          },
          {
            label: "Evaluation",
            children: [
              { label: "Predictions" },
              { label: "Metrics" },
              { label: "Iterate" },
            ],
          },
        ],
      },
      flashcards: [
        {
          front: "What is train/test split?",
          back: "Dividing your dataset into two parts: one for training the model (typically 80%) and one for testing its performance (typically 20%).",
        },
        {
          front: "Why do we need a test set?",
          back: "To evaluate how well the model generalizes to new, unseen data. Without a test set, we can't know if the model is overfitting.",
        },
      ],
      mcqs: [
        {
          question: "What is the typical split ratio for train/test data?",
          options: ["50/50", "80/20", "90/10", "70/30"],
          answer: "80/20",
        },
      ],
      trueFalse: [
        {
          question:
            "You should always train on 100% of your data for best results.",
          answer: false,
          explanation:
            "You should always hold out some data for testing to evaluate how well your model generalizes to unseen data.",
        },
      ],
      fillUps: [
        {
          sentence:
            "The process of a model learning too much from training data is called _______.",
          missingWord: "overfitting",
        },
      ],
    },
  ];

  // Create sections and content
  for (const sectionData of sectionsData) {
    console.log(
      `Creating section ${sectionData.sectionNumber}: ${sectionData.title}...`,
    );

    const section = await sectionRepository.create({
      courseId: course.id,
      sectionNumber: sectionData.sectionNumber,
      title: sectionData.title,
    });

    // Create article pages
    const articlePages = sectionData.article.pages.map((page, index) => ({
      sectionId: section.id,
      pageNumber: index + 1,
      pageTitle: page.pageTitle,
      content: page.content,
    }));
    await articleRepository.createMany(articlePages);
    console.log(`  ✓ Created ${articlePages.length} article page(s)`);

    // Create mind map
    await mindMapRepository.create({
      sectionId: section.id,
      data: JSON.stringify(sectionData.mindMap),
    });
    console.log(`  ✓ Created mind map`);

    // Create flashcards
    const flashcards = sectionData.flashcards.map((card) => ({
      sectionId: section.id,
      front: card.front,
      back: card.back,
    }));
    await flashcardRepository.createMany(flashcards);
    console.log(`  ✓ Created ${flashcards.length} flashcard(s)`);

    // Create MCQ questions
    const mcqs = sectionData.mcqs.map((mcq) => ({
      sectionId: section.id,
      question: mcq.question,
      options: JSON.stringify(mcq.options),
      answer: mcq.answer,
    }));
    await mcqRepository.createMany(mcqs);
    console.log(`  ✓ Created ${mcqs.length} MCQ question(s)`);

    // Create True/False questions
    const trueFalseQs = sectionData.trueFalse.map((tf) => ({
      sectionId: section.id,
      question: tf.question,
      answer: tf.answer,
      explanation: tf.explanation,
    }));
    await trueFalseRepository.createMany(trueFalseQs);
    console.log(`  ✓ Created ${trueFalseQs.length} True/False question(s)`);

    // Create Fill-in-the-blank questions
    const fillUps = sectionData.fillUps.map((fill) => ({
      sectionId: section.id,
      sentence: fill.sentence,
      missingWord: fill.missingWord,
    }));
    await fillUpRepository.createMany(fillUps);
    console.log(`  ✓ Created ${fillUps.length} Fill-in-the-blank question(s)`);
  }

  console.log("\n✅ Database seeded successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   - 1 User`);
  console.log(`   - 1 Course`);
  console.log(`   - ${sectionsData.length} Sections`);
  console.log(
    `   - Article pages, flashcards, quizzes, and mind maps for each section`,
  );
}

// Run the seed function
seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
