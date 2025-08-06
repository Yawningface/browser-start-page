# Browser Start Page

**Your Open Source Alternative to Star.me**

🌐 **Live Demo:** [Browser Start Page Demo](https://chromewebstore.google.com/detail/browser-start-page/cbmbipkecoonmcocfmoaddgmffbnfpho)  
🔗 **Website:** [yawningface.org](https://yawningface.org/) 
💻 **GitHub:** [Browser Start Page on GitHub](https://github.com/Yawningface/browser-start-page)

Browser Start Page is an open source, highly customizable start page (which appears when clicking new tab or when opening the browser) designed to enhance your browsing experience. As a powerful alternative to star.me, it combines the simplicity of marker widgets with the versatility of embed widgets, allowing you to create a personalized dashboard that works just the way you want.

---
## Usage

- **Marker Widgets:** Easily add, edit, and remove links with custom aliases for quick access.
- **Embed Widgets:** Simply copy the URL of any webpage (e.g., your favorite productivity tool or a pomodoro timer) and embed it into your start page.
- **Customization:** Modify settings, change themes, and organize your dashboard to reflect your unique workflow.

## Getting Started

### Prerequisites

1. **Node.js:** Ensure you have Node.js version **22.12.0 or higher**. If not, you can install or switch versions using [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm).

   **Using NVM:**
   ```sh
   # Install the latest Node.js version (if needed)
   nvm install node

   # Or install a specific version, e.g., 22.12.0
   nvm install 22.12.0

   # Use the installed version
   nvm use 22.12.0
   ```

2. **pnpm:** Install the pnpm package manager globally if you haven't already:
   ```sh
   npm install -g pnpm
   ```

### Installation

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/yourusername/browser-start-page.git
   cd browser-start-page
   ```

2. **Install Dependencies with pnpm:**
   ```sh
   pnpm install
   ```

3. **Launch the Development Server:**
   ```sh
   pnpm dev
   ```
   Open your browser and navigate to `http://localhost:3000` to see your custom start page in action.

4. **Build for Production:**
   ```sh
   pnpm build
   ```

---

## Publish in the chrome web store
From inside your extension’s folder (the one that contains manifest.json), run:

```bash
zip -r ../my-extension.zip . -x "*.DS_Store" -x "__MACOSX/*"
```
And then you can upload that folder.


---

## Contributing

Contributions are welcome! If you have ideas, improvements, or bug fixes, please feel free to:
- Submit an **issue** for feature requests or bugs.
- Create a **pull request** with your improvements.
- Join our community discussions to help shape the future of Browser Start Page.

---

## License

This project is licensed under the **MIT License**.

---

🚀 **Created by [Your Name/Organization](https://yourwebsite.com)**  
💻 **GitHub:** [Browser Start Page on GitHub](https://github.com/yourusername/browser-start-page)  
🌐 **Live Demo:** [Browser Start Page Demo](https://browser-start-page.example.com)
