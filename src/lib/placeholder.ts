export const MOCK_COURSE_SECTION = {
  sectionTitle: "Introduction to React Hooks",
  article: {
    pages: [
      {
        pageTitle: "What are Hooks?",
        content: "Hooks are functions that let you **'hook into'** React state and lifecycle features from function components. They were introduced in React 16.8.\n\n### Why Hooks?\n- Better code reuse\n- No more 'wrapper hell'\n- Avoids complex class components"
      },
      {
        pageTitle: "The useState Hook",
        content: "The `useState` hook is the most basic hook. It returns a pair: the **current state value** and a **function** that lets you update it.\n\n```javascript\nconst [count, setCount] = useState(0);\n```"
      },
      {
        pageTitle: "Rules of Hooks",
        content: "1. **Only Call Hooks at the Top Level**: Don’t call Hooks inside loops, conditions, or nested functions.\n2. **Only Call Hooks from React Functions**: Don’t call Hooks from regular JavaScript functions."
      }
    ]
  },
  studyMaterial: {
  mindMap: {
    label: "React Hooks",
    children: [
      {
        label: "State Management",
        children: [
          { label: "useState" },
          { label: "Functional State" }
        ]
      },
      {
        label: "Side Effects",
        children: [
          { label: "useEffect" },
          { label: "Lifecycle Events" }
        ]
      },
      {
        label: "Rules of Hooks",
        children: [
          { label: "Top-level only" },
          { label: "React Functions only" }
        ]
      }
    ]
  },
    flashcards: [
      { front: "What hook handles side effects?", back: "useEffect" },
      { front: "Can you use hooks in class components?", back: "No, hooks are for functional components only." },
      { front: "What does useState return?", back: "An array with the current state and a setter function." },
      { front: "When was hooks introduced?", back: "React version 16.8" },
      { front: "Can hooks be conditional?", back: "No, they must be called at the top level." }
    ]
  },
  quiz: {
    mcqs: [
      {
        question: "Which hook is used to manage state?",
        options: ["useEffect", "useState", "useContext", "useRef"],
        answer: "useState"
      },
      {
        question: "Where should you call hooks?",
        options: ["Inside loops", "Top level of component", "Inside if statements", "In any JS function"],
        answer: "Top level of component"
      },
      {
        question: "What does useEffect replace in class components?",
        options: ["constructor", "render", "componentDidMount", "state"],
        answer: "componentDidMount"
      },
      {
        question: "What is the second element returned by useState?",
        options: ["The initial value", "A dispatcher", "A setter function", "The state object"],
        answer: "A setter function"
      },
      {
        question: "Which hook is for context?",
        options: ["useContext", "useProvider", "useState", "useMemo"],
        answer: "useContext"
      }
    ],
    trueFalse: [
      {
        question: "Hooks can be used inside loops.",
        answer: false,
        explanation: "Hooks must always be called at the top level of your React function."
      },
      {
        question: "useState can only hold strings.",
        answer: false,
        explanation: "useState can hold any JavaScript value, including objects and arrays."
      },
      {
        question: "useEffect runs after every render by default.",
        answer: true,
        explanation: "Unless you provide a dependency array, it runs after every completed render."
      },
      {
        question: "You can create your own custom hooks.",
        answer: true,
        explanation: "Custom hooks are just functions whose names start with 'use' and can call other hooks."
      },
      {
        question: "Hooks work in class components.",
        answer: false,
        explanation: "Hooks are specifically designed for functional components."
      }
    ],
    fillUps: [
      { sentence: "The ______ hook allows you to perform side effects.", missingWord: "useEffect" },
      { sentence: "Hooks were introduced in React version ______.", missingWord: "16.8" },
      { sentence: "A custom hook must start with the word '______'.", missingWord: "use" },
      { sentence: "The ______ hook is used to access values from a provider.", missingWord: "useContext" },
      { sentence: "State updates in React are ______ and don't change the current variable immediately.", missingWord: "asynchronous" }
    ]
  }
};