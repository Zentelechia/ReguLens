# Project Overview

This MVP, developed for Junction 2025 (Nov 14–16), focuses on analysing a company’s MOE (Manual of Operations / internal documentation) and identifying gaps, inconsistencies, and contradictions when compared against relevant regulatory requirements.

The system ingests both regulatory text and the organisation’s internal documents, then uses text-analysis and similarity-based matching to:

- detect which regulatory requirements are covered in the MOE
- highlight missing or weakly addressed areas
- surface contradictions between regulation and company documentation
- provide a structured overview of compliance gaps

The goal of this MVP is to demonstrate how automated document comparison can support compliance teams, auditors, and safety managers by reducing manual review time and making regulatory alignment more transparent.
# ReguLens

## Prerequisites
- **Node.js** (LTS recommended)
- **Git**
- **Meteor**

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
meteor npm install
```

## Run the app
```
meteor
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Notes
- If you encounter errors about missing branches when pushing to GitHub, make sure you have committed at least once and are on the correct branch (usually `main`).
- For development, use Node.js LTS and the latest stable Meteor version.
- For more information, see [Meteor Docs](https://docs.meteor.com/).
