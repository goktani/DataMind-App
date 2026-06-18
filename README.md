## 📖 About the Project

**AI Auto-EDA Report Generator** is a full-fledged web application designed for data scientists and analysts. By analyzing the metadata of a user-uploaded or manually defined dataset, it generates an executable, professional-grade Jupyter Notebook (`.ipynb`) in seconds.

To strictly protect data privacy, this project **does not send raw data to the AI**. It extracts only the metadata (column names, data types, and missing value counts) and sends it to Google's **Gemini 3.5 Flash** model. Based on this metadata and user-specific prompts, the AI compiles a report featuring advanced data visualization codes using the `plotly_dark` theme.

## ✨ Key Features

* **🔒 Privacy-First Analysis:** The application parses your CSV file to extract *only metadata*. Your raw data is never sent to the server or the AI model.
* **🧠 Gemini 3.5 Flash Integration:** Understands the context of the dataset to automatically design the most suitable advanced charts (Sunburst, Heatmap, 3D Scatter, Violin, etc.) and statistical insights.
* **📝 Instant Jupyter Notebook (.ipynb) Output:** The generated codes and explanations can be downloaded as a fully functional `.ipynb` file with a single click, ready to run in your local VS Code or Jupyter environment.
* **💻 Advanced Notebook Viewer (UI):** Features an in-browser Jupyter-like interface with syntax highlighting, cell copying, and simulated cell execution.
* **📊 Smart Error Prevention Algorithm:** Automatically applies `pd.Categorical` transformations at the code level to prevent common categorical color scale errors (`ValueError`) in Plotly.
* **🛠️ Manual Metadata Editor:** Even if you don't have a dataset on hand, you can manually input column names, types, and NaN ratios to generate synthetic data analysis reports.

## 🛠️ Tech Stack

### Frontend (Client)
* **React 19:** Modern, fast, component-based UI development.
* **Vite:** Ultra-fast frontend build tool and development server.
* **Tailwind CSS v4:** Modern, utility-first CSS framework for flexible styling.
* **TypeScript:** Static typing for a more robust and maintainable codebase.
* **Lucide React:** Minimalist and elegant icon set.

### Backend (Server)
* **Node.js & Express.js:** Server infrastructure handling API endpoints and static file serving.
* **@google/genai:** Google's latest Gemini API client (utilizing the Gemini 3.5 Flash model).
* **esbuild:** Extremely fast bundler for compiling the server code for production.

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── MetadataForm.tsx    # Interface for parsing CSV and manually editing columns
│   │   └── NotebookViewer.tsx  # Component that renders the generated Markdown as a Jupyter Notebook UI
│   ├── App.tsx                 # Main application shell and state management
│   ├── data.ts                 # Pre-defined data templates for quick start (HR, E-Commerce, etc.)
│   ├── types.ts                # TypeScript interfaces (ColumnDef, VeriOzetiMetadata, etc.)
│   ├── utils.ts                # CSV parser, Metadata converter, and Markdown to .ipynb compiler
│   └── main.tsx                # React entry point
├── server.ts                   # Express backend and Gemini API integration (/api/generate-eda)
├── package.json                # Project dependencies and scripts
├── vite.config.ts              # Vite configuration
└── .env.example                # Template for environment variables
```

## 🚀 Installation & Setup
Prerequisites: Ensure you have Node.js (v18 or higher recommended) installed on your system.

### 1. Clone the Repository
```Bash
git clone <project-repo-url>
cd Auto-EDA-Report-
```

### 2. Install Dependencies
```Bash
npm install
```

### 3. Configure Environment Variables
Rename the .env.example file in the root directory to .env and add your Gemini API key. (You can obtain an API key from Google AI Studio).
```Kod snippet'i
GEMINI_API_KEY="Your_Gemini_API_Key_Here"
```

### 4. Start the Development Server
The following command will concurrently boot up both the Vite development server and the Express backend:
```Bash
npm run dev
```
You can access the application in your browser at http://localhost:3000.

### 5. Build for Production
To build the project for deployment or production environments:
```Bash
# Builds both the Frontend (Vite) and Backend (esbuild)
npm run build

# Starts the compiled production server
npm start
```

## 💡 How to Use
Define Your Data: Use the Import CSV tab on the left panel to paste your raw CSV data. The system will read it and extract only the column names and data types. Alternatively, you can add columns manually via the Manual Edit tab.

Add Custom Requests: Specify exactly what you want the AI to focus on (e.g., "Draw a violin plot showing salary distribution across departments").

Generate Report: Click the "Generate Jupyter Notebook" button. Gemini 3.5 Flash will craft your report in seconds.

View & Download: Review the generated Python code, explanations, and highlighted statistics via the Notebook UI on the right panel. Use the Download .ipynb button at the top right to download the file and run it locally.

## 🤖 Prompt Engineering & AI Behavior
This application utilizes highly specialized system instructions (systemInstruction) to elicit maximum professionalism from the Gemini model:

* The model is strictly instructed to return responses only in Markdown format.

* It is forced to always utilize advanced visualizations with the plotly_dark theme.

* Crucial insights and data points within the text are aesthetically highlighted using emerald green HTML tags (<span style="color: #27AE60; font-weight: bold;">).

* If no actual dataset is loaded into the system, it automatically writes Pandas code to generate a mock dataset that fits the defined columns.
