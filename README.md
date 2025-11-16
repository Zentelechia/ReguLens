
# ReguLens

## Overview

ReguLens is a compliance analysis MVP developed for Junction 2025 (Nov 14–16). It analyses a company’s MOE (Manual of Operations / internal documentation) and identifies gaps, inconsistencies, and contradictions compared to regulatory requirements (e.g., EASA Part-145).

The system consists of:

- **Frontend (Meteor app)**: Provides a web UI for uploading handbooks (PDF, DOCX, MD, etc.), viewing findings, and navigating compliance results. The upload form and findings UI are built with Meteor and React. All findings are shown after automated checks against Part-145.
- **Backend (Python app)**: Handles document analysis and regulatory comparison. The backend exposes an HTTP API for the frontend to upload files and receive findings. It is designed to work with large documents and regulatory texts.
- **LLM Integration**: Uses [LM Studio](https://lmstudio.ai/) to run the [Llama-2-7b-chat](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf) model locally for advanced text analysis and compliance reasoning. LM Studio must be running with the Llama-2-7b-chat model loaded for the backend to function.

The goal is to demonstrate how automated document comparison can support compliance teams, auditors, and safety managers by reducing manual review time and making regulatory alignment more transparent.


## Prerequisites
- **Node.js** (LTS recommended)
- **Git**
- **Meteor**
- **Python 3.9+** (for backend)
- **LM Studio** (for local LLM inference)


## Install Meteor
If you do not have Meteor installed, run:

```
curl https://install.meteor.com/ | sh
```


## Clone the repository
```
git clone git@github.com:Zentelechia/ReguLens.git
cd ReguLens
```


## Install dependencies
```
cd frontend
meteor npm install
```


## Run the Meteor frontend
```
cd frontend
meteor
```
The app will be available at [http://localhost:3000](http://localhost:3000)

## Run the Python backend
```
cd backend
python app.py
```
The backend will listen for file uploads and analysis requests from the frontend.

## LLM Setup (LM Studio + Llama-2-7b-chat)
1. Download and install [LM Studio](https://lmstudio.ai/).
2. Download the [Llama-2-7b-chat](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf) model and load it in LM Studio.
3. Start the LM Studio server so the Python backend can access the model for compliance analysis.


## License & Intellectual Property
All intellectual property (IP) related to this project belongs to the team:

- Iurii Zubarovskii
- Lilia MAHDID
- Billal MOKHTARI

No part of this project may be used, copied, or distributed without explicit permission from all team members.

## Notes
- If you encounter errors about missing branches when pushing to GitHub, make sure you have committed at least once and are on the correct branch (usually `main`).
- For development, use Node.js LTS and the latest stable Meteor version.
- For more information, see [Meteor Docs](https://docs.meteor.com/).
