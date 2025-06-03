# Helideck Inspection Web App

A React + Vite + Tailwind-based application for managing helideck inspections across offshore facilities.

## 🚀 Features

- View inspection history per facility
- Submit new inspections with notes and document/photo uploads
- Dashboard with real-time inspection status
- LocalStorage persistence (no backend needed)
- Recharts visualization of upcoming/overdue status

## 🛠 Stack

- [React](https://reactjs.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [React Router](https://reactrouter.com)
- [UUID](https://www.npmjs.com/package/uuid)

## 📦 Setup

```bash
npm install
npm run dev
```

## 📁 Folder Structure

```
src/
├── pages/
├── components/
├── utils/
├── App.jsx
├── main.jsx
├── index.css
```

## 📝 Notes

- Inspections are stored locally in your browser's localStorage.
- Files (images/PDFs) are previewed via `URL.createObjectURL` and not permanently stored.
