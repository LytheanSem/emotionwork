# 🎤 Visual EmotionWork — Event & Stage Management Platform  

A full-stack web application designed to revolutionize the event management and concert production industry in Cambodia.  
It provides a **centralized digital platform** for stage booking, 3D stage design, equipment management, consultation scheduling, and automation workflows — enhancing efficiency, customer experience, and business transparency.  

---

## 🚀 Table of Contents  
- [Problem Statement](#-problem-statement)  
- [Project Objective](#-project-objective)  
- [System Overview](#-system-overview)  
- [Core Features](#-core-features)  
- [Technology Stack](#-technology-stack)  
- [System Architecture](#-system-architecture)  
- [Automation Workflow](#-automation-workflow)  
- [Testing & Evaluation](#-testing--evaluation)  
- [Future Enhancements](#-future-enhancements)  
- [Team](#-team)  
- [Conclusion](#-conclusion)  

---

## 🧩 Problem Statement  
Traditional event management faces several key challenges:
- Manual bookings through calls and emails  
- Equipment details stored in spreadsheets  
- No real-time availability or pricing updates  
- Lack of centralized client-staff communication  
- Poor customer experience and missed opportunities  

💡 **Goal:** Transform manual workflows into a digital, automated, and user-friendly platform.  

---

## 🎯 Project Objective  
The project aims to:  
- Develop a **centralized web platform** for event and stage management.  
- Integrate **automation tools** (Zoom, Gmail, Google Sheets) for efficiency.  
- Enable customers to **design stages in 3D**, book equipment, and schedule meetings online.  
- Provide **role-based access control** for Admin, Manager, and Customer roles.  

---

## 🏗️ System Overview  

### 🔹 Equipment Management  
Browse, filter, and manage audio-visual equipment in real time.  

### 🔹 Consultation Booking  
Book online or on-site meetings with Zoom integration.  

### 🔹 3D Stage Designer  
Interactive drag-and-drop stage creation using **Three.js** and **React Three Fiber**.  

### 🔹 AI Chatbot  
24/7 automated assistant (via **n8n** + **OpenAI**) for inquiries and bookings.  

### 🔹 Stage Booking System  
Reserve stages with real-time availability and pricing.  

---

## ⚙️ Core Features  

### 🏠 Home & Services Page  
User-friendly interface introducing services like stage setup, LED rental, lighting design, and consultations.  

### 🎚️ Equipment Catalog  
Displays images, specifications, and rental prices with filtering and cart functionality.  

### 🧱 3D Stage Designer  
- Built with **Three.js** and **React Three Fiber**  
- Supports drag-and-drop, resizing, and color customization  
- Export designs as **.png** or **.pdf**  
- Visualizes client setup before booking  

### 📅 Booking & Scheduling  
- Integrated **Zoom API** for meeting creation  
- **Google Sheets API** logs bookings  
- **Gmail API** sends automatic confirmations  

### 🤖 AI Chatbot (n8n Workflow)  
- Natural language support using **OpenAI models**  
- Automates booking, availability checks, and responses  

### 🛠️ Admin Dashboard  
- Manage users, bookings, and equipment  
- Full **CRUD** operations  
- Integrated **Cloudinary** for image and media management  

---

## 🧰 Technology Stack  

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Backend** | Next.js API Routes, RESTful APIs, tRPC |
| **Database** | MongoDB Atlas, Google Sheets |
| **Media Management** | Cloudinary |
| **Automation** | Zoom API, Gmail API, Google Sheets API, n8n |
| **Testing & Deployment** | Postman, GitHub, Vercel |

---

## 🧱 System Architecture  

- **Frontend:** Next.js & React — handles UI, navigation, and real-time updates  
- **Backend:** Next.js API routes & tRPC for type-safe API communication  
- **Database:** MongoDB Atlas for scalability & persistence  
- **Automation Layer:** n8n + APIs for task orchestration  

---

## 🔄 Automation Workflow  

**n8n Automation Includes:**  
- Chatbot responses using OpenAI  
- Auto-creation of Zoom meetings  
- Email confirmations via Gmail API  
- Google Sheets logging for Admin tracking  

---

## 🧪 Testing & Evaluation  
✅ UI tested across devices for responsive design  
✅ Booking and authentication workflows validated  
✅ APIs tested via Postman  
✅ End-to-end testing for Cloudinary, Zoom, and Google Sheets integrations  

---

## 🔮 Future Enhancements  
- 📊 Analytics Dashboard for business insights  
- 📱 Mobile App (iOS & Android)  
- 🏷️ Automated Inventory Management  
- 🤖 AI-powered Equipment Recommendations  
- 🌍 Khmer Language Support for localization  

---

## 👥 Team  
**Project Name:** Visual EmotionWork (PAZ)  
**Institution:** Assumption University – Faculty of Science & Technology  
**Team Members:**  
- Paveena Chuayaem  
- Vibol Rothmony Seng
- Lythean Sem

---

## 🌐 Deployment  
**Frontend & Backend:** [Vercel Deployment Link](#https://www.visualemotionwork.com/)  
**Repository:** [GitHub Project Link](#)  

---

## 🏁 Conclusion  
Visual EmotionWork successfully delivers a modern digital platform that transforms event management and concert production.  
It unifies booking, equipment rental, consultation, and 3D stage design in a single, secure, and automated system — driving efficiency, customer satisfaction, and competitiveness in Cambodia’s event industry.  
